import { describe, expect, it } from 'vitest'
import { updateAnswer, updateGeneralNotes } from './answers'
import { createCar } from '../car/car'
import { LIMITS } from '../limits'
import type { Car } from '../types'

const car: Car = createCar(
  { make: 'מאזדה', model: '3', year: 2019, mileage: null, askingPrice: null, licensePlate: '' },
  'car-1',
  new Date('2026-11-03T08:00:00Z'),
)

describe('updateAnswer', () => {
  it('sets the status and keeps the other fields', () => {
    const next = updateAnswer(car, 'history-01', { status: 'concern' })
    expect(next.answers['history-01']).toEqual({ status: 'concern', note: '', followUp: false })
  })

  it('keeps status, note, and follow-up independent (FR-4.3)', () => {
    let next = updateAnswer(car, 'history-01', { note: 'הערה' })
    next = updateAnswer(next, 'history-01', { followUp: true })
    next = updateAnswer(next, 'history-01', { status: 'unknown' })
    expect(next.answers['history-01']).toEqual({ status: 'unknown', note: 'הערה', followUp: true })
    next = updateAnswer(next, 'history-01', { status: 'notAnswered' })
    expect(next.answers['history-01']).toEqual({
      status: 'notAnswered',
      note: 'הערה',
      followUp: true,
    })
  })

  it('removes the entry when every field is back to its default', () => {
    const answered = updateAnswer(car, 'history-01', { status: 'ok' })
    const cleared = updateAnswer(answered, 'history-01', { status: 'notAnswered' })
    expect(cleared.answers).toEqual({})
  })

  it('truncates a note to the limit', () => {
    const next = updateAnswer(car, 'history-01', { note: 'א'.repeat(LIMITS.note + 10) })
    expect(next.answers['history-01'].note).toHaveLength(LIMITS.note)
  })

  it('leaves the original car and other answers untouched', () => {
    const first = updateAnswer(car, 'history-01', { status: 'ok' })
    const second = updateAnswer(first, 'history-02', { followUp: true })
    expect(car.answers).toEqual({})
    expect(first.answers['history-01']).toEqual(second.answers['history-01'])
    expect(Object.keys(first.answers)).toEqual(['history-01'])
  })
})

describe('updateGeneralNotes', () => {
  it('replaces the general notes', () => {
    expect(updateGeneralNotes(car, 'הערות').generalNotes).toBe('הערות')
  })

  it('truncates to the limit', () => {
    const next = updateGeneralNotes(car, 'א'.repeat(LIMITS.generalNotes + 1))
    expect(next.generalNotes).toHaveLength(LIMITS.generalNotes)
  })
})
