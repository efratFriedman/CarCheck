import { CHECKLIST_ITEMS } from '../../data/checklist'
import { updateDecision } from '../../domain/decision/decision'
import { formatNumber } from '../../domain/format/format'
import { buildSummary, type SummaryEntry } from '../../domain/summary/summary'
import type { Car, Status } from '../../domain/types'
import { Disclaimer } from '../common/Disclaimer'
import { AllAnswers } from './AllAnswers'
import { CarDetailsSummary } from './CarDetailsSummary'
import { CATEGORY_ORDER } from './categories'
import { DecisionEditor } from './DecisionEditor'
import { DecisionView } from './DecisionView'
import { EntryList, statusLabel } from './EntryList'

// The shared mode arrives in session 10 (spec §7 summary modes).
export type SummaryMode = 'active' | 'archived'

// Only the active mode can change the car; the archived mode has no editable inputs (AC-8.3).
type SummaryProps =
  | { mode: 'active'; car: Car; onCarChange: (car: Car) => void }
  | { mode: 'archived'; car: Car }

const COUNT_ORDER: readonly Status[] = ['ok', 'concern', 'unknown', 'notAnswered']

function unansweredText(count: number, total: number): string {
  if (count === 0) return 'כל השאלות נענו.'
  if (count === 1) return `שאלה אחת מתוך ${formatNumber(total)} עדיין ללא מענה.`
  return `${formatNumber(count)} שאלות מתוך ${formatNumber(total)} עדיין ללא מענה.`
}

export function Summary(props: SummaryProps) {
  const { mode, car } = props
  const summary = buildSummary(CHECKLIST_ITEMS, CATEGORY_ORDER, car)

  return (
    <div className="space-y-6">
      <CarDetailsSummary details={car.details} />

      <section aria-labelledby="decision-title" className="space-y-3">
        <h2 id="decision-title" className="text-xl font-bold">
          ההחלטה שלי
        </h2>
        {props.mode === 'active' ? (
          <DecisionEditor
            decision={car.decision}
            onChange={(patch) => props.onCarChange(updateDecision(car, patch))}
          />
        ) : (
          <DecisionView decision={car.decision} />
        )}
      </section>

      <section aria-labelledby="counts-title" className="space-y-3">
        <h2 id="counts-title" className="text-xl font-bold">
          סיכום תשובות
        </h2>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {COUNT_ORDER.map((status) => (
            <div
              key={status}
              className="flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-3 text-center"
            >
              <dt className="text-sm text-slate-600">{statusLabel(status)}</dt>
              <dd className="text-2xl font-bold">{formatNumber(summary.counts[status])}</dd>
            </div>
          ))}
        </dl>
        <p className="flex flex-wrap items-center gap-x-3">
          <span>{unansweredText(summary.counts.notAnswered, summary.total)}</span>
          {mode === 'active' && (
            <a href="#/checklist" className="inline-flex min-h-11 items-center underline">
              מעבר לצ'קליסט
            </a>
          )}
        </p>
      </section>

      <ListSection
        id="concerns"
        title="חששות"
        entries={summary.concerns}
        empty="אין פריטים בסטטוס חשש."
      />
      <ListSection
        id="unknowns"
        title="לא ידוע"
        entries={summary.unknowns}
        empty="אין פריטים בסטטוס לא ידוע."
      />
      <ListSection
        id="follow-ups"
        title="דורש בירור"
        entries={summary.followUps}
        empty="אין פריטים שסומנו כדורשים בירור."
        showStatus
      />

      <AllAnswers groups={summary.byCategory} />

      <section aria-labelledby="general-notes-title" className="space-y-2">
        <h2 id="general-notes-title" className="text-xl font-bold">
          הערות כלליות
        </h2>
        {car.generalNotes.trim() === '' ? (
          <p className="text-slate-600">לא נכתבו הערות כלליות.</p>
        ) : (
          <p dir="auto" className="whitespace-pre-wrap break-words">
            {car.generalNotes}
          </p>
        )}
      </section>

      <Disclaimer />
    </div>
  )
}

function ListSection({
  id,
  title,
  entries,
  empty,
  showStatus = false,
}: {
  id: string
  title: string
  entries: readonly SummaryEntry[]
  empty: string
  showStatus?: boolean
}) {
  return (
    <section aria-labelledby={`${id}-title`} className="space-y-2">
      <h2 id={`${id}-title`} className="text-xl font-bold">
        {title} ({formatNumber(entries.length)})
      </h2>
      <EntryList entries={entries} empty={empty} showCategory showStatus={showStatus} />
    </section>
  )
}
