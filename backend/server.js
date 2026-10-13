require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST, port: process.env.DB_PORT,
  user: process.env.DB_USER, password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME, connectionLimit: 10,
});
const app = express();
app.use(compression());
app.use(cors());

// Request logging: one line per request with method, URL, status and duration.
// Logged on 'finish' so the status code and total time are final.
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`);
  });
  next();
});

app.get('/api/health', async (req, res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ok', database: 'connected' }); }
  catch { res.status(500).json({ status: 'error', database: 'disconnected' }); }
});

const parsePhotos = (s) => { try { return JSON.parse(s) || []; } catch { return []; } };

// all_data is a JSON blob in the MLS feed; it is not always valid JSON and is
// not always an object (some rows hold a bare string or null), so every access
// past the parse is guarded.
function toOpenHouse({ all_data, ...o }) {
  let remarks = null;
  try {
    const parsed = JSON.parse(all_data);
    if (parsed && typeof parsed === 'object') remarks = parsed.OpenHouseRemarks ?? null;
  } catch { /* leave remarks null for malformed blobs */ }
  return { ...o, remarks };
}
const SUMMARY = `L_ListingID id, L_Address address, L_City city, L_State state, L_Zip zip,
  L_SystemPrice price, L_Keyword2 beds, LM_Dec_3 baths, LM_Int2_3 sqft, L_Type_ type,
  (SELECT MIN(CONCAT(o.OpenHouseDate,' ',o.OH_StartTime,'|',o.OH_EndTime)) FROM rets_openhouse o WHERE o.L_ListingID = rets_property.L_ListingID AND o.OpenHouseDate >= CURDATE()) nextOpen,
  LMD_MP_Latitude lat, LMD_MP_Longitude lng, YearBuilt yearBuilt, L_Photos photos`;

const RENTAL_TYPES = (process.env.RENTAL_PROPERTY_TYPES || 'ResidentialLease,Apartment')
  .split(',').map((s) => s.trim()).filter(Boolean);

// L_ListingID values are short alphanumeric MLS keys. Anything else (path
// fragments, SQL-ish payloads, absurdly long strings) is a bad request, not a
// missing property, so it gets a 400 rather than a 404.
const LISTING_ID_MAX = 32;
function validateListingId(id) {
  if (typeof id !== 'string' || id.length === 0) return 'listing id is required';
  if (id.length > LISTING_ID_MAX) return `listing id must be at most ${LISTING_ID_MAX} characters`;
  if (!/^[A-Za-z0-9_-]+$/.test(id)) return 'listing id must contain only letters, numbers, hyphens and underscores';
  return null;
}

function validateQuery(req) {
  const { page, limit, offset, minPrice, maxPrice, beds, baths, category, zipcode } = req.query;
  const errors = [];
  const isNum = (v) => v === undefined || (v !== '' && !Number.isNaN(Number(v)));
  if (page !== undefined && (!isNum(page) || !Number.isInteger(+page) || +page < 1)) errors.push('page must be a positive integer');
  if (limit !== undefined && (!isNum(limit) || !Number.isInteger(+limit) || +limit < 1 || +limit > 100)) errors.push('limit must be an integer between 1 and 100');
  if (offset !== undefined && (!isNum(offset) || !Number.isInteger(+offset) || +offset < 0)) errors.push('offset must be a non-negative integer');
  if (!isNum(minPrice) || +minPrice < 0) errors.push('minPrice must be a non-negative number');
  if (!isNum(maxPrice) || +maxPrice < 0) errors.push('maxPrice must be a non-negative number');
  if (!isNum(beds) || +beds < 0) errors.push('beds must be a non-negative number');
  if (!isNum(baths) || +baths < 0) errors.push('baths must be a non-negative number');
  if (zipcode !== undefined && !/^\d{1,10}$/.test(zipcode)) errors.push('zipcode must be numeric');
  if (category !== undefined && !['sale', 'rent'].includes(category)) errors.push("category must be 'sale' or 'rent'");
  if (minPrice !== undefined && maxPrice !== undefined && isNum(minPrice) && isNum(maxPrice) && +minPrice > +maxPrice) errors.push('minPrice must not exceed maxPrice');
  return errors;
}

function buildWhere(req) {
  const { city, zipcode, minPrice, maxPrice, beds, baths, type, q, category } = req.query;
  const where = ["L_Status='Active'"], args = [];
  if (category === 'rent') {
    if (RENTAL_TYPES.length) { where.push(`L_Type_ IN (${RENTAL_TYPES.map(() => '?').join(',')})`); args.push(...RENTAL_TYPES); }
  } else if (category === 'sale' && RENTAL_TYPES.length) {
    where.push(`L_Type_ NOT IN (${RENTAL_TYPES.map(() => '?').join(',')})`); args.push(...RENTAL_TYPES);
  }
  if (city) { where.push('L_City = ?'); args.push(city); }
  if (zipcode) { where.push('L_Zip = ?'); args.push(zipcode); }
  if (q) { where.push('(L_City LIKE ? OR L_Zip LIKE ? OR L_Address LIKE ?)'); args.push(`${q}%`, `${q}%`, `${q}%`); }
  if (minPrice) { where.push('L_SystemPrice >= ?'); args.push(+minPrice); }
  if (maxPrice) { where.push('L_SystemPrice <= ?'); args.push(+maxPrice); }
  if (beds) { where.push('L_Keyword2 >= ?'); args.push(+beds); }
  if (baths) { where.push('LM_Dec_3 >= ?'); args.push(+baths); }
  if (type) { where.push('L_Type_ = ?'); args.push(type); }
  return { w: where.join(' AND '), args };
}

app.get('/api/properties/map', async (req, res) => {
  const errors = validateQuery(req);
  if (errors.length) return res.status(400).json({ error: 'Invalid query parameters', details: errors });
  try {
    const { w, args } = buildWhere(req);
    const [rows] = await pool.query(
      `SELECT L_ListingID id, L_SystemPrice price, LMD_MP_Latitude lat, LMD_MP_Longitude lng FROM rets_property
       WHERE ${w} AND LMD_MP_Latitude IS NOT NULL AND LMD_MP_Latitude <> 0 AND LMD_MP_Longitude <> 0 LIMIT 1000`, args);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/properties', async (req, res) => {
  const errors = validateQuery(req);
  if (errors.length) return res.status(400).json({ error: 'Invalid query parameters', details: errors });
  try {
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    // offset wins when given directly (API contract); otherwise derive it from page (used by the frontend).
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const offset = req.query.offset !== undefined ? Math.max(0, parseInt(req.query.offset) || 0) : (page - 1) * limit;
    const { w, args } = buildWhere(req);
    const sorts = { price_asc: 'L_SystemPrice ASC', price_desc: 'L_SystemPrice DESC', newest: 'L_ListingID DESC' };
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) total FROM rets_property WHERE ${w}`, args);
    const [rows] = await pool.query(
      `SELECT ${SUMMARY} FROM rets_property WHERE ${w} ORDER BY ${sorts[req.query.sort] || sorts.newest} LIMIT ? OFFSET ?`,
      [...args, limit, offset]);
    rows.forEach((r) => { r.photos = parsePhotos(r.photos).slice(0, 1); r.forRent = RENTAL_TYPES.includes(r.type); });
    res.json({ total, limit, offset, page: Math.floor(offset / limit) + 1, pages: Math.ceil(total / limit), results: rows });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// Registered before '/api/properties/:id'. Express matches routes in the order
// they are defined, so if '/:id' came first it would match '/ABC123/openhouses'
// (or fail outright) and this handler would never run.
app.get('/api/properties/:id/openhouses', async (req, res) => {
  const idError = validateListingId(req.params.id);
  if (idError) return res.status(400).json({ error: 'Invalid listing id', details: [idError] });
  try {
    const [[property]] = await pool.query(
      'SELECT L_ListingID id FROM rets_property WHERE L_ListingID = ? LIMIT 1', [req.params.id]);
    if (!property) {
      return res.status(404).json({ error: `No property found with listing id '${req.params.id}'` });
    }
    const [rows] = await pool.query(
      `SELECT OpenHouseDate date, OH_StartTime startTime, OH_EndTime endTime, all_data FROM rets_openhouse
       WHERE L_ListingID = ? ORDER BY OpenHouseDate, OH_StartTime`, [req.params.id]);
    // A property with no scheduled open houses is normal: return [], not an error.
    res.json(rows.map(toOpenHouse));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/properties/:id', async (req, res) => {
  const idError = validateListingId(req.params.id);
  if (idError) return res.status(400).json({ error: 'Invalid listing id', details: [idError] });
  try {
    const [rows] = await pool.query(
      `SELECT ${SUMMARY}, L_Remarks remarks, LotSizeAcres lotAcres FROM rets_property WHERE L_ListingID = ?`, [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ error: `No property found with listing id '${req.params.id}'` });
    }
    const p = rows[0]; p.photos = parsePhotos(p.photos); p.forRent = RENTAL_TYPES.includes(p.type);
    const [oh] = await pool.query(
      `SELECT OpenHouseDate date, OH_StartTime startTime, OH_EndTime endTime, all_data FROM rets_openhouse
       WHERE L_ListingID = ? AND OpenHouseDate >= CURDATE() ORDER BY OpenHouseDate, OH_StartTime`, [req.params.id]);
    p.openHouses = oh.map(toOpenHouse);
    res.json(p);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/cities', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT L_City city, COUNT(*) n FROM rets_property WHERE L_Status='Active' AND L_City<>'' GROUP BY L_City ORDER BY n DESC LIMIT 100");
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

app.use('/api', (req, res) => res.status(404).json({ error: `Unknown endpoint: ${req.method} ${req.originalUrl}` }));

// Last-resort handler so a throw anywhere above becomes a logged 500 instead of
// an unhandled rejection that takes the process down.
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Server error' });
});

process.on('unhandledRejection', (reason) => console.error('Unhandled promise rejection:', reason));

module.exports = app;
if (require.main === module) app.listen(process.env.PORT || 5000, () => console.log('API on', process.env.PORT || 5000));
