# CarCheck — Decision Log

Settled decisions and why they were made. Don't reopen a decision unless the product owner asks; to change one, add a new entry that supersedes it instead of editing history.

Format: **ID — Decision.** Why. *Rejected:* alternatives considered.

## 2026-10-28 — Product discovery

- **D01 — Target user: non-expert private buyers in Israel.** They need guidance on what to ask, so every built-in item has a short "why this matters" hint in plain Hebrew. *Rejected:* experienced buyers who only want organization; a personal-only tool.
- **D02 — Primary usage is before the viewing and at home afterward; on-site use is secondary.** The product owner finds on-site use the least attractive. The UI must work on a phone and handle longer notes, but is not optimized for quick tap-only input. *Rejected:* on-site-first design.
- **D03 — CarCheck organizes information only.** No diagnosis, scoring, price evaluation, or buy/don't-buy recommendation, to avoid false authority. *Rejected:* any computed verdict.
- **D04 — One active car at a time; previous cars are archived.** Keeps the data model and navigation simple while preserving history. *Rejected:* replacing (deleting) the previous car; multiple active cars; side-by-side comparison.
- **D05 — Archived cars are read-only: view, share, delete.** *Rejected:* reactivating or editing archived cars.
- **D06 — The current car is archived only when the new car's details are saved.** Cancelling the new car form must not lose or archive the current car. *Rejected:* archiving immediately on confirmation.
- **D07 — Car details: only make and model are required; everything else is optional and editable later.** Details are entered first from the listing, before the call with the seller, and are often incomplete. Seller name and phone are not separate fields. *Rejected:* a larger required form; dedicated seller contact fields.
- **D08 — Fixed, Israel-specific built-in checklist plus custom questions for the active car.** The curated list is the core value for non-experts. Custom questions live in a "My questions" category. *Rejected:* generic content; a fully editable checklist; custom categories.
- **D09 — Built-in checklist content is drafted by the AI assistant and reviewed by the product owner** in a dedicated session. *Rejected:* product owner writing all content.
- **D10 — Uniform answer model: status (Not answered / OK / Concern / Unknown) + optional note + independent follow-up flag.** Simple, consistent, and easy to summarize. Facts such as the number of previous owners go in the note. *Rejected:* typed answers per item; free-text only.
- **D11 — The decision is recorded manually by the user** (Still evaluating / Moving forward / Not buying + optional reason) and shown in the summary, archive list, and shared view. *Rejected:* no decision field; any computed decision.
- **D12 — Sharing uses a snapshot link with no backend.** A versioned, compressed payload lives in the URL fragment; sent via the native share sheet with clipboard fallback; a privacy warning comes first; the recipient sees a read-only view. *Rejected:* sharing as plain text only; PDF; server-stored links.
- **D13 — Shared links contain all answered items; unanswered items only as a count.** Gives the recipient the full picture while limiting link length. Built-in items are referenced by ID, custom questions include their text.
- **D14 — Length limits:** item note 500, custom question 200, decision reason 300 characters. Keeps share links reasonable.
- **D15 — Storage is browser `localStorage`; no backend, accounts, or analytics.** *Rejected:* any server component for the MVP.
- **D16 — Hebrew-only, RTL, responsive UI.** *Rejected:* multilingual UI for the MVP.
- **D17 — Stack: React + TypeScript + Tailwind on Vite; Vitest for pure logic.** Handles several form-heavy screens cleanly, and AI coding assistants work well with it. *Rejected:* vanilla TypeScript; Svelte or Preact.
- **D18 — Hosting: Netlify, Vercel, or Cloudflare Pages** with auto-deploy on push; the specific host is picked in session 1. *Rejected:* GitHub Pages.
- **D19 — Built-in checklist item IDs are never reused or deleted;** removed items are retired so stored data and old share links keep working.
- **D20 — Summary, archived summary, and shared view are one view in three modes.** Less code, consistent output, and makes sharing archived cars nearly free.
- **D21 — Repository docs are limited to five files:** README, `.github/copilot-instructions.md`, `docs/spec.md`, `docs/decisions.md`, `docs/roadmap.md`. *Rejected:* personas, user stories, ADR templates, wireframe files, a separate checklist content doc.

## 2026-10-28 — Session 0 clarifications

Consistency fixes made while writing the spec. The product owner can still veto these.

- **D22 — The summary includes a collapsible "All answers by category" section.** Follows from D10 and D13: facts recorded in notes of *OK* items would otherwise be invisible in the summary, and shared links already carry all answered items.
- **D23 — The car details form uses an explicit Save button; everything else autosaves.** Required-field validation and the "archive on save" rule (D06) need an explicit save action.

## 2026-10-29 — Session 0 review

Clarifications from reviewing the docs against the repo. The product owner can still veto D24–D28.

- **D24 — Numbers and dates use `Intl` with the `he-IL` locale as-is:** `120,000 ק"מ`, `45,000 ₪` (the shekel sign follows the number), `28.10.2026`. No custom formatting code. Replaces the `₪45,000` example in FR-1.3. *Rejected:* custom formatting to put ₪ first.
- **D25 — Car details limits and number input:** make and model up to 50 characters, license plate up to 20. Number fields drop commas, spaces, and `₪`; anything else that isn't a digit shows an inline error. Every free-text field that goes into a share link is now bounded (D14).
- **D26 — Header: the app name and "Current car" link to Home; "Previous cars" links to the archive list.** The app name "CarCheck" is the only Latin UI string.
- **D27 — Share snapshots don't store status counts;** the shared view derives them from the answered items and the unanswered count. Less data to keep consistent; AC-9.1 still holds.
- **D28 — Retired-item handling (spec §10) is built when the first built-in item is retired.** v1 ships with none. Status counts add up to the items in that car's checklist.
- **D29 — Agent instructions stay in `.github/copilot-instructions.md`; no AGENTS.md.** Confirms D21. *Rejected:* an AGENTS.md replacing or duplicating it.
- **D30 — Every roadmap session has scope, non-goals, done-when criteria, and verification steps, and follows a shared Definition of done whose single gate is `npm run check`.** The old session 1 is split into Toolchain and App shell and deploy; the host (D18) is now picked before session 2. *Rejected:* separate plan files per session; a CI workflow (the host build runs `npm run check`).

## 2026-10-29 — Session 1

- **D31 — Linter is oxlint** (OQ8), configured in `.oxlintrc.json` with the TypeScript and React plugins and the hooks rules. *Rejected:* `typescript-eslint` (needs TypeScript below 6.1); no linter.
- **D32 — `@types/react` and `@types/react-dom` are dev dependencies,** required for React under TypeScript 7. No other dependencies beyond the session 1 scope.

## 2026-10-29 — Session 2

- **D33 — Host is Netlify** (OQ4), building with `npm run check` and publishing `dist` (configured in `netlify.toml`). This settles D18. *Rejected:* Vercel, Cloudflare Pages.
- **D34 — Hash routing with a small in-house router** (OQ5): `#/`, `#/car`, `#/checklist`, `#/summary`, `#/archive`, `#/archive/<id>`, `#/shared/<data>`. Parsing lives in `src/domain/routes.ts`; unknown hashes render Home. No dependency and no host rewrite rule; the shared payload stays in the fragment. *Rejected:* path routing with React Router.

## 2026-10-29 — Session 3

- **D35 — iOS Safari's ~7-day storage eviction is accepted for the MVP** (OQ2). Home gets a short note, `navigator.storage.persist()` is requested best effort (both in a UI session), and data backup is the first post-MVP item.
- **D36 — Session 0 clarifications D22 and D23 are confirmed, and the general notes limit is 1,000 characters** (OQ7).
- **D37 — Storage error behavior** (OQ9, AC-2.2). Corrupt data or unknown version: blocking Hebrew error with "Delete data and start over" behind a confirmation; the raw data stays untouched until then. Storage unavailable: blocking message on app screens; shared links still work. Storage full on write: non-blocking error; the change stays on screen but is marked unsaved.
- **D38 — Data model and storage API (schema version 1).** `localStorage` key `carcheck:data` holds `{ version, activeCar, archivedCars }`. Answers are keyed by item ID (built-in or custom) and a missing key means *Not answered*. Dates are ISO strings. The storage module takes an injectable `StorageLike` (or `null`) and returns results instead of throwing: `loadData` gives `ok` (empty storage yields empty data and writes nothing), `corrupt`, `unknownVersion`, or `unavailable`; `saveData` gives `ok`, `full`, or `unavailable`; `clearStoredData` backs "Delete data and start over". Loading never writes. Validation returns error codes (`required`, `tooLong`, `invalid`, `outOfRange`); the UI maps them to Hebrew text. Numbers beyond the safe-integer range are `invalid`. *Rejected:* throwing from storage functions.
## 2026-10-29 — Session 4

- **D39 — Built-in checklist content approved** (OQ1). 30 items, 5 in each of the six categories, in `src/data/checklist.ts` with category titles in `CATEGORIES`. Tone: friendly, plain, gender-neutral Hebrew with no direct-address imperatives, and deliberately probing questions that can surface flaws; hints explain why a question matters and never diagnose, score, or recommend (product rule 1). IDs are permanent and use the form `<prefix>-NN` (prefixes `history`, `paperwork`, `maintenance`, `condition`, `drive`, `inspection`; the test-drive category ID stays `testDrive`). *Rejected:* descriptive-slug IDs; sequential-number IDs.
