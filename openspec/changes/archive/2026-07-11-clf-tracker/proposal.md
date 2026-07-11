# Proposal: AWS CLF-C02 Certification Tracker

## Intent

Offline-first SPA for AWS Cloud Practitioner (CLF-C02) study tracking. User needs structured checklist with status, progress visualization, and resource management — no backend.

## Scope

### In Scope
- Domain/topic hierarchical checklist with not_started → in_progress → completed status
- Progress bar per domain + overall progress indicator
- Pre-seeded CLF-C02 topic tree (4 domains, topics, sub-topics, services)
- Dexie.js / IndexedDB persistence
- Resource tracking (URLs + notes per topic)
- Tailwind CSS v4 + Radix UI + Lucide icons UI
- PWA manifest + service worker
- Vitest + React Testing Library test suite

### Out of Scope
Quizzes, flashcard, session logging, time-series charts, export/backup, dark mode, AI integration, cloud sync (all Phase 2+).

## Capabilities

### New Capabilities
- `topic-checklist`: Hierarchical tree (domains → topics → sub-topics) with status toggling and seed data loading.
- `progress-tracking`: Weighted per-domain completion bars + overall circular indicator, reactive to status changes.
- `local-persistence`: Dexie schema for Exam, Domain, Topic, Resource tables. CRUD + reactive queries, offline-only.
- `resource-management`: Add/edit/delete URLs and notes linked to topics, inline editing with validation.

### Modified Capabilities
- None (greenfield)

## Approach

React 19 + Vite 6 + TypeScript strict. Dexie.js (data), Zustand (UI state), React Router (nav). Tailwind v4 + Radix UI + CVA. Seed data as JSON into Dexie on first visit. PWA via vite-plugin-pwa.

## Affected Areas

| Area | Impact |
|------|--------|
| Project root (config, package.json) | New |
| `src/components/` | New |
| `src/stores/` | New |
| `src/db/` | New |
| `public/` (PWA assets) | New |
| `tests/` | New |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| IndexedDB quota on large notes | Low | 10 KB note cap |
| PWA stale cache | Low | Versioned cache keys + background revalidation |
| Scope creep | Medium | SDD phase gates, explicit non-goals |

## Rollback Plan

Pre-deploy: `git reset` to last green commit. Post-deploy: revert deploy branch. Data is browser-only IndexedDB — no server state. Dexie `upgrade()` for schema migrations.

## Dependencies

Node.js 20+, npm packages: react, react-dom, dexie, zustand, react-router-dom, tailwindcss, @radix-ui/*, class-variance-authority, lucide-react, vite, vite-plugin-pwa, vitest, @testing-library/react, typescript.

## Success Criteria

- [ ] 4 CLF-C02 domains display with correct topic hierarchy from seed data
- [ ] Toggling topic status updates progress bars in real time
- [ ] Overall progress ring reflects correct percentage
- [ ] Resources persist across reloads (add/edit/delete)
- [ ] App installs as PWA and works fully offline
- [ ] `npm run test -- --run` passes
- [ ] `npm run build` produces deployable `dist/`
