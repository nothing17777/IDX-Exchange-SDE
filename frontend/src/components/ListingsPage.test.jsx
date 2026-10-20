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
    expect(await screen.findByText('Showing 1 of 487 properties')).toBeInTheDocument()
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
