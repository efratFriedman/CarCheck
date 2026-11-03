import { LIMITS } from '../limits'
import type { Car } from '../types'

export type CustomQuestionError = 'required' | 'tooLong'

export type CustomQuestionResult = { ok: true; text: string } | { ok: false; error: CustomQuestionError }

// FR-5.2: the text must be non-empty after trimming; the limit is spec §9.
export function validateCustomQuestion(raw: string): CustomQuestionResult {
  const text = raw.trim()
  if (text === '') return { ok: false, error: 'required' }
  if (text.length > LIMITS.customQuestion) return { ok: false, error: 'tooLong' }
  return { ok: true, text }
}

// Invalid text leaves the car unchanged, so the pure functions never store bad data.
export function addCustomQuestion(car: Car, id: string, raw: string): Car {
  const result = validateCustomQuestion(raw)
  if (!result.ok) return car
  return { ...car, customQuestions: [...car.customQuestions, { id, text: result.text }] }
}

// Editing keeps the question's ID, so its answer stays attached.
export function editCustomQuestion(car: Car, id: string, raw: string): Car {
  const result = validateCustomQuestion(raw)
  if (!result.ok) return car
  return {
    ...car,
    customQuestions: car.customQuestions.map((question) =>
      question.id === id ? { ...question, text: result.text } : question,
    ),
  }
}

// FR-5.3: deleting a question also removes its answer.
export function deleteCustomQuestion(car: Car, id: string): Car {
  const answers = { ...car.answers }
  delete answers[id]
  return {
    ...car,
    answers,
    customQuestions: car.customQuestions.filter((question) => question.id !== id),
  }
}
