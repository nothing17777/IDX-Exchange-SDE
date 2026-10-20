import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, buildQuery, fetchProperties, fetchPropertyDetail } from './client.js'

const jsonResponse = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body })

describe('api client', () => {
  beforeEach(() => { global.fetch = vi.fn() })
  afterEach(() => { vi.restoreAllMocks() })

  it('fetchProperties returns the parsed JSON body on success', async () => {
    const body = { total: 1, results: [{ id: '1' }] }
    fetch.mockResolvedValue(jsonResponse(200, body))
    await expect(fetchProperties({ city: 'Irvine' })).resolves.toEqual(body)
    expect(fetch).toHaveBeenCalledWith('/api/properties?city=Irvine', expect.any(Object))
  })

  it('does not send empty filter values to the API', async () => {
    fetch.mockResolvedValue(jsonResponse(200, { total: 0, results: [] }))
    await fetchProperties({ city: 'Irvine', zipcode: '', minPrice: '  ', beds: '3', baths: null, maxPrice: undefined })
    expect(fetch).toHaveBeenCalledWith('/api/properties?city=Irvine&beds=3', expect.any(Object))
    expect(buildQuery({ city: '' })).toBe('')
  })

  it('throws the server error message and details on a 4xx response', async () => {
    fetch.mockResolvedValue(jsonResponse(400, { error: 'Invalid query parameters', details: ['minPrice must not exceed maxPrice'] }))
    const err = await fetchProperties({ minPrice: 9, maxPrice: 1 }).catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err.status).toBe(400)
    expect(err.message).toBe('Invalid query parameters: minPrice must not exceed maxPrice')
  })

  it('throws a meaningful error for a 404 on property detail', async () => {
    fetch.mockResolvedValue(jsonResponse(404, { error: "No property found with listing id 'nope'" }))
    await expect(fetchPropertyDetail('nope')).rejects.toThrow("No property found with listing id 'nope'")
  })

  it('reports an unavailable server when the error body is not JSON', async () => {
    fetch.mockResolvedValue({ ok: false, status: 502, json: async () => { throw new SyntaxError('bad json') } })
    await expect(fetchProperties()).rejects.toThrow('The server is unavailable (HTTP 502)')
  })

  it('reports an unreachable backend when fetch itself fails', async () => {
    fetch.mockRejectedValue(new TypeError('Failed to fetch'))
    const err = await fetchProperties().catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err.message).toMatch(/Unable to reach the server/)
  })
})
