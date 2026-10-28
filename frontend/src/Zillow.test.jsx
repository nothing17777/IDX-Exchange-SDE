import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pager } from './Zillow.jsx'

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
})
