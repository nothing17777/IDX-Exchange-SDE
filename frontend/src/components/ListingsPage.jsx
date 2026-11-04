import { useEffect, useState } from 'react'
import { fetchProperties } from '../api/client.js'
import PropertyCard from './PropertyCard.jsx'
import PropertyFilters from './PropertyFilters.jsx'
import Pagination from './Pagination.jsx'
import './listings.css'

const DEFAULT_PAGE_SIZE = 20

export default function ListingsPage() {
  const [query, setQuery] = useState({})
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Aborting on cleanup stops a slower, older request from overwriting newer results.
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    setData(null)
    fetchProperties({ ...query, page: page > 1 ? page : '', limit: itemsPerPage }, { signal: controller.signal })
      .then(setData)
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [query, page, itemsPerPage])

  // Paging keeps the filters untouched; only the page number moves, and the
  // reader is sent back to the top of the fresh grid.
  const changePage = (next) => {
    setPage(next)
    window.scrollTo(0, 0)
  }

  // Any change to the filters or the page size invalidates the current offset,
  // so both reset to page 1 rather than stranding the reader past the last page.
  const applyFilters = (filters) => {
    setPage(1)
    setQuery(filters)
  }

  const current = data?.page || 1
  const first = data ? (current - 1) * itemsPerPage + 1 : 0
  const last = data ? first + data.results.length - 1 : 0

  return (
    <div className="lp">
      <h1>Property Listings</h1>
      <PropertyFilters
        onSearch={(f) => applyFilters({ ...f })}
        onClear={() => applyFilters({})}
      />
      <label className="lp-per-page">
        Properties per page
        <select
          value={itemsPerPage}
          onChange={(e) => { setPage(1); setItemsPerPage(Number(e.target.value)) }}
        >
          {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      {loading && <div className="lp-status" role="status">Loading properties…</div>}
      {error && <div className="lp-error" role="alert">Could not load properties: {error}</div>}
      {data && (
        <>
          <div className="lp-count">
            {data.results.length === 0
              ? 'Showing 0 of 0 properties'
              : `Showing ${first.toLocaleString()}-${last.toLocaleString()} of ${data.total.toLocaleString()} properties`}
          </div>
          {data.results.length === 0
            ? <div className="lp-empty">No properties match these filters. Try widening the price range or clearing a filter.</div>
            : <div className="lp-grid">{data.results.map((p) => <PropertyCard key={p.id} property={p} />)}</div>}
          <Pagination page={current} pages={data.pages || 1} onPageChange={changePage} />
        </>
      )}
    </div>
  )
}
