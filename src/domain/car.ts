import type { CarDetailsInput } from './carDetails'
import type { Car, CarDetails } from './types'

export function createCar(details: CarDetails, id: string, now: Date): Car {
  return {
    id,
    details,
    answers: {},
    customQuestions: [],
    generalNotes: '',
    decision: { value: 'evaluating', reason: '' },
    createdAt: now.toISOString(),
  }
}

export function updateCarDetails(car: Car, details: CarDetails): Car {
  return { ...car, details }
}

export function detailsToInput(details: CarDetails | null): CarDetailsInput {
  const text = (value: number | null) => (value === null ? '' : String(value))
  return {
    make: details?.make ?? '',
    model: details?.model ?? '',
    year: text(details?.year ?? null),
    mileage: text(details?.mileage ?? null),
    askingPrice: text(details?.askingPrice ?? null),
    licensePlate: details?.licensePlate ?? '',
  }
}
