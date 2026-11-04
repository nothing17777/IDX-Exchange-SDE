import { useEffect, useRef, useState } from 'react'
import { parsePhotos } from './photos.js'

export default function PropertyImageGallery({ photos, alt = 'Property photo' }) {
  const list = parsePhotos(photos)
  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const overlay = useRef(null)

  // A plain <div> is not in the tab order, so it never receives keydown. The
  // overlay gets tabIndex={-1} to make it focusable, and focus moves to it as
  // soon as it opens — otherwise Escape and the arrow keys go to the body and
  // the handler below never fires.
  useEffect(() => {
    if (lightbox) overlay.current?.focus()
  }, [lightbox])

  if (list.length === 0) {
    return <div className="pd-gallery pd-gallery-empty">No photos available</div>
  }

  const current = Math.min(index, list.length - 1)
  const move = (delta) => setIndex((i) => (i + delta + list.length) % list.length)

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { setLightbox(false); return }
    if (e.key === 'ArrowRight') { e.preventDefault(); move(1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1) }
  }

  return (
    <div className="pd-gallery">
      <button
        type="button"
        className="pd-main"
        aria-label="Open photo full screen"
        onClick={() => setLightbox(true)}
      >
        <img src={list[current]} alt={`${alt} ${current + 1} of ${list.length}`} />
      </button>

      {list.length > 1 && (
        <ol className="pd-thumbs" aria-label="Photo thumbnails">
          {list.map((url, i) => (
            <li key={url + i}>
              <button
                type="button"
                className={i === current ? 'pd-thumb is-current' : 'pd-thumb'}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === current ? 'true' : undefined}
                onClick={() => setIndex(i)}
              >
                <img src={url} alt="" loading="lazy" />
              </button>
            </li>
          ))}
        </ol>
      )}

      {lightbox && (
        <div
          className="pd-lightbox"
          ref={overlay}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          tabIndex={-1}
          onKeyDown={onKeyDown}
          // Only a click on the backdrop itself closes; clicks on the photo or
          // the controls inside it land on a child and are left alone.
          onClick={(e) => { if (e.target === e.currentTarget) setLightbox(false) }}
        >
          <button type="button" className="pd-close" aria-label="Close photo viewer" onClick={() => setLightbox(false)}>×</button>
          {list.length > 1 && (
            <button type="button" className="pd-lb-prev" aria-label="Previous photo" onClick={() => move(-1)}>&lsaquo;</button>
          )}
          <img className="pd-lb-img" src={list[current]} alt={`${alt} ${current + 1} of ${list.length}`} />
          {list.length > 1 && (
            <button type="button" className="pd-lb-next" aria-label="Next photo" onClick={() => move(1)}>&rsaquo;</button>
          )}
          <span className="pd-lb-counter">{current + 1} / {list.length}</span>
        </div>
      )}
    </div>
  )
}
