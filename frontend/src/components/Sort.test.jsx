import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ForSale } from '../Zillow.jsx'

// One page of results is enough; the assertions are about the request URL the
// page builds, not about what comes back.
const listing = {
  id: '1', address: '1 Main St', city: 'Los Angeles', state: 'CA', zip: '90001',
  price: 500000, beds: 3, baths: 2, sqft: 1500, photos: [], yearBuilt: 2000,
}
const payload = { total: 60, limit: 20, offset: 0, page: 1, pages: 3, results: [listing] }

const calls = () => fetch.mock.calls.map(([url]) => String(url))
const lastList = () => calls().filter((u) => u.includes('/api/properties?')).at(-1)
const params = (url) => new URLSearchParams(url.split('?')[1])

function renderPage(initial = '/for-sale?q=Los+Angeles') {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes><Route path="/for-sale" element={<ForSale />} /></Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  // The page also loads map pins, which come back as a bare array.
  global.fetch = vi.fn((url) => Promise.resolve({
    ok: true,
    json: () => Promise.resolve(String(url).includes('/api/properties/map') ? [] : payload),
  }))
})
afterEach(() => vi.restoreAllMocks())

describe('sort control', () => {
  it('sends no sort parameters by default', async () => {
    renderPage()
    await waitFor(() => expect(lastList()).toBeTruthy())
    expect(params(lastList()).get('sortBy')).toBeNull()
  })

  it('requests the chosen field and direction', async () => {
    renderPage()
    await waitFor(() => expect(lastList()).toBeTruthy())
    await userEvent.selectOptions(screen.getByLabelText('Sort results'), 'price:asc')
    await waitFor(() => {
      const p = params(lastList())
      expect(p.get('sortBy')).toBe('price')
      expect(p.get('sortOrder')).toBe('asc')
    })
  })

  it('sorts by date listed', async () => {
    renderPage()
    await waitFor(() => expect(lastList()).toBeTruthy())
    await userEvent.selectOptions(screen.getByLabelText('Sort results'), 'listed:desc')
    await waitFor(() => {
      const p = params(lastList())
      expect(p.get('sortBy')).toBe('listed')
      expect(p.get('sortOrder')).toBe('desc')
    })
  })

  it('reads an existing sort out of the URL', async () => {
    renderPage('/for-sale?q=Los+Angeles&sortBy=sqft&sortOrder=desc')
    await waitFor(() => expect(lastList()).toBeTruthy())
    expect(screen.getByLabelText('Sort results')).toHaveValue('sqft:desc')
  })

  it('keeps the sort when the page changes', async () => {
    renderPage('/for-sale?q=Los+Angeles&sortBy=price&sortOrder=desc')
    await waitFor(() => expect(lastList()).toBeTruthy())
    await userEvent.click(screen.getByRole('button', { name: 'Page 2' }))
    await waitFor(() => {
      const p = params(lastList())
      expect(p.get('page')).toBe('2')
      expect(p.get('sortBy')).toBe('price')
      expect(p.get('sortOrder')).toBe('desc')
    })
  })

  it('returns to page one when the sort changes', async () => {
    renderPage('/for-sale?q=Los+Angeles&page=3&sortBy=price&sortOrder=desc')
    await waitFor(() => expect(lastList()).toBeTruthy())
    await userEvent.selectOptions(screen.getByLabelText('Sort results'), 'price:asc')
    await waitFor(() => expect(params(lastList()).get('page')).toBeNull())
  })

  it('resets the sort when filters are applied', async () => {
    renderPage('/for-sale?q=Los+Angeles&sortBy=price&sortOrder=asc')
    await waitFor(() => expect(lastList()).toBeTruthy())
    await userEvent.selectOptions(screen.getByDisplayValue('Property type ▾'), 'Condominium')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    await waitFor(() => {
      const p = params(lastList())
      expect(p.get('type')).toBe('Condominium')
      expect(p.get('sortBy')).toBeNull()
      expect(p.get('sortOrder')).toBeNull()
    })
    expect(screen.getByLabelText('Sort results')).toHaveValue('')
  })
})
