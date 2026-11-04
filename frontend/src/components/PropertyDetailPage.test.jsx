import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PropertyDetailPage from './PropertyDetailPage.jsx'
import ListingsPage from './ListingsPage.jsx'

const detail = (over = {}) => ({
  id: 'OC1234',
  address: '15 Harbor Way',
  city: 'Newport Beach',
  state: 'CA',
  zip: '92660',
  price: 1850000,
  beds: 4,
  baths: 3,
  sqft: 2840,
  yearBuilt: 1998,
  type: 'Residential',
  lotAcres: 0.22,
  remarks: 'Single-level home with an ocean view.',
  lat: 33.61,
  lng: -117.9,
  photos: ['http://img/a.jpg', 'http://img/b.jpg'],
  openHouses: [],
  ...over,
})

const mockFetch = (body, { ok = true, status = 200 } = {}) => {
  global.fetch = vi.fn(async () => ({ ok, status, json: async () => body }))
}

const renderDetail = (id = 'OC1234') => render(
  <MemoryRouter initialEntries={[`/listings/property/${id}`]}>
    <Routes>
      <Route path="/listings" element={<div>Listings page</div>} />
      <Route path="/listings/property/:id" element={<PropertyDetailPage />} />
    </Routes>
  </MemoryRouter>,
)

describe('PropertyDetailPage', () => {
  afterEach(() => vi.restoreAllMocks())

  it('requests the property by the id in the url', async () => {
    mockFetch(detail())
    renderDetail('OC1234')
    expect(screen.getByRole('status')).toHaveTextContent('Loading property')
    await screen.findByText('$1,850,000')
    expect(global.fetch).toHaveBeenCalledWith('/api/properties/OC1234', expect.anything())
  })

  it('shows the price, address, stats and description', async () => {
    mockFetch(detail())
    renderDetail()
    expect(await screen.findByText('$1,850,000')).toBeInTheDocument()
    expect(screen.getByText('15 Harbor Way, Newport Beach, CA 92660')).toBeInTheDocument()
    expect(screen.getByText('Single-level home with an ocean view.')).toBeInTheDocument()
    for (const [label, value] of [['Beds', '4'], ['Baths', '3'], ['Square feet', '2,840'], ['Year built', '1998']]) {
      expect(screen.getByText(label)).toBeInTheDocument()
      expect(screen.getByText(value)).toBeInTheDocument()
    }
    expect(screen.getByText('0.22 acres')).toBeInTheDocument()
  })

  it('renders the gallery, the map and the open houses', async () => {
    mockFetch(detail({
      openHouses: [{ date: '2026-05-02', startTime: '13:00:00', endTime: '16:00:00', all_data: '{"OpenHouseRemarks":"Side gate"}' }],
    }))
    renderDetail()
    await screen.findByText('$1,850,000')
    expect(screen.getByRole('button', { name: 'Open photo full screen' })).toBeInTheDocument()
    expect(screen.getByTitle('Map of 15 Harbor Way')).toBeInTheDocument()
    expect(screen.getByText('Saturday, May 2')).toBeInTheDocument()
    expect(screen.getByText('Side gate')).toBeInTheDocument()
  })

  it('says when there are no open houses and hides the map without coordinates', async () => {
    mockFetch(detail({ lat: null, lng: null, openHouses: [] }))
    renderDetail()
    expect(await screen.findByText('No open houses scheduled')).toBeInTheDocument()
    expect(document.querySelector('iframe')).toBeNull()
  })

  it('shows an error instead of crashing for an unknown listing id', async () => {
    mockFetch({ error: "No property found with listing id 'invalid-id'" }, { ok: false, status: 404 })
    renderDetail('invalid-id')
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent("No property found with listing id 'invalid-id'")
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('goes back to the listings page', async () => {
    const user = userEvent.setup()
    mockFetch(detail())
    renderDetail()
    await screen.findByText('$1,850,000')
    await user.click(screen.getByRole('link', { name: '← Back to listings' }))
    expect(await screen.findByText('Listings page')).toBeInTheDocument()
  })
})

describe('listings to detail navigation', () => {
  afterEach(() => vi.restoreAllMocks())

  it('opens the detail page for the card that was clicked', async () => {
    const user = userEvent.setup()
    global.fetch = vi.fn(async (url) => ({
      ok: true,
      status: 200,
      json: async () => (String(url).includes('/api/properties/OC1234')
        ? detail()
        : { total: 1, page: 1, pages: 1, results: [{ id: 'OC1234', address: '15 Harbor Way', city: 'Newport Beach', state: 'CA', price: 1850000, beds: 4, baths: 3, sqft: 2840, photos: [] }] }),
    }))

    render(
      <MemoryRouter initialEntries={['/listings']}>
        <Routes>
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listings/property/:id" element={<PropertyDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(await screen.findByText('15 Harbor Way'))
    expect(await screen.findByText('$1,850,000')).toBeInTheDocument()
  })
})
