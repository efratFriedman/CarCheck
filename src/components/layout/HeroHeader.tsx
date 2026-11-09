import { ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'

// Start-screen header: brand, optional actions, and room for an illustration below.
export function HeroHeader({ actions, children }: { actions?: ReactNode; children?: ReactNode }) {
  return (
    <header className="relative overflow-hidden bg-linear-to-b from-navy to-navy-soft text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -start-24 -top-20 size-80 rounded-full bg-white/5"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -end-20 bottom-0 size-48 rounded-full bg-white/5"
      />
      <div className="relative mx-auto w-full max-w-md px-5 pt-6 pb-16">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 min-[390px]:gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-control bg-teal min-[390px]:size-12">
              <ShieldCheck className="size-6 min-[390px]:size-7" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl leading-tight font-bold min-[390px]:text-2xl">CarCheck</h1>
              <p className="text-sm text-white/70">בדיקת רכב משומש לפני קנייה</p>
            </div>
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
        {children}
      </div>
    </header>
  )
}
