import { Routes, Route, Navigate } from 'react-router-dom'
import { RfHome, RfSearch, RfRent, RfDetail } from './Redfin.jsx'
import { Home, ForSale, ForRent, Detail, Simple, Shell } from './Zillow.jsx'
import { Favorites, Searches, Updates, Plan, Inbox } from './components/RailPages.jsx'

// The rail pages render inside the same chrome as every other page; Shell lives
// in Zillow.jsx, so they are composed here rather than importing it back there.
const rail = (El) => <Shell sale><El /></Shell>
export default function App() {
  return <Routes><Route path="/" element={<Home />} /><Route path="/for-sale" element={<ForSale />} /><Route path="/rent" element={<ForRent />} /><Route path="/property/:id" element={<Detail />} /><Route path="/listings" element={<Navigate to="/for-sale" replace />} /><Route path="/listings/property/:id" element={<Navigate to="/for-sale" replace />} /><Route path="/redfin" element={<RfHome />} /><Route path="/redfin/homes" element={<RfSearch />} /><Route path="/redfin/rent" element={<RfRent />} /><Route path="/redfin/property/:id" element={<RfDetail />} /><Route path="/favorites" element={rail(Favorites)} /><Route path="/searches" element={rail(Searches)} /><Route path="/updates" element={rail(Updates)} /><Route path="/plan" element={rail(Plan)} /><Route path="/inbox" element={rail(Inbox)} /><Route path="/:page" element={<Simple />} /></Routes>
}
