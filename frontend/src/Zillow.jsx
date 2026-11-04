import { useEffect, useState } from 'react'
import { Link, useSearchParams, useParams, useLocation, useNavigate } from 'react-router-dom'
import { SIDE, FOOT } from './chrome.js'
import MapView from './MapView.jsx'
import { pageItems } from './components/Pagination.jsx'
import PropertyImageCarousel from './components/PropertyImageCarousel.jsx'
import PropertyImageGallery from './components/PropertyImageGallery.jsx'
import PropertyMap from './components/PropertyMap.jsx'
import OpenHouses from './components/OpenHouses.jsx'
import './components/listings.css'
import './zillow-index.css'
import './zillow-sale.css'

export const usd = (n) => '$' + Number(n).toLocaleString()
const Z = 'https://www.zillowstatic.com/'
export const fmtOpen = (s) => {
  if (!s) return null
  const [d, t] = s.split('|'), [date, st] = d.split(' ')
  const dt = new Date(date + 'T00:00:00'), h = +st.slice(0, 2), e = +t.slice(0, 2)
  const f = (x) => (x % 12 || 12) + (x >= 12 ? 'pm' : 'am')
  return `Open: ${dt.toLocaleDateString('en-US', { weekday: 'short' })} ${f(h)}-${f(e)} (${dt.getMonth() + 1}/${dt.getDate()})`
}

export const Spinner = () => <div className="spin" role="status" aria-label="Loading" />

export function SiteSwitch({ current }) {
  const { pathname, search } = useLocation()
  const rest = current === 'redfin' ? pathname.replace(/^\/redfin/, '') : pathname
  const to = (site) => {
    if (site === current) return pathname + search
    const z = rest === '/homes' ? '/for-sale' : rest || '/'
    if (site === 'zillow') return z + search
    return '/redfin' + (z === '/' ? '' : z === '/for-sale' ? '/homes' : z) + search
  }
  return <div className={'siteswitch ' + current}>
    <Link className={current === 'zillow' ? 'on z' : 'z'} to={to('zillow')}>Zillow</Link>
    <Link className={current === 'redfin' ? 'on r' : 'r'} to={to('redfin')}>Redfin</Link>
  </div>
}

export function Shell({ children, sale }) {
  return <div className={sale ? 'sale' : ''}>
    <div dangerouslySetInnerHTML={{ __html: SIDE }} />
    <div className="wrap">
      <header>
        <SiteSwitch current="zillow" />
        <nav><Link to="/for-sale">Buy</Link><Link to="/rent">Rent</Link><Link to="/sell">Sell</Link><Link to="/mortgage">Get a mortgage</Link><Link to="/agents">Find an agent</Link></nav>
        <Link className="logo" to="/"><img src="/idx-logo.png" alt="IDX Exchange" /></Link>
        <nav className="r"><Link to="/manage-rentals">Manage rentals</Link><Link to="/advertise">Advertise</Link><Link to="/help">Get help</Link><a className="signin" href="#">Sign in</a></nav>
      </header>
      {children}
      <div dangerouslySetInnerHTML={{ __html: FOOT }} />
    </div>
  </div>
}

function SearchBox({ className, placeholder }) {
  const [q, setQ] = useState('')
  return <form className={className} onSubmit={(e) => { e.preventDefault(); location.href = '/for-sale?q=' + encodeURIComponent(q) }}>
    <input style={{ border: 0, outline: 0, flex: 1, font: 'inherit' }} placeholder={placeholder} value={q} onChange={(e) => setQ(e.target.value)} />
    <span style={{ color: 'var(--c-ink)', fontSize: 18 }}>⌕</span>
  </form>
}

export function Home() {
  const [d, setD] = useState(null)
  useEffect(() => { loadList('/api/properties?q=Los%20Angeles&limit=8&sort=price_asc&category=sale', setD) }, [])
  const cards = [['Buy a home', 'A real estate agent can provide you with a clear breakdown of costs so that you can avoid surprise expenses.', 'Find a local agent', 'agents', 'homepage-spot-agent-lg'], ['Rent a home', 'We’re creating a seamless online experience – from shopping on the largest rental network, to applying, to paying rent.', 'Find rentals', 'rent', 'homepage-spot-rent-lg'], ['Finance a home', 'IDX Exchange Home Loans can get you pre-approved so you’re ready to make an offer quickly when you find the right home.', 'Start now', 'mortgage', 'homepage-spot-financing-lg']]
  return <Shell>
    <section className="hero"><h1>Rentals. Homes.<br />Agents. Loans.</h1><SearchBox className="search" placeholder="Enter an address, neighborhood, city, or ZIP code" /></section>
    <section className="sec" style={{ paddingTop: 34 }}><div className="arrows"><span>‹</span><span>›</span></div><h5>Trending Homes in Los Angeles, CA</h5><div className="sub">Viewed and saved the most in the area over the past 24 hours</div>
      <div className="row">{!d && <Spinner />}{d?.results.map((p) => <Link key={p.id} className="pc" to={`/property/${p.id}`}>
        <div className="ph" style={{ backgroundImage: p.photos[0] ? `url(${p.photos[0]})` : 'none' }}>{p.nextOpen && <span className="badge">{fmtOpen(p.nextOpen)}</span>}</div>
        <div className="in"><b>{usd(p.price)}</b><small>{p.beds} bds | {Number(p.baths)} ba | {p.sqft?.toLocaleString()} sqft &nbsp; Active</small><small>{p.address}, {p.city}, {p.state}, {p.zip}</small><div className="mls">MLS listing. Listing provided by CRMLS</div></div></Link>)}</div></section>
    <section className="sec" style={{ paddingTop: 38 }}><h5>Find homes you can afford with BuyAbility℠</h5><div className="sub">Answer a few questions. We'll highlight homes you're likely to qualify for.</div>
      <div className="ba"><div className="bab"><small style={{ fontWeight: 700, color: 'var(--c-link)' }}>IDX Exchange Home Loans</small><div className="g"><div><b>$ - -</b>Target home price</div><div><b>$ - -</b>Max home price</div><div><b>$ -- /mo</b>Target payment</div><div><b>-- %</b>Your est. rate</div></div><Link className="blue" to="/mortgage">Get your BuyAbility</Link></div>
        {['2024/10/2017_ZillowExteriors_218-1.jpg', '2024/10/GettyImages-472069091-Edit.jpg', '2024/10/shutterstock_529108441.jpg'].map((x) => <div key={x} className="pc sk"><div className="ph" style={{ backgroundImage: `url(${Z}bedrock/app/uploads/sites/5/${x})` }}><span className="badge" style={{ background: '#0041D9' }}>Within BuyAbility</span></div><div className="l" /><div className="l" style={{ width: '70%' }} /><div className="l" style={{ width: '60%' }} /></div>)}</div></section>
    <div className="more">↓ More recommended homes</div>
    <section className="gray">{cards.map((c) => <div key={c[0]} className="rc"><img src={`${Z}bedrock/app/uploads/sites/55/2025/04/${c[4]}.webp`} alt="" /><h4>{c[0]}</h4><p>{c[1]}</p><Link className="out" to={'/' + c[3]}>{c[2]}</Link>{c[0][0] === 'F' && null}</div>)}</section>
    <section className="rec"><h6>About IDX Exchange's Recommendations</h6><p>Recommendations are based on your location and search activity, such as the homes you've viewed and saved and the filters you've used. We use this information to bring similar homes to your attention, so you don't miss out.</p><div className="acc"><span>Real Estate ⌄</span><span>Rentals ⌄</span><span>Mortgage Rates ⌄</span><span>Browse Homes ⌄</span></div></section>
  </Shell>
}

// A failed request used to land in setD as {error}, so the grid blew up on
// d.results.map and the whole page went blank. Normalising every outcome to a
// list shape keeps the page rendering and puts the message on screen instead.
export function loadList(url, setD) {
  return fetch(url)
    .then((r) => r.json())
    .then((j) => setD(Array.isArray(j?.results)
      ? j
      : { error: j?.error || 'Could not load listings.', results: [], total: 0, pages: 0 }))
    .catch(() => setD({ error: 'Could not reach the server. Check that the backend is running.', results: [], total: 0, pages: 0 }))
}

// "Showing 21-40 of 487 properties" for the current page. The API reports the
// limit it actually used, so the range stays right whatever the page size is.
export function resultRange(d) {
  if (!d) return 'Loading...'
  if (!d.total || !d.results.length) return 'Showing 0 of 0 properties'
  const limit = d.limit || d.results.length
  const first = ((d.page || 1) - 1) * limit + 1
  const last = first + d.results.length - 1
  return `Showing ${first.toLocaleString()}-${last.toLocaleString()} of ${d.total.toLocaleString()} properties`
}

export function Pager({ page, pages, onGo }) {
  const [jump, setJump] = useState('')
  if (!pages || pages <= 1) return null
  const submit = (e) => {
    e.preventDefault()
    const t = Number(jump)
    // Ignore a typo or a page past the end rather than loading an empty grid.
    if (!Number.isInteger(t) || t < 1 || t > pages) return
    setJump('')
    onGo(t)
  }
  return <div style={{ display: 'flex', gap: 14, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', margin: '28px 0', fontSize: 14 }}>
    <button className="chip" disabled={page <= 1} onClick={() => onGo(page - 1)}>&lsaquo; Prev</button>
    <ol className="z-pages">
      {pageItems(page, pages).map((item) => typeof item === 'string'
        ? <li key={item} className="z-gap" aria-hidden="true">…</li>
        : <li key={item}>
          <button
            className={item === page ? 'chip z-page on' : 'chip z-page'}
            aria-label={`Page ${item}`}
            aria-current={item === page ? 'page' : undefined}
            onClick={() => onGo(item)}
          >{item}</button>
        </li>)}
    </ol>
    <button className="chip" disabled={page >= pages} onClick={() => onGo(page + 1)}>Next &rsaquo;</button>
    <span>Page {page} of {pages.toLocaleString()}</span>
    <form onSubmit={submit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <label htmlFor="z-jump">Go to page</label>
      <input id="z-jump" className="chip" style={{ width: 90 }} type="number" min="1" max={pages} value={jump} onChange={(e) => setJump(e.target.value)} placeholder={String(page)} />
      <button className="chip" type="submit">Go</button>
    </form>
  </div>
}

export function ForSale() {
  const [sp, setSp] = useSearchParams()
  const [d, setD] = useState(null)
  const nav = useNavigate()
  const [f, setF] = useState({ q: sp.get('q') || 'Los Angeles', minPrice: sp.get('minPrice') || '', maxPrice: sp.get('maxPrice') || '', beds: sp.get('beds') || '', baths: sp.get('baths') || '', type: sp.get('type') || '', sort: sp.get('sort') || '' })
  const q = sp.get('q') || 'Los Angeles', page = +sp.get('page') || 1
  useEffect(() => { setD(null); const n = new URLSearchParams(sp); if (!n.get('q')) n.set('q', 'Los Angeles'); n.set('category', 'sale'); loadList('/api/properties?' + n, setD) }, [sp])
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = (e) => { e.preventDefault(); setSp(Object.fromEntries(Object.entries(f).filter(([, v]) => v))) }
  const go = (p) => { const n = new URLSearchParams(sp); n.set('page', p); setSp(n); window.scrollTo(0, 0) }
  const mapParams = (() => { const n = new URLSearchParams(sp); if (!n.get('q')) n.set('q', 'Los Angeles'); n.set('category', 'sale'); return n })()
  const switchCategory = (e) => { if (e.target.value === 'rent') nav('/rent?' + new URLSearchParams({ q: f.q })) }
  return <Shell sale>
    <form className="filterbar" onSubmit={submit}>
      <div className="searchbox"><input style={{ border: 0, outline: 0, font: 'inherit', width: '100%' }} value={f.q} onChange={set('q')} /><span>⌕</span></div>
      <select className="chip on" value="sale" onChange={switchCategory}><option value="sale">For sale</option><option value="rent">For rent</option></select>
      <select className="chip" value={f.type} onChange={set('type')}><option value="">Property type ▾</option><option>SingleFamilyResidence</option><option>Condominium</option><option>Townhouse</option><option>Duplex</option></select>
      <input className="chip" style={{ width: 110 }} type="number" placeholder="Min price" value={f.minPrice} onChange={set('minPrice')} />
      <input className="chip" style={{ width: 110 }} type="number" placeholder="Max price" value={f.maxPrice} onChange={set('maxPrice')} />
      <select className="chip" value={f.beds} onChange={set('beds')}><option value="">Beds ▾</option>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+ bd</option>)}</select>
      <select className="chip" value={f.baths} onChange={set('baths')}><option value="">Baths ▾</option>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+ ba</option>)}</select>
      <button className="save" style={{ border: 0, cursor: 'pointer', font: 'inherit', fontWeight: 700 }}>Search</button>
    </form>
    <div className="results">
      <div className="mapcol"><MapView params={mapParams} /></div>
      <div className="listcol">
        <h1>{q} Real Estate &amp; Homes For Sale</h1>
        <div className="count"><span>{resultRange(d)}</span>
          <select value={f.sort} onChange={(e) => { const v = e.target.value; setF({ ...f, sort: v }); const n = new URLSearchParams(sp); v ? n.set('sort', v) : n.delete('sort'); setSp(n) }} style={{ border: 0, font: 'inherit' }}><option value="">Sort: Homes for You</option><option value="price_asc">Price (Low to High)</option><option value="price_desc">Price (High to Low)</option></select></div>
        <div className="grid">{!d && <Spinner />}{d?.results.map((p) => <Link key={p.id} className="card" to={`/property/${p.id}`}>
          <div className="ph"><PropertyImageCarousel photos={p.photos} alt={p.address} className="z-ph" /><div className="heart">♡</div></div>
          <div className="in"><div className="price">{usd(p.price)}</div>
            <div className="meta">{p.beds} bds | {Number(p.baths)} ba | {p.sqft?.toLocaleString()} sqft | {p.type?.replace(/([A-Z])/g, ' $1').trim()} for sale</div>
            <div className="addr">{p.address}, {p.city}, {p.state} {p.zip}</div>
            {p.nextOpen && <div className="broker" style={{ color: 'var(--c-hot)' }}>{fmtOpen(p.nextOpen)}</div>}</div></Link>)}</div>
        {d?.error && <div role="alert" style={{ padding: '10px 0 28px', color: 'var(--c-hot)' }}>{d.error}</div>}
        {d && !d.error && !d.results.length && <div style={{ padding: '10px 0 28px', color: 'var(--c-mute)' }}>No homes match your search yet — try widening your filters.</div>}
        {d && <Pager page={page} pages={d.pages} onGo={go} />}
      </div>
    </div>
  </Shell>
}

export function ForRent() {
  const [sp, setSp] = useSearchParams()
  const [d, setD] = useState(null)
  const nav = useNavigate()
  const [f, setF] = useState({ q: sp.get('q') || 'Los Angeles', minPrice: sp.get('minPrice') || '', maxPrice: sp.get('maxPrice') || '', beds: sp.get('beds') || '', baths: sp.get('baths') || '', type: sp.get('type') || '', sort: sp.get('sort') || '' })
  const q = sp.get('q') || 'Los Angeles', page = +sp.get('page') || 1
  useEffect(() => { setD(null); const n = new URLSearchParams(sp); if (!n.get('q')) n.set('q', 'Los Angeles'); n.set('category', 'rent'); loadList('/api/properties?' + n, setD) }, [sp])
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = (e) => { e.preventDefault(); setSp(Object.fromEntries(Object.entries(f).filter(([, v]) => v))) }
  const go = (p) => { const n = new URLSearchParams(sp); n.set('page', p); setSp(n); window.scrollTo(0, 0) }
  const mapParams = (() => { const n = new URLSearchParams(sp); if (!n.get('q')) n.set('q', 'Los Angeles'); n.set('category', 'rent'); return n })()
  const switchCategory = (e) => { if (e.target.value === 'sale') nav('/for-sale?' + new URLSearchParams({ q: f.q })) }
  return <Shell sale>
    <form className="filterbar" onSubmit={submit}>
      <div className="searchbox"><input style={{ border: 0, outline: 0, font: 'inherit', width: '100%' }} value={f.q} onChange={set('q')} /><span>⌕</span></div>
      <select className="chip on" value="rent" onChange={switchCategory}><option value="sale">For sale</option><option value="rent">For rent</option></select>
      <select className="chip" value={f.type} onChange={set('type')}><option value="">Property type ▾</option><option>Apartment</option><option>SingleFamilyResidence</option><option>Condominium</option><option>Townhouse</option><option>Duplex</option></select>
      <input className="chip" style={{ width: 110 }} type="number" placeholder="Min rent" value={f.minPrice} onChange={set('minPrice')} />
      <input className="chip" style={{ width: 110 }} type="number" placeholder="Max rent" value={f.maxPrice} onChange={set('maxPrice')} />
      <select className="chip" value={f.beds} onChange={set('beds')}><option value="">Beds ▾</option>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+ bd</option>)}</select>
      <select className="chip" value={f.baths} onChange={set('baths')}><option value="">Baths ▾</option>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+ ba</option>)}</select>
      <button className="save" style={{ border: 0, cursor: 'pointer', font: 'inherit', fontWeight: 700 }}>Search</button>
    </form>
    <div className="results">
      <div className="mapcol"><MapView params={mapParams} /></div>
      <div className="listcol">
        <h1>{q} Apartments &amp; Houses For Rent</h1>
        <div className="count"><span>{resultRange(d)}</span>
          <select value={f.sort} onChange={(e) => { const v = e.target.value; setF({ ...f, sort: v }); const n = new URLSearchParams(sp); v ? n.set('sort', v) : n.delete('sort'); setSp(n) }} style={{ border: 0, font: 'inherit' }}><option value="">Sort: Homes for You</option><option value="price_asc">Rent (Low to High)</option><option value="price_desc">Rent (High to Low)</option></select></div>
        <div className="grid">{!d && <Spinner />}{d?.results.map((p) => <Link key={p.id} className="card" to={`/property/${p.id}`}>
          <div className="ph"><PropertyImageCarousel photos={p.photos} alt={p.address} className="z-ph" /><div className="heart">♡</div></div>
          <div className="in"><div className="price">{usd(p.price)}/mo</div>
            <div className="meta">{p.beds} bds | {Number(p.baths)} ba | {p.sqft?.toLocaleString()} sqft | {p.type?.replace(/([A-Z])/g, ' $1').trim()} for rent</div>
            <div className="addr">{p.address}, {p.city}, {p.state} {p.zip}</div>
            {p.nextOpen && <div className="broker" style={{ color: 'var(--c-hot)' }}>{fmtOpen(p.nextOpen)}</div>}</div></Link>)}</div>
        {d?.error && <div role="alert" style={{ padding: '10px 0 28px', color: 'var(--c-hot)' }}>{d.error}</div>}
        {d && !d.error && !d.results.length && <div style={{ padding: '10px 0 28px', color: 'var(--c-mute)' }}>No rentals match your search yet — try widening your filters.</div>}
        {d && <Pager page={page} pages={d.pages} onGo={go} />}
      </div>
    </div>
  </Shell>
}

export function Detail() {
  const { id } = useParams()
  const [p, setP] = useState(null), [err, setErr] = useState(false)
  useEffect(() => { fetch('/api/properties/' + id).then((r) => (r.ok ? r.json() : Promise.reject())).then(setP).catch(() => setErr(true)) }, [id])
  return <Shell sale>
    <div style={{ maxWidth: 1100, margin: 'auto', padding: 20 }}>
      <Link to={p?.forRent ? '/rent' : '/for-sale'} style={{ color: 'var(--c-link)', fontWeight: 700 }}>← Back to search</Link>
      {err && <p>Listing not found.</p>}
      {!p && !err && <Spinner />}
      {p && <div className="pd pd-inline">
        <PropertyImageGallery photos={p.photos} alt={p.address} />
        <div style={{ fontSize: 32, fontWeight: 800, marginTop: 16 }}>{usd(p.price)}{p.forRent ? '/mo' : ''}</div>
        <h3 style={{ margin: '4px 0 12px' }}>{p.address}, {p.city}, {p.state} {p.zip}</h3>
        <dl className="pd-stats">
          <div><dt>Beds</dt><dd>{p.beds ?? '—'}</dd></div>
          <div><dt>Baths</dt><dd>{p.baths ? Number(p.baths) : '—'}</dd></div>
          <div><dt>Square feet</dt><dd>{p.sqft ? p.sqft.toLocaleString() : '—'}</dd></div>
          <div><dt>Year built</dt><dd>{p.yearBuilt || '—'}</dd></div>
        </dl>
        <section className="pd-description"><h2>Description</h2><p>{p.remarks || 'No description provided for this property.'}</p></section>
        <section className="pd-details"><h2>Property details</h2>
          <dl>
            <div><dt>Listing ID</dt><dd>{p.id}</dd></div>
            <div><dt>Property type</dt><dd>{p.type?.replace(/([A-Z])/g, ' $1').trim() || '—'}</dd></div>
            <div><dt>Lot size</dt><dd>{p.lotAcres ? `${p.lotAcres} acres` : '—'}</dd></div>
            <div><dt>ZIP code</dt><dd>{p.zip || '—'}</dd></div>
          </dl>
        </section>
        <OpenHouses openHouses={p.openHouses} />
        <PropertyMap lat={p.lat} lng={p.lng} address={p.address} />
      </div>}
    </div>
  </Shell>
}

const TITLES = { sell: 'Sell your home', agents: 'Find an agent', 'manage-rentals': 'Manage rentals', advertise: 'Advertise', help: 'Get help' }

function Mortgage() {
  const [price, setPrice] = useState(800000), [down, setDown] = useState(20), [rate, setRate] = useState(6.5), [years, setYears] = useState(30)
  const loan = price * (1 - down / 100), r = rate / 1200, n = years * 12
  const pay = r ? (loan * r) / (1 - Math.pow(1 + r, -n)) : loan / n
  const fld = { height: 40, border: '1px solid var(--c-line)', borderRadius: 8, padding: '0 12px', font: 'inherit', width: '100%' }
  const L = ({ t, children }) => <label style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>{t}{children}</label>
  return <div style={{ maxWidth: 520, padding: '40px 32px', minHeight: 420 }}>
    <h1>Mortgage payment calculator</h1>
    <div style={{ display: 'grid', gap: 14 }}>
      <L t="Home price ($)"><input style={fld} type="number" value={price} onChange={(e) => setPrice(+e.target.value)} /></L>
      <L t="Down payment (%)"><input style={fld} type="number" value={down} onChange={(e) => setDown(+e.target.value)} /></L>
      <L t="Interest rate (%)"><input style={fld} type="number" step="0.01" value={rate} onChange={(e) => setRate(+e.target.value)} /></L>
      <L t="Loan term"><select style={fld} value={years} onChange={(e) => setYears(+e.target.value)}><option value={30}>30 years</option><option value={20}>20 years</option><option value={15}>15 years</option></select></L>
    </div>
    <div style={{ background: 'var(--c-tint)', borderRadius: 12, padding: 20, marginTop: 20 }}>
      <div style={{ fontSize: 13, color: 'var(--c-mute)' }}>Estimated monthly payment (principal &amp; interest)</div>
      <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--c-link)' }}>{usd(Math.round(pay || 0))}/mo</div>
      <div style={{ fontSize: 13 }}>Loan amount {usd(Math.round(loan))}</div>
    </div>
  </div>
}

export function Simple() {
  const { page } = useParams()
  if (page === 'mortgage') return <Shell sale><Mortgage /></Shell>
  const t = TITLES[page]
  return <Shell sale><div style={{ padding: '60px 32px', minHeight: 420 }}>
    <h1>{t || 'Page not found'}</h1>
    {t && <p style={{ fontSize: 20, color: 'var(--c-mute)' }}>Coming soon.</p>}
    <Link className="save" style={{ display: 'inline-flex', width: 'fit-content' }} to="/">Back home</Link></div></Shell>
}
