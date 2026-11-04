import { useState } from 'react'
import { parsePhotos } from './photos.js'

// Photo strip for a listing card. The card itself is a link, so the arrows
// must swallow their click rather than let it bubble up and navigate away.
export default function PropertyImageCarousel({ photos, alt = 'Property photo', className = '' }) {
  const list = parsePhotos(photos)
  const [index, setIndex] = useState(0)
  const [broken, setBroken] = useState({})
  const cx = (extra) => `lp-photo ${extra}${className ? ` ${className}` : ''}`.trim()

  if (list.length === 0) {
    return <div className={cx('')}><span>No photo available</span></div>
  }

  const current = Math.min(index, list.length - 1)
  const step = (delta) => (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIndex((i) => (i + delta + list.length) % list.length)
  }

  return (
    <div className={cx('lp-carousel')}>
      {broken[current]
        ? <span>Photo unavailable</span>
        : (
          <img
            src={list[current]}
            alt={`${alt} ${current + 1} of ${list.length}`}
            loading="lazy"
            onError={() => setBroken((b) => ({ ...b, [current]: true }))}
          />
        )}
      {list.length > 1 && (
        <>
          <button type="button" className="lp-arrow lp-prev" aria-label="Previous photo" onClick={step(-1)}>&lsaquo;</button>
          <button type="button" className="lp-arrow lp-next" aria-label="Next photo" onClick={step(1)}>&rsaquo;</button>
          <span className="lp-counter">{current + 1} / {list.length}</span>
        </>
      )}
    </div>
  )
}
