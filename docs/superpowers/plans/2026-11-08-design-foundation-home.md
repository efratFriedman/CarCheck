# Design Foundation and Home Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shadcn/ui-style design foundation and rebuild the Home screen on it to match mockup 01, leaving the other screens unchanged.

**Architecture:** Design tokens live in Tailwind v4 `@theme` in `src/styles/style.css`. Primitives (`Button`, `Card`, `Badge`) in `src/components/ui` use `class-variance-authority` + `cn()`; layout pieces (`AppShell`, `HeroHeader`, `SectionTitle`) in `src/components/layout`. Home-only pieces live in `src/components/home`. The per-category tile data comes from a tested pure function in `src/domain/progress`.

**Tech Stack:** React 19, TypeScript 7, Vite 8, Tailwind CSS 4.3, Vitest 5, oxlint; new: lucide-react, class-variance-authority, clsx, tailwind-merge, @radix-ui/react-slot, @fontsource-variable/heebo.

**Spec:** [docs/superpowers/specs/2026-11-08-design-foundation-home-design.md](../specs/2026-11-08-design-foundation-home-design.md)

## Global Constraints

- Approved new dependencies only: `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`, `@fontsource-variable/heebo`. No react-router-dom; keep the in-house hash router and `formatRoute`.
- Imports are relative (no `@/` alias).
- Hebrew copy; layouts use logical utilities only (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `border-s`, `text-start`) — never `ml-/mr-/pl-/pr-/left-/right-/text-left/text-right/border-l/border-r/rounded-l/rounded-r`.
- Forward arrow = `ChevronLeft`. Tap targets ≥ 44px (`min-h-11` / `size-11`).
- Components use token classes (`bg-navy`, `text-teal-dark`, `border-border`…), never hex values.
- Amber = needs attention; teal = actions and progress; the decision badge stays neutral; no score or recommendation.
- `src/domain` has no React imports; only `src/domain/storage*` touches `localStorage`.
- Only the Home screen changes. Every other route keeps its current look and the old global `Header`.
- The product owner commits. Do not run `git commit`; leave changes in the working tree.

---

### Task 1: `categoryOverview` pure helper

**Files:**
- Modify: `src/domain/progress/progress.ts` (append at end)
- Test: `src/domain/progress/progress.test.ts` (append at end, extend the import)

**Interfaces:**
- Consumes: existing `categoryProgress`, `customProgress`, `Progress`, `ProgressSource` in `progress.ts`.
- Produces:
  - `export const CUSTOM_OVERVIEW_ID = 'custom'`
  - `export type OverviewId = CategoryId | typeof CUSTOM_OVERVIEW_ID`
  - `export interface CategoryOverview { id: OverviewId; progress: Progress }`
  - `export function categoryOverview(items: readonly ChecklistItem[], categoryIds: readonly CategoryId[], car: Pick<Car, 'answers' | 'customQuestions'>): CategoryOverview[]`

- [ ] **Step 1: Write the failing tests**

In `src/domain/progress/progress.test.ts`, change the import to:

```ts
import {
  calculateProgress,
  categoryOverview,
  categoryProgress,
  customProgress,
  getAnswer,
  overallProgress,
} from './progress'
```

Append:

```ts
describe('categoryOverview', () => {
  it('lists categories in the given order with their progress, then custom questions last', () => {
    const answers = { 'history-02': answer({ status: 'ok' }), c1: answer({ status: 'concern' }) }
    const customQuestions = [{ id: 'c1', text: 'א' }]
    expect(categoryOverview(items, ['paperwork', 'history'], { answers, customQuestions })).toEqual([
      { id: 'paperwork', progress: { answered: 0, total: 1 } },
      { id: 'history', progress: { answered: 1, total: 2 } },
      { id: 'custom', progress: { answered: 1, total: 1 } },
    ])
  })

  it('reports custom questions as 0 of 0 when there are none', () => {
    expect(categoryOverview(items, ['history'], { answers: {}, customQuestions: [] })).toEqual([
      { id: 'history', progress: { answered: 0, total: 2 } },
      { id: 'custom', progress: { answered: 0, total: 0 } },
    ])
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/domain/progress/progress.test.ts`
Expected: FAIL — `categoryOverview` is not exported (TypeError: categoryOverview is not a function).

- [ ] **Step 3: Write the implementation**

Append to `src/domain/progress/progress.ts`:

```ts
export const CUSTOM_OVERVIEW_ID = 'custom'
export type OverviewId = CategoryId | typeof CUSTOM_OVERVIEW_ID

export interface CategoryOverview {
  id: OverviewId
  progress: Progress
}

// Built-in categories in the given order, then "My questions", which always comes last.
export function categoryOverview(
  items: readonly ChecklistItem[],
  categoryIds: readonly CategoryId[],
  car: ProgressSource,
): CategoryOverview[] {
  return [
    ...categoryIds.map((id) => ({ id, progress: categoryProgress(items, id, car.answers) })),
    { id: CUSTOM_OVERVIEW_ID, progress: customProgress(car) },
  ]
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/domain/progress/progress.test.ts`
Expected: PASS (all tests in the file).

---

### Task 2: Design foundation (dependencies, tokens, primitives, layout)

**Files:**
- Modify: `package.json`, `package-lock.json` (via npm)
- Modify: `src/styles/style.css`
- Modify: `src/main.tsx`
- Create: `src/lib/cn.ts`
- Create: `src/components/ui/Button.tsx`, `src/components/ui/Card.tsx`, `src/components/ui/Badge.tsx`
- Create: `src/components/layout/AppShell.tsx`, `src/components/layout/HeroHeader.tsx`, `src/components/layout/SectionTitle.tsx`
- Modify: `src/components/common/ProgressBar.tsx`

**Interfaces:**
- Produces:
  - `cn(...inputs: ClassValue[]): string`
  - `Button` props: `ComponentProps<'button'> & { variant?: 'primary' | 'outline' | 'ghost' | 'hero'; size?: 'default' | 'lg' | 'pill' | 'icon'; asChild?: boolean }`
  - `Card` props: `ComponentProps<'div'>`
  - `Badge` props: `ComponentProps<'span'> & { variant?: 'neutral' | 'teal' | 'amber' | 'soon' }`
  - `AppShell({ header: ReactNode; footer?: ReactNode; children: ReactNode })`
  - `HeroHeader({ actions?: ReactNode; children?: ReactNode })` — renders the page `<h1>` "CarCheck"
  - `SectionTitle({ id?: string; title: string; meta?: string })` — renders an `<h2>`
  - `ProgressBar` gains optional `className?: string` and `indicatorClassName?: string`
  - Token classes: `bg-navy`, `bg-navy-soft`, `bg-teal`, `text-teal-dark`, `bg-teal-soft`, `border-amber`, `text-amber-dark`, `bg-amber-soft`, `bg-bg`, `bg-surface`, `border-border`, `text-ink`, `text-muted`, `fill-danger`, `rounded-card`, `rounded-control`, `font-heebo`

- [ ] **Step 1: Install the approved dependencies**

Run: `npm install lucide-react class-variance-authority clsx tailwind-merge @radix-ui/react-slot @fontsource-variable/heebo`
Expected: the six packages appear under `dependencies` in `package.json`; no peer-dependency errors.

- [ ] **Step 2: Add the design tokens**

Replace `src/styles/style.css` with:

```css
@import "tailwindcss";

/* Design tokens taken from the mockups in docs/design. Components use these classes, never hex values. */
@theme {
  --font-heebo: "Heebo Variable", ui-sans-serif, system-ui, sans-serif;

  --color-navy: #0f2a44;
  --color-navy-soft: #1c3d5e;
  --color-teal: #14a693;
  --color-teal-dark: #0e7c6e;
  --color-teal-soft: #e3f5f2;
  --color-amber: #e0960f;
  --color-amber-dark: #8a5a00;
  --color-amber-soft: #fff4dd;
  --color-bg: #eef3f7;
  --color-surface: #ffffff;
  --color-border: #dfe6ee;
  --color-ink: #14283c;
  --color-muted: #6b7c8f;
  --color-danger: #d64545;

  --radius-card: 1.25rem;
  --radius-control: 0.875rem;
}
```

- [ ] **Step 3: Load the font**

In `src/main.tsx`, add the font import above the stylesheet import:

```ts
import '@fontsource-variable/heebo'
import './styles/style.css'
```

- [ ] **Step 4: Add `cn`**

Create `src/lib/cn.ts`:

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 5: Add the primitives**

Create `src/components/ui/Button.tsx`:

```tsx
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
        hero: 'bg-white/10 text-white hover:bg-white/20',
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
```

Create `src/components/ui/Card.tsx`:

```tsx
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('rounded-card border border-border bg-surface shadow-sm shadow-navy/5', className)}
      {...props}
    />
  )
}
```

Create `src/components/ui/Badge.tsx`:

```tsx
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
```

- [ ] **Step 6: Add the layout pieces**

Create `src/components/layout/AppShell.tsx`:

```tsx
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
```

Create `src/components/layout/HeroHeader.tsx`:

```tsx
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
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-control bg-teal">
              <ShieldCheck className="size-7" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl leading-tight font-bold">CarCheck</h1>
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
```

Create `src/components/layout/SectionTitle.tsx`:

```tsx
export function SectionTitle({ id, title, meta }: { id?: string; title: string; meta?: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <h2 id={id} className="text-xl font-bold">
        {title}
      </h2>
      {meta && <p className="text-sm text-muted">{meta}</p>}
    </div>
  )
}
```

- [ ] **Step 7: Let `ProgressBar` take styling overrides**

Replace `src/components/common/ProgressBar.tsx` with (defaults unchanged, so old screens look the same):

```tsx
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
```

- [ ] **Step 8: Verify the foundation compiles**

Run: `npm run typecheck; npm run lint; npm run build`
Expected: all three succeed with no errors.

---

### Task 3: Home screen on the new foundation

**Files:**
- Modify: `src/components/archive/StartNewCar.tsx` (export the text)
- Modify: `src/components/common/Disclaimer.tsx` (export the text)
- Create: `src/components/home/CarIllustration.tsx`
- Create: `src/components/home/VehicleCard.tsx`
- Create: `src/components/home/CategoryGrid.tsx`
- Create: `src/components/home/StartNewCarCard.tsx`
- Replace: `src/pages/HomePage.tsx`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Consumes: Task 1 (`categoryOverview`, `CUSTOM_OVERVIEW_ID`, `CategoryOverview`, `OverviewId`), Task 2 (all primitives and layout pieces, `ProgressBar` overrides).
- Produces:
  - `START_NEW_CAR_TEXT: { title, body, confirm, cancel }` and `DISCLAIMER_TEXT: string`
  - `CarIllustration({ className?: string })`
  - `VehicleCard({ details: CarDetails; decision: DecisionValue; progress: Progress })`
  - `CategoryGrid({ entries: readonly CategoryOverview[] })`
  - `StartNewCarCard({ onCancel: () => void })`

- [ ] **Step 1: Share the confirmation and disclaimer text**

In `src/components/archive/StartNewCar.tsx`, add after the imports and use the constants in the JSX (same text as today):

```tsx
export const START_NEW_CAR_TEXT = {
  title: 'להתחיל לבדוק רכב חדש?',
  body: 'הרכב הנוכחי יעבור לרכבים קודמים רק אחרי שמירת פרטי הרכב החדש. שם אפשר לצפות בו, אבל לא לערוך אותו.',
  confirm: 'כן, לפרטי הרכב החדש',
  cancel: 'ביטול',
} as const
```

The panel becomes:

```tsx
    <div role="alert" className="rounded-md border border-slate-300 bg-slate-50 p-3">
      <p className="font-medium">{START_NEW_CAR_TEXT.title}</p>
      <p className="mt-1">{START_NEW_CAR_TEXT.body}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <a
          href={formatRoute({ name: 'newCar' })}
          className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white"
        >
          {START_NEW_CAR_TEXT.confirm}
        </a>
        <button type="button" onClick={() => setConfirming(false)} className={secondaryButton}>
          {START_NEW_CAR_TEXT.cancel}
        </button>
      </div>
    </div>
```

Replace `src/components/common/Disclaimer.tsx` with:

```tsx
export const DISCLAIMER_TEXT =
  'CarCheck מארגן מידע בלבד. הוא אינו בדיקה מקצועית, אינו מאבחן תקלות ואינו מעריך את הרכב או את מחירו. מומלץ לבצע בדיקה מקצועית במכון בדיקה לפני קנייה.'

export function Disclaimer() {
  return (
    <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
      {DISCLAIMER_TEXT}
    </p>
  )
}
```

- [ ] **Step 2: Car illustration**

Create `src/components/home/CarIllustration.tsx`:

```tsx
// Decorative side view of a sedan, drawn with token colors.
export function CarIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 460 215" aria-hidden="true" focusable="false" className={className}>
      <ellipse cx="230" cy="198" rx="220" ry="12" className="fill-navy opacity-70" />
      <path
        d="M112 90 L160 36 Q168 28 182 28 L288 28 Q302 28 310 36 L362 90 Z"
        className="fill-surface"
      />
      <path d="M134 88 L174 44 L222 44 L222 88 Z" className="fill-navy-soft" />
      <path d="M238 44 L290 44 L334 88 L238 88 Z" className="fill-navy-soft" />
      <path
        d="M40 104 Q40 92 54 90 L112 84 L362 84 L404 92 Q420 96 420 110 L420 152 Q420 160 412 160 L48 160 Q40 160 40 152 Z"
        className="fill-surface"
      />
      <rect x="40" y="126" width="380" height="34" rx="8" className="fill-border" />
      <rect x="222" y="100" width="24" height="5" rx="2.5" className="fill-muted opacity-60" />
      <rect x="44" y="104" width="18" height="14" rx="3" className="fill-danger opacity-80" />
      <rect x="396" y="104" width="22" height="14" rx="4" className="fill-amber opacity-80" />
      {[120, 340].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="160" r="40" className="fill-navy" />
          <circle cx={cx} cy="160" r="19" className="fill-muted" />
          <circle cx={cx} cy="160" r="8" className="fill-navy" />
        </g>
      ))}
    </svg>
  )
}
```

- [ ] **Step 3: Vehicle card**

Create `src/components/home/VehicleCard.tsx`:

```tsx
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
    <div className="min-w-0 px-1 text-center not-first:border-s not-first:border-border">
      <dt className="text-xs text-muted">{label}</dt>
      <dd dir="auto" className={cn('mt-1 font-bold break-words', soon ? 'text-muted' : 'text-ink')}>
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
    <Card className="p-5">
      <section aria-label="הרכב הנוכחי">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2 dir="auto" className="text-2xl leading-tight font-bold break-words">
              {make} {model}
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
```

- [ ] **Step 4: Category grid**

Create `src/components/home/CategoryGrid.tsx`:

```tsx
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
                <span className="block leading-snug font-bold">{titleOf(id)}</span>
                <span className="block text-sm text-muted">{countText(progress, isCustom)}</span>
              </span>
            </Card>
          </li>
        )
      })}
    </ul>
  )
}
```

- [ ] **Step 5: Start-new-car confirmation card**

Create `src/components/home/StartNewCarCard.tsx`:

```tsx
import { formatRoute } from '../../domain/routes/routes'
import { START_NEW_CAR_TEXT } from '../archive/StartNewCar'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

// Same flow as StartNewCar (D50 inline confirmation); archiving happens only when the new car is saved.
export function StartNewCarCard({ onCancel }: { onCancel: () => void }) {
  return (
    <Card role="alert" className="border-amber/50 bg-amber-soft p-4">
      <p className="font-bold">{START_NEW_CAR_TEXT.title}</p>
      <p className="mt-1 text-sm">{START_NEW_CAR_TEXT.body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild>
          <a href={formatRoute({ name: 'newCar' })}>{START_NEW_CAR_TEXT.confirm}</a>
        </Button>
        <Button variant="outline" onClick={onCancel}>
          {START_NEW_CAR_TEXT.cancel}
        </Button>
      </div>
    </Card>
  )
}
```

- [ ] **Step 6: Rebuild the Home page**

Replace `src/pages/HomePage.tsx` with:

```tsx
import { ChevronLeft, History } from 'lucide-react'
import { useState } from 'react'
import { CATEGORIES, CHECKLIST_ITEMS } from '../data/checklist'
import { formatNumber } from '../domain/format/format'
import { categoryOverview, overallProgress } from '../domain/progress/progress'
import { formatRoute } from '../domain/routes/routes'
import type { Car } from '../domain/types'
import { DISCLAIMER_TEXT } from '../components/common/Disclaimer'
import { CarIllustration } from '../components/home/CarIllustration'
import { CategoryGrid } from '../components/home/CategoryGrid'
import { StartNewCarCard } from '../components/home/StartNewCarCard'
import { VehicleCard } from '../components/home/VehicleCard'
import { AppShell } from '../components/layout/AppShell'
import { HeroHeader } from '../components/layout/HeroHeader'
import { SectionTitle } from '../components/layout/SectionTitle'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAppData } from '../hooks/useAppData'

const CATEGORY_IDS = CATEGORIES.map((category) => category.id)
const NO_CAR: Pick<Car, 'answers' | 'customQuestions'> = { answers: {}, customQuestions: [] }

export function HomePage() {
  const { data } = useAppData()
  const car = data.activeCar
  const [confirmingNewCar, setConfirmingNewCar] = useState(false)
  const source = car ?? NO_CAR
  const progress = overallProgress(CHECKLIST_ITEMS, source)
  const overview = categoryOverview(CHECKLIST_ITEMS, CATEGORY_IDS, source)

  return (
    <AppShell
      header={
        <HeroHeader
          actions={
            <>
              {car && (
                <Button
                  variant="hero"
                  size="pill"
                  aria-expanded={confirmingNewCar}
                  onClick={() => setConfirmingNewCar(true)}
                >
                  בדיקה חדשה
                </Button>
              )}
              <Button asChild variant="hero" size="icon">
                <a href={formatRoute({ name: 'archive' })} aria-label="רכבים קודמים" title="רכבים קודמים">
                  <History className="size-5" aria-hidden="true" />
                </a>
              </Button>
            </>
          }
        >
          <CarIllustration className="mx-auto mt-6 w-full max-w-sm" />
        </HeroHeader>
      }
      footer={<HomeFooter car={car} started={progress.answered > 0} />}
    >
      <div className="relative z-10 -mt-16">
        {car ? (
          <VehicleCard details={car.details} decision={car.decision.value} progress={progress} />
        ) : (
          <WelcomeCard />
        )}
      </div>

      {car && confirmingNewCar && <StartNewCarCard onCancel={() => setConfirmingNewCar(false)} />}

      <section aria-labelledby="home-categories" className="space-y-3">
        <SectionTitle
          id="home-categories"
          title="מה נבדוק בדרך"
          meta={`${formatNumber(CATEGORIES.length)} שלבים · ${formatNumber(progress.total)} שאלות`}
        />
        <CategoryGrid entries={overview} />
      </section>

      <div className="space-y-3 text-sm text-muted">
        <p className="rounded-card border border-border bg-surface p-4">{DISCLAIMER_TEXT}</p>
        <p>
          הנתונים נשמרים בדפדפן במכשיר הזה בלבד. ב־Safari באייפון, אתרים שלא נפתחו כשבוע עלולים לאבד
          את הנתונים השמורים.
        </p>
      </div>
    </AppShell>
  )
}

function WelcomeCard() {
  return (
    <Card className="p-5">
      <h2 className="text-2xl font-bold">ברוכים הבאים ל־CarCheck</h2>
      <p className="mt-2 text-muted">
        CarCheck עוזר לארגן את המידע בזמן בדיקת רכב משומש: פרטי הרכב, שאלות לשאול את המוכר, תשובות,
        הערות ונקודות לבירור.
      </p>
    </Card>
  )
}

function HomeFooter({ car, started }: { car: Car | null; started: boolean }) {
  const primary = car
    ? {
        href: formatRoute({ name: 'checklist' }),
        label: started ? 'המשך הבדיקה' : 'התחלת בדיקת הרכב',
      }
    : { href: formatRoute({ name: 'car' }), label: 'התחלת בדיקת רכב' }

  return (
    <>
      <div className="flex gap-3">
        <Button asChild size="lg" className="flex-1">
          <a href={primary.href}>
            {primary.label}
            <ChevronLeft className="size-5" aria-hidden="true" />
          </a>
        </Button>
        {car && (
          <Button asChild size="lg" variant="outline">
            <a href={formatRoute({ name: 'summary' })}>סיכום</a>
          </Button>
        )}
      </div>
      <p className="mt-2 text-center text-sm text-muted">ההתקדמות נשמרת במכשיר</p>
    </>
  )
}
```

- [ ] **Step 7: Hide the old header on Home**

In `src/app/App.tsx`, replace `<Header />` with:

```tsx
      {/* Restyled screens (AppShell) bring their own header. */}
      {route.name !== 'home' && <Header />}
```

- [ ] **Step 8: Verify**

Run: `npm run check`
Expected: typecheck, lint, all unit tests, and build pass.

Run the three Definition-of-done searches (include untracked files):

```
git grep --untracked -n localStorage -- src ":!src/domain/storage*"
git grep --untracked -nE "from .react" -- src/domain
git grep --untracked -nwE "(ml|mr|pl|pr|left|right)-[a-z0-9]+|text-(left|right)|(border|rounded)-[lr]" -- src
```

Expected: all three print nothing.

---

### Task 4: Browser verification and docs

**Files:**
- Modify: `docs/decisions.md` (append D54)
- Modify: `docs/roadmap.md` (current status, session log)
- Modify: `.github/copilot-instructions.md` (token location)

- [ ] **Step 1: Browser checks**

Start `npm run dev`. On `#/` at 390×844, 360×800 and 1280×800, check each state: no car; active car with nothing answered (button reads התחלת בדיקת הרכב); active car with answers (button reads המשך הבדיקה, tile counts show "X מתוך Y נענו"); the "בדיקה חדשה" confirmation open; a car with a 50-character unbroken make and model and every number empty. For each: `document.documentElement.scrollWidth <= window.innerWidth`, `document.documentElement.dir === 'rtl'`, no console errors. Reload: state is kept. Links: pencil → `#/car`, history → `#/archive`, footer → `#/checklist` / `#/summary` / `#/car`; confirm → `#/car/new`; cancel closes the card. Other routes still show the old header and look unchanged. Take a 390×844 screenshot and compare with `docs/design/CarCheck-01-vehicle-overview.png`; fix spacing differences in the components.

- [ ] **Step 2: Record the decision**

Append to `docs/decisions.md`:

```markdown

## 2026-11-08 — Design step 1

- **D54 — Restyle one screen at a time; design foundation and Home (product owner).** Amends D48 and D50: the restyle to the mockups in `docs/design/` happens one screen at a time, starting with Home (mockup 01); Checklist (mockup 02) and Summary (mockup 03) follow on the same foundation. Approved dependencies: `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`, `@fontsource-variable/heebo` (shadcn/ui pattern: the components live in `src/components/ui` and are owned by the repo). The in-house hash router stays (D34). Tokens are in `@theme` in `src/styles/style.css`; layout pieces are in `src/components/layout` (`AppShell`, `HeroHeader`, `SectionTitle`). Restyled screens use `AppShell` and bring their own header, so the old global `Header` is shown only on screens not yet restyled. Mockup features the app does not have yet (number of previous owners, the "יד" badge) keep their slot with "—" and a "בקרוב" badge; empty existing fields show "—". Category tiles show progress but are not links yet. The mockup's "כ־15 דקות" estimate is dropped. Spec: `docs/superpowers/specs/2026-11-08-design-foundation-home-design.md`. *Rejected:* restyling every screen at once; Home-only inline classes without shared primitives; a global re-theme of the old screens; a full component library (MUI, Mantine).
```

- [ ] **Step 3: Update the roadmap**

In `docs/roadmap.md`, replace the last sentence of **Current status** ("A design step that restyles every screen to the mockups in `docs/design/` is planned (D48); its timing is up to the product owner.") with: "Design step 1 (design foundation and Home, D54) is done and verified locally; the Checklist and Summary restyles follow as later design steps." Append a session log entry `- **2026-11-08 — Design step 1 (foundation and Home).** …` listing D54, the six dependencies, the files added, the `categoryOverview` tests, `npm run check` result (test count), the three searches, and the browser checks from Step 1.

- [ ] **Step 4: Update the agent instructions**

In `.github/copilot-instructions.md`, change "Defined once in `src/index.css` under `@theme`" to "Defined once in `src/styles/style.css` under `@theme`", and add after that sentence: "Restyled screens apply the font with `font-heebo` through `AppShell`."

- [ ] **Step 5: Final check**

Run: `npm run check` and the three searches again. Expected: pass / print nothing. Leave the work uncommitted for the product owner.
