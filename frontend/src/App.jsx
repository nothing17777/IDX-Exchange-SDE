import { Routes, Route } from 'react-router-dom'
import { Home, ForSale, Detail, Simple } from './Zillow.jsx'
export default function App() {
  return <Routes><Route path="/" element={<Home />} /><Route path="/for-sale" element={<ForSale />} /><Route path="/property/:id" element={<Detail />} /><Route path="/:page" element={<Simple />} /></Routes>
}
