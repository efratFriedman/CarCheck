import type { DecisionValue } from '../../domain/types'
import { DECISION_LABELS } from './decisionOptions'

// Neutral on purpose: the decision is the user's, so no color suggests a good or bad choice.
export function DecisionBadge({ value }: { value: DecisionValue }) {
  return (
    <p className="text-sm">
      <span className="text-slate-600">החלטה: </span>
      <span className="inline-block rounded-full border border-slate-300 bg-slate-100 px-3 py-0.5 font-medium text-slate-800">
        {DECISION_LABELS[value]}
      </span>
    </p>
  )
}
