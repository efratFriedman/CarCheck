import { LIMITS } from '../limits'
import { getAnswer } from '../progress/progress'
import { buildSummary, type Summary } from '../summary/summary'
import type { Answer, Car, CarDetails, CategoryId, ChecklistItem, CustomQuestion, Decision } from '../types'

// One shared item: built-in items are referenced by ID; custom questions also carry their text (FR-9.4).
export interface SnapshotItem extends Answer {
  id: string
  text?: string
}

// A frozen copy of what the sender's summary shows (FR-9.4). Status counts are derived, not stored (D27).
export interface Snapshot {
  sharedAt: string
  details: CarDetails
  decision: Decision
  generalNotes: string
  items: SnapshotItem[]
  unanswered: number
}

// Keeps only items the summary can show: answered ones, and flagged ones that are not answered (D49).
export function createSnapshot(items: readonly ChecklistItem[], car: Car, now: Date): Snapshot {
  const entries: SnapshotItem[] = [
    ...items.map((item) => ({ id: item.id, ...getAnswer(car.answers, item.id) })),
    ...car.customQuestions.map((question) => ({
      id: question.id,
      ...getAnswer(car.answers, question.id),
      text: question.text,
    })),
  ]
  return {
    sharedAt: now.toISOString(),
    details: car.details,
    decision: car.decision,
    generalNotes: car.generalNotes,
    items: entries.filter((entry) => entry.status !== 'notAnswered' || entry.followUp),
    unanswered: entries.filter((entry) => entry.status === 'notAnswered').length,
  }
}

export function summarizeSnapshot(
  items: readonly ChecklistItem[],
  categoryOrder: readonly CategoryId[],
  snapshot: Snapshot,
): Summary {
  const shared = new Set(snapshot.items.map((item) => item.id))
  const answers: Record<string, Answer> = {}
  const customQuestions: CustomQuestion[] = []
  for (const { id, status, note, followUp, text } of snapshot.items) {
    answers[id] = { status, note, followUp }
    if (text !== undefined) customQuestions.push({ id, text })
  }
  const summary = buildSummary(
    items.filter((item) => shared.has(item.id)),
    categoryOrder,
    { answers, customQuestions },
  )
  // The stored count reflects the checklist at the moment of sharing (AC-9.1).
  const counts = { ...summary.counts, notAnswered: snapshot.unanswered }
  return { ...summary, counts, total: counts.ok + counts.concern + counts.unknown + counts.notAnswered }
}

const STATUSES = ['notAnswered', 'ok', 'concern', 'unknown']
const DECISIONS = ['evaluating', 'movingForward', 'notBuying']
const CUSTOM_PREFIX = 'custom-'

// Checks decoded link data before it is shown; anything unexpected makes the link invalid (AC-9.4).
export function validateSnapshot(items: readonly ChecklistItem[], value: unknown): value is Snapshot {
  if (!isRecord(value)) return false
  const builtInIds = new Set(items.map((item) => item.id))
  const { sharedAt, details, decision, generalNotes, items: shared, unanswered } = value
  return (
    typeof sharedAt === 'string' &&
    !Number.isNaN(Date.parse(sharedAt)) &&
    isDetails(details) &&
    isRecord(decision) &&
    typeof decision.value === 'string' &&
    DECISIONS.includes(decision.value) &&
    isText(decision.reason, LIMITS.decisionReason) &&
    isText(generalNotes, LIMITS.generalNotes) &&
    Array.isArray(shared) &&
    shared.every((item) => isItem(item, builtInIds)) &&
    new Set(shared.map((item) => (item as SnapshotItem).id)).size === shared.length &&
    typeof unanswered === 'number' &&
    Number.isSafeInteger(unanswered) &&
    unanswered >= 0
  )
}

function isItem(value: unknown, builtInIds: ReadonlySet<string>): boolean {
  if (!isRecord(value) || typeof value.id !== 'string') return false
  const answerOk =
    typeof value.status === 'string' &&
    STATUSES.includes(value.status) &&
    isText(value.note, LIMITS.note) &&
    typeof value.followUp === 'boolean'
  if (builtInIds.has(value.id)) return answerOk && value.text === undefined
  return (
    answerOk &&
    value.id.startsWith(CUSTOM_PREFIX) &&
    isText(value.text, LIMITS.customQuestion) &&
    value.text.trim() !== ''
  )
}

function isDetails(value: unknown): value is CarDetails {
  return (
    isRecord(value) &&
    isText(value.make, LIMITS.make) &&
    isText(value.model, LIMITS.model) &&
    isNullableNumber(value.year) &&
    isNullableNumber(value.mileage) &&
    isNullableNumber(value.askingPrice) &&
    isText(value.licensePlate, LIMITS.licensePlate)
  )
}

function isText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length <= max
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
