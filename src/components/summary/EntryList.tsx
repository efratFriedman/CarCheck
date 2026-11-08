import type { SummaryEntry } from '../../domain/summary/summary'
import type { Status } from '../../domain/types'
import { STATUS_OPTIONS } from '../checklist/statusOptions'
import { categoryTitle } from './categories'

export function statusLabel(status: Status): string {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status
}

export function EntryList({
  entries,
  empty,
  showCategory = false,
  showStatus = false,
  showFlag = false,
}: {
  entries: readonly SummaryEntry[]
  empty: string
  showCategory?: boolean
  showStatus?: boolean
  showFlag?: boolean
}) {
  if (entries.length === 0) return <p className="text-slate-600">{empty}</p>

  return (
    <ul className="space-y-2">
      {entries.map((entry) => (
        <li key={entry.id} className="rounded-lg border border-slate-200 bg-white p-3">
          {showCategory && <p className="text-sm text-slate-600">{categoryTitle(entry.category)}</p>}
          <p dir="auto" className="font-medium break-words">
            {entry.question}
          </p>
          {(showStatus || (showFlag && entry.followUp)) && (
            <p className="mt-1 flex flex-wrap gap-x-3 text-sm text-slate-700">
              {showStatus && <span>סטטוס: {statusLabel(entry.status)}</span>}
              {showFlag && entry.followUp && <span>דורש בירור</span>}
            </p>
          )}
          {entry.note && (
            <p dir="auto" className="mt-1 whitespace-pre-wrap break-words text-slate-700">
              {entry.note}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}
