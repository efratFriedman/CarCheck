import {
  ClipboardCheck,
  Eye,
  FileText,
  Gauge,
  MessageSquare,
  ScrollText,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { CATEGORIES } from '../../data/checklist'
import { formatNumber } from '../../domain/format/format'
import {
  CUSTOM_OVERVIEW_ID,
  type CategoryOverview,
  type OverviewId,
  type Progress,
} from '../../domain/progress/progress'
import { cn } from '../../lib/cn'
import { Card } from '../ui/Card'

const ICONS: Record<OverviewId, LucideIcon> = {
  history: ScrollText,
  paperwork: FileText,
  maintenance: Wrench,
  condition: Eye,
  testDrive: Gauge,
  inspection: ClipboardCheck,
  custom: MessageSquare,
}

function titleOf(id: OverviewId): string {
  if (id === CUSTOM_OVERVIEW_ID) return 'השאלות שלי'
  return CATEGORIES.find((category) => category.id === id)?.title ?? ''
}

function countText({ answered, total }: Progress, isCustom: boolean): string {
  if (isCustom && total === 0) return 'אפשר להוסיף שאלות'
  if (answered > 0) return `${formatNumber(answered)} מתוך ${formatNumber(total)} נענו`
  return total === 1 ? 'שאלה אחת' : `${formatNumber(total)} שאלות`
}

export function CategoryGrid({ entries }: { entries: readonly CategoryOverview[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3">
      {entries.map(({ id, progress }) => {
        const Icon = ICONS[id]
        const isCustom = id === CUSTOM_OVERVIEW_ID
        const complete = progress.total > 0 && progress.answered === progress.total
        return (
          <li key={id} className={cn(isCustom && 'col-span-2')}>
            <Card className="flex h-full items-center gap-3 p-3">
              <span
                className={cn(
                  'grid size-11 shrink-0 place-items-center rounded-control',
                  complete ? 'bg-teal text-white' : 'bg-teal-soft text-teal-dark',
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block leading-snug font-bold break-words">{titleOf(id)}</span>
                <span className="block text-sm text-muted">{countText(progress, isCustom)}</span>
              </span>
            </Card>
          </li>
        )
      })}
    </ul>
  )
}
