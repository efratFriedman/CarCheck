import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  STORAGE_KEY,
  clearStoredData,
  createEmptyData,
  getBrowserStorage,
  loadData,
  saveData,
  type StorageLike,
} from './storage'
import type { ArchivedCar, Car, StoredData } from './types'

class MemoryStorage implements StorageLike {
  items = new Map<string, string>()
  getItem = vi.fn((key: string) => this.items.get(key) ?? null)
  setItem = vi.fn((key: string, value: string) => {
    this.items.set(key, value)
  })
  removeItem = vi.fn((key: string) => {
    this.items.delete(key)
  })
}

function makeCar(overrides: Partial<Car> = {}): Car {
  return {
    id: 'car-1',
    details: {
      make: 'Toyota',
      model: 'Corolla',
      year: 2019,
      mileage: 120000,
      askingPrice: null,
      licensePlate: '12-345-67',
    },
    answers: {
      'history-owners': { status: 'ok', note: 'יד שנייה', followUp: true },
      'custom-1': { status: 'concern', note: '', followUp: false },
    },
    customQuestions: [{ id: 'custom-1', text: 'האם יש מפתח רזרבי?' }],
    generalNotes: 'הערות',
    decision: { value: 'evaluating', reason: '' },
    createdAt: '2026-10-29T10:00:00.000Z',
    ...overrides,
  }
}

function makeData(): StoredData {
  const archived: ArchivedCar = {
    ...makeCar({ id: 'car-0' }),
    archivedAt: '2026-10-20T10:00:00.000Z',
  }
  return { version: 1, activeCar: makeCar(), archivedCars: [archived] }
}

function storageWith(raw: string): MemoryStorage {
  const storage = new MemoryStorage()
  storage.items.set(STORAGE_KEY, raw)
  storage.setItem.mockClear()
  return storage
}

function failingStorage(error: unknown): MemoryStorage {
  const storage = new MemoryStorage()
  storage.getItem.mockImplementation(() => {
    throw error
  })
  storage.setItem.mockImplementation(() => {
    throw error
  })
  storage.removeItem.mockImplementation(() => {
    throw error
  })
  return storage
}

describe('loadData', () => {
  it('returns empty data for empty storage without writing anything', () => {
    const storage = new MemoryStorage()
    expect(loadData(storage)).toEqual({ status: 'ok', data: createEmptyData() })
    expect(storage.setItem).not.toHaveBeenCalled()
    expect(storage.items.size).toBe(0)
  })

  it('round-trips saved data', () => {
    const storage = new MemoryStorage()
    const data = makeData()
    expect(saveData(storage, data)).toEqual({ status: 'ok' })
    expect(loadData(storage)).toEqual({ status: 'ok', data })
  })

  it('round-trips data with no active car', () => {
    const storage = new MemoryStorage()
    saveData(storage, createEmptyData())
    expect(loadData(storage)).toEqual({ status: 'ok', data: createEmptyData() })
  })

  it.each([
    ['invalid JSON', '{not json'],
    ['a non-object', '42'],
    ['null', 'null'],
    ['a missing version', '{"activeCar":null,"archivedCars":[]}'],
    ['a non-numeric version', '{"version":"1","activeCar":null,"archivedCars":[]}'],
    ['a missing archive list', '{"version":1,"activeCar":null}'],
    ['an active car of the wrong type', '{"version":1,"activeCar":"x","archivedCars":[]}'],
    [
      'an unknown answer status',
      JSON.stringify({
        version: 1,
        activeCar: makeCar({
          answers: { a: { status: 'great', note: '', followUp: false } } as never,
        }),
        archivedCars: [],
      }),
    ],
    [
      'an archived car without an archive date',
      JSON.stringify({ version: 1, activeCar: null, archivedCars: [makeCar()] }),
    ],
    [
      'a non-string note',
      JSON.stringify({
        version: 1,
        activeCar: makeCar({ answers: { a: { status: 'ok', note: 5, followUp: false } } as never }),
        archivedCars: [],
      }),
    ],
  ])('reports corrupt data for %s and leaves the raw value unchanged', (_name, raw) => {
    const storage = storageWith(raw)
    expect(loadData(storage)).toEqual({ status: 'corrupt' })
    expect(storage.items.get(STORAGE_KEY)).toBe(raw)
    expect(storage.setItem).not.toHaveBeenCalled()
    expect(storage.removeItem).not.toHaveBeenCalled()
  })

  it('reports an unknown version and leaves the raw value unchanged', () => {
    const raw = JSON.stringify({ version: 2, somethingNew: true })
    const storage = storageWith(raw)
    expect(loadData(storage)).toEqual({ status: 'unknownVersion', version: 2 })
    expect(storage.items.get(STORAGE_KEY)).toBe(raw)
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it('reports unavailable storage when it is null', () => {
    expect(loadData(null)).toEqual({ status: 'unavailable' })
  })

  it('reports unavailable storage when reading throws', () => {
    const storage = failingStorage(new DOMException('denied', 'SecurityError'))
    expect(loadData(storage)).toEqual({ status: 'unavailable' })
  })
})

describe('saveData', () => {
  it('reports unavailable storage when it is null', () => {
    expect(saveData(null, createEmptyData())).toEqual({ status: 'unavailable' })
  })

  it.each(['QuotaExceededError', 'NS_ERROR_DOM_QUOTA_REACHED'])(
    'reports full storage on a %s',
    (name) => {
      const storage = failingStorage(new DOMException('full', name))
      expect(saveData(storage, makeData())).toEqual({ status: 'full' })
    },
  )

  it('reports unavailable storage on any other write error', () => {
    const storage = failingStorage(new DOMException('denied', 'SecurityError'))
    expect(saveData(storage, makeData())).toEqual({ status: 'unavailable' })
  })

  it('keeps the previous value when a write fails', () => {
    const storage = new MemoryStorage()
    saveData(storage, createEmptyData())
    const before = storage.items.get(STORAGE_KEY)
    storage.setItem.mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError')
    })
    expect(saveData(storage, makeData())).toEqual({ status: 'full' })
    expect(storage.items.get(STORAGE_KEY)).toBe(before)
  })
})

describe('getBrowserStorage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns the browser storage when it is accessible', () => {
    const storage = new MemoryStorage()
    vi.stubGlobal('localStorage', storage)
    expect(getBrowserStorage()).toBe(storage)
  })

  it('returns null when it is missing', () => {
    vi.stubGlobal('localStorage', undefined)
    expect(getBrowserStorage()).toBeNull()
  })

  it('returns null when merely accessing it throws', () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('denied', 'SecurityError')
      },
    })
    try {
      expect(getBrowserStorage()).toBeNull()
    } finally {
      if (original) Object.defineProperty(globalThis, 'localStorage', original)
      else delete (globalThis as { localStorage?: unknown }).localStorage
    }
  })
})

describe('clearStoredData', () => {
  it('removes the stored value', () => {
    const storage = storageWith('{broken')
    expect(clearStoredData(storage)).toEqual({ status: 'ok' })
    expect(storage.items.has(STORAGE_KEY)).toBe(false)
    expect(loadData(storage)).toEqual({ status: 'ok', data: createEmptyData() })
  })

  it('reports unavailable storage', () => {
    expect(clearStoredData(null)).toEqual({ status: 'unavailable' })
    expect(clearStoredData(failingStorage(new Error('x')))).toEqual({ status: 'unavailable' })
  })
})
