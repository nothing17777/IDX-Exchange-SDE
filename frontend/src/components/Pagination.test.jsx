import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Pagination, { pageItems } from './Pagination.jsx'

const setup = (props) => {
  const onPageChange = vi.fn()
  render(<Pagination page={1} pages={5} onPageChange={onPageChange} {...props} />)
  return { onPageChange, user: userEvent.setup() }
}

const pageNumbers = () =>
  screen.getAllByRole('button', { name: /^Page \d+$/ }).map((b) => b.textContent)

describe('Pagination', () => {
  it('reports the current page and total', () => {
    setup({ page: 3, pages: 7 })
    expect(screen.getByText('Page 3 of 7')).toBeInTheDocument()
  })

  it('moves forward and back by one page', async () => {
    const { onPageChange, user } = setup({ page: 3, pages: 7 })
    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenCalledWith(4)
    await user.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('disables Previous on the first page', async () => {
    const { onPageChange, user } = setup({ page: 1, pages: 5 })
    const prev = screen.getByRole('button', { name: 'Previous page' })
    expect(prev).toBeDisabled()
    await user.click(prev)
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('disables Next on the last page', async () => {
    const { onPageChange, user } = setup({ page: 5, pages: 5 })
    const next = screen.getByRole('button', { name: 'Next page' })
    expect(next).toBeDisabled()
    await user.click(next)
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('jumps to a page typed into the box', async () => {
    const { onPageChange, user } = setup({ page: 1, pages: 20 })
    await user.type(screen.getByLabelText('Go to page'), '7')
    await user.click(screen.getByRole('button', { name: 'Go' }))
    expect(onPageChange).toHaveBeenCalledWith(7)
  })

  it('jumps on the Enter key and clears the box', async () => {
    const { onPageChange, user } = setup({ page: 1, pages: 20 })
    const box = screen.getByLabelText('Go to page')
    await user.type(box, '12{Enter}')
    expect(onPageChange).toHaveBeenCalledWith(12)
    expect(box).toHaveValue(null)
  })

  it('ignores a page number past the last page', async () => {
    const { onPageChange, user } = setup({ page: 1, pages: 20 })
    await user.type(screen.getByLabelText('Go to page'), '99{Enter}')
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('ignores zero, negative and empty input', async () => {
    const { onPageChange, user } = setup({ page: 3, pages: 20 })
    const box = screen.getByLabelText('Go to page')
    await user.click(screen.getByRole('button', { name: 'Go' }))
    await user.type(box, '0{Enter}')
    await user.clear(box)
    await user.type(box, '-2{Enter}')
    expect(onPageChange).not.toHaveBeenCalled()
  })


  it('renders every page number when they all fit', () => {
    setup({ page: 2, pages: 5 })
    expect(screen.getAllByRole('button', { name: /^Page \d+$/ }).map((b) => b.textContent))
      .toEqual(['1', '2', '3', '4', '5'])
    expect(screen.queryByText('…')).not.toBeInTheDocument()
  })

  it('marks the current page number', () => {
    setup({ page: 3, pages: 9 })
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Page 4' })).not.toHaveAttribute('aria-current')
  })

  it('navigates to a clicked page number', async () => {
    const { onPageChange, user } = setup({ page: 12, pages: 24 })
    await user.click(screen.getByRole('button', { name: 'Page 13' }))
    expect(onPageChange).toHaveBeenCalledWith(13)
  })

  it('trails a single ellipsis on the first page of a long list', () => {
    setup({ page: 1, pages: 24 })
    expect(pageNumbers()).toEqual(['1', '2', '3', '4', '5', '24'])
    expect(screen.getAllByText('…')).toHaveLength(1)
  })

  it('brackets the current page with two ellipses in the middle', () => {
    setup({ page: 12, pages: 24 })
    expect(pageNumbers()).toEqual(['1', '11', '12', '13', '24'])
    expect(screen.getAllByText('…')).toHaveLength(2)
  })

  it('leads with a single ellipsis near the end of a long list', () => {
    setup({ page: 23, pages: 24 })
    expect(pageNumbers()).toEqual(['1', '20', '21', '22', '23', '24'])
    expect(screen.getAllByText('…')).toHaveLength(1)
  })

  // Regression: near the end the last page used to be emitted twice, rendering
  // "1 … 2 3 4 … 1" instead of a run ending at the real last page.
  it('never repeats a page number at any position in a long list', () => {
    for (let page = 1; page <= 24; page += 1) {
      const items = pageItems(page, 24).filter((i) => typeof i === 'number')
      expect(new Set(items).size).toBe(items.length)
      expect(items).toEqual([...items].sort((a, b) => a - b))
      expect(items[0]).toBe(1)
      expect(items[items.length - 1]).toBe(24)
      expect(items).toContain(page)
    }
  })

  it('keeps the current page inside the visible window on every page', () => {
    for (const pages of [8, 9, 20, 24, 100]) {
      for (let page = 1; page <= pages; page += 1) {
        expect(pageItems(page, pages)).toContain(page)
      }
    }
  })

  it('renders nothing when there is only one page of results', () => {
    setup({ page: 1, pages: 1 })
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})
