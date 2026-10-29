# CarCheck — Roadmap

Living document. Update it at the end of every session: session status, session log, and open questions.

**Current status:** Session 0 done: docs reviewed and the development workflow defined. The repo contains only the Vite + TypeScript + Tailwind starter template; application work starts with session 1.

## How sessions work

A session is one roadmap step and may take more than one chat. Work on one session at a time. Decide the open questions listed under "Decide first" before starting a session. Each session ends with something working and committed, and deployed from session 2 onward. Requirement IDs (FR, AC, UC) refer to [spec.md](spec.md); OQ IDs refer to [Open questions](#open-questions).

Pure logic (storage, validation, progress, summary, share encoding) lives in framework-free modules with Vitest unit tests. Screens are checked in the browser.

### Definition of done (every session from session 1)

1. `npm run check` passes (typecheck, lint, unit tests, production build).
2. `package.json` contains only dependencies the product owner approved.
3. These searches print nothing:
   - `git grep -n localStorage -- src ":!src/domain/storage*"`: only the storage module touches `localStorage`.
   - `git grep -nE "from .react" -- src/domain`: pure logic has no React imports.
   - `git grep -nwE "(ml|mr|pl|pr|left|right)-[a-z0-9]+|text-(left|right)|(border|rounded)-[lr]" -- src`: layouts use logical utilities (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `text-end`), never left/right ones.
4. Sessions that change UI: at 360×800 and at desktop width, `document.documentElement.scrollWidth <= window.innerWidth` is true, the console has no errors, and state survives a reload. Walk through the session's acceptance criteria and note the result in the session log.
5. Roadmap, decisions, and spec are updated; the work is committed and the working tree is clean.

## Implementation sessions

| # | Session | Depends on | Decide first | Status |
|---|---|---|---|---|
| 0 | Repo docs and workflow | — | — | Done |
| 1 | Toolchain | 0 | OQ8 | Not started |
| 2 | App shell and deploy | 1 | OQ4, OQ5 | Not started |
| 3 | Data model and storage | 1 | OQ2, OQ7, OQ9 | Not started |
| 4 | Checklist content | 3 (item type); can run in parallel with 5 | OQ1 | Not started |
| 5 | Home and car details | 2, 3 | — | Not started |
| 6 | Checklist screen | 4, 5 | — | Not started |
| 7 | Custom questions | 6 | — | Not started |
| 8 | Summary and decision | 7 | — | Not started |
| 9 | Archive | 8 | — | Not started |
| 10 | Sharing | 8 (9 for sharing archived cars) | OQ3 | Not started |
| 11 | Polish and release | 10 | — | Not started |

Sessions 1–8 deliver a product usable on a real car. Sessions 9–10 add archive and sharing and can be paused or re-prioritized without leaving anything half-built.

### 1. Toolchain

- **Scope:** Add React, React DOM, `@vitejs/plugin-react`, Vitest, and the linter chosen in OQ8. Remove the starter demo (`src/counter.ts`, `src/assets/`, `public/icons.svg`, demo markup in `src/main.ts`, template CSS), `autoprefixer`, and `tailwind.config.js`; load Tailwind with `@import "tailwindcss";`. Set `<html lang="he" dir="rtl">` and a Hebrew `<title>`. Scripts: `typecheck`, `lint`, `test`, `build` (`vite build`), and `check` (all four in that order). Create `src/domain/` (pure logic and colocated `*.test.ts`), `src/data/`, and `src/ui/`, with one sample pure function and its test. Update the commands in README and `.github/copilot-instructions.md`.
- **Non-goals:** Routing, screens, storage, deploy.
- **Done when:** `npm run check` passes; the dev server shows a Hebrew placeholder page in RTL with no console errors; no starter demo files remain.
- **Verify:** Definition of done; `document.documentElement.dir === "rtl"` in the browser console.

### 2. App shell and deploy

- **Scope:** Header with the app name, "Current car", and "Previous cars" (D26). Placeholder pages with Hebrew titles for Home, Car details, Checklist, Summary, Previous cars, Archived car, and Shared view. Unknown routes go to Home. Routing per OQ5. Deploy to the host chosen in OQ4 with `npm run check` as the build command. The product owner connects the repo to the host.
- **Non-goals:** Data, forms, real content.
- **Done when:** Every route shows its title on direct load and after reload, locally and on the live URL; nothing scrolls horizontally at 360px; the host's build log shows `npm run check` running the tests.
- **Verify:** Definition of done; open every route on the live URL.

### 3. Data model and storage

- **Scope:** Types for car, car details, answer, custom question, decision, checklist item, and stored data (schema version 1). A storage module with an injectable `Storage`, returning results instead of throwing for unavailable, corrupt, unknown-version, and full storage (behavior per OQ9). Length limits (spec §9). Car details validation and number normalization (FR-3).
- **Non-goals:** UI, migrations beyond version 1, checklist content.
- **Done when:** Unit tests cover save/load round trip, empty storage, corrupt data (raw value left unchanged), unknown version, unavailable storage, a quota error on write, every FR-3 validation rule, and AC-3.2.
- **Verify:** Definition of done.

### 4. Checklist content

- **Scope:** `src/data/checklist.ts` with 25–35 built-in items in the six spec categories, each with a stable ID, a Hebrew question, and a "why this matters" hint. A content test: unique IDs, no empty text, every category has items, item count in range. Product owner reviews the content.
- **Non-goals:** UI, retirement handling (D28).
- **Done when:** Tests pass and the product owner approves the content (closes OQ1).
- **Verify:** Definition of done; approval noted in the session log.

### 5. Home and car details (UC1)

- **Scope:** Car details form (create and edit, validation, explicit Save). Home without an active car (intro, disclaimer, start button, link to previous cars) and with one (card with make, model, year; continue, summary, edit details).
- **Non-goals:** Starting a new car while one is active (session 9); progress and decision badge on the Home card (sessions 6 and 8).
- **Done when:** AC-3.1, AC-3.2, AC-3.3, and AC-1.3 (Home) pass; car details survive a reload.
- **Verify:** Definition of done.

### 6. Checklist screen (UC2)

- **Scope:** Category accordion with per-category progress; each item with question, expandable hint, 4-option status selector, note (500-character limit), and follow-up toggle. Progress calculation as tested pure logic; overall progress on the Home card. General notes at the bottom.
- **Non-goals:** Custom questions, summary.
- **Done when:** AC-4.1 (progress part), AC-4.2, and AC-2.1 (answers and notes) pass; the screen is usable on a phone at 360px.
- **Verify:** Definition of done.

### 7. Custom questions (UC3)

- **Scope:** Add, edit, and delete (with confirmation) in "My questions", including its empty state.
- **Non-goals:** Custom categories, reordering.
- **Done when:** FR-5.2, FR-5.3, AC-5.1 (progress part), and AC-5.2 pass.
- **Verify:** Definition of done.

### 8. Summary and decision (UC4, UC6)

- **Scope:** Summary calculation as tested pure logic. One summary component with a `mode` prop, active mode only (spec §7 summary modes). Decision editor; decision badge on the Home card.
- **Non-goals:** Sharing; archived and shared modes.
- **Done when:** AC-6.1–AC-6.3, AC-4.1 (summary part), AC-5.1 (summary part), and AC-7.1 (summary part) pass. **Core product usable.**
- **Verify:** Definition of done.

### 9. Archive (UC7)

- **Scope:** Start-new-car confirmation; archiving only when the new car is saved, as tested pure logic. Previous cars list with its empty state. Archived summary mode. Delete with confirmation.
- **Non-goals:** Reactivating or editing archived cars.
- **Done when:** AC-8.1–AC-8.3, AC-1.3 (archived mode), and AC-7.1 (previous cars list) pass.
- **Verify:** Definition of done.

### 10. Sharing (UC5)

- **Scope:** OQ3 spike first. Versioned snapshot encoder and decoder as tested pure logic (round trip, maximum-length notes, tampered data, unknown version). Privacy warning; share sheet, then clipboard, then selectable field; long-link warning. Shared route and shared summary mode.
- **Non-goals:** Importing a shared car.
- **Done when:** AC-9.1–AC-9.5, AC-1.3 (shared mode), AC-5.1 (sharing part), and AC-7.1 (shared view) pass.
- **Verify:** Definition of done; open a link in a private window of a second browser and confirm that window's Local Storage is still empty afterward.

### 11. Polish and release

- **Scope:** Final Hebrew labels (spec §6); empty states; accessibility basics: every input has a label, dialogs and the accordion work with the keyboard, focus is visible. Disclaimer check.
- **Non-goals:** New features.
- **Done when:** Every acceptance criterion is checked on the live URL on iOS Safari and Android Chrome and recorded in the session log.
- **Verify:** Definition of done.

## Open questions

| ID | Question | Recommendation | Owner | Decide by |
|---|---|---|---|---|
| OQ1 | Final checklist items, categories, hint wording, and tone | AI drafts, product owner reviews | Both | Session 4 |
| OQ2 | Is iOS Safari's ~7-day storage eviction acceptable for the MVP? | Accept it, add a short note on Home, request persistent storage with `navigator.storage.persist()` (best effort), and make JSON backup (or "share link as backup") the first post-MVP item | Product owner | Before session 3 |
| OQ3 | Compression approach and link-length warning threshold | Use the browser's built-in `CompressionStream` with base64url encoding (no dependency); a short spike measures real link lengths with maximum-length notes to set the threshold | AI + product owner | Start of session 10 |
| OQ4 | Netlify vs Vercel vs Cloudflare Pages | Whichever the product owner has an account on; they are equivalent for a static SPA. Use `npm run check` as the build command | Product owner | Before session 2 |
| OQ5 | Routing: path routing with SPA rewrite and `/shared#data`, or hash routing | Hash routing (`#/checklist`, `#/shared/<data>`) with a small in-house router: no dependency and no host rewrite config. Alternative: path routing with React Router and a host rewrite rule | AI + product owner | Before session 2 |
| OQ6 | Should marking an item *Unknown* suggest turning on the follow-up flag? | Keep them independent for now | Product owner | After real use |
| OQ7 | Confirm session 0 clarifications: general notes limit of 1,000 characters, "All answers by category" in the summary (D22), explicit Save on the car details form (D23) | Accept all three | Product owner | Before session 3 |
| OQ8 | Linter | oxlint: one dependency, works with TypeScript 7, includes the React hooks rules. ESLint's TypeScript plugin (`typescript-eslint`) requires TypeScript below 6.1. Alternative: no linter, so `check` runs typecheck, tests, and build only | Product owner | Before session 1 |
| OQ9 | Storage error behavior (AC-2.2) | Corrupt data or unknown version: blocking Hebrew error with "Delete data and start over" behind a confirmation; raw data stays untouched until then. Storage unavailable: blocking message on app screens; shared links still work. Storage full on write: non-blocking error; the change stays on screen but is marked unsaved | Product owner | Before session 3 |

## Post-MVP backlog

Roughly in priority order. Nothing here is in scope without explicit approval.

1. Data backup: JSON export/import, or "share link as backup" (mitigates OQ2).
2. Government vehicle data lookup by license plate.
3. PDF / print-friendly summary.
4. Import a shared car into the recipient's own CarCheck.
5. Multiple active cars and side-by-side comparison.
6. Reactivate an archived car.
7. Photos and attachments.
8. PWA / offline install.
9. Dark mode; English UI.

## Session log

- **2026-10-28 — Product discovery.** Defined problem, users, journey, MVP scope, screens, requirements, edge cases, and session order. Decisions D01–D21.
- **2026-10-28 — Session 0.** Created README, AI instructions, spec, decision log, and roadmap. Added clarifications D22–D23 and OQ7. Awaiting product owner review; not yet committed.
- **2026-10-28 — Commit `e1f1ed4`.** Committed the session 0 docs together with the Vite + TypeScript + Tailwind starter template (demo code, removed in session 1).
- **2026-10-29 — Session 0 review.** Reviewed the docs against the repo. Restructured sessions: the old session 1 is split into Toolchain and App shell and deploy, and every session now has scope, non-goals, done-when, and verification, plus a shared Definition of done (D30). Spec clarifications D24–D28. Kept `.github/copilot-instructions.md` as the only agent instructions file (D29). Added OQ8 (linter) and OQ9 (storage errors).
