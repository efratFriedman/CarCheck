import { LIMITS } from './limits'
import type { CarDetails } from './types'

export interface CarDetailsInput {
  make: string
  model: string
  year: string
  mileage: string
  askingPrice: string
  licensePlate: string
}

export type CarDetailsError = 'required' | 'tooLong' | 'invalid' | 'outOfRange'

export type CarDetailsErrors = Partial<Record<keyof CarDetailsInput, CarDetailsError>>

export type CarDetailsResult =
  | { ok: true; details: CarDetails }
  | { ok: false; errors: CarDetailsErrors }

export type NumberInput = { kind: 'empty' } | { kind: 'invalid' } | { kind: 'number'; value: number }

const MIN_YEAR = 1950

// Drops commas, whitespace, and ₪; whatever is left must be digits only (D25).
export function parseNumberInput(raw: string): NumberInput {
  const digits = raw.replace(/[,\s₪]/g, '')
  if (digits === '') return { kind: 'empty' }
  if (!/^[0-9]+$/.test(digits)) return { kind: 'invalid' }
  const value = Number(digits)
  return Number.isSafeInteger(value) ? { kind: 'number', value } : { kind: 'invalid' }
}

export function validateCarDetails(input: CarDetailsInput, now: Date): CarDetailsResult {
  const errors: CarDetailsErrors = {}

  const make = requiredText(input.make, LIMITS.make, 'make', errors)
  const model = requiredText(input.model, LIMITS.model, 'model', errors)

  const licensePlate = input.licensePlate.trim()
  if (licensePlate.length > LIMITS.licensePlate) errors.licensePlate = 'tooLong'

  const year = optionalNumber(input.year, 'year', errors)
  if (year !== null && (year < MIN_YEAR || year > now.getFullYear() + 1)) {
    errors.year = 'outOfRange'
  }
  const mileage = optionalNumber(input.mileage, 'mileage', errors)
  const askingPrice = optionalNumber(input.askingPrice, 'askingPrice', errors)

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, details: { make, model, year, mileage, askingPrice, licensePlate } }
}

function requiredText(
  raw: string,
  max: number,
  field: 'make' | 'model',
  errors: CarDetailsErrors,
): string {
  const text = raw.trim()
  if (text === '') errors[field] = 'required'
  else if (text.length > max) errors[field] = 'tooLong'
  return text
}

function optionalNumber(
  raw: string,
  field: 'year' | 'mileage' | 'askingPrice',
  errors: CarDetailsErrors,
): number | null {
  const parsed = parseNumberInput(raw)
  if (parsed.kind === 'invalid') errors[field] = 'invalid'
  return parsed.kind === 'number' ? parsed.value : null
}
