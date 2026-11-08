import type { DecisionValue } from '../../domain/types'

export const DECISION_VALUES: readonly DecisionValue[] = ['evaluating', 'movingForward', 'notBuying']

export const DECISION_LABELS: Record<DecisionValue, string> = {
  evaluating: 'עדיין בבדיקה',
  movingForward: 'מתקדמים לקנייה',
  notBuying: 'לא קונים',
}
