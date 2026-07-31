# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

**Current phase:** Fase 3 (Frontend + Mock Data) — Fase 0 is complete, Fase 1 partially complete (T-011, T-012 done). The frontend runs with MSW (Mock Service Worker) providing fake API responses; no real backend is connected yet. See `06_TASK.md` for task-by-task status.

**Completed:** Monorepo scaffolding, NestJS skeleton, shared enums/labels/schemas, auth context, login/logout flow, AppShell layout (header + role-aware bottom nav), lazy-loaded routes with role guards, Mess observation form (conditional finding fields), observation history, approval queue page, user list page, profile page, empty/error states.

**Not yet built:** Non-Mess form, photo upload, offline sync (Dexie), TanStack Query mutations with cache invalidation on all features, backend modules beyond the NestJS scaffold (no Prisma schema yet).

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

## Commands

All commands run from the monorepo root. Use `pnpm --filter` to target a workspace.

```bash
# Development (run both together during Fase 3)
pnpm --filter web dev          # Vite dev server on :5173
pnpm --filter api dev          # NestJS dev server on :3000 (no DB yet)

# Type checking & linting
pnpm --filter web typecheck    # tsc -b --noEmit
pnpm --filter api typecheck    # tsc --noEmit
pnpm --filter web lint         # ESLint 9 flat config
pnpm --filter api lint

# Testing (no tests written yet — commands exist in package.json)
pnpm --filter web test         # vitest run
pnpm --filter api test         # jest
pnpm --filter shared test      # vitest run

# Build (for verifying producibility)
pnpm --filter web build        # tsc -b && vite build
pnpm --filter api build        # nest build

# Install dependencies
pnpm install                   # Install all workspaces

# Generate MSW service worker (re-run if handlers.ts changes location)
pnpm --filter web exec msw init public/ --save
```

## Architecture

```
observasi/
  apps/web/           React 19 + Vite 6 + TypeScript strict + Tailwind v4
  apps/api/           NestJS 11 scaffold (no Prisma schema, no modules yet)
  packages/shared/    Zod schemas, const-object enums, Indonesian labels
```

### How data flows (current Fase 3 state)

```
Browser → React components → TanStack Query hooks → api-client.ts (fetch wrapper)
                                                         ↓
                                              MSW service worker intercepts
                                              /api/v1/* requests in dev mode
                                                         ↓
                                              Returns mock data from fixtures.ts
```

- `api-client.ts` is a thin typed `fetch` wrapper. It reads `accessToken` from `localStorage`, attaches `Authorization: Bearer`, parses `{ data, meta }` envelope responses, and throws `ApiError` on non-2xx.
- MSW auto-starts in dev mode via `main.tsx` dynamic import; it's tree-shaken from production builds.
- When Fase 6 begins, `api-client.ts` gets a token-refresh interceptor (T-140) and MSW is replaced with real HTTP calls to the NestJS backend.

### Frontend structure

```
apps/web/src/
  main.tsx              Entry: starts MSW in dev, then renders <App>
  App.tsx               Providers: QueryClient → AuthProvider → BrowserRouter → AppRoutes
  index.css             Tailwind v4 @theme block — ALL design tokens live here
  routes/
    index.tsx           Lazy-loaded route tree with role guards
    protected-route.tsx  Reads useAuth(), redirects /login /ganti-password /403
  lib/
    api-client.ts       Typed fetch wrapper (currently hits MSW at /api/v1)
    query-client.ts     TanStack QueryClient with staleTime: 30s, retry: 1
    format.ts           Date/time formatting in WITA timezone, file size formatting
    utils.ts            cn() = clsx + tailwind-merge
  features/
    auth/               AuthContext + useLogin mutation
    observations/       Query keys, types, useMessObservations hooks
    master-data/        useMessComplexes hook
    users/              useUsers hook
  components/
    ui/                 shadcn-style primitives (button, input, label, card)
    layout/             AppShell, Header (sticky, back button, sync badge), BottomNav (role-aware)
    common/             EmptyState, ObservationCard
  pages/                One directory per screen, default-exported for lazy(), e.g.:
    login/              LoginPage — RHF + zodResolver(loginSchema)
    observasi-mess/     MessObservationFormPage — conditional fields via watch("hasFinding")
    home/               HomePage — role-branched UI (paramedic vs doctor/superadmin)
    approval-queue/     ApprovalQueuePage — approve/reject with inline actions
    users/              UserListPage
  mocks/
    handlers.ts         MSW request handlers for all /api/v1 endpoints
    fixtures.ts         Mock data: 4 users, 3 mess observations, 5 mess complexes, KPI summary
```

Key patterns:

- **Path alias**: `@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`).
- **Lazy routes**: every page is `React.lazy(() => import(...))` wrapped in a single top-level `<Suspense>`.
- **Auth**: token stored in `localStorage("accessToken")`, user state in React Context (`AuthProvider`). The mock login handler accepts any email + `"Password123"`.
- **Forms**: React Hook Form + `zodResolver` with schemas imported from `@observasi/shared`. Conditional validation uses `.superRefine()` (e.g., `messObservationSchema` requires employee fields only when `hasFinding` is true).
- **CSS**: Tailwind v4 with CSS-first config (no `tailwind.config.js`). Design tokens are CSS custom properties in the `@theme` block inside `index.css`. The visual style is neo-brutalist: `border-[3px] border-ink-900`, `shadow-sm`/`shadow-card`/`shadow-raised` tokens with solid offsets. Fonts: IBM Plex Sans Condensed (display), IBM Plex Sans (body), IBM Plex Mono (mono). Dark mode uses `:root.dark` class.

### API structure (minimal — scaffold only)

```
apps/api/src/
  main.ts              Bootstrap: NestFactory, global prefix /api/v1, ValidationPipe
  app.module.ts         Only imports ConfigModule with Zod env validation
  config/
    env.schema.ts      Zod schema for DATABASE_URL, JWT secrets, UPLOAD_DIR, PORT, etc.
```

No Prisma schema, no modules, no guards exist yet. All of that is Fase 5 work.

### packages/shared (source of truth for both apps)

```
packages/shared/src/
  index.ts             Re-exports everything
  constants.ts         All enums as const objects (ROLE, USER_STATUS, OBSERVATION_STATUS, etc.)
  labels.ts            Indonesian labels for every enum value (ROLE_LABEL, COMPANY_LABEL, etc.)
  schemas/
    auth.schema.ts     loginSchema, passwordSchema, changePasswordSchema
    mess-observation.schema.ts  messObservationSchema with conditional .superRefine()
```

Both `apps/web` and `apps/api` import from `@observasi/shared` (declared as `workspace:*` in their `package.json`). Enums follow the pattern `const object + derived union type` — never TypeScript `enum`.

### Key architectural decisions (full rationale in `11_DECISION_LOG.md`)

- **ADR-001**: `mess_observations` and `non_mess_observations` are separate tables (not one polymorphic table or EAV) — the two forms share almost no fields. Combined queries go through `v_observations_summary`.
- **ADR-002**: Photos live in a dedicated `observation_photos` table (category, thumbnail, ordering), not URL columns. Upload is two-phase: upload photo → get ID → include `photoIds` in the observation payload.
- **ADR-003**: Offline sync correctness hinges on a client-generated `clientUuid` (UUID v4 via `crypto.randomUUID()`, created when the form opens, sent with every submit attempt). A repeated `clientUuid` returns `409` with the existing record, and the client must treat `409` as success. This is the load-bearing mechanism preventing duplicate observations from field retries — do not weaken or bypass it.

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

| Layer               | Tool                                         |
| ------------------- | -------------------------------------------- |
| Backend unit        | Jest                                         |
| Backend integration | Jest + Supertest + PostgreSQL test container |
| Frontend unit       | Vitest + Testing Library                     |
| Component           | Vitest + Testing Library                     |
| E2E                 | Playwright                                   |
| Offline             | Playwright `context.setOffline(true)`        |

Query priority in tests: role/label/text first, `data-testid` only as a last resort.

## Git conventions

- Branches: `feat/T-021-form-mess`, `fix/T-045-sync-duplicate`, `chore/upgrade-prisma`.
- Conventional Commits, Bahasa Indonesia subject, lowercase, no trailing period, ≤72 chars, footer `Refs: T-021`.
- PR description must include: task ID, summary, manual test steps, screenshots (mobile + desktop) for UI changes.
- PRs capped at ~400 effective changed lines — split larger work.

## Docs index

| File                    | Purpose                                                   |
| ----------------------- | --------------------------------------------------------- |
| `00_PRD.md`             | Product requirements, scope, tech stack, FR-xx/NFR-xx IDs |
| `01_USER_FLOW.md`       | Screen-by-screen user flows                               |
| `02_ERD.md`             | Conceptual data model                                     |
| `03_DATABASE_SPEC.md`   | Column types, constraints, indexes                        |
| `04_API_CONTRACT.md`    | REST endpoint contracts (`/api/v1`)                       |
| `05_CODING_STANDARD.md` | Full coding standard (source of the rules above)          |
| `06_TASK.md`            | Ordered task breakdown, `T-xxx` IDs, phase DoDs           |
| `07_CHANGELOG.md`       | Release log                                               |
| `08_UI_GUIDE.md`        | Design tokens, wireframes, copy rules                     |
| `09_COMPONENT.md`       | Shared component specs                                    |
| `10_BUSINESS_RULE.md`   | Testable business rules, `BR-xxx` IDs                     |
| `11_DECISION_LOG.md`    | ADRs — why, and what was rejected                         |

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
