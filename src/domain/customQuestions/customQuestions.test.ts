import { describe, expect, it } from 'vitest'
import { updateAnswer } from '../answers/answers'
import { createCar } from '../car/car'
import {
  addCustomQuestion,
  deleteCustomQuestion,
  editCustomQuestion,
  validateCustomQuestion,
} from './customQuestions'
import { LIMITS } from '../limits'
import { overallProgress } from '../progress/progress'
import type { Car, ChecklistItem } from '../types'

const items: ChecklistItem[] = [
  { id: 'history-01', category: 'history', question: 'ש1', hint: 'ה1' },
]

const car: Car = createCar(
  { make: 'מאזדה', model: '3', year: 2019, mileage: null, askingPrice: null, licensePlate: '' },
  'car-1',
  new Date('2026-11-03T08:00:00Z'),
)

describe('validateCustomQuestion', () => {
  it('rejects empty and whitespace-only text (FR-5.2)', () => {
    expect(validateCustomQuestion('')).toEqual({ ok: false, error: 'required' })
    expect(validateCustomQuestion('  \t\n ')).toEqual({ ok: false, error: 'required' })
  })

  it('trims the text', () => {
    expect(validateCustomQuestion('  יש מפתח רזרבי?  ')).toEqual({
      ok: true,
      text: 'יש מפתח רזרבי?',
    })
  })

  it('accepts exactly the limit and rejects one more', () => {
    expect(validateCustomQuestion('א'.repeat(LIMITS.customQuestion)).ok).toBe(true)
    expect(validateCustomQuestion('א'.repeat(LIMITS.customQuestion + 1))).toEqual({
      ok: false,
      error: 'tooLong',
    })
  })

  it('measures the limit after trimming', () => {
    expect(validateCustomQuestion(` ${'א'.repeat(LIMITS.customQuestion)} `).ok).toBe(true)
  })
})

describe('addCustomQuestion', () => {
  it('appends the trimmed question in insertion order', () => {
    let next = addCustomQuestion(car, 'c1', ' ראשונה ')
    next = addCustomQuestion(next, 'c2', 'שנייה')
    expect(next.customQuestions).toEqual([
      { id: 'c1', text: 'ראשונה' },
      { id: 'c2', text: 'שנייה' },
    ])
  })

  it('leaves the car unchanged for invalid text', () => {
    expect(addCustomQuestion(car, 'c1', '   ')).toBe(car)
    expect(addCustomQuestion(car, 'c1', 'א'.repeat(LIMITS.customQuestion + 1))).toBe(car)
  })

  it('does not mutate the original car', () => {
    addCustomQuestion(car, 'c1', 'שאלה')
    expect(car.customQuestions).toEqual([])
  })
})

describe('editCustomQuestion', () => {
  const withQuestions = addCustomQuestion(addCustomQuestion(car, 'c1', 'ישנה'), 'c2', 'אחרת')

  it('changes only the matching question text', () => {
    const next = editCustomQuestion(withQuestions, 'c1', ' חדשה ')
    expect(next.customQuestions).toEqual([
      { id: 'c1', text: 'חדשה' },
      { id: 'c2', text: 'אחרת' },
    ])
  })

  it('keeps the answer attached to the question', () => {
    const answered = updateAnswer(withQuestions, 'c1', { status: 'concern', note: 'x' })
    const next = editCustomQuestion(answered, 'c1', 'חדשה')
    expect(next.answers.c1).toEqual({ status: 'concern', note: 'x', followUp: false })
  })

  it('leaves the car unchanged for invalid text', () => {
    expect(editCustomQuestion(withQuestions, 'c1', '  ')).toBe(withQuestions)
  })
})

describe('deleteCustomQuestion', () => {
  it('removes the question and its answer (FR-5.3)', () => {
    let next = addCustomQuestion(addCustomQuestion(car, 'c1', 'א'), 'c2', 'ב')
    next = updateAnswer(next, 'c1', { status: 'ok' })
    next = updateAnswer(next, 'c2', { status: 'concern' })
    next = updateAnswer(next, 'history-01', { status: 'ok' })
    const after = deleteCustomQuestion(next, 'c1')
    expect(after.customQuestions).toEqual([{ id: 'c2', text: 'ב' }])
    expect(Object.keys(after.answers).sort()).toEqual(['c2', 'history-01'])
  })

  it('removes the question from progress (AC-5.2)', () => {
    let next = addCustomQuestion(car, 'c1', 'א')
    next = updateAnswer(next, 'c1', { status: 'ok' })
    expect(overallProgress(items, next)).toEqual({ answered: 1, total: 2 })
    expect(overallProgress(items, deleteCustomQuestion(next, 'c1'))).toEqual({
      answered: 0,
      total: 1,
    })
  })
})
