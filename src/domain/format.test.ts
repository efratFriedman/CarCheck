import { describe, expect, it } from 'vitest'
import { formatNumber } from './format'

describe('formatNumber', () => {
  it('groups thousands using the he-IL locale', () => {
    expect(formatNumber(1234567)).toBe('1,234,567')
  })

  it('keeps small numbers unchanged', () => {
    expect(formatNumber(42)).toBe('42')
  })
})
