export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function buildQuery(params = {}) {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    const v = String(value).trim()
    if (v !== '') qs.set(key, v)
  }
  const s = qs.toString()
  return s ? `?${s}` : ''
}

async function request(path, { signal } = {}) {
  let res
  try {
    res = await fetch(path, { signal })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ApiError('Unable to reach the server. Check that the backend is running.', 0)
  }
  if (!res.ok) {
    let body = null
    try { body = await res.json() } catch { /* non-JSON error body, e.g. from the dev proxy */ }
    if (body?.error) {
      const details = Array.isArray(body.details) && body.details.length ? `: ${body.details.join(', ')}` : ''
      throw new ApiError(`${body.error}${details}`, res.status)
    }
    throw new ApiError(
      res.status >= 500
        ? `The server is unavailable (HTTP ${res.status}). Check that the backend is running.`
        : `Request failed (HTTP ${res.status}).`,
      res.status,
    )
  }
  return res.json()
}

export function fetchProperties(params = {}, options) {
  return request(`/api/properties${buildQuery(params)}`, options)
}

export function fetchPropertyDetail(id, options) {
  return request(`/api/properties/${encodeURIComponent(id)}`, options)
}

export function fetchOpenHouses(id, options) {
  return request(`/api/properties/${encodeURIComponent(id)}/openhouses`, options)
}
