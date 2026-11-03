import type { Answer, CategoryId, ChecklistItem } from './types'

export interface Progress {
  answered: number
  total: number
}

export const EMPTY_ANSWER: Answer = { status: 'notAnswered', note: '', followUp: false }

export function getAnswer(answers: Record<string, Answer>, id: string): Answer {
  return answers[id] ?? EMPTY_ANSWER
}

// An item counts as answered only when its status is not "not answered" (FR-4.4).
// Notes and follow-up flags never affect progress (AC-4.2).
export function calculateProgress(ids: readonly string[], answers: Record<string, Answer>): Progress {
  const answered = ids.filter((id) => getAnswer(answers, id).status !== 'notAnswered').length
  return { answered, total: ids.length }
}

export function categoryProgress(
  items: readonly ChecklistItem[],
  category: CategoryId,
  answers: Record<string, Answer>,
): Progress {
  return calculateProgress(
    items.filter((item) => item.category === category).map((item) => item.id),
    answers,
  )
}

export function overallProgress(
  items: readonly ChecklistItem[],
  answers: Record<string, Answer>,
): Progress {
  return calculateProgress(
    items.map((item) => item.id),
    answers,
  )
}
