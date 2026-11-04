import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import PropertyImageCarousel from './PropertyImageCarousel.jsx'
import PropertyCard from './PropertyCard.jsx'

const photos = ['http://img/a.jpg', 'http://img/b.jpg', 'http://img/c.jpg']

describe('PropertyImageCarousel', () => {
  it('shows the first photo and the counter', () => {
    render(<PropertyImageCarousel photos={photos} alt="123 Main St" />)
    expect(screen.getByRole('img')).toHaveAttribute('src', 'http://img/a.jpg')
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('cycles forward with the next arrow', async () => {
    const user = userEvent.setup()
    render(<PropertyImageCarousel photos={photos} />)
    await user.click(screen.getByRole('button', { name: 'Next photo' }))
    expect(screen.getByRole('img')).toHaveAttribute('src', 'http://img/b.jpg')
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
  })

  it('wraps around in both directions', async () => {
    const user = userEvent.setup()
    render(<PropertyImageCarousel photos={photos} />)
    await user.click(screen.getByRole('button', { name: 'Previous photo' }))
    expect(screen.getByText('3 / 3')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next photo' }))
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('parses photos delivered as a JSON string', () => {
    render(<PropertyImageCarousel photos={JSON.stringify(photos)} />)
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('falls back to a placeholder for malformed or empty photo data', () => {
    const { rerender } = render(<PropertyImageCarousel photos="not json at all" />)
    expect(screen.getByText('No photo available')).toBeInTheDocument()
    rerender(<PropertyImageCarousel photos={[]} />)
    expect(screen.getByText('No photo available')).toBeInTheDocument()
    rerender(<PropertyImageCarousel photos={null} />)
    expect(screen.getByText('No photo available')).toBeInTheDocument()
  })

  it('hides the arrows and counter for a single photo', () => {
    render(<PropertyImageCarousel photos={['http://img/only.jpg']} />)
    expect(screen.queryByRole('button', { name: 'Next photo' })).not.toBeInTheDocument()
    expect(screen.queryByText('1 / 1')).not.toBeInTheDocument()
  })

  it('does not navigate to the detail page when an arrow is clicked', async () => {
    const user = userEvent.setup()
    const property = { id: 'A1', address: '1 Oak', city: 'Irvine', state: 'CA', price: 100, beds: 2, baths: 1, sqft: 900, photos }
    render(
      <MemoryRouter initialEntries={['/listings']}>
        <Routes>
          <Route path="/listings" element={<PropertyCard property={property} />} />
          <Route path="/listings/property/:id" element={<div>Detail page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Next photo' }))
    expect(screen.queryByText('Detail page')).not.toBeInTheDocument()
    expect(screen.getByText('2 / 3')).toBeInTheDocument()

    await user.click(screen.getByText('1 Oak'))
    expect(await screen.findByText('Detail page')).toBeInTheDocument()
  })
})
