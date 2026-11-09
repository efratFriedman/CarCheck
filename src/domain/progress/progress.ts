import type { Answer, CategoryId, Car, ChecklistItem } from '../types'

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

type ProgressSource = Pick<Car, 'answers' | 'customQuestions'>

// Custom questions count like built-in items (AC-5.1).
export function overallProgress(items: readonly ChecklistItem[], car: ProgressSource): Progress {
  return calculateProgress(
    [...items.map((item) => item.id), ...car.customQuestions.map((question) => question.id)],
    car.answers,
  )
}

export function customProgress(car: ProgressSource): Progress {
  return calculateProgress(
    car.customQuestions.map((question) => question.id),
    car.answers,
  )
}

export const CUSTOM_OVERVIEW_ID = 'custom'
export type OverviewId = CategoryId | typeof CUSTOM_OVERVIEW_ID

export interface CategoryOverview {
  id: OverviewId
  progress: Progress
}

// Built-in categories in the given order, then "My questions", which always comes last.
export function categoryOverview(
  items: readonly ChecklistItem[],
  categoryIds: readonly CategoryId[],
  car: ProgressSource,
): CategoryOverview[] {
  return [
    ...categoryIds.map((id) => ({ id, progress: categoryProgress(items, id, car.answers) })),
    { id: CUSTOM_OVERVIEW_ID, progress: customProgress(car) },
  ]
}
