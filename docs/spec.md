# CarCheck — Product Spec (MVP)

> Source of truth for product behavior. Rationale for decisions lives in [decisions.md](decisions.md); progress, open questions, and the post-MVP backlog live in [roadmap.md](roadmap.md).
>
> Last updated: 2026-10-29 (session 3).

## 1. Problem

Non-expert private buyers in Israel gather information about a used car from many sources: the listing, a call with the seller, government records, the viewing, the test drive, and a professional inspection. That information ends up scattered across memory, WhatsApp, and paper. Buyers don't know what to ask, forget important questions, lose track of what is still unknown, and struggle to see the whole picture or get advice from someone knowledgeable.

CarCheck gives them a guided, Israel-specific checklist and one place to record answers, unknowns, and follow-ups, then turns that into a clear summary they can review and share.

### Product boundary

CarCheck **organizes information**. It never diagnoses mechanical problems, scores the car, evaluates the price, or recommends whether to buy. The only decision in the app is the one the user records manually. The app shows a disclaimer that it is not a professional inspection and recommends a professional inspection (בדיקה במכון).

## 2. Users and context

- **Primary user:** a Hebrew-speaking, non-expert private buyer in Israel, using a phone and/or desktop. Needs guidance on *what* to ask and *why* it matters.
- **Secondary user:** a knowledgeable friend or mechanic who receives a shared summary link. Read-only, no setup.
- **Usage context:** mostly before the viewing (calls with the seller, research) and at home afterward (review). Use during the on-site inspection is supported but secondary: the UI must work well on a phone and support longer notes, but it is not optimized for quick tap-only input.

## 3. User journey

1. **Start a car, before contacting the seller:** enter whatever the listing shows. Only make and model are required.
2. **Call the seller and research:** answer history and paperwork items, complete missing car details, mark unknowns and follow-ups.
3. **Viewing / test drive (optional):** update condition items.
4. **Review at home:** the summary shows concerns, unknowns, follow-ups, and how much is still unanswered.
5. **Get advice:** share a snapshot link with a friend or mechanic.
6. **Decide:** record your own decision and an optional reason.
7. **Next car:** start a new car; the current car is archived and stays viewable.

## 4. Use cases

| ID | Use case |
|---|---|
| UC1 | Create a car evaluation with basic details |
| UC2 | Answer checklist items (status, note, follow-up) across multiple sessions |
| UC3 | Add, edit, and delete custom questions for the current car |
| UC4 | Review the summary |
| UC5 | Share the summary as a link; the recipient views it read-only |
| UC6 | Record your own decision and reason |
| UC7 | Start a new car (the current one is archived); browse, view, share, and delete archived cars |

## 5. MVP scope

### In scope

- Hebrew-only, RTL, responsive (phone and desktop) web app. React + TypeScript + Tailwind, deployed as a static site.
- Data stored in the browser (`localStorage`). No backend, no accounts.
- **One active car** with car details and general notes.
- **Built-in, Israel-specific checklist**, grouped into categories; each item has a question and a short "why this matters" hint.
- **Uniform answer model** for every item: status, optional note, follow-up flag.
- **Custom questions** for the active car, in a "My questions" category.
- **Progress** per category and overall.
- **Summary** with counts, concerns, unknowns, follow-ups, all answers, and general notes.
- **User-recorded decision** with an optional reason.
- **Archive:** starting a new car archives the current one; archived cars can be viewed, shared, and deleted.
- **Shareable snapshot link** (no backend) with a read-only shared view.
- **Disclaimer** that CarCheck is not a professional inspection.

### Out of scope (MVP)

Anything below requires explicit approval before implementation. Likely next features are tracked in the [roadmap backlog](roadmap.md#post-mvp-backlog).

- Backend, accounts, cloud sync, sync across devices or tabs.
- More than one active car; side-by-side comparison.
- Reactivating or editing archived cars.
- Editing, removing, or reordering built-in items; custom categories.
- Any scoring, verdict, price evaluation, or diagnosis.
- Government data lookup by license plate.
- Photos and attachments; PDF/print export; JSON backup and import.
- Importing a shared car into the recipient's own CarCheck.
- Languages other than Hebrew; dark mode; PWA/offline install; reminders; analytics.

## 6. Domain concepts and UI labels

Hebrew labels marked *proposed* are finalized during the UI sessions.

| Concept | Meaning | Hebrew UI label |
|---|---|---|
| Active car | The single car currently being evaluated; fully editable | — |
| Archived car | A previous car; read-only | — |
| Built-in item | A checklist question that ships with the app; has a stable ID | — |
| Custom question | A user-added question that belongs to the active car only | category: השאלות שלי *(proposed)* |
| Status: Not answered | Default status of every item | לא נענה *(proposed)* |
| Status: OK | | תקין *(proposed)* |
| Status: Concern | | חשש *(proposed)* |
| Status: Unknown | | לא ידוע *(proposed)* |
| Follow-up flag | Independent of status; marks an item that needs more checking | דורש בירור *(proposed)* |
| Answered item | An item whose status is not *Not answered* | — |
| Decision: Still evaluating | Default decision | עדיין בבדיקה *(proposed)* |
| Decision: Moving forward | | מתקדמים לקנייה *(proposed)* |
| Decision: Not buying | | לא קונים *(proposed)* |
| Snapshot link | A share link containing a frozen copy of a car's summary | קישור לשיתוף *(proposed)* |

### Built-in checklist structure

Content is drafted in session 4 and reviewed by the product owner; it lives in a static data file, not in this document.

- Categories, in order (final, D39): history and ownership, paperwork and legal, maintenance, visible condition, test drive, professional inspection. "My questions" is always last.
- Size: 30 built-in items, 5 per category.
- Israel-specific topics include: test (טסט), number of previous owners (יד), original ownership (מקוריות), ex-leasing or rental use, liens (שעבוד), and professional inspection at a מכון.
- Each item has: a stable ID, a category, a question, and a "why this matters" hint written for non-experts in plain Hebrew.

## 7. Screens

The Summary, Archived summary, and Shared view are **one summary view in three modes**.

| # | Screen | Responsibility |
|---|---|---|
| 1 | **Home** (בית) | **No active car:** what CarCheck does, the disclaimer, a "Start evaluating a car" button, a link to previous cars. **Active car:** card with make, model, year, overall progress, and decision badge; actions: continue checklist, summary, edit details, start new car. |
| 2 | **Car details** (פרטי הרכב) | Create and edit form with validation. Used both to start a car and to complete details later. |
| 3 | **Checklist** (צ'קליסט) | Collapsible categories (accordion), each with its progress. Each item shows the question, an expandable "why this matters" hint, a 4-option status selector, a note, and a follow-up toggle. "My questions" is the last category, with add, edit, and delete. General notes for the car are at the bottom. |
| 4 | **Summary** (סיכום), active mode | Car details, decision editor, status counts, concerns, unknowns, follow-ups, unanswered count with a link back to the checklist, all answers by category, general notes, disclaimer. Actions: Share, Start new car. |
| 5 | **Previous cars** (רכבים קודמים) | List of archived cars (make, model, year, decision, archive date), newest first, with an empty state. Opening one shows the **summary in archived mode**: read-only, with Share and Delete. |
| 6 | **Shared view** (סיכום משותף) | Opened from a link. **Summary in shared mode:** read-only, a "Shared snapshot from [date]" banner, the disclaimer, and a link to open CarCheck. Never reads or writes the recipient's local data. Broken or invalid links show an error state. |

**Dialogs:** confirm start new car, privacy warning before sharing, confirm delete (custom questions and archived cars).

**Navigation:** a simple header with the app name and "Current car" (both open Home) and "Previous cars" (D26).

**Summary modes:**

| Element | Active | Archived | Shared |
|---|---|---|---|
| Car details, status counts, Concerns, Unknowns, Follow-ups, All answers by category, general notes, disclaimer | Shown | Shown | Shown |
| Decision and reason | Editable | Read-only | Read-only |
| Unanswered count | With a link to the checklist | Count only | Count only |
| "Shared snapshot from [date]" banner and a link to open CarCheck | — | — | Shown |
| Actions | Share, Start new car | Share, Delete | — |

## 8. Functional requirements and acceptance criteria

### FR-1 Platform and language

- FR-1.1 All UI text is Hebrew. The document root uses `lang="he"` and `dir="rtl"`.
- FR-1.2 The layout is usable from 360px wide up to desktop.
- FR-1.3 Numbers and dates use `Intl` formatting with the `he-IL` locale, e.g. `120,000 ק"מ`, `45,000 ₪`, and `28.10.2026` (D24).
- FR-1.4 User-entered text is rendered with `dir="auto"` so mixed Hebrew/English/numbers display correctly.
- FR-1.5 The disclaimer is shown on Home when there is no active car, and in every summary mode.

Acceptance criteria:

- AC-1.1 No screen scrolls horizontally at 360px.
- AC-1.2 Every UI string is Hebrew, except the app name "CarCheck" (D26).
- AC-1.3 The disclaimer is visible on Home (no active car) and in active, archived, and shared summary modes.

### FR-2 Persistence

- FR-2.1 The active car and archived cars are stored in `localStorage` under a versioned schema.
- FR-2.2 Checklist answers, custom questions, general notes, and the decision autosave on every change; there is no save button for them.
- FR-2.3 The car details form uses an explicit Save button, because it validates required fields.

Acceptance criteria:

- AC-2.1 After answering items, adding custom questions, and editing details, a page reload restores exactly the same state.
- AC-2.2 If storage is unavailable or its data is corrupt, a Hebrew error message is shown, the app does not crash, and corrupt data is never silently overwritten. The exact behavior per case is in D37.

### FR-3 Car details

| Field | Hebrew label | Required | Validation |
|---|---|---|---|
| Make | יצרן | Yes | Non-empty after trimming; up to 50 characters |
| Model | דגם | Yes | Non-empty after trimming; up to 50 characters |
| Year | שנת ייצור | No | Integer from 1950 to next calendar year |
| Mileage (km) | קילומטראז' | No | Non-negative integer |
| Asking price (₪) | מחיר מבוקש | No | Non-negative integer |
| License plate | מספר רישוי | No | Free text, up to 20 characters |

Number fields drop commas, spaces, and `₪`; if anything other than digits remains, the field shows an inline Hebrew error (D25).

Seller name and phone are not separate fields; users may write them in notes.

Acceptance criteria:

- AC-3.1 Saving without make or model shows an inline Hebrew error and saves nothing.
- AC-3.2 Number fields accept input typed with commas or `₪` and normalize it to digits.
- AC-3.3 Editing details never changes checklist answers.

### FR-4 Checklist

- FR-4.1 Built-in items come from a static data file with stable IDs and a fixed category order.
- FR-4.2 Every item starts as *Not answered*. Any status can be changed at any time, including back to *Not answered*.
- FR-4.3 Status, note, and follow-up flag are independent of each other.
- FR-4.4 Progress counts an item as answered only when its status is not *Not answered*. Progress is shown per category and overall.
- FR-4.5 The checklist screen includes the car's general notes.

Acceptance criteria:

- AC-4.1 Setting an item to *Concern* immediately updates category and overall progress, and the item appears in the summary's Concerns list.
- AC-4.2 Adding a note or follow-up flag alone does not change progress.

### FR-5 Custom questions

- FR-5.1 Custom questions are added, edited, and deleted in "My questions", the last category. They belong to the active car only.
- FR-5.2 Question text must be non-empty after trimming.
- FR-5.3 Deleting a custom question requires confirmation and removes its answer.

Acceptance criteria:

- AC-5.1 A custom question behaves exactly like a built-in item in progress, summary, and sharing.
- AC-5.2 After deleting a custom question, progress and summary no longer include it.

### FR-6 Summary

- FR-6.1 Shows car details, the decision, counts per status (including *Not answered*), and the unanswered count with a link to the checklist.
- FR-6.2 Lists **Concerns**, **Unknowns**, and **Follow-ups** (any item with the flag, regardless of status). Entries are sorted by category order, then item order, and show category, question, and note. An item may appear in more than one list.
- FR-6.3 Includes a collapsible **All answers by category** section listing every answered item with its status, note, and flag. This is where facts recorded in notes of *OK* items (e.g. number of previous owners) are visible.
- FR-6.4 Shows general notes and the disclaimer.
- FR-6.5 Empty lists show an explicit empty state.

Acceptance criteria:

- AC-6.1 Status counts always add up to the number of items in that car's checklist (built-in plus custom).
- AC-6.2 An item with status *OK* and the follow-up flag appears in Follow-ups and in All answers, but not in Concerns or Unknowns.
- AC-6.3 A car with zero answers shows empty states for every list and the full unanswered count.

### FR-7 Decision

- FR-7.1 Values: *Still evaluating* (default), *Moving forward*, *Not buying*, plus an optional reason.
- FR-7.2 The decision is chosen only by the user and is editable only for the active car.

Acceptance criteria:

- AC-7.1 The decision and reason appear in the summary, the previous cars list (decision only), and the shared view.

### FR-8 Start new car, archive, and previous cars

- FR-8.1 "Start new car" is available from Home and Summary. With no active car, it opens the car details form directly.
- FR-8.2 With an active car, a confirmation dialog explains that the current car will be archived once the new car is saved. After confirmation, the car details form opens for the new car.
- FR-8.3 The current car is archived **only when the new car is saved**, with an archive date.
- FR-8.4 Previous cars lists archived cars newest first. Opening one shows the summary in archived mode, with Share and Delete.
- FR-8.5 Deleting an archived car requires confirmation and is permanent.

Acceptance criteria:

- AC-8.1 Cancelling the dialog or the new car form leaves the current car active and unchanged.
- AC-8.2 After saving the new car, the old car is at the top of Previous cars with its archive date, and the new car is active with every item *Not answered*.
- AC-8.3 The archived summary has no editable inputs.

### FR-9 Sharing

- FR-9.1 Share is available for the active car and for archived cars.
- FR-9.2 Before sharing, a privacy warning explains that the link contains all car details and notes, anyone with the link can read it, and it is a snapshot that won't update.
- FR-9.3 The link carries a versioned, compressed snapshot in the URL **fragment**, so the hosting server never receives the data. The exact route depends on the routing decision (OQ5 in the roadmap).
- FR-9.4 The snapshot contains: snapshot date, car details, decision and reason, general notes, every answered item (status, note, flag), and the number of unanswered items. Status counts are derived from these, not stored (D27). Built-in items are referenced by ID; custom questions include their text.
- FR-9.5 Sharing uses `navigator.share` when available; otherwise it copies the link and shows "הקישור הועתק"; if copying fails, the link is shown in a selectable field.
- FR-9.6 Above a length threshold (OQ3 in the roadmap), the user is warned that some apps may truncate the link, but can still share.
- FR-9.7 The shared view never reads or writes `localStorage`.

Acceptance criteria:

- AC-9.1 Opened in a different browser with no local data, the link shows the same car details, decision, counts, and answered items as the sender's summary at the moment of sharing.
- AC-9.2 Editing the car after sharing does not change what an already-shared link shows.
- AC-9.3 Cancelling the privacy warning generates and shares nothing.
- AC-9.4 A broken, tampered, or unknown-version link shows an error state with a link to Home.
- AC-9.5 Opening a shared link leaves the opener's own CarCheck data untouched.

## 9. Limits

Limits keep share links at a reasonable length.

| Field | Max characters | Status |
|---|---|---|
| Item note | 500 | Confirmed |
| Custom question text | 200 | Confirmed |
| Decision reason | 300 | Confirmed |
| Make, model | 50 each | Added in session 0 review (D25) |
| License plate | 20 | Added in session 0 review (D25) |
| General notes | 1,000 | Confirmed (D36) |

## 10. Edge cases

| Area | Case | Expected handling |
|---|---|---|
| Storage | `localStorage` unavailable (some private modes), full, or corrupt | Hebrew error message, no crash, corrupt data never silently overwritten; details per case in D37 |
| Storage | App open in two tabs | Last write wins. Documented limitation, no sync logic |
| Storage | iOS Safari deletes site storage after about 7 days without a visit | Known MVP risk, accepted (D35) |
| Content | Built-in items change in a later version | Item IDs are never reused or deleted. Removed items are marked *retired*: hidden for new answers, still displayed wherever an answer or shared link already references them. New items appear as *Not answered*. Built when the first item is retired; v1 ships with none (D28) |
| Sharing | Web Share not supported (e.g. desktop Firefox) | Fall back to clipboard, then to a selectable link field |
| Sharing | Very long link (many long notes) | Warn above the threshold, still allow sharing |
| Sharing | Sender opens their own shared link | Read-only view with banner; local data untouched |
| Sharing | Link truncated, tampered with, or unknown version | Error state with a link to Home |
| Text | Mixed Hebrew and English or numbers (e.g. "Toyota Corolla", plate numbers, URLs in notes) | `dir="auto"` on user-entered text |
| Input | Commas or `₪` typed into number fields; long unbroken strings | Numeric input mode with digit normalization; long words wrap |
| Flow | Starting a new car when the current one has no answers | Same rule: archived when the new car is saved; user can delete it later |
| States | No active car, no archived cars, zero answers, empty "My questions" | Each has an explicit Hebrew empty state |

## 11. Open questions

Tracked with owner and timing in [roadmap.md](roadmap.md#open-questions).
