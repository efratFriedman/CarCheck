import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 font-bold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-teal text-white hover:bg-teal-dark',
        outline: 'border border-border bg-surface text-ink hover:bg-bg',
        ghost: 'text-teal-dark hover:bg-teal-soft',
        hero: 'bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white',
      },
      size: {
        default: 'min-h-11 rounded-control px-4 text-base',
        lg: 'min-h-14 rounded-control px-6 text-lg',
        pill: 'min-h-11 rounded-full px-4 text-sm',
        icon: 'size-11 rounded-full',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
)

export interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  // Renders the single child (usually an <a>) with button styles instead of a <button>.
  asChild?: boolean
}

export function Button({ className, variant, size, asChild = false, type, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      type={asChild ? undefined : (type ?? 'button')}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
