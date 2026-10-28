import { useState } from 'react'

export default function Pagination({ page, pages, onPageChange }) {
  const [jumpTo, setJumpTo] = useState('')

  if (pages <= 1) return null

  const go = (e) => {
    e.preventDefault()
    const target = Number(jumpTo)
    // Ignore anything that is not a whole page inside the range, so a typo never blanks the list.
    if (!Number.isInteger(target) || target < 1 || target > pages) return
    setJumpTo('')
    onPageChange(target)
  }

  return (
    <nav className="lp-pager" aria-label="Pagination">
      <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        Previous page
      </button>
      <span className="lp-pager-status" aria-live="polite">Page {page} of {pages}</span>
      <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= pages}>
        Next page
      </button>
      <form className="lp-jump" onSubmit={go}>
        <label htmlFor="lp-jump-input">Go to page</label>
        <input
          id="lp-jump-input"
          type="number"
          min="1"
          max={pages}
          value={jumpTo}
          onChange={(e) => setJumpTo(e.target.value)}
          placeholder={String(page)}
        />
        <button type="submit">Go</button>
      </form>
    </nav>
  )
}
