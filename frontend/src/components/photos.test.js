import { describe, expect, it } from 'vitest'
import { firstPhoto } from './photos.js'

describe('firstPhoto', () => {
  it('returns the first URL from an array or JSON string', () => {
    expect(firstPhoto(['a.jpg', 'b.jpg'])).toBe('a.jpg')
    expect(firstPhoto('["a.jpg","b.jpg"]')).toBe('a.jpg')
  })

  it('returns null for missing, empty, malformed or non-array values', () => {
    for (const v of [null, undefined, '', '[]', '{not json', '"a.jpg"', '{"url":"a.jpg"}', [], [null, ''], 42]) {
      expect(firstPhoto(v)).toBeNull()
    }
  })

  it('skips empty entries to find the first usable URL', () => {
    expect(firstPhoto(['', null, 'c.jpg'])).toBe('c.jpg')
  })
})
