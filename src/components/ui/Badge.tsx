import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-sm whitespace-nowrap',
  {
    variants: {
      variant: {
        neutral: 'border-border bg-bg font-medium text-ink',
        teal: 'border-transparent bg-teal-soft font-bold text-teal-dark',
        amber: 'border-amber/40 bg-amber-soft font-bold text-amber-dark',
        // A feature that is planned but not built yet.
        soon: 'border-dashed border-border bg-transparent font-medium text-muted',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
)

export function Badge({
  className,
  variant,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
