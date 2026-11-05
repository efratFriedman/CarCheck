import { getAnswer } from '../progress/progress'
import type { Answer, Car, CategoryId, ChecklistItem, Status } from '../types'

export type SummaryCategory = CategoryId | 'custom'

export interface SummaryEntry extends Answer {
  id: string
  category: SummaryCategory
  question: string
}

export interface CategoryAnswers {
  category: SummaryCategory
  entries: SummaryEntry[]
}

export interface Summary {
  total: number
  counts: Record<Status, number>
  concerns: SummaryEntry[]
  unknowns: SummaryEntry[]
  followUps: SummaryEntry[]
  byCategory: CategoryAnswers[]
}

// Built-in items in category order, then item order; custom questions last, in insertion order (FR-6.2).
// Only the car's current items are summarized, so stray answers never skew the counts (AC-6.1).
export function buildSummary(
  items: readonly ChecklistItem[],
  categoryOrder: readonly CategoryId[],
  car: Pick<Car, 'answers' | 'customQuestions'>,
): Summary {
  const builtIn = categoryOrder.flatMap((category) =>
    items
      .filter((item) => item.category === category)
      .map((item) => toEntry(item.id, category, item.question, car.answers)),
  )
  const custom = car.customQuestions.map((question) =>
    toEntry(question.id, 'custom', question.text, car.answers),
  )
  const entries = [...builtIn, ...custom]

  const counts: Record<Status, number> = { notAnswered: 0, ok: 0, concern: 0, unknown: 0 }
  for (const entry of entries) counts[entry.status] += 1

  const answered = entries.filter((entry) => entry.status !== 'notAnswered')
  const groupOrder: SummaryCategory[] = [...categoryOrder, 'custom']

  return {
    total: entries.length,
    counts,
    concerns: entries.filter((entry) => entry.status === 'concern'),
    unknowns: entries.filter((entry) => entry.status === 'unknown'),
    followUps: entries.filter((entry) => entry.followUp),
    byCategory: groupOrder
      .map((category) => ({
        category,
        entries: answered.filter((entry) => entry.category === category),
      }))
      .filter((group) => group.entries.length > 0),
  }
}

function toEntry(
  id: string,
  category: SummaryCategory,
  question: string,
  answers: Record<string, Answer>,
): SummaryEntry {
  return { id, category, question, ...getAnswer(answers, id) }
}
