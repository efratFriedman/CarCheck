import { describe, expect, it } from 'vitest'
import { parseNumberInput, validateCarDetails, type CarDetailsInput } from './carDetails'

const now = new Date(2026, 9, 29)

const valid: CarDetailsInput = {
  make: 'Toyota',
  model: 'Corolla',
  year: '',
  mileage: '',
  askingPrice: '',
  licensePlate: '',
}

describe('parseNumberInput', () => {
  it.each([
    ['120000', 120000],
    ['120,000', 120000],
    ['1,200,000', 1200000],
    ['45,000 ₪', 45000],
    ['₪45,000', 45000],
    ['₪ 45 000', 45000],
    ['\u00a045,000\u00a0', 45000],
    ['007', 7],
    ['0', 0],
  ])('normalizes %j to %d', (raw, value) => {
    expect(parseNumberInput(raw)).toEqual({ kind: 'number', value })
  })

  it.each(['', '   ', '₪', ' , '])('treats %j as empty', (raw) => {
    expect(parseNumberInput(raw)).toEqual({ kind: 'empty' })
  })

  it.each(['abc', '12a', '-5', '1.5', '1e3', '١٢٣', '12₪3x'])('rejects %j', (raw) => {
    expect(parseNumberInput(raw)).toEqual({ kind: 'invalid' })
  })

  it('rejects numbers beyond the safe integer range', () => {
    expect(parseNumberInput('99999999999999999999')).toEqual({ kind: 'invalid' })
  })
})

describe('validateCarDetails', () => {
  it('accepts make and model only and leaves the rest empty', () => {
    expect(validateCarDetails(valid, now)).toEqual({
      ok: true,
      details: {
        make: 'Toyota',
        model: 'Corolla',
        year: null,
        mileage: null,
        askingPrice: null,
        licensePlate: '',
      },
    })
  })

  it('trims text fields', () => {
    const result = validateCarDetails(
      { ...valid, make: '  Mazda ', model: ' 3 ', licensePlate: ' 12-345-67 ' },
      now,
    )
    expect(result).toMatchObject({
      ok: true,
      details: { make: 'Mazda', model: '3', licensePlate: '12-345-67' },
    })
  })

  it('normalizes typed numbers (AC-3.2)', () => {
    const result = validateCarDetails(
      { ...valid, year: '2019', mileage: '120,000', askingPrice: '45,000 ₪' },
      now,
    )
    expect(result).toMatchObject({
      ok: true,
      details: { year: 2019, mileage: 120000, askingPrice: 45000 },
    })
  })

  it.each(['make', 'model'] as const)('requires %s (AC-3.1)', (field) => {
    expect(validateCarDetails({ ...valid, [field]: '   ' }, now)).toEqual({
      ok: false,
      errors: { [field]: 'required' },
    })
  })

  it('reports every error at once', () => {
    expect(validateCarDetails({ ...valid, make: '', model: '', year: 'x' }, now)).toEqual({
      ok: false,
      errors: { make: 'required', model: 'required', year: 'invalid' },
    })
  })

  it.each(['make', 'model'] as const)('limits %s to 50 characters', (field) => {
    expect(validateCarDetails({ ...valid, [field]: 'a'.repeat(50) }, now).ok).toBe(true)
    expect(validateCarDetails({ ...valid, [field]: 'a'.repeat(51) }, now)).toEqual({
      ok: false,
      errors: { [field]: 'tooLong' },
    })
  })

  it('limits the license plate to 20 characters', () => {
    expect(validateCarDetails({ ...valid, licensePlate: '1'.repeat(20) }, now).ok).toBe(true)
    expect(validateCarDetails({ ...valid, licensePlate: '1'.repeat(21) }, now)).toEqual({
      ok: false,
      errors: { licensePlate: 'tooLong' },
    })
  })

  it('accepts years from 1950 to next calendar year', () => {
    expect(validateCarDetails({ ...valid, year: '1950' }, now).ok).toBe(true)
    expect(validateCarDetails({ ...valid, year: '2027' }, now).ok).toBe(true)
  })

  it.each(['1949', '2028', '0'])('rejects year %s as out of range', (year) => {
    expect(validateCarDetails({ ...valid, year }, now)).toEqual({
      ok: false,
      errors: { year: 'outOfRange' },
    })
  })

  it.each(['20x9', '2019.5', '-2019'])('rejects year %s as invalid', (year) => {
    expect(validateCarDetails({ ...valid, year }, now)).toEqual({
      ok: false,
      errors: { year: 'invalid' },
    })
  })

  it('moves the year ceiling with the current date', () => {
    expect(validateCarDetails({ ...valid, year: '2028' }, new Date(2027, 0, 1)).ok).toBe(true)
  })

  it('accepts zero for mileage and price', () => {
    expect(validateCarDetails({ ...valid, mileage: '0', askingPrice: '0' }, now)).toMatchObject({
      ok: true,
      details: { mileage: 0, askingPrice: 0 },
    })
  })

  it.each(['mileage', 'askingPrice'] as const)('rejects a negative or non-numeric %s', (field) => {
    for (const raw of ['-1', 'abc', '1.5']) {
      expect(validateCarDetails({ ...valid, [field]: raw }, now)).toEqual({
        ok: false,
        errors: { [field]: 'invalid' },
      })
    }
  })
})
