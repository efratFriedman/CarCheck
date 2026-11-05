import type { Decision } from '../../domain/types'
import { DecisionBadge } from './DecisionBadge'

// Read-only decision for the archived summary (and later the shared view).
export function DecisionView({ decision }: { decision: Decision }) {
  const reason = decision.reason.trim()
  return (
    <div className="space-y-2">
      <DecisionBadge value={decision.value} />
      {reason === '' ? (
        <p className="text-slate-600">לא נכתבה סיבה.</p>
      ) : (
        <div>
          <p className="text-sm text-slate-600">סיבה</p>
          <p dir="auto" className="whitespace-pre-wrap break-words">
            {decision.reason}
          </p>
        </div>
      )}
    </div>
  )
}
