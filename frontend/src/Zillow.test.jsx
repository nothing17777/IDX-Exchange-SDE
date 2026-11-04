import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Pager, resultRange, loadList } from './Zillow.jsx'

const setup = (props) => {
  const onGo = vi.fn()
  const view = render(<Pager page={1} pages={200} onGo={onGo} {...props} />)
  return { onGo, user: userEvent.setup(), ...view }
}

describe('Pager (for-sale / rent)', () => {
  it('shows the current page and the page count', () => {
    setup({ page: 3, pages: 200 })
    expect(screen.getByText('Page 3 of 200')).toBeInTheDocument()
  })

  it('steps forward and back', async () => {
    const { onGo, user } = setup({ page: 3 })
    await user.click(screen.getByRole('button', { name: 'Next ›' }))
    expect(onGo).toHaveBeenCalledWith(4)
    await user.click(screen.getByRole('button', { name: '‹ Prev' }))
    expect(onGo).toHaveBeenCalledWith(2)
  })

  it('disables Prev on the first page and Next on the last', () => {
    const { unmount } = setup({ page: 1, pages: 5 })
    expect(screen.getByRole('button', { name: '‹ Prev' })).toBeDisabled()
    unmount()
    setup({ page: 5, pages: 5 })
    expect(screen.getByRole('button', { name: 'Next ›' })).toBeDisabled()
  })

  it('jumps to a typed page on Enter', async () => {
    const { onGo, user } = setup({ page: 1, pages: 200 })
    await user.type(screen.getByLabelText('Go to page'), '42{Enter}')
    expect(onGo).toHaveBeenCalledWith(42)
  })

  it('ignores a page past the end', async () => {
    const { onGo, user } = setup({ page: 1, pages: 200 })
    await user.type(screen.getByLabelText('Go to page'), '500{Enter}')
    expect(onGo).not.toHaveBeenCalled()
  })

  it('renders nothing for a single page or an empty result set', () => {
    const { unmount } = setup({ page: 1, pages: 1 })
    expect(screen.queryByText(/Go to page/)).not.toBeInTheDocument()
    unmount()
    setup({ page: 1, pages: 0 })
    expect(screen.queryByText(/Go to page/)).not.toBeInTheDocument()
  })
  it('shows numbered pages with ellipsis for a long result set', () => {
    setup({ page: 12, pages: 200 })
    expect(screen.getAllByRole('button', { name: /^Page \d+$/ }).map((b) => b.textContent))
      .toEqual(['1', '11', '12', '13', '200'])
    expect(screen.getAllByText('…')).toHaveLength(2)
  })

  it('never repeats the last page number near the end', () => {
    setup({ page: 199, pages: 200 })
    const nums = screen.getAllByRole('button', { name: /^Page \d+$/ }).map((b) => b.textContent)
    expect(nums).toEqual(['1', '196', '197', '198', '199', '200'])
    expect(new Set(nums).size).toBe(nums.length)
  })

  it('marks and navigates to a clicked page number', async () => {
    const { onGo, user } = setup({ page: 3, pages: 200 })
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page')
    await user.click(screen.getByRole('button', { name: 'Page 4' }))
    expect(onGo).toHaveBeenCalledWith(4)
  })
})

describe('resultRange', () => {
  it('summarises the range on the current page', () => {
    expect(resultRange({ total: 487, page: 1, limit: 20, results: new Array(20) }))
      .toBe('Showing 1-20 of 487 properties')
    expect(resultRange({ total: 487, page: 3, limit: 20, results: new Array(20) }))
      .toBe('Showing 41-60 of 487 properties')
  })

  it('handles the short last page, no results and no data', () => {
    expect(resultRange({ total: 487, page: 25, limit: 20, results: new Array(7) }))
      .toBe('Showing 481-487 of 487 properties')
    expect(resultRange({ total: 0, page: 1, limit: 20, results: [] })).toBe('Showing 0 of 0 properties')
    expect(resultRange(null)).toBe('Loading...')
  })
})

// Regression: an API error used to be stored as-is, so the grid called
// .map on an undefined results array and the whole page rendered blank.
describe('loadList', () => {
  afterEach(() => vi.restoreAllMocks())

  it('passes a normal payload straight through', async () => {
    global.fetch = vi.fn(async () => ({ json: async () => ({ total: 2, results: [1, 2] }) }))
    const setD = vi.fn()
    await loadList('/api/properties', setD)
    expect(setD).toHaveBeenCalledWith({ total: 2, results: [1, 2] })
  })

  it('turns an error payload into an empty list plus a message', async () => {
    global.fetch = vi.fn(async () => ({ json: async () => ({ error: 'Server error' }) }))
    const setD = vi.fn()
    await loadList('/api/properties', setD)
    expect(setD).toHaveBeenCalledWith({ error: 'Server error', results: [], total: 0, pages: 0 })
  })

  it('reports an unreachable server without throwing', async () => {
    global.fetch = vi.fn(async () => { throw new Error('offline') })
    const setD = vi.fn()
    await loadList('/api/properties', setD)
    expect(setD.mock.calls[0][0].results).toEqual([])
    expect(setD.mock.calls[0][0].error).toMatch(/Could not reach the server/)
  })
})
