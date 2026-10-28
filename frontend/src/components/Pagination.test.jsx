import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Pagination from './Pagination.jsx'

const setup = (props) => {
  const onPageChange = vi.fn()
  render(<Pagination page={1} pages={5} onPageChange={onPageChange} {...props} />)
  return { onPageChange, user: userEvent.setup() }
}

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

  it('renders nothing when there is only one page of results', () => {
    setup({ page: 1, pages: 1 })
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})
