import { describe, expect, it } from 'vitest'
import { updateDecision } from './decision'
import { createCar } from '../car/car'
import { LIMITS } from '../limits'
import type { Car } from '../types'

const car: Car = createCar(
  { make: 'מאזדה', model: '3', year: 2019, mileage: null, askingPrice: null, licensePlate: '' },
  'car-1',
  new Date('2026-11-05T08:00:00Z'),
)

describe('updateDecision', () => {
  it('starts as still evaluating with no reason (FR-7.1)', () => {
    expect(car.decision).toEqual({ value: 'evaluating', reason: '' })
  })

  it('changes the value and keeps the reason', () => {
    const withReason = updateDecision(car, { reason: 'מחיר טוב' })
    const next = updateDecision(withReason, { value: 'movingForward' })
    expect(next.decision).toEqual({ value: 'movingForward', reason: 'מחיר טוב' })
  })

  it('changes the reason and keeps the value', () => {
    const notBuying = updateDecision(car, { value: 'notBuying' })
    expect(updateDecision(notBuying, { reason: 'שעבוד' }).decision).toEqual({
      value: 'notBuying',
      reason: 'שעבוד',
    })
  })

  it('truncates the reason to the limit', () => {
    const next = updateDecision(car, { reason: 'א'.repeat(LIMITS.decisionReason + 5) })
    expect(next.decision.reason).toHaveLength(LIMITS.decisionReason)
  })

  it('leaves the original car and its answers untouched', () => {
    const next = updateDecision(car, { value: 'notBuying' })
    expect(car.decision.value).toBe('evaluating')
    expect(next.answers).toBe(car.answers)
  })
})
