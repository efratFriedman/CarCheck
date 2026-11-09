# CarCheck – instructions for coding agents

Hebrew, RTL, mobile-first web app that guides a person through inspecting a used car,
records answers/notes, flags follow-ups, and produces a copyable summary.
It is a personal MVP. It is **not** a mechanic replacement and **never scores the car**.

## Stack (do not swap without asking)
React 19 · TypeScript · Vite · Tailwind CSS v4 · lucide-react · react-router-dom (HashRouter) ·
class-variance-authority + clsx + tailwind-merge (shadcn/ui-style primitives in `src/components/ui`).
No backend. State lives in React context and is persisted to LocalStorage.

## Commands
`npm install` · `npm run dev` · `npm run build` (typechecks, then builds)

## Product rules
1. **No score, rating, grade, or "buy / don't buy" recommendation.** Organise information only.
2. Hebrew copy, `dir="rtl"` on `<html>`. Use logical utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start/end`,
   `border-s`, `text-start`) – never `ml-/mr-/left-/right-`.
   Forward arrow = `ChevronLeft`, back arrow = `ArrowRight`.
3. Design for 390 × 844. Tap targets ≥ 44px. Primary action lives in the sticky footer.
4. Amber = follow-up / needs attention. Red (`danger`) only for genuine warnings. Teal = actions and progress.
5. No animation beyond simple transitions.

## Layout – one shell for every screen
Every page renders `<AppShell header={...} footer={...}>` (`src/components/layout/AppShell.tsx`):
`header (navy)` → scrollable body (`px-5`, `gap-5`) → sticky footer with the primary action.
- Start screen uses `HeroHeader`; every other screen uses `PageHeader` (back button, title, subtitle, optional progress).
- Sections use `SectionTitle`; surfaces use `Card`. Do not hand-roll headers, footers or page padding in a page.
- New screens must be added as a page in `src/pages`, a route in `App.tsx`, and use the shell.

## Design tokens
Defined once in `src/styles/style.css` under `@theme` (navy, teal, amber, bg, border, ink, muted, radii, Heebo font). Restyled screens apply the font with `font-heebo` through `AppShell`.
Use token classes (`bg-navy`, `text-teal-dark`, `border-border`…). Don't hard-code hex values in components.

## Data & persistence
- `src/data/checklist.ts` – 6 categories, 20 questions (id, text, hint, short label). Add/reorder questions here only.
- `src/data/mock.ts` – mock vehicle + dev demo data (`loadDemo`, shown only in `npm run dev`).
- `src/store/inspection.tsx` – single source of truth (`useInspection`). Item = `{ answer: yes|no|unknown|null, note, flagged, photo? }`.
- `src/lib/storage.ts` – the **only** file that touches LocalStorage (key `carcheck:v1`).
  When a DB arrives, replace `loadState/saveState/clearState` there (make them async + add loading state) and leave the rest alone.
- "Answered" = `answer !== null`. "Unanswered" = `answer === null`. "Flagged" is independent of answered.
- Photos are downscaled to JPEG data URLs (`src/lib/image.ts`) – move to file/object storage with the DB.

## Screens
| Route | File | Purpose |
|---|---|---|
| `/` | `OverviewPage` | Brand, car illustration, vehicle facts, category preview, "Start inspection" |
| `/inspect` | `InspectionPage` | One question at a time: Yes/No/Unknown, note, flag, photo; category tabs, progress, item chips |
| `/summary` | `SummaryPage` | Counts, follow-up list, unanswered link, general notes, copy / share |

## Known gaps / next steps
- Vehicle details are mock only (no edit form yet).
- No component tests. Add Vitest + Testing Library when behaviour stabilises.
- Verify RTL rendering on a real phone (iOS Safari, Android Chrome) and the camera input (`capture="environment"`).