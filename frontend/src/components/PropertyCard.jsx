import { Link } from 'react-router-dom'
import PropertyImageCarousel from './PropertyImageCarousel.jsx'
import SaveButton from './SaveButton.jsx'

const fmt = (n) => (n === null || n === undefined || n === '' ? '—' : Number(n).toLocaleString())

export default function PropertyCard({ property: p }) {
  return (
    <Link className="lp-card" to={`/listings/property/${p.id}`}>
      <PropertyImageCarousel photos={p.photos} alt={p.address} />
      <SaveButton property={p} />
      <div className="lp-body">
        <div className="lp-price">{p.price ? `$${fmt(p.price)}` : 'Price unavailable'}</div>
        <div className="lp-stats">{fmt(p.beds)} bd · {fmt(p.baths)} ba · {fmt(p.sqft)} sqft</div>
        <div className="lp-addr">{p.address}</div>
        <div className="lp-city">{[p.city, p.state].filter(Boolean).join(', ')}</div>
      </div>
    </Link>
  )
}
