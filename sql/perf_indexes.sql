-- Composite indexes for the common query shapes in backend/server.js buildWhere().
-- Every query filters on L_Status first, so pairing it with the next-most-selective
-- column lets MySQL use one index instead of scanning the whole table.
SET SESSION sql_mode='';
CREATE INDEX idx_status_price ON rets_property (L_Status, L_SystemPrice);
CREATE INDEX idx_status_listingid ON rets_property (L_Status, L_ListingID);
CREATE INDEX idx_status_city ON rets_property (L_Status, L_City);
CREATE INDEX idx_status_geo ON rets_property (L_Status, LMD_MP_Latitude, LMD_MP_Longitude);
CREATE INDEX idx_status_type ON rets_property (L_Status, L_Type_);
CREATE INDEX idx_status_zip ON rets_property (L_Status, L_Zip);
