import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PropertyMap, { mapSrc } from './PropertyMap.jsx'

const frame = () => document.querySelector('iframe')

describe('PropertyMap', () => {
  it('renders an iframe at the property location', () => {
    render(<PropertyMap lat={33.68} lng={-117.82} address="1 Oak St" />)
    const el = screen.getByTitle('Map of 1 Oak St')
    expect(el.tagName).toBe('IFRAME')
    expect(el.getAttribute('src')).toContain('33.68,-117.82')
  })

  it('builds the Embed API url when a key is configured', () => {
    expect(mapSrc(33.68, -117.82, 'KEY123'))
      .toBe('https://www.google.com/maps/embed/v1/place?key=KEY123&q=33.68,-117.82&zoom=15')
  })

  it('falls back to the keyless embed when no key is configured', () => {
    expect(mapSrc(33.68, -117.82, '')).toContain('output=embed')
  })

  it('renders nothing when either coordinate is missing', () => {
    const { rerender } = render(<PropertyMap lat={33.68} lng={null} />)
    expect(frame()).toBeNull()
    rerender(<PropertyMap lat={null} lng={-117.82} />)
    expect(frame()).toBeNull()
    rerender(<PropertyMap />)
    expect(frame()).toBeNull()
  })

  it('treats the 0/0 placeholder and non-numeric values as no location', () => {
    const { rerender } = render(<PropertyMap lat={0} lng={0} />)
    expect(frame()).toBeNull()
    rerender(<PropertyMap lat="n/a" lng="n/a" />)
    expect(frame()).toBeNull()
  })

  it('offers a directions link that opens in a new tab', () => {
    render(<PropertyMap lat={33.68} lng={-117.82} />)
    const link = screen.getByRole('link', { name: 'Get Directions' })
    expect(link).toHaveAttribute('href', 'https://www.google.com/maps/dir/?api=1&destination=33.68,-117.82')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'))
  })
})
