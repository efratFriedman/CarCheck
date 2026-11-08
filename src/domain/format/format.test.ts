import { describe, expect, it } from 'vitest'
import { formatDate, formatNumber } from './format'

describe('formatNumber', () => {
  it('groups thousands using the he-IL locale', () => {
    expect(formatNumber(1234567)).toBe('1,234,567')
  })

  it('keeps small numbers unchanged', () => {
    expect(formatNumber(42)).toBe('42')
  })
})

describe('formatDate', () => {
  // Midday UTC keeps the calendar date the same in any time zone a user is likely to be in.
  it('shows an ISO date as day.month.year using the he-IL locale', () => {
    expect(formatDate('2026-11-05T12:00:00.000Z')).toBe('5.11.2026')
  })

  it('does not pad single-digit days and months', () => {
    expect(formatDate('2026-01-09T12:00:00.000Z')).toBe('9.1.2026')
  })
})
