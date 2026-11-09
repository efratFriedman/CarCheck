import type { ReactNode } from 'react'

// Every restyled screen: header, scrollable body, sticky footer with the primary action.
export function AppShell({
  header,
  footer,
  children,
}: {
  header: ReactNode
  footer?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg font-heebo text-ink">
      {header}
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-5 pt-5 pb-8">
        {children}
      </main>
      {footer && (
        <footer className="sticky bottom-0 z-20 border-t border-border bg-surface">
          <div className="mx-auto w-full max-w-md px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        </footer>
      )}
    </div>
  )
}
