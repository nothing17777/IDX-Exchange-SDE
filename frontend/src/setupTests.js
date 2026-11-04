import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// jsdom has no layout, so it leaves scrollTo unimplemented and logs a "Not
// implemented" error for every call. Components legitimately scroll to the top
// on navigation, so stub it once here and let tests assert on the spy.
window.scrollTo = vi.fn()

afterEach(() => {
  cleanup()
  window.scrollTo.mockClear()
})
