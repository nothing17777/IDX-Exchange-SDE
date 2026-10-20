import { useState } from 'react'
import { Link } from 'react-router-dom'
import { firstPhoto } from './photos.js'

const fmt = (n) => (n === null || n === undefined || n === '' ? '—' : Number(n).toLocaleString())

export default function PropertyCard({ property: p }) {
  const photo = firstPhoto(p.photos)
  const [broken, setBroken] = useState(false)
  return (
    <Link className="lp-card" to={`/property/${p.id}`}>
      <div className="lp-photo">
        {photo && !broken
          ? <img src={photo} alt={p.address} loading="lazy" onError={() => setBroken(true)} />
          : <span>No photo available</span>}
      </div>
      <div className="lp-body">
        <div className="lp-price">{p.price ? `$${fmt(p.price)}` : 'Price unavailable'}</div>
        <div className="lp-stats">{fmt(p.beds)} bd · {fmt(p.baths)} ba · {fmt(p.sqft)} sqft</div>
        <div className="lp-addr">{p.address}</div>
        <div className="lp-city">{[p.city, p.state].filter(Boolean).join(', ')}</div>
      </div>
    </Link>
  )
}
