# CarCheck — Roadmap

Living document. Update it at the end of every session: session status, session log, and open questions.

**Current status:** Product defined. Session 0 docs created and awaiting review. No application code yet.

## Implementation sessions

Each session ends with something working and committed, and deployed from session 1 onward. Pure logic (storage, summary calculations, share encoding, validation) gets Vitest unit tests; screens are checked manually at 360px and on desktop. Requirement IDs refer to [spec.md](spec.md).

| # | Session | Goal | Done when | Status |
|---|---|---|---|---|
| 0 | Repo docs | Commit the agreed product docs and AI instructions | Docs are in the repo and reviewed | In review |
| 1 | Walking skeleton | Add React, RTL Hebrew base layout, header navigation, placeholder screens, Vitest. Decide routing (OQ5) and host (OQ4), then deploy | The deployed URL shows the RTL shell; `build` and `test` pass | Not started |
| 2 | Data model and persistence | Types, versioned storage module, error handling, unit tests. Decide OQ2 | Tests cover save, load, corrupt data, and unavailable storage (FR-2) | Not started |
| 3 | Checklist content | Draft the Israel-specific checklist data file (IDs, categories, questions, hints); product owner reviews it (OQ1). Can run any time before session 5 | Content approved and committed | Not started |
| 4 | Home and car details | Create/edit form with validation; Home in both states. Confirm OQ7 | UC1 works end to end and survives a reload (FR-3) | Not started |
| 5 | Checklist screen | Accordion, answer UI, progress, general notes | UC2 works on a phone (FR-4) | Not started |
| 6 | Custom questions | Add, edit, delete in "My questions" | UC3 works (FR-5) | Not started |
| 7 | Summary and decision | Summary in active mode, decision editor | UC4 and UC6 work (FR-6, FR-7). **Core product usable** | Not started |
| 8 | Archive | Start-new-car flow, Previous cars, archived mode | UC7 works, including "archive only on save" (FR-8) | Not started |
| 9 | Sharing | OQ3 spike, then encoder/decoder with tests, share flow, shared view | UC5 works across two browsers (FR-9) | Not started |
| 10 | Polish and release | RTL/bidi and 360px QA, empty states, basic accessibility, disclaimer check | All acceptance criteria verified on the live URL | Not started |

Sessions 1–7 deliver a product usable on a real car. Sessions 8–9 add archive and sharing and can be paused or re-prioritized without leaving anything half-built.

## Open questions

| ID | Question | Recommendation | Owner | Decide by |
|---|---|---|---|---|
| OQ1 | Final checklist items, categories, hint wording, and tone | AI drafts, product owner reviews | Both | Session 3 |
| OQ2 | Is iOS Safari's ~7-day storage eviction acceptable for the MVP? | Accept it, add a short note on Home, and make JSON backup (or "share link as backup") the first post-MVP item | Product owner | Before session 2 |
| OQ3 | Compression library and link-length warning threshold | Short spike measuring real link lengths with maximum-length notes | AI + product owner | Start of session 9 |
| OQ4 | Netlify vs Vercel vs Cloudflare Pages | Any of them; they are equivalent for a static SPA | Product owner | Session 1 |
| OQ5 | Routing: path routing with SPA rewrite and `/shared#data`, or hash routing | Decide with the host choice | AI + product owner | Session 1 |
| OQ6 | Should marking an item *Unknown* suggest turning on the follow-up flag? | Keep them independent for now | Product owner | After real use |
| OQ7 | Confirm session 0 clarifications: general notes limit of 1,000 characters, "All answers by category" in the summary (D22), explicit Save on the car details form (D23) | Accept all three | Product owner | Session 4 |

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
