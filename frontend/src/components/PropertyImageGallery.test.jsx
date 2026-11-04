import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import PropertyImageGallery from './PropertyImageGallery.jsx'

const photos = ['http://img/a.jpg', 'http://img/b.jpg', 'http://img/c.jpg']

const mainImage = () => screen.getByRole('button', { name: 'Open photo full screen' }).querySelector('img')
const openLightbox = async (user) => {
  await user.click(screen.getByRole('button', { name: 'Open photo full screen' }))
  return screen.getByRole('dialog')
}

describe('PropertyImageGallery', () => {
  it('shows the first photo with a thumbnail for each image', () => {
    render(<PropertyImageGallery photos={photos} />)
    expect(mainImage()).toHaveAttribute('src', 'http://img/a.jpg')
    expect(screen.getAllByRole('button', { name: /^Show photo \d$/ })).toHaveLength(3)
  })

  it('updates the main image when a thumbnail is clicked', async () => {
    const user = userEvent.setup()
    render(<PropertyImageGallery photos={photos} />)
    await user.click(screen.getByRole('button', { name: 'Show photo 3' }))
    expect(mainImage()).toHaveAttribute('src', 'http://img/c.jpg')
    expect(screen.getByRole('button', { name: 'Show photo 3' })).toHaveAttribute('aria-current', 'true')
  })

  it('parses a JSON string and tolerates malformed photo data', () => {
    const { rerender } = render(<PropertyImageGallery photos={JSON.stringify(photos)} />)
    expect(screen.getAllByRole('button', { name: /^Show photo \d$/ })).toHaveLength(3)
    rerender(<PropertyImageGallery photos="{broken" />)
    expect(screen.getByText('No photos available')).toBeInTheDocument()
  })

  it('hides the thumbnail strip for a single photo', () => {
    render(<PropertyImageGallery photos={['http://img/only.jpg']} />)
    expect(screen.queryByRole('list', { name: 'Photo thumbnails' })).not.toBeInTheDocument()
  })

  it('opens a lightbox when the main image is clicked', async () => {
    const user = userEvent.setup()
    render(<PropertyImageGallery photos={photos} />)
    const dialog = await openLightbox(user)
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('navigates photos from inside the lightbox', async () => {
    const user = userEvent.setup()
    render(<PropertyImageGallery photos={photos} />)
    await openLightbox(user)
    await user.click(screen.getByRole('button', { name: 'Next photo' }))
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Previous photo' }))
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('navigates photos with the left and right arrow keys', async () => {
    const user = userEvent.setup()
    render(<PropertyImageGallery photos={photos} />)
    await openLightbox(user)
    await user.keyboard('{ArrowRight}')
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  // Regression: a bare <div> is not focusable, so the overlay never received
  // keydown and Escape did nothing. It needs tabIndex plus focus on open.
  it('closes the lightbox on the Escape key', async () => {
    const user = userEvent.setup()
    render(<PropertyImageGallery photos={photos} />)
    const dialog = await openLightbox(user)
    expect(dialog).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes the lightbox on a click outside the photo', async () => {
    const user = userEvent.setup()
    render(<PropertyImageGallery photos={photos} />)
    const dialog = await openLightbox(user)
    await user.click(dialog)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('keeps the lightbox open when the photo itself is clicked', async () => {
    const user = userEvent.setup()
    render(<PropertyImageGallery photos={photos} />)
    await openLightbox(user)
    await user.click(document.querySelector('.pd-lb-img'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes the lightbox from the close button', async () => {
    const user = userEvent.setup()
    render(<PropertyImageGallery photos={photos} />)
    await openLightbox(user)
    await user.click(screen.getByRole('button', { name: 'Close photo viewer' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
