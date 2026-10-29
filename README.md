# CarCheck

CarCheck is a small Hebrew (RTL), responsive web app that helps non-expert buyers in Israel organize what they learn while evaluating a used car: basic vehicle details, a guided checklist (history, paperwork, maintenance, condition), answers, notes, unknowns, and follow-ups. It ends in a clear summary the buyer can review and share with someone knowledgeable.

CarCheck organizes information. It does **not** diagnose mechanical problems or decide whether a car is worth buying.

**Status:** product defined and docs reviewed; implementation starts with session 1 (toolchain). See [docs/roadmap.md](docs/roadmap.md).

**Live app:** not deployed yet (planned for session 2).

## Tech

- Vite, TypeScript, Tailwind CSS (starter template); React and Vitest are added in session 1.
- Data is stored in the browser (`localStorage`). No backend, no accounts.

## Development

```bash
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # type-check and production build
npm run preview  # preview the production build
```

`test`, `lint`, and `check` scripts are added in session 1; `npm run check` is the gate before every commit (see the Definition of done in [docs/roadmap.md](docs/roadmap.md)).

## Docs

| Doc | Purpose |
|---|---|
| [docs/spec.md](docs/spec.md) | Product spec: problem, users, scope, screens, requirements, edge cases |
| [docs/decisions.md](docs/decisions.md) | Settled decisions, their rationale, and rejected alternatives |
| [docs/roadmap.md](docs/roadmap.md) | Implementation sessions (scope, non-goals, done-when, verification), Definition of done, open questions, post-MVP backlog, session log |
| [.github/copilot-instructions.md](.github/copilot-instructions.md) | Working agreement for AI coding sessions |
