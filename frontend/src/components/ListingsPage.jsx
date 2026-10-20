import { useEffect, useState } from 'react'
import { fetchProperties } from '../api/client.js'
import PropertyCard from './PropertyCard.jsx'
import PropertyFilters from './PropertyFilters.jsx'
import './listings.css'

const PAGE_SIZE = 20

export default function ListingsPage() {
  const [query, setQuery] = useState({})
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Aborting on cleanup stops a slower, older request from overwriting newer results.
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    setData(null)
    fetchProperties({ ...query, limit: PAGE_SIZE }, { signal: controller.signal })
      .then(setData)
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [query])

  return (
    <div className="lp">
      <h1>Property Listings</h1>
      <PropertyFilters onSearch={(f) => setQuery({ ...f })} onClear={() => setQuery({})} />
      {loading && <div className="lp-status" role="status">Loading properties…</div>}
      {error && <div className="lp-error" role="alert">Could not load properties: {error}</div>}
      {data && (
        <>
          <div className="lp-count">
            Showing {data.results.length.toLocaleString()} of {data.total.toLocaleString()} properties
          </div>
          {data.results.length === 0
            ? <div className="lp-empty">No properties match these filters. Try widening the price range or clearing a filter.</div>
            : <div className="lp-grid">{data.results.map((p) => <PropertyCard key={p.id} property={p} />)}</div>}
        </>
      )}
    </div>
  )
}
