import { LIMITS } from '../../domain/limits'
import type { Decision } from '../../domain/types'
import { CHOICE_CLASS } from '../common/choiceStyles'
import { TextArea } from '../common/TextArea'
import { DECISION_LABELS, DECISION_VALUES } from './decisionOptions'

export function DecisionEditor({
  decision,
  onChange,
}: {
  decision: Decision
  onChange: (patch: Partial<Decision>) => void
}) {
  return (
    <div className="space-y-3">
      <fieldset>
        <legend className="sr-only">בחירת החלטה</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {DECISION_VALUES.map((value) => (
            <label key={value} className={CHOICE_CLASS}>
              <input
                type="radio"
                name="decision"
                value={value}
                checked={decision.value === value}
                onChange={() => onChange({ value })}
                className="sr-only"
              />
              {DECISION_LABELS[value]}
            </label>
          ))}
        </div>
      </fieldset>
      <TextArea
        name="decisionReason"
        label="סיבה (לא חובה)"
        value={decision.reason}
        maxLength={LIMITS.decisionReason}
        onChange={(reason) => onChange({ reason })}
      />
    </div>
  )
}
