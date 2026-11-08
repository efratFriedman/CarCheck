import { LIMITS } from '../limits'
import type { Car, Decision } from '../types'

export function updateDecision(car: Car, patch: Partial<Decision>): Car {
  const decision: Decision = { ...car.decision, ...patch }
  if (decision.reason.length > LIMITS.decisionReason) {
    decision.reason = decision.reason.slice(0, LIMITS.decisionReason)
  }
  return { ...car, decision }
}
