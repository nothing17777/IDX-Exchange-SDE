// Remarks live inside the all_data JSON blob the MLS feed ships with each open
// house. The blob is not always valid JSON and is not always an object (some
// rows hold a bare string or null), so every access past the parse is guarded
// and a bad blob simply means "no remarks".
export function openHouseRemarks(oh) {
  if (!oh) return null
  if (oh.remarks) return oh.remarks
  if (typeof oh.all_data !== 'string') return null
  try {
    const parsed = JSON.parse(oh.all_data)
    if (parsed && typeof parsed === 'object') return parsed.OpenHouseRemarks || null
  } catch { /* malformed blob: leave the remarks off */ }
  return null
}

// Dates arrive as 'YYYY-MM-DD' or a full ISO timestamp. Slicing to the date
// part and pinning midnight keeps the day from sliding backwards in timezones
// behind UTC, which a bare new Date('2026-05-01') would do.
export function formatDate(value) {
  if (!value) return ''
  const d = new Date(`${String(value).slice(0, 10)}T00:00:00`)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

// Times arrive as 'HH:MM:SS'.
export function formatTime(value) {
  if (!value) return ''
  const [h, m] = String(value).split(':')
  const hour = Number(h)
  if (!Number.isFinite(hour)) return String(value)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const display = hour % 12 === 0 ? 12 : hour % 12
  return `${display}:${m ?? '00'} ${suffix}`
}

export default function OpenHouses({ openHouses }) {
  const list = Array.isArray(openHouses) ? openHouses : []

  return (
    <section className="pd-open-houses">
      <h2>Open houses</h2>
      {list.length === 0
        ? <p className="pd-no-open">No open houses scheduled</p>
        : (
          <ul className="pd-oh-list">
            {list.map((oh, i) => {
              const remarks = openHouseRemarks(oh)
              return (
                <li key={`${oh.date}-${oh.startTime}-${i}`} className="pd-oh">
                  <span className="pd-oh-date">{formatDate(oh.date)}</span>
                  <span className="pd-oh-time">{formatTime(oh.startTime)} – {formatTime(oh.endTime)}</span>
                  {remarks && <span className="pd-oh-remarks">{remarks}</span>}
                </li>
              )
            })}
          </ul>
        )}
    </section>
  )
}
