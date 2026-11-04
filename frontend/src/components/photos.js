// L_Photos may arrive as an array, a JSON string, null, '' or malformed JSON.
export function parsePhotos(photos) {
  let list = photos
  if (typeof list === 'string') {
    try { list = JSON.parse(list) } catch { return [] }
  }
  if (!Array.isArray(list)) return []
  return list.filter((u) => typeof u === 'string' && u.trim() !== '')
}

export function firstPhoto(photos) {
  return parsePhotos(photos)[0] ?? null
}
