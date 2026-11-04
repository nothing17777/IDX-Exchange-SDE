import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchPropertyDetail } from '../api/client.js'
import PropertyImageGallery from './PropertyImageGallery.jsx'
import PropertyMap from './PropertyMap.jsx'
import OpenHouses from './OpenHouses.jsx'
import './listings.css'

const fmt = (n) => (n === null || n === undefined || n === '' ? '—' : Number(n).toLocaleString())
const money = (n) => (n ? `$${fmt(n)}` : 'Price unavailable')

export default function PropertyDetailPage() {
  const { id } = useParams()
  const [property, setProperty] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    setProperty(null)
    fetchPropertyDetail(id, { signal: controller.signal })
      .then(setProperty)
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [id])

  const p = property
  return (
    <div className="pd">
      <Link className="pd-back" to="/listings">&larr; Back to listings</Link>
      {loading && <div className="lp-status" role="status">Loading property…</div>}
      {/* A bad or unknown id is an ordinary error state here, never a crash. */}
      {error && <div className="lp-error" role="alert">Could not load this property: {error}</div>}
      {p && (
        <>
          <PropertyImageGallery photos={p.photos} alt={p.address} />
          <h1 className="pd-price">{money(p.price)}{p.forRent ? '/mo' : ''}</h1>
          <p className="pd-address">
            {p.address}
            {[p.city, p.state].filter(Boolean).length > 0 && `, ${[p.city, p.state].filter(Boolean).join(', ')}`}
            {p.zip ? ` ${p.zip}` : ''}
          </p>

          <dl className="pd-stats">
            <div><dt>Beds</dt><dd>{fmt(p.beds)}</dd></div>
            <div><dt>Baths</dt><dd>{fmt(p.baths)}</dd></div>
            <div><dt>Square feet</dt><dd>{fmt(p.sqft)}</dd></div>
            {/* A year is a label, not a quantity: no thousands separator. */}
              <div><dt>Year built</dt><dd>{p.yearBuilt ? String(p.yearBuilt) : '—'}</dd></div>
          </dl>

          <section className="pd-description">
            <h2>Description</h2>
            <p>{p.remarks || 'No description provided for this property.'}</p>
          </section>

          <section className="pd-details">
            <h2>Property details</h2>
            <dl>
              <div><dt>Listing ID</dt><dd>{p.id}</dd></div>
              <div><dt>Property type</dt><dd>{p.type || '—'}</dd></div>
              <div><dt>Lot size</dt><dd>{p.lotAcres ? `${p.lotAcres} acres` : '—'}</dd></div>
              <div><dt>ZIP code</dt><dd>{p.zip || '—'}</dd></div>
            </dl>
          </section>

          <OpenHouses openHouses={p.openHouses} />
          <PropertyMap lat={p.lat} lng={p.lng} address={p.address} />
        </>
      )}
    </div>
  )
}
