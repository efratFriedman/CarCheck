import { LIMITS } from '../limits'
import { EMPTY_ANSWER, getAnswer } from '../progress/progress'
import type { Answer, Car } from '../types'

function isEmpty(answer: Answer): boolean {
  return (
    answer.status === EMPTY_ANSWER.status &&
    answer.note === EMPTY_ANSWER.note &&
    answer.followUp === EMPTY_ANSWER.followUp
  )
}

// Fully default answers are removed, since a missing key already means "not answered".
export function updateAnswer(car: Car, id: string, patch: Partial<Answer>): Car {
  const next: Answer = { ...getAnswer(car.answers, id), ...patch }
  if (next.note.length > LIMITS.note) next.note = next.note.slice(0, LIMITS.note)

  const answers = { ...car.answers }
  if (isEmpty(next)) delete answers[id]
  else answers[id] = next
  return { ...car, answers }
}

export function updateGeneralNotes(car: Car, generalNotes: string): Car {
  return { ...car, generalNotes: generalNotes.slice(0, LIMITS.generalNotes) }
}
