import { describe, expect, it } from 'vitest'
import { createCar, detailsToInput, updateCarDetails } from './car'
import type { Car, CarDetails } from '../types'

const details: CarDetails = {
  make: 'מאזדה',
  model: '3',
  year: 2019,
  mileage: 85000,
  askingPrice: null,
  licensePlate: '12-345-67',
}

describe('createCar', () => {
  it('starts with no answers, no custom questions, and an undecided decision', () => {
    const car = createCar(details, 'car-1', new Date('2026-10-29T12:00:00Z'))
    expect(car).toEqual({
      id: 'car-1',
      details,
      answers: {},
      customQuestions: [],
      generalNotes: '',
      decision: { value: 'evaluating', reason: '' },
      createdAt: '2026-10-29T12:00:00.000Z',
    })
  })
})

describe('updateCarDetails', () => {
  it('replaces only the details and leaves answers and everything else untouched (AC-3.3)', () => {
    const car: Car = {
      ...createCar(details, 'car-1', new Date('2026-10-29T12:00:00Z')),
      answers: { 'history-01': { status: 'concern', note: 'הערה', followUp: true } },
      customQuestions: [{ id: 'c1', text: 'שאלה' }],
      generalNotes: 'הערות',
      decision: { value: 'movingForward', reason: 'סיבה' },
    }
    const updated = updateCarDetails(car, { ...details, mileage: 90000 })
    expect(updated.details.mileage).toBe(90000)
    expect({ ...updated, details: car.details }).toEqual(car)
  })
})

describe('detailsToInput', () => {
  it('returns an empty form for no details', () => {
    expect(detailsToInput(null)).toEqual({
      make: '',
      model: '',
      year: '',
      mileage: '',
      askingPrice: '',
      licensePlate: '',
    })
  })

  it('turns numbers into digit strings and null into empty strings', () => {
    expect(detailsToInput(details)).toEqual({
      make: 'מאזדה',
      model: '3',
      year: '2019',
      mileage: '85000',
      askingPrice: '',
      licensePlate: '12-345-67',
    })
  })
})
