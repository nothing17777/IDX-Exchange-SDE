// Vite exposes env vars prefixed VITE_ on import.meta.env (the REACT_APP_
// prefix in the brief belongs to Create React App, which this project does not
// use). With no key the keyless embed still renders, so a missing key degrades
// to a working map rather than a blank frame.
const API_KEY = import.meta.env?.VITE_GOOGLE_MAPS_API_KEY || ''

const isCoord = (v) => v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v)) && Number(v) !== 0

export function mapSrc(lat, lng, key = API_KEY) {
  return key
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${lat},${lng}&zoom=15`
    : `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`
}

export default function PropertyMap({ lat, lng, address }) {
  // 0/0 is the MLS placeholder for "no geocode", not a real location.
  if (!isCoord(lat) || !isCoord(lng)) return null

  const title = address ? `Map of ${address}` : 'Property location map'
  return (
    <section className="pd-map">
      <h2>Location</h2>
      <iframe
        title={title}
        className="pd-map-frame"
        src={mapSrc(Number(lat), Number(lng))}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <a
        className="pd-directions"
        href={`https://www.google.com/maps/dir/?api=1&destination=${Number(lat)},${Number(lng)}`}
        target="_blank"
        rel="noreferrer"
      >
        Get Directions
      </a>
    </section>
  )
}
