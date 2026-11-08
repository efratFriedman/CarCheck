import { describe, expect, it } from 'vitest'
import { CHECKLIST_ITEMS } from '../../data/checklist'
import { createCar } from '../car/car'
import { buildSummary } from '../summary/summary'
import type { Answer, Car, CategoryId, ChecklistItem } from '../types'
import { createSnapshot, summarizeSnapshot, validateSnapshot, type Snapshot } from './snapshot'

const categories: CategoryId[] = ['history', 'paperwork', 'maintenance', 'condition', 'testDrive', 'inspection']

const items: ChecklistItem[] = [
  { id: 'history-01', category: 'history', question: 'היסטוריה א', hint: 'ה' },
  { id: 'history-02', category: 'history', question: 'היסטוריה ב', hint: 'ה' },
  { id: 'paperwork-01', category: 'paperwork', question: 'מסמך', hint: 'ה' },
  { id: 'inspection-01', category: 'inspection', question: 'מכון', hint: 'ה' },
]

const now = new Date('2026-11-08T08:00:00.000Z')

const answer = (patch: Partial<Answer>): Answer => ({ status: 'notAnswered', note: '', followUp: false, ...patch })

function sender(): Car {
  return {
    ...createCar(
      { make: 'מאזדה', model: '3', year: 2019, mileage: 85000, askingPrice: null, licensePlate: '12-345-67' },
      'car-1',
      new Date('2026-11-01T09:00:00.000Z'),
    ),
    answers: {
      'history-01': answer({ status: 'concern', note: 'תאונה', followUp: true }),
      'history-02': answer({ note: 'הערה בלי תשובה' }),
      'paperwork-01': answer({ followUp: true, note: 'לבדוק שעבוד' }),
      'custom-a': answer({ status: 'unknown', note: 'לא יודע' }),
      'custom-deleted': answer({ status: 'ok' }),
    },
    customQuestions: [
      { id: 'custom-a', text: 'האם יש מפתח רזרבי?' },
      { id: 'custom-b', text: 'למה מוכרים?' },
    ],
    generalNotes: 'המוכר נחמד',
    decision: { value: 'movingForward', reason: 'מחיר טוב' },
  }
}

describe('createSnapshot', () => {
  it('records the share date, car details, decision, and general notes', () => {
    const car = sender()
    const snapshot = createSnapshot(items, car, now)
    expect(snapshot.sharedAt).toBe('2026-11-08T08:00:00.000Z')
    expect(snapshot.details).toEqual(car.details)
    expect(snapshot.decision).toEqual(car.decision)
    expect(snapshot.generalNotes).toBe('המוכר נחמד')
  })

  it('keeps answered and flagged items, built-in first, then custom questions with their text', () => {
    expect(createSnapshot(items, sender(), now).items).toEqual([
      { id: 'history-01', status: 'concern', note: 'תאונה', followUp: true },
      { id: 'paperwork-01', status: 'notAnswered', note: 'לבדוק שעבוד', followUp: true },
      { id: 'custom-a', status: 'unknown', note: 'לא יודע', followUp: false, text: 'האם יש מפתח רזרבי?' },
    ])
  })

  it('counts unanswered built-in and custom items, including flagged ones, and ignores stray answers', () => {
    // history-02, paperwork-01, inspection-01, and custom-b are not answered.
    expect(createSnapshot(items, sender(), now).unanswered).toBe(4)
  })
})

describe('summarizeSnapshot', () => {
  it('gives the same summary as the sender saw when sharing (AC-9.1)', () => {
    const car = sender()
    car.answers['condition-02'] = answer({ status: 'ok', note: 'נראה טוב' })
    car.answers['drive-03'] = answer({ status: 'unknown', followUp: true })
    const snapshot = createSnapshot(CHECKLIST_ITEMS, car, now)
    const sent = buildSummary(CHECKLIST_ITEMS, categories, car)
    expect(summarizeSnapshot(CHECKLIST_ITEMS, categories, snapshot)).toEqual(sent)
  })

  it('keeps the unanswered count from the moment of sharing when the checklist later grows', () => {
    const snapshot = createSnapshot(items, sender(), now)
    const grown = [...items, { id: 'history-03', category: 'history', question: 'חדשה', hint: 'ה' } as const]
    const summary = summarizeSnapshot(grown, categories, snapshot)
    expect(summary.counts).toEqual({ ok: 0, concern: 1, unknown: 1, notAnswered: 4 })
    expect(summary.total).toBe(6)
  })
})

describe('validateSnapshot', () => {
  const valid = (): Snapshot => JSON.parse(JSON.stringify(createSnapshot(items, sender(), now)))

  it('accepts a snapshot that went through JSON', () => {
    expect(validateSnapshot(items, valid())).toBe(true)
  })

  it.each<[string, (s: any) => unknown]>([
    ['not an object', () => 'x'],
    ['an array', () => []],
    ['a missing share date', (s) => ({ ...s, sharedAt: undefined })],
    ['an invalid share date', (s) => ({ ...s, sharedAt: 'yesterday' })],
    ['a year given as text', (s) => ({ ...s, details: { ...s.details, year: '2019' } })],
    ['a make over 50 characters', (s) => ({ ...s, details: { ...s.details, make: 'א'.repeat(51) } })],
    ['a license plate over 20 characters', (s) => ({ ...s, details: { ...s.details, licensePlate: '1'.repeat(21) } })],
    ['an unknown decision', (s) => ({ ...s, decision: { ...s.decision, value: 'maybe' } })],
    ['a reason over 300 characters', (s) => ({ ...s, decision: { ...s.decision, reason: 'א'.repeat(301) } })],
    ['general notes over 1,000 characters', (s) => ({ ...s, generalNotes: 'א'.repeat(1001) })],
    ['items that are not a list', (s) => ({ ...s, items: {} })],
    ['an unknown status', (s) => ({ ...s, items: [{ ...s.items[0], status: 'great' }] })],
    ['a note over 500 characters', (s) => ({ ...s, items: [{ ...s.items[0], note: 'א'.repeat(501) }] })],
    ['a follow-up flag that is not a boolean', (s) => ({ ...s, items: [{ ...s.items[0], followUp: 1 }] })],
    ['an unknown built-in ID', (s) => ({ ...s, items: [{ ...s.items[0], id: 'history-99' }] })],
    ['a built-in item with text', (s) => ({ ...s, items: [{ ...s.items[0], text: 'שאלה' }] })],
    ['a custom question without text', (s) => ({ ...s, items: [{ ...s.items[2], text: undefined }] })],
    ['an empty custom question text', (s) => ({ ...s, items: [{ ...s.items[2], text: '  ' }] })],
    ['a custom question over 200 characters', (s) => ({ ...s, items: [{ ...s.items[2], text: 'א'.repeat(201) }] })],
    ['a duplicate ID', (s) => ({ ...s, items: [s.items[0], s.items[0]] })],
    ['a negative unanswered count', (s) => ({ ...s, unanswered: -1 })],
    ['a fractional unanswered count', (s) => ({ ...s, unanswered: 1.5 })],
  ])('rejects %s', (_, mutate) => {
    expect(validateSnapshot(items, mutate(valid()))).toBe(false)
  })
})
