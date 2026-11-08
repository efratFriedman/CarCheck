import { describe, expect, it } from 'vitest'
import { buildSummary, type SummaryEntry } from './summary'
import type { Answer, CategoryId, ChecklistItem, CustomQuestion } from '../types'

const categories: CategoryId[] = [
  'history',
  'paperwork',
  'maintenance',
  'condition',
  'testDrive',
  'inspection',
]

// Deliberately not in category order, to check sorting.
const items: ChecklistItem[] = [
  { id: 'paperwork-01', category: 'paperwork', question: 'מסמך', hint: 'ה' },
  { id: 'history-02', category: 'history', question: 'היסטוריה ב', hint: 'ה' },
  { id: 'history-01', category: 'history', question: 'היסטוריה א', hint: 'ה' },
  { id: 'inspection-01', category: 'inspection', question: 'מכון', hint: 'ה' },
]

const customQuestions: CustomQuestion[] = [
  { id: 'custom-b', text: 'שאלה שלי ראשונה' },
  { id: 'custom-a', text: 'שאלה שלי שנייה' },
]

const answer = (patch: Partial<Answer>): Answer => ({
  status: 'notAnswered',
  note: '',
  followUp: false,
  ...patch,
})

const summarize = (answers: Record<string, Answer>, custom: CustomQuestion[] = customQuestions) =>
  buildSummary(items, categories, { answers, customQuestions: custom })

const ids = (entries: SummaryEntry[]) => entries.map((entry) => entry.id)

describe('buildSummary counts', () => {
  it('counts every status, and the counts add up to built-in plus custom items (AC-6.1)', () => {
    const summary = summarize({
      'history-01': answer({ status: 'ok' }),
      'history-02': answer({ status: 'concern' }),
      'paperwork-01': answer({ status: 'unknown', followUp: true }),
      'custom-a': answer({ status: 'concern' }),
      'inspection-01': answer({ note: 'רק הערה' }),
    })
    expect(summary.total).toBe(6)
    expect(summary.counts).toEqual({ ok: 1, concern: 2, unknown: 1, notAnswered: 2 })
  })

  it('ignores answers whose question no longer exists, so counts still add up (AC-5.2)', () => {
    const summary = summarize({
      'custom-deleted': answer({ status: 'concern', followUp: true }),
      'history-01': answer({ status: 'ok' }),
    })
    expect(summary.counts).toEqual({ ok: 1, concern: 0, unknown: 0, notAnswered: 5 })
    expect(summary.concerns).toEqual([])
    expect(summary.followUps).toEqual([])
    expect(ids(summary.byCategory.flatMap((group) => group.entries))).toEqual(['history-01'])
  })

  it('shows every list empty and the full unanswered count with zero answers (AC-6.3)', () => {
    const summary = summarize({})
    expect(summary.counts).toEqual({ ok: 0, concern: 0, unknown: 0, notAnswered: 6 })
    expect(summary.concerns).toEqual([])
    expect(summary.unknowns).toEqual([])
    expect(summary.followUps).toEqual([])
    expect(summary.byCategory).toEqual([])
  })

  it('handles a car with no custom questions', () => {
    const summary = summarize({ 'history-01': answer({ status: 'ok' }) }, [])
    expect(summary.total).toBe(4)
    expect(summary.counts.notAnswered).toBe(3)
  })
})

describe('buildSummary lists', () => {
  it('lists an item set to concern under Concerns (AC-4.1)', () => {
    const summary = summarize({ 'history-02': answer({ status: 'concern', note: 'תאונה' }) })
    expect(summary.concerns).toEqual([
      {
        id: 'history-02',
        category: 'history',
        question: 'היסטוריה ב',
        status: 'concern',
        note: 'תאונה',
        followUp: false,
      },
    ])
  })

  it('lists unknown items under Unknowns', () => {
    const summary = summarize({ 'inspection-01': answer({ status: 'unknown' }) })
    expect(ids(summary.unknowns)).toEqual(['inspection-01'])
    expect(summary.concerns).toEqual([])
  })

  it('puts an OK item with a follow-up flag in Follow-ups and All answers only (AC-6.2)', () => {
    const summary = summarize({ 'history-01': answer({ status: 'ok', followUp: true }) })
    expect(ids(summary.followUps)).toEqual(['history-01'])
    expect(ids(summary.byCategory.flatMap((group) => group.entries))).toEqual(['history-01'])
    expect(summary.concerns).toEqual([])
    expect(summary.unknowns).toEqual([])
  })

  it('lets an item appear in more than one list', () => {
    const summary = summarize({ 'paperwork-01': answer({ status: 'concern', followUp: true }) })
    expect(ids(summary.concerns)).toEqual(['paperwork-01'])
    expect(ids(summary.followUps)).toEqual(['paperwork-01'])
  })

  it('lists a flagged item under Follow-ups even when it is not answered', () => {
    const summary = summarize({ 'inspection-01': answer({ followUp: true, note: 'לבדוק' }) })
    expect(ids(summary.followUps)).toEqual(['inspection-01'])
    expect(summary.byCategory).toEqual([])
  })

  it('sorts by category order, then item order, with custom questions last (FR-6.2)', () => {
    const concern = answer({ status: 'concern' })
    const summary = summarize({
      'custom-a': concern,
      'inspection-01': concern,
      'custom-b': concern,
      'paperwork-01': concern,
      'history-01': concern,
      'history-02': concern,
    })
    expect(ids(summary.concerns)).toEqual([
      'history-02',
      'history-01',
      'paperwork-01',
      'inspection-01',
      'custom-b',
      'custom-a',
    ])
  })

  it('treats custom questions like built-in items (AC-5.1)', () => {
    const summary = summarize({
      'custom-b': answer({ status: 'unknown', note: 'לשאול', followUp: true }),
    })
    const entry: SummaryEntry = {
      id: 'custom-b',
      category: 'custom',
      question: 'שאלה שלי ראשונה',
      status: 'unknown',
      note: 'לשאול',
      followUp: true,
    }
    expect(summary.unknowns).toEqual([entry])
    expect(summary.followUps).toEqual([entry])
    expect(summary.byCategory).toEqual([{ category: 'custom', entries: [entry] }])
  })
})

describe('buildSummary all answers by category (FR-6.3)', () => {
  it('groups answered items by category in order and skips categories with none', () => {
    const summary = summarize({
      'custom-a': answer({ status: 'ok' }),
      'inspection-01': answer({ status: 'concern' }),
      'history-01': answer({ status: 'ok', note: 'יד שנייה' }),
      'history-02': answer({ status: 'unknown' }),
      'paperwork-01': answer({ note: 'לא נענה, רק הערה' }),
    })
    expect(
      summary.byCategory.map((group) => ({ category: group.category, ids: ids(group.entries) })),
    ).toEqual([
      { category: 'history', ids: ['history-02', 'history-01'] },
      { category: 'inspection', ids: ['inspection-01'] },
      { category: 'custom', ids: ['custom-a'] },
    ])
    expect(summary.byCategory[0].entries[1].note).toBe('יד שנייה')
  })
})
