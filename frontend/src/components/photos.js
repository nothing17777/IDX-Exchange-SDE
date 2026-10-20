// L_Photos may arrive as an array, a JSON string, null, '' or malformed JSON.
export function firstPhoto(photos) {
  let list = photos
  if (typeof list === 'string') {
    try { list = JSON.parse(list) } catch { return null }
  }
  if (!Array.isArray(list)) return null
  return list.find((u) => typeof u === 'string' && u.trim() !== '') ?? null
}
