import { useState } from 'react'

export const EMPTY_FILTERS = { city: '', zipcode: '', minPrice: '', maxPrice: '', beds: '', baths: '' }

export default function PropertyFilters({ onSearch, onClear }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const set = (key) => (e) => setFilters({ ...filters, [key]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    onSearch(filters)
  }
  const clear = () => {
    setFilters(EMPTY_FILTERS)
    onClear()
  }

  return (
    <form className="lp-filters" onSubmit={submit} aria-label="Property filters">
      <label>City<input value={filters.city} onChange={set('city')} placeholder="e.g. Irvine" /></label>
      <label>ZIP code<input value={filters.zipcode} onChange={set('zipcode')} inputMode="numeric" placeholder="e.g. 92618" /></label>
      <label>Min price<input type="number" min="0" value={filters.minPrice} onChange={set('minPrice')} placeholder="No min" /></label>
      <label>Max price<input type="number" min="0" value={filters.maxPrice} onChange={set('maxPrice')} placeholder="No max" /></label>
      <label>Beds
        <select value={filters.beds} onChange={set('beds')}>
          <option value="">Any</option>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
        </select>
      </label>
      <label>Baths
        <select value={filters.baths} onChange={set('baths')}>
          <option value="">Any</option>
          {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
        </select>
      </label>
      <div className="lp-actions">
        <button type="submit">Search</button>
        <button type="button" className="secondary" onClick={clear}>Clear Filters</button>
      </div>
    </form>
  )
}
