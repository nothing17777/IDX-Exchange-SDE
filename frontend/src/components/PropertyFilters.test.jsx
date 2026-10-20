import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PropertyFilters, { EMPTY_FILTERS } from './PropertyFilters.jsx'

const setup = () => {
  const onSearch = vi.fn()
  const onClear = vi.fn()
  render(<PropertyFilters onSearch={onSearch} onClear={onClear} />)
  return { onSearch, onClear, user: userEvent.setup() }
}

describe('PropertyFilters', () => {
  it('renders all six filter inputs', () => {
    setup()
    for (const label of ['City', 'ZIP code', 'Min price', 'Max price', 'Beds', 'Baths']) {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    }
    expect(screen.getByLabelText('Beds').tagName).toBe('SELECT')
    expect(screen.getByLabelText('Baths').tagName).toBe('SELECT')
  })

  it('submits combined filter values on Search', async () => {
    const { onSearch, user } = setup()
    await user.type(screen.getByLabelText('City'), 'Irvine')
    await user.type(screen.getByLabelText('Max price'), '900000')
    await user.selectOptions(screen.getByLabelText('Beds'), '3')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect(onSearch).toHaveBeenCalledWith({ ...EMPTY_FILTERS, city: 'Irvine', maxPrice: '900000', beds: '3' })
  })

  it('Clear Filters resets every input and notifies the parent', async () => {
    const { onClear, user } = setup()
    await user.type(screen.getByLabelText('City'), 'Irvine')
    await user.type(screen.getByLabelText('ZIP code'), '92618')
    await user.selectOptions(screen.getByLabelText('Baths'), '2')
    await user.click(screen.getByRole('button', { name: 'Clear Filters' }))
    expect(onClear).toHaveBeenCalledTimes(1)
    expect(screen.getByLabelText('City')).toHaveValue('')
    expect(screen.getByLabelText('ZIP code')).toHaveValue('')
    expect(screen.getByLabelText('Baths')).toHaveValue('')
  })

  it('submits via the Enter key', async () => {
    const { onSearch, user } = setup()
    await user.type(screen.getByLabelText('ZIP code'), '92618{Enter}')
    expect(onSearch).toHaveBeenCalledWith({ ...EMPTY_FILTERS, zipcode: '92618' })
  })
})
