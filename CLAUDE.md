# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

This repository currently contains **only planning documents** (`00_PRD.md` through `11_DECISION_LOG.md`) — no code has been written yet. The monorepo structure (`apps/web`, `apps/api`, `packages/shared`) described below does not exist on disk; it must be created following 06_TASK.md Fase 0 before any other work.

**Product:** Dashboard Observasi Istirahat Karyawan (`observasi-istirahat`) — a mobile-first, offline-capable PWA for recording employee rest observations, replacing a paper/Excel process. Three roles: **Paramedis** (fills observation forms in the field, own-data scope only), **Dokter** (approves/rejects findings with medical notes), **Superadmin** (manages users, master data, schedules).

## Mandatory workflow

Development must follow this exact sequence — do not skip phases (06_TASK.md):

```
1. Requirement   → 00_PRD, 10_BUSINESS_RULE
2. Wireframe     → 08_UI_GUIDE, 01_USER_FLOW
3. Frontend + Mock Data → 09_COMPONENT, MSW-backed pages (no backend yet)
4. API Contract  → 04_API_CONTRACT (locked only after FE mock works)
5. Backend       → 02_ERD, 03_DATABASE_SPEC, NestJS modules
6. Integration   → replace mocks with real API, offline sync
7. Testing       → unit, integration, E2E, real-device offline test
8. Review        → code review, UAT
9. Release       → deploy via Dokploy, update 07_CHANGELOG.md
```

Frontend is built before the API contract is locked deliberately — the real shape of needed data only becomes clear once the UI exists. Do not write backend code ahead of its corresponding frontend phase.

Task tracking rules (06_TASK.md):
- Work task IDs (`T-xxx`) in order; each task references the doc section that governs it (**Acuan** column) — read that section before starting.
- One task = one commit (or one PR for large tasks). Mark `[x]` only when the task's phase DoD is met, then log it in `07_CHANGELOG.md`.
- If a requirement isn't covered by the docs, **stop and ask** — do not improvise business rules.
- If code and docs conflict, the docs win — fix the code, or change the docs via a new entry in `11_DECISION_LOG.md` (ADR format: Konteks/Keputusan/Alternatif/Konsekuensi/Kapan ditinjau).

## Architecture (once code exists)

pnpm monorepo:
```
apps/web/          React 19 + Vite 6 + TypeScript strict + Tailwind v4 + shadcn/ui
apps/api/           NestJS 11 + Prisma 6 + PostgreSQL 16+
packages/shared/     Zod schemas, enums, constants — the ONLY place these are defined
```
Frontend and backend both import validation schemas/enums from `packages/shared`; never redeclare an enum in two places. Request/response DTOs derive from the shared Zod schemas (`type X = z.infer<typeof xSchema>`), not hand-written interfaces.

Key architectural decisions (full rationale in `11_DECISION_LOG.md`):
- **ADR-001**: `mess_observations` and `non_mess_observations` are separate tables (not one polymorphic table or EAV) — the two forms share almost no fields. Combined queries (history, KPI, reports) go through the `v_observations_summary` view.
- **ADR-002**: Photos live in a dedicated `observation_photos` table (category, thumbnail, ordering), not URL columns. Upload is two-phase: upload photo → get ID → include `photoIds` in the observation payload.
- **ADR-003**: Offline sync correctness hinges on a client-generated `clientUuid` (UUID v4, created when the form opens, sent with every submit attempt). A repeated `clientUuid` returns `409` with the existing record, and the client must treat `409` as success. This is the load-bearing mechanism preventing duplicate observations from field retries — do not weaken or bypass it.

Data-scoping rule (`BR-PRM-*`): every list/detail query enforces role scope **in the service layer**, never trusted from frontend query params. Out-of-scope records return `404`, not `403` (avoids leaking existence). Paramedis sees only their own data; Dokter/Superadmin see everything but only Dokter can approve/reject.

## Non-negotiable technical rules

- **TypeScript**: `strict: true`, `noUncheckedIndexedAccess: true`. No `any` — use `unknown` and narrow. No type assertions (`as`) without a comment explaining why. Enums are `const object + union type`, never TS `enum`.
- **Naming language split**: identifiers/code in English, user-facing text in Bahasa Indonesia — never mix (`employeeData` ✅, `dataKaryawan` ❌).
- **Frontend data fetching**: TanStack Query only, no manual `useEffect` + `fetch`. Structured array query keys collected per-feature (see 05_CODING_STANDARD.md §4.2). Mutations must invalidate affected keys.
- **Forms**: React Hook Form + `zodResolver`, schema imported from `packages/shared` (same schema backend validates against). No manual form state.
- **Offline writes**: all observation writes go through `features/offline-sync`, never directly through `api-client`. Components must not read `navigator.onLine` directly — use `useOnlineStatus()`.
- **Backend controllers**: thin — parse params, call service, return. Always a `class-validator` DTO, never `@Body() body: any`. Role guards via `@Roles()` decorator.
- **Backend services**: multi-table writes wrapped in `prisma.$transaction`. No raw SQL except joined views/KPI aggregation, and only with `Prisma.sql` parameter binding — never string interpolation.
- **Audit**: actions in the `AuditAction` enum must write their audit log entry in the same transaction as the data change; a failed audit write rolls back the operation.
- **Env vars**: validated at startup with Zod; the app must fail to boot if a required var is missing — no silent fallbacks. No `process.env` access outside `config/`.
- Component files: one exported component per file, split anything over ~150 lines. Touch targets minimum 44×44px (`min-h-11 min-w-11`). No hardcoded hex colors — use tokens from `08_UI_GUIDE.md`.

## Testing expectations

Every rule in `10_BUSINESS_RULE.md` (IDs like `BR-AUTH-03`, `BR-OBS-04`) must have at least one test referencing that ID in a comment. Coverage target 80% on `apps/api/src/modules/**/*.service.ts` and `packages/shared`, but the ID-per-rule requirement matters more than the percentage.

| Layer | Tool |
|---|---|
| Backend unit | Jest |
| Backend integration | Jest + Supertest + PostgreSQL test container |
| Frontend unit | Vitest + Testing Library |
| Component | Vitest + Testing Library |
| E2E | Playwright |
| Offline | Playwright `context.setOffline(true)` |

Query priority in tests: role/label/text first, `data-testid` only as a last resort.

## Git conventions

- Branches: `feat/T-021-form-mess`, `fix/T-045-sync-duplicate`, `chore/upgrade-prisma`.
- Conventional Commits, Bahasa Indonesia subject, lowercase, no trailing period, ≤72 chars, footer `Refs: T-021`.
- PR description must include: task ID, summary, manual test steps, screenshots (mobile + desktop) for UI changes.
- PRs capped at ~400 effective changed lines — split larger work.

## Docs index

| File | Purpose |
|---|---|
| `00_PRD.md` | Product requirements, scope, tech stack, FR-xx/NFR-xx IDs |
| `01_USER_FLOW.md` | Screen-by-screen user flows |
| `02_ERD.md` | Conceptual data model |
| `03_DATABASE_SPEC.md` | Column types, constraints, indexes |
| `04_API_CONTRACT.md` | REST endpoint contracts (`/api/v1`) |
| `05_CODING_STANDARD.md` | Full coding standard (source of the rules above) |
| `06_TASK.md` | Ordered task breakdown, `T-xxx` IDs, phase DoDs |
| `07_CHANGELOG.md` | Release log |
| `08_UI_GUIDE.md` | Design tokens, wireframes, copy rules |
| `09_COMPONENT.md` | Shared component specs |
| `10_BUSINESS_RULE.md` | Testable business rules, `BR-xxx` IDs |
| `11_DECISION_LOG.md` | ADRs — why, and what was rejected |
