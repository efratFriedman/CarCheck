import { formatNumber } from '../../domain/format/format'
import type { Progress } from '../../domain/progress/progress'
import { cn } from '../../lib/cn'

export function progressText({ answered, total }: Progress): string {
  return `${formatNumber(answered)} מתוך ${formatNumber(total)} נענו`
}

export function ProgressBar({
  progress,
  label,
  className,
  indicatorClassName,
}: {
  progress: Progress
  label: string
  className?: string
  indicatorClassName?: string
}) {
  const percent = progress.total === 0 ? 0 : Math.round((progress.answered / progress.total) * 100)
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={progress.total}
      aria-valuenow={progress.answered}
      aria-valuetext={progressText(progress)}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-200', className)}
    >
      <div className={cn('h-full bg-slate-700', indicatorClassName)} style={{ width: `${percent}%` }} />
    </div>
  )
}
