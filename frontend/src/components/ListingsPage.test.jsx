import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ListingsPage from './ListingsPage.jsx'

const page = (address, total = 1) => ({ total, results: [{ id: address, address, city: 'X', state: 'CA', price: 1, beds: 1, baths: 1, sqft: 1, photos: [] }] })

// Responses resolve only when the test says so, so we can make an older request finish last.
function controllableFetch() {
  const pending = []
  global.fetch = vi.fn((url, { signal } = {}) => new Promise((resolve, reject) => {
    signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })))
    pending.push({ url, respond: (body) => resolve({ ok: true, status: 200, json: async () => body }) })
  }))
  return pending
}

describe('ListingsPage', () => {
  let pending
  beforeEach(() => { pending = controllableFetch() })
  afterEach(() => vi.restoreAllMocks())

  const renderPage = () => render(<MemoryRouter><ListingsPage /></MemoryRouter>)

  it('shows a loading state, then the property count', async () => {
    renderPage()
    expect(screen.getByRole('status')).toHaveTextContent('Loading properties')
    pending[0].respond(page('1 Main St', 487))
    expect(await screen.findByText('Showing 1-1 of 487 properties')).toBeInTheDocument()
  })

  it('sends all six filters to the API and renders the matching results', async () => {
    const user = userEvent.setup()
    renderPage()
    pending[0].respond(page('Initial'))
    await screen.findByText('Initial')

    await user.type(screen.getByLabelText('City'), 'Irvine')
    await user.type(screen.getByLabelText('ZIP code'), '92618')
    await user.type(screen.getByLabelText('Min price'), '400000')
    await user.type(screen.getByLabelText('Max price'), '900000')
    await user.selectOptions(screen.getByLabelText('Beds'), '3')
    await user.selectOptions(screen.getByLabelText('Baths'), '2')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    const req = pending[pending.length - 1]
    for (const part of ['city=Irvine', 'zipcode=92618', 'minPrice=400000', 'maxPrice=900000', 'beds=3', 'baths=2']) {
      expect(req.url).toContain(part)
    }
    req.respond(page('Filtered result'))
    expect(await screen.findByText('Filtered result')).toBeInTheDocument()
    expect(screen.queryByText('Initial')).not.toBeInTheDocument()
  })

  it('refetches without filters after Clear Filters', async () => {
    const user = userEvent.setup()
    renderPage()
    pending[0].respond(page('Initial'))
    await screen.findByText('Initial')

    await user.type(screen.getByLabelText('City'), 'Irvine')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    await user.click(screen.getByRole('button', { name: 'Clear Filters' }))

    const req = pending[pending.length - 1]
    expect(req.url).not.toContain('city=')
    req.respond(page('Unfiltered result'))
    expect(await screen.findByText('Unfiltered result')).toBeInTheDocument()
  })

  it('shows an empty-result message when no property matches the filters', async () => {
    renderPage()
    pending[0].respond({ total: 0, results: [] })
    expect(await screen.findByText(/No properties match these filters/)).toBeInTheDocument()
    expect(screen.getByText('Showing 0 of 0 properties')).toBeInTheDocument()
  })

  it('shows an error instead of results when the request fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid query parameters', details: ['minPrice must not exceed maxPrice'] }),
    })
    renderPage()
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Invalid query parameters: minPrice must not exceed maxPrice')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('requests the next page and keeps the active filters', async () => {
    const user = userEvent.setup()
    renderPage()
    pending[0].respond({ ...page('Page one'), total: 60, page: 1, pages: 3 })
    await screen.findByText('Page one')

    await user.type(screen.getByLabelText('City'), 'Irvine')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    pending[pending.length - 1].respond({ ...page('Filtered page one'), total: 60, page: 1, pages: 3 })
    await screen.findByText('Filtered page one')

    await user.click(screen.getByRole('button', { name: 'Next page' }))
    const req = pending[pending.length - 1]
    expect(req.url).toContain('page=2')
    expect(req.url).toContain('city=Irvine')
    req.respond({ ...page('Page two'), total: 60, page: 2, pages: 3 })
    expect(await screen.findByText('Page two')).toBeInTheDocument()
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()
  })

  it('scrolls back to the top when the page changes', async () => {
    const user = userEvent.setup()
    renderPage()
    pending[0].respond({ ...page('First'), total: 60, page: 1, pages: 3 })
    await screen.findByText('First')
    expect(window.scrollTo).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('summarises the range of results on the current page', async () => {
    const user = userEvent.setup()
    renderPage()
    pending[0].respond({ ...page('First'), total: 60, page: 1, pages: 3 })
    expect(await screen.findByText('Showing 1-1 of 60 properties')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next page' }))
    pending[pending.length - 1].respond({ ...page('Second'), total: 60, page: 2, pages: 3 })
    expect(await screen.findByText('Showing 21-21 of 60 properties')).toBeInTheDocument()
  })

  it('returns to page 1 when the filters change', async () => {
    const user = userEvent.setup()
    renderPage()
    pending[0].respond({ ...page('First'), total: 60, page: 1, pages: 3 })
    await screen.findByText('First')

    await user.click(screen.getByRole('button', { name: 'Next page' }))
    pending[pending.length - 1].respond({ ...page('Second'), total: 60, page: 2, pages: 3 })
    await screen.findByText('Page 2 of 3')

    await user.type(screen.getByLabelText('City'), 'Tustin')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    const req = pending[pending.length - 1]
    expect(req.url).not.toContain('page=2')
    expect(req.url).toContain('city=Tustin')
  })

  it('returns to page 1 when filters are cleared', async () => {
    const user = userEvent.setup()
    renderPage()
    pending[0].respond({ ...page('First'), total: 60, page: 1, pages: 3 })
    await screen.findByText('First')

    await user.click(screen.getByRole('button', { name: 'Next page' }))
    pending[pending.length - 1].respond({ ...page('Second'), total: 60, page: 2, pages: 3 })
    await screen.findByText('Page 2 of 3')

    await user.click(screen.getByRole('button', { name: 'Clear Filters' }))
    const req = pending[pending.length - 1]
    expect(req.url).not.toContain('page=2')
  })

  it('never shows results from a search that was superseded by Clear + a new search', async () => {
    const user = userEvent.setup()
    renderPage()
    pending[0].respond(page('Initial'))
    await screen.findByText('Initial')

    await user.type(screen.getByLabelText('City'), 'Irvine')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    await user.click(screen.getByRole('button', { name: 'Clear Filters' }))
    await user.type(screen.getByLabelText('City'), 'Tustin')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    const tustin = pending.find((p) => p.url.includes('city=Tustin'))
    const irvine = pending.find((p) => p.url.includes('city=Irvine'))
    tustin.respond(page('Tustin result'))
    expect(await screen.findByText('Tustin result')).toBeInTheDocument()
    irvine.respond(page('Irvine result'))
    await new Promise((r) => setTimeout(r, 0))
    expect(screen.queryByText('Irvine result')).not.toBeInTheDocument()
    expect(screen.getByText('Tustin result')).toBeInTheDocument()
  })
})
