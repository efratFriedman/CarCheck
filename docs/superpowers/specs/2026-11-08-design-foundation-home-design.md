# Design step 1 — Design foundation and Home screen

Date: 2026-11-08. Approved by the product owner in chat. Target mockup: [CarCheck-01-vehicle-overview.png](../../design/CarCheck-01-vehicle-overview.png).

## Goal

Start the restyle planned in D48 with one screen. Add a shared design foundation (tokens, shadcn/ui-style primitives, layout pieces) and rebuild the Home screen on it to match mockup 01. Features that the mockup shows but the app does not have yet keep their place in the layout with a muted dash and a "בקרוב" tag. The other screens are not changed in this step.

## Decisions

- **Restyle one screen at a time** (amends D48 and D50, which said every screen at once). Home is first; later steps restyle Checklist (mockup 02) and Summary (mockup 03) on the same foundation.
- **Approved dependencies:** `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`, `@fontsource-variable/heebo`.
- **Kept:** the in-house hash router (D34; no react-router-dom), relative imports, the data model (no owners field is added).
- **Not-yet-existing features** (previous owners fact, the "יד" badge): the slot stays, showing "—" and a "בקרוב" badge. A field that exists but is empty (for example a missing year) shows "—" only.
- **Category tiles are not links** in this step: opening a specific category does not exist yet.
- **Copy:** the mockup's "כ־15 דקות" estimate is dropped; the caption is "ההתקדמות נשמרת במכשיר".

## Foundation

- Tokens in `src/styles/style.css` under `@theme`: `navy`, `navy-soft`, `teal`, `teal-dark`, `teal-soft`, `amber`, `amber-dark`, `amber-soft`, `bg`, `surface`, `border`, `ink`, `muted`, `danger`, card and control radii, and the Heebo font. Components use token classes, never hex values.
- `src/lib/cn.ts`: `cn(...)` = `twMerge(clsx(...))`.
- `src/components/ui/`: `Button` (cva variants `primary`, `outline`, `ghost`, `hero`; sizes `default`, `lg`, `pill`, `icon`; `asChild` via Radix `Slot` so links look like buttons), `Card`, `Badge` (variants `neutral`, `teal`, `amber`, `soon`).
- `src/components/layout/`: `AppShell` (header slot, scrollable body in a centered `max-w-md` column, sticky footer with safe-area padding), `HeroHeader` (navy with decorative circles, brand, actions slot, children slot), `SectionTitle` (title plus optional meta text).

## Home screen

With an active car, top to bottom:

1. `HeroHeader`: shield logo, "CarCheck", "בדיקת רכב משומש לפני קנייה"; actions: a history icon button to `#/archive` ("רכבים קודמים") and a "בדיקה חדשה" pill that opens the start-new-car confirmation card in the body (D50 inline pattern, same text as `StartNewCar`, link to `#/car/new`, cancel).
2. `CarIllustration`: inline decorative SVG.
3. `VehicleCard`, overlapping the hero: make and model, "פרטי הרכב כפי שמסר המוכר", owners badge slot ("בקרוב"), an "עריכה" button to `#/car`, then four facts: שנת ייצור, קילומטראז׳, מחיר מבוקש, בעלים קודמים (בקרוב). Then the neutral decision badge and the teal progress bar with "X מתוך Y נענו".
4. "מה נבדוק בדרך" with "6 שלבים · N שאלות": a two-column grid with one tile per category (lucide icon, title, item count, answered count), plus a full-width "השאלות שלי" tile.
5. Storage notice and the disclaimer.
6. Sticky footer: primary "התחלת בדיקת הרכב" (nothing answered) or "המשך הבדיקה" to `#/checklist` with `ChevronLeft`; outline "סיכום" to `#/summary`; caption "ההתקדמות נשמרת במכשיר".

Without an active car: the same hero (history button only), the illustration, a welcome card with the existing intro text, the categories grid, the disclaimer and the storage notice; the footer CTA "התחלת בדיקת רכב" goes to `#/car`.

`App.tsx` renders the old global `Header` on every route except Home.

## Pure logic

`categoryOverview(items, categoryIds, car)` in `src/domain/progress/progress.ts` returns, per category in the given order, the item count and answered count, plus a last `custom` entry for "השאלות שלי". Tests are written first.

## Verification

- `npm run check` passes; the three Definition-of-done searches print nothing.
- Browser at 390×844, 360×800 and 1280×800: `scrollWidth <= innerWidth`, `dir` is `rtl`, no console errors; states: no car, active car with nothing answered, active car with answers, confirmation open; state survives a reload; screenshot compared with mockup 01.
- Docs: D54 in `docs/decisions.md`, roadmap entry, token path in `.github/copilot-instructions.md`.
