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
