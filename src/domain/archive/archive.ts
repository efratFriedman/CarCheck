import { createCar } from '../car/car'
import type { ArchivedCar, CarDetails, StoredData } from '../types'

// Called only when the new car's details are saved (D06), so cancelling never archives anything.
export function startNewCar(data: StoredData, details: CarDetails, id: string, now: Date): StoredData {
  const archivedCars = data.activeCar
    ? [{ ...data.activeCar, archivedAt: now.toISOString() }, ...data.archivedCars]
    : data.archivedCars
  return { ...data, activeCar: createCar(details, id, now), archivedCars }
}

export function listArchivedCars(data: StoredData): ArchivedCar[] {
  return [...data.archivedCars].sort((a, b) =>
    a.archivedAt === b.archivedAt ? 0 : a.archivedAt < b.archivedAt ? 1 : -1,
  )
}

export function findArchivedCar(data: StoredData, id: string): ArchivedCar | null {
  return data.archivedCars.find((car) => car.id === id) ?? null
}

export function deleteArchivedCar(data: StoredData, id: string): StoredData {
  return { ...data, archivedCars: data.archivedCars.filter((car) => car.id !== id) }
}
