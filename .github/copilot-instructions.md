# CarCheck — AI Working Agreement

## Context

CarCheck is a Hebrew (RTL), responsive web app that helps non-expert buyers in Israel organize information while evaluating a used car: car details, a built-in Israel-specific checklist plus custom questions, answers (status, note, follow-up flag), a summary, a user-recorded decision, an archive of previous cars, and a read-only shareable snapshot link. One active car at a time. Data lives in the browser; there is no backend.

## Read first

- [docs/spec.md](../docs/spec.md) before changing any behavior. It is the source of truth for scope, screens, requirements (FR/AC IDs), limits, and edge cases.
- [docs/decisions.md](../docs/decisions.md) before proposing an alternative. Don't reopen a recorded decision unless the user asks.
- [docs/roadmap.md](../docs/roadmap.md) to find the current session, its done-when criteria, and open questions.

## Stack

- Vite, React, TypeScript, Tailwind CSS; Vitest for unit tests; oxlint for linting.
- Static hosting on Netlify, Vercel, or Cloudflare Pages.
- Commands: `npm run dev`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run preview`; `npm run check` runs typecheck, lint, test, and build.

## Product rules (must follow)

1. Never diagnose, score, rate, evaluate the price, or recommend buying or not buying. The only decision is the one the user records.
2. All UI text is Hebrew. The root is `lang="he"` and `dir="rtl"`. Render user-entered text with `dir="auto"`. Format numbers with the `he-IL` locale.
3. Persist only to `localStorage`, under a versioned schema. Migrate stored data; never break or silently overwrite it.
4. Built-in checklist item IDs are permanent: never reuse, delete, or repurpose them. Retire items instead.
5. Share payloads are versioned and live in the URL fragment. The shared view never reads or writes `localStorage`.
6. Enforce the length limits in the spec.
7. Anything listed as out of scope in the spec needs the user's explicit approval. No backend, auth, analytics, or third-party data services.

## Engineering conventions

- Keep pure logic (storage, migrations, summary calculations, share encoding/decoding, validation) in framework-free TypeScript modules with Vitest unit tests.
- Keep components and files small and focused. Summary, archived summary, and shared view are one component with three modes.
- Build mobile-first and check layouts at 360px and on desktop.
- Ask before adding any dependency.
- Only comment code that needs clarification.

## Session workflow

1. Work on one roadmap session at a time and say which one.
2. Before coding, restate the session goal and done-when criteria, and ask about anything ambiguous, one question at a time.
3. Before finishing, run `npm run check` and verify the relevant acceptance criteria.
4. At the end, update [docs/roadmap.md](../docs/roadmap.md) (status, session log, open questions), add new decisions to [docs/decisions.md](../docs/decisions.md), and update [docs/spec.md](../docs/spec.md) if behavior changed.
