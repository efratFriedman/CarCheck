import { describe, expect, it } from 'vitest'
import { createCar } from '../car/car'
import type { ArchivedCar, Car, CarDetails, StoredData } from '../types'
import { deleteArchivedCar, findArchivedCar, listArchivedCars, startNewCar } from './archive'

const oldDetails: CarDetails = {
  make: 'מאזדה',
  model: '3',
  year: 2019,
  mileage: 85000,
  askingPrice: 72000,
  licensePlate: '12-345-67',
}

const newDetails: CarDetails = {
  make: 'טויוטה',
  model: 'קורולה',
  year: 2020,
  mileage: null,
  askingPrice: null,
  licensePlate: '',
}

const now = new Date('2026-11-05T13:30:00.000Z')

function activeCar(): Car {
  return {
    ...createCar(oldDetails, 'car-old', new Date('2026-11-01T09:00:00.000Z')),
    answers: { 'history-01': { status: 'concern', note: 'תאונה קלה', followUp: true } },
    customQuestions: [{ id: 'custom-1', text: 'האם יש מפתח רזרבי?' }],
    generalNotes: 'נראה טוב',
    decision: { value: 'notBuying', reason: 'יקר מדי' },
  }
}

function archived(id: string, archivedAt: string): ArchivedCar {
  return { ...createCar(oldDetails, id, new Date('2026-10-01T09:00:00.000Z')), archivedAt }
}

function data(active: Car | null, archivedCars: ArchivedCar[] = []): StoredData {
  return { version: 1, activeCar: active, archivedCars }
}

describe('startNewCar', () => {
  it('creates the new active car without touching the archive when there is no active car', () => {
    const existing = archived('car-a', '2026-10-20T10:00:00.000Z')
    const result = startNewCar(data(null, [existing]), newDetails, 'car-new', now)
    expect(result.activeCar).toEqual(createCar(newDetails, 'car-new', now))
    expect(result.archivedCars).toEqual([existing])
  })

  it('archives the current car unchanged, with the archive date, at the front of the archive (AC-8.2)', () => {
    const current = activeCar()
    const existing = archived('car-a', '2026-10-20T10:00:00.000Z')
    const result = startNewCar(data(current, [existing]), newDetails, 'car-new', now)
    expect(result.archivedCars).toEqual([
      { ...current, archivedAt: '2026-11-05T13:30:00.000Z' },
      existing,
    ])
  })

  it('makes the new car active with every item not answered (AC-8.2)', () => {
    const result = startNewCar(data(activeCar()), newDetails, 'car-new', now)
    expect(result.activeCar).toEqual(createCar(newDetails, 'car-new', now))
    expect(result.activeCar?.answers).toEqual({})
    expect(result.activeCar?.customQuestions).toEqual([])
  })

  it('archives a current car that has no answers by the same rule', () => {
    const empty = createCar(oldDetails, 'car-empty', new Date('2026-11-04T09:00:00.000Z'))
    const result = startNewCar(data(empty), newDetails, 'car-new', now)
    expect(result.archivedCars).toEqual([{ ...empty, archivedAt: '2026-11-05T13:30:00.000Z' }])
  })

  it('does not change the data it was given (AC-8.1: nothing changes until the result is saved)', () => {
    const before = data(activeCar(), [archived('car-a', '2026-10-20T10:00:00.000Z')])
    const snapshot = structuredClone(before)
    startNewCar(before, newDetails, 'car-new', now)
    expect(before).toEqual(snapshot)
  })
})

describe('listArchivedCars', () => {
  it('returns an empty list when nothing is archived', () => {
    expect(listArchivedCars(data(null))).toEqual([])
  })

  it('lists archived cars newest first by archive date, whatever the stored order (FR-8.4)', () => {
    const oldest = archived('car-1', '2026-09-01T10:00:00.000Z')
    const newest = archived('car-3', '2026-11-01T10:00:00.000Z')
    const middle = archived('car-2', '2026-10-01T10:00:00.000Z')
    const stored = data(null, [oldest, newest, middle])
    expect(listArchivedCars(stored).map((car) => car.id)).toEqual(['car-3', 'car-2', 'car-1'])
    expect(stored.archivedCars.map((car) => car.id)).toEqual(['car-1', 'car-3', 'car-2'])
  })
})

describe('findArchivedCar', () => {
  it('finds an archived car by ID', () => {
    const target = archived('car-2', '2026-10-01T10:00:00.000Z')
    const stored = data(null, [archived('car-1', '2026-09-01T10:00:00.000Z'), target])
    expect(findArchivedCar(stored, 'car-2')).toBe(target)
  })

  it('returns null for an unknown ID, including the active car ID', () => {
    const stored = data(activeCar(), [archived('car-1', '2026-09-01T10:00:00.000Z')])
    expect(findArchivedCar(stored, 'nope')).toBeNull()
    expect(findArchivedCar(stored, 'car-old')).toBeNull()
  })
})

describe('deleteArchivedCar', () => {
  it('removes only that archived car and keeps the active car (FR-8.5)', () => {
    const current = activeCar()
    const keep = archived('car-1', '2026-09-01T10:00:00.000Z')
    const remove = archived('car-2', '2026-10-01T10:00:00.000Z')
    const result = deleteArchivedCar(data(current, [keep, remove]), 'car-2')
    expect(result).toEqual(data(current, [keep]))
  })

  it('leaves the data unchanged for an unknown ID', () => {
    const stored = data(activeCar(), [archived('car-1', '2026-09-01T10:00:00.000Z')])
    expect(deleteArchivedCar(stored, 'nope')).toEqual(stored)
  })

  it('does not change the data it was given', () => {
    const before = data(null, [archived('car-1', '2026-09-01T10:00:00.000Z')])
    const snapshot = structuredClone(before)
    deleteArchivedCar(before, 'car-1')
    expect(before).toEqual(snapshot)
  })
})
