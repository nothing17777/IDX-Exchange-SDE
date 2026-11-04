import { useState } from 'react'

// Page numbers always shown around the current page on each side.
const SIBLINGS = 1

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i)

// Builds the list of page tokens: numbers plus 'gap-left'/'gap-right' ellipsis markers.
//
// Four cases, as the window of pages slides along:
//   1. everything fits            -> 1 2 3 4 5 6 7
//   2. current page near start    -> 1 2 3 4 5 … 24
//   3. current page near the end  -> 1 … 20 21 22 23 24
//   4. current page in the middle -> 1 … 11 12 13 … 24
//
// Every branch owns a disjoint slice: the edge branches build their run with
// range() bounded against the first/last page, so page 1 and page `pages` are
// each emitted exactly once. Deriving the near-the-end run from a fixed count
// (rather than clamping both ends) is what used to re-emit the last page and
// render "1 … 2 3 4 … 1".
export function pageItems(page, pages, siblings = SIBLINGS) {
  const current = Math.min(Math.max(page, 1), pages)
  // Widest run we can show without ellipsis: first, last, the window, 2 gaps.
  const windowSize = siblings * 2 + 1
  const maxWithoutGaps = windowSize + 4
  if (pages <= maxWithoutGaps) return range(1, pages)

  const nearStart = current - siblings <= 3
  const nearEnd = current + siblings >= pages - 2

  if (nearStart) return [...range(1, Math.max(windowSize + 2, current + siblings)), 'gap-right', pages]
  if (nearEnd) return [1, 'gap-left', ...range(Math.min(pages - windowSize - 1, current - siblings), pages)]
  return [1, 'gap-left', ...range(current - siblings, current + siblings), 'gap-right', pages]
}

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
      <ol className="lp-pages">
        {pageItems(page, pages).map((item) =>
          typeof item === 'string'
            ? <li key={item} className="lp-gap" aria-hidden="true">…</li>
            : (
              <li key={item}>
                <button
                  type="button"
                  className={item === page ? 'lp-page is-current' : 'lp-page'}
                  aria-label={`Page ${item}`}
                  aria-current={item === page ? 'page' : undefined}
                  onClick={() => onPageChange(item)}
                >
                  {item}
                </button>
              </li>
            ))}
      </ol>
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
