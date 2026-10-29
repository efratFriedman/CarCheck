import {
  SCHEMA_VERSION,
  type Answer,
  type ArchivedCar,
  type Car,
  type CarDetails,
  type StoredData,
} from './types'

export const STORAGE_KEY = 'carcheck:data'

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export type LoadResult =
  | { status: 'ok'; data: StoredData }
  | { status: 'corrupt' }
  | { status: 'unknownVersion'; version: number }
  | { status: 'unavailable' }

export type WriteResult = { status: 'ok' } | { status: 'full' } | { status: 'unavailable' }

export function createEmptyData(): StoredData {
  return { version: SCHEMA_VERSION, activeCar: null, archivedCars: [] }
}

// Merely reading `localStorage` can throw in some private modes.
export function getBrowserStorage(): StorageLike | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

// Never writes: corrupt or unknown-version data stays untouched until clearStoredData (OQ9).
export function loadData(storage: StorageLike | null): LoadResult {
  if (!storage) return { status: 'unavailable' }

  let raw: string | null
  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch {
    return { status: 'unavailable' }
  }
  if (raw === null) return { status: 'ok', data: createEmptyData() }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { status: 'corrupt' }
  }
  if (!isRecord(parsed) || typeof parsed.version !== 'number') return { status: 'corrupt' }
  if (parsed.version !== SCHEMA_VERSION) {
    return { status: 'unknownVersion', version: parsed.version }
  }
  return isStoredData(parsed) ? { status: 'ok', data: parsed } : { status: 'corrupt' }
}

export function saveData(storage: StorageLike | null, data: StoredData): WriteResult {
  if (!storage) return { status: 'unavailable' }
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data))
    return { status: 'ok' }
  } catch (error) {
    return { status: isQuotaError(error) ? 'full' : 'unavailable' }
  }
}

export function clearStoredData(storage: StorageLike | null): Exclude<WriteResult, { status: 'full' }> {
  if (!storage) return { status: 'unavailable' }
  try {
    storage.removeItem(STORAGE_KEY)
    return { status: 'ok' }
  } catch {
    return { status: 'unavailable' }
  }
}

function isQuotaError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value))
}

const STATUSES = ['notAnswered', 'ok', 'concern', 'unknown']
const DECISIONS = ['evaluating', 'movingForward', 'notBuying']

function isCarDetails(value: unknown): value is CarDetails {
  return (
    isRecord(value) &&
    typeof value.make === 'string' &&
    typeof value.model === 'string' &&
    isNullableNumber(value.year) &&
    isNullableNumber(value.mileage) &&
    isNullableNumber(value.askingPrice) &&
    typeof value.licensePlate === 'string'
  )
}

function isAnswer(value: unknown): value is Answer {
  return (
    isRecord(value) &&
    typeof value.status === 'string' &&
    STATUSES.includes(value.status) &&
    typeof value.note === 'string' &&
    typeof value.followUp === 'boolean'
  )
}

function isCar(value: unknown): value is Car {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    isCarDetails(value.details) &&
    isRecord(value.answers) &&
    Object.values(value.answers).every(isAnswer) &&
    Array.isArray(value.customQuestions) &&
    value.customQuestions.every(
      (q) => isRecord(q) && typeof q.id === 'string' && typeof q.text === 'string',
    ) &&
    typeof value.generalNotes === 'string' &&
    isRecord(value.decision) &&
    typeof value.decision.value === 'string' &&
    DECISIONS.includes(value.decision.value) &&
    typeof value.decision.reason === 'string' &&
    typeof value.createdAt === 'string'
  )
}

function isArchivedCar(value: unknown): value is ArchivedCar {
  return isCar(value) && typeof (value as { archivedAt?: unknown }).archivedAt === 'string'
}

function isStoredData(value: Record<string, unknown>): value is StoredData & Record<string, unknown> {
  return (
    value.version === SCHEMA_VERSION &&
    (value.activeCar === null || isCar(value.activeCar)) &&
    Array.isArray(value.archivedCars) &&
    value.archivedCars.every(isArchivedCar)
  )
}
