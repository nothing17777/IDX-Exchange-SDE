import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import OpenHouses, { formatDate, formatTime, openHouseRemarks } from './OpenHouses.jsx'

const oh = (over = {}) => ({ date: '2026-05-02', startTime: '13:00:00', endTime: '16:00:00', ...over })

describe('OpenHouses', () => {
  it('lists each open house with its date and formatted times', () => {
    render(<OpenHouses openHouses={[oh(), oh({ date: '2026-05-03', startTime: '09:30:00', endTime: '12:00:00' })]} />)
    expect(screen.getByText('Saturday, May 2')).toBeInTheDocument()
    expect(screen.getByText('1:00 PM – 4:00 PM')).toBeInTheDocument()
    expect(screen.getByText('9:30 AM – 12:00 PM')).toBeInTheDocument()
  })

  it('shows a message when nothing is scheduled', () => {
    const { rerender } = render(<OpenHouses openHouses={[]} />)
    expect(screen.getByText('No open houses scheduled')).toBeInTheDocument()
    rerender(<OpenHouses openHouses={undefined} />)
    expect(screen.getByText('No open houses scheduled')).toBeInTheDocument()
  })

  // Regression: remarks live inside the all_data JSON blob, so reading
  // oh.remarks alone left them blank for every feed row that ships the blob.
  it('extracts remarks from the all_data JSON blob', () => {
    render(<OpenHouses openHouses={[oh({ all_data: JSON.stringify({ OpenHouseRemarks: 'Enter through the side gate' }) })]} />)
    expect(screen.getByText('Enter through the side gate')).toBeInTheDocument()
  })

  it('prefers remarks the API already extracted', () => {
    expect(openHouseRemarks({ remarks: 'From the API', all_data: '{"OpenHouseRemarks":"From the blob"}' }))
      .toBe('From the API')
  })

  it('renders no remarks line for a missing, malformed or non-object blob', () => {
    for (const all_data of [undefined, null, 'not json', '"a bare string"', 'null', '{}']) {
      expect(openHouseRemarks({ ...oh(), all_data })).toBeNull()
    }
    render(<OpenHouses openHouses={[oh({ all_data: '{broken' })]} />)
    expect(screen.getByText('Saturday, May 2')).toBeInTheDocument()
  })

  it('formats dates from a full timestamp without sliding a day', () => {
    expect(formatDate('2026-05-02T00:00:00.000Z')).toBe('Saturday, May 2')
    expect(formatDate(null)).toBe('')
    expect(formatDate('garbage')).toBe('garbage')
  })

  it('formats midnight and noon correctly', () => {
    expect(formatTime('00:15:00')).toBe('12:15 AM')
    expect(formatTime('12:00:00')).toBe('12:00 PM')
    expect(formatTime('23:45:00')).toBe('11:45 PM')
    expect(formatTime('')).toBe('')
  })
})
