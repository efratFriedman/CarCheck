import { Pencil } from 'lucide-react'
import { formatNumber } from '../../domain/format/format'
import type { Progress } from '../../domain/progress/progress'
import { formatRoute } from '../../domain/routes/routes'
import type { CarDetails, DecisionValue } from '../../domain/types'
import { cn } from '../../lib/cn'
import { ProgressBar, progressText } from '../common/ProgressBar'
import { DECISION_LABELS } from '../summary/decisionOptions'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

const EMPTY = '—'

function Fact({ label, value, soon = false }: { label: string; value: string; soon?: boolean }) {
  return (
    <div className="min-w-0 px-0.5 text-center not-first:border-s not-first:border-border">
      <dt className="text-xs text-muted">{label}</dt>
      <dd
        dir="auto"
        className={cn(
          'mt-1 text-[0.9375rem] font-bold break-words min-[390px]:text-base',
          soon ? 'text-muted' : 'text-ink',
        )}
      >
        {value}
      </dd>
      {soon && (
        <dd className="mt-1">
          <Badge variant="soon" className="px-2 text-xs">
            בקרוב
          </Badge>
        </dd>
      )}
    </div>
  )
}

export function VehicleCard({
  details,
  decision,
  progress,
}: {
  details: CarDetails
  decision: DecisionValue
  progress: Progress
}) {
  const { make, model, year, mileage, askingPrice } = details

  return (
    <Card className="p-4">
      <section aria-label="הרכב הנוכחי">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl leading-tight font-bold break-words">
              <bdi>
                {make} {model}
              </bdi>
            </h2>
            <p className="mt-1 text-sm text-muted">פרטי הרכב כפי שמסר המוכר</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Badge variant="soon" title="מספר הבעלים (יד) – בקרוב">
              יד · בקרוב
            </Badge>
            <Button asChild variant="ghost" size="icon">
              <a href={formatRoute({ name: 'car' })} aria-label="עריכת פרטי הרכב" title="עריכת פרטי הרכב">
                <Pencil className="size-5" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-4 border-t border-border pt-4">
          <Fact label="שנת ייצור" value={year === null ? EMPTY : String(year)} />
          <Fact label="קילומטראז׳" value={mileage === null ? EMPTY : formatNumber(mileage)} />
          <Fact
            label="מחיר מבוקש"
            value={askingPrice === null ? EMPTY : `${formatNumber(askingPrice)} ₪`}
          />
          <Fact label="בעלים קודמים" value={EMPTY} soon />
        </dl>

        <div className="mt-4 space-y-2 border-t border-border pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-medium">{progressText(progress)}</span>
            <span className="text-muted">
              החלטה: <Badge>{DECISION_LABELS[decision]}</Badge>
            </span>
          </div>
          <ProgressBar
            progress={progress}
            label="התקדמות כללית"
            className="bg-bg"
            indicatorClassName="bg-teal"
          />
        </div>
      </section>
    </Card>
  )
}
