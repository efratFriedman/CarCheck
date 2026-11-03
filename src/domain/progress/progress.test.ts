import { describe, expect, it } from 'vitest'
import {
  calculateProgress,
  categoryProgress,
  customProgress,
  getAnswer,
  overallProgress,
} from './progress'
import type { Answer, ChecklistItem } from '../types'

const items: ChecklistItem[] = [
  { id: 'history-01', category: 'history', question: 'ש1', hint: 'ה1' },
  { id: 'history-02', category: 'history', question: 'ש2', hint: 'ה2' },
  { id: 'paperwork-01', category: 'paperwork', question: 'ש3', hint: 'ה3' },
]

const answer = (patch: Partial<Answer>): Answer => ({
  status: 'notAnswered',
  note: '',
  followUp: false,
  ...patch,
})

describe('getAnswer', () => {
  it('returns an unanswered default for a missing key', () => {
    expect(getAnswer({}, 'history-01')).toEqual(answer({}))
  })

  it('returns the stored answer', () => {
    const stored = answer({ status: 'ok', note: 'x' })
    expect(getAnswer({ 'history-01': stored }, 'history-01')).toBe(stored)
  })
})

describe('calculateProgress', () => {
  it('is 0 of N when nothing is answered', () => {
    expect(calculateProgress(['a', 'b'], {})).toEqual({ answered: 0, total: 2 })
  })

  it('counts ok, concern, and unknown as answered', () => {
    const answers = {
      a: answer({ status: 'ok' }),
      b: answer({ status: 'concern' }),
      c: answer({ status: 'unknown' }),
    }
    expect(calculateProgress(['a', 'b', 'c', 'd'], answers)).toEqual({ answered: 3, total: 4 })
  })

  it('does not count a note or a follow-up flag alone (AC-4.2)', () => {
    const answers = {
      a: answer({ note: 'הערה' }),
      b: answer({ followUp: true }),
    }
    expect(calculateProgress(['a', 'b'], answers)).toEqual({ answered: 0, total: 2 })
  })

  it('counts an item set back to not answered as unanswered, even with a note', () => {
    expect(calculateProgress(['a'], { a: answer({ note: 'x', followUp: true }) })).toEqual({
      answered: 0,
      total: 1,
    })
  })

  it('ignores answers for ids that are not listed', () => {
    expect(calculateProgress(['a'], { z: answer({ status: 'ok' }) })).toEqual({
      answered: 0,
      total: 1,
    })
  })

  it('handles an empty list', () => {
    expect(calculateProgress([], {})).toEqual({ answered: 0, total: 0 })
  })
})

describe('categoryProgress and overallProgress', () => {
  it('updates category and overall progress when an item is set to concern (AC-4.1)', () => {
    const answers = { 'history-01': answer({ status: 'concern' }) }
    expect(categoryProgress(items, 'history', answers)).toEqual({ answered: 1, total: 2 })
    expect(categoryProgress(items, 'paperwork', answers)).toEqual({ answered: 0, total: 1 })
    expect(overallProgress(items, { answers, customQuestions: [] })).toEqual({
      answered: 1,
      total: 3,
    })
  })

  it('reports a category with no items as 0 of 0', () => {
    expect(categoryProgress(items, 'testDrive', {})).toEqual({ answered: 0, total: 0 })
  })
})

describe('custom questions in progress (AC-5.1)', () => {
  const customQuestions = [
    { id: 'c1', text: 'א' },
    { id: 'c2', text: 'ב' },
  ]

  it('adds custom questions to the overall total and answered count', () => {
    const answers = { 'history-01': answer({ status: 'ok' }), c1: answer({ status: 'unknown' }) }
    expect(overallProgress(items, { answers, customQuestions })).toEqual({ answered: 2, total: 5 })
  })

  it('reports custom progress on its own, and 0 of 0 with no questions', () => {
    const answers = { c2: answer({ status: 'concern' }), 'history-01': answer({ status: 'ok' }) }
    expect(customProgress({ answers, customQuestions })).toEqual({ answered: 1, total: 2 })
    expect(customProgress({ answers, customQuestions: [] })).toEqual({ answered: 0, total: 0 })
  })

  it('does not count a note or follow-up flag alone', () => {
    const answers = { c1: answer({ note: 'x', followUp: true }) }
    expect(customProgress({ answers, customQuestions })).toEqual({ answered: 0, total: 2 })
  })
})
