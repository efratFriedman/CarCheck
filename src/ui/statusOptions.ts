import type { Status } from '../domain/types'

export const STATUS_OPTIONS: readonly { value: Status; label: string }[] = [
  { value: 'notAnswered', label: 'לא נענה' },
  { value: 'ok', label: 'תקין' },
  { value: 'concern', label: 'חשש' },
  { value: 'unknown', label: 'לא ידוע' },
]
