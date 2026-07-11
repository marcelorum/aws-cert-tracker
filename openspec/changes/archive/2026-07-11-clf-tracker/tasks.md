# Tasks: AWS CLF-C02 Certification Tracker

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1,500 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Delivery strategy | exception-ok |
| Suggested split | Single PR (~1,500 lines, within 2,000-line review budget) |

Decision needed before apply: Resolved — exception-ok (single PR)
Chained PRs recommended: Yes (overridden by user consent)
Chain strategy: exception-ok
400-line budget risk: High (accepted by user)

### Suggested Work Units

| Unit | Goal | Likely PR | Base |
|------|------|-----------|------|
| 1 | Project scaffold (8 config files) | PR #1 | main |
| 2 | Data layer + state (types, Dexie, hooks, store) | PR #2 | main |
| 3 | Components, pages, routing (16 files) | PR #3 | main |
| 4 | Test suite (7 files) | PR #4 | main |

## Phase 1: Foundation

- [x] 1.1 Create `package.json` with React 19, Vite 6, Dexie, Zustand, Tailwind v4, Radix UI, Lucide, CVA, vitest, RTL
- [x] 1.2 Create `vite.config.ts` with `@vitejs/plugin-react` + `vite-plugin-pwa`
- [x] 1.3 Create `tsconfig.json` with strict mode, path aliases
- [x] 1.4 Create `tailwind.config.ts` with Vite entry content paths
- [x] 1.5 Create `index.html` SPA entry with PWA meta + viewport
- [x] 1.6 Create `src/index.css` with Tailwind directives + base styles
- [x] 1.7 Create `public/manifest.json` PWA manifest
- [x] 1.8 Create `.gitignore`

## Phase 2: Data Layer & State

- [x] 2.1 Create `src/lib/types.ts` — Exam, Domain, Topic, Resource, TopicStatus, ResourceType
- [x] 2.2 Create `src/lib/utils.ts` — `cn()`, `isValidUrl()`, status label helpers
- [x] 2.3 Create `src/db/schema.ts` — `CLFTrackerDB` Dexie class with 4 stores (v1)
- [x] 2.4 Create `src/db/seed-data.ts` — CLF-C02 4 domains + full topic/sub-topic tree
- [x] 2.5 Create `src/db/hooks.ts` — `useDomains`, `useTopics`, `useResources`, `useProgress` via `liveQuery`
- [x] 2.6 Create `src/stores/ui-store.ts` — Zustand store: sidebar, expanded domains/topics, activeTopicId

## Phase 3: Components, Pages & Routing

- [x] 3.1 Create `src/components/layout/AppLayout.tsx` and `Sidebar.tsx`
- [x] 3.2 Create `src/components/checklist/StatusBadge.tsx` — three-state cycle badge
- [x] 3.3 Create `src/components/checklist/DomainCard.tsx` — collapsible domain with progress bar
- [x] 3.4 Create `src/components/checklist/TopicItem.tsx` — topic row with sub-topic expand
- [x] 3.5 Create `src/components/progress/ProgressRing.tsx` — SVG weighted circular indicator
- [x] 3.6 Create `src/components/progress/ProgressBar.tsx` — horizontal fill bar
- [x] 3.7 Create `src/components/resources/ResourceForm.tsx` — type selector + URL/note validation
- [x] 3.8 Create `src/components/resources/ResourceItem.tsx` — inline edit with blur save / Escape cancel
- [x] 3.9 Create `src/components/resources/ResourceList.tsx` — grouped resource display
- [x] 3.10 Create `src/routes.tsx`, `src/App.tsx`, `src/main.tsx` — router + layout + mount
- [x] 3.11 Create `src/pages/DashboardPage.tsx` — ring + per-domain progress bars
- [x] 3.12 Create `src/pages/ChecklistPage.tsx` — full domain/topic tree
- [x] 3.13 Create `src/pages/TopicDetailPage.tsx` — topic info + resource management

## Phase 4: Testing

- [x] 4.1 `tests/db/schema.test.ts` — verify CLFTrackerDB stores and indexes exist
- [x] 4.2 `tests/db/seed.test.ts` — verify seed record counts (1 exam, 4 domains, full topics)
- [x] 4.3 `tests/components/StatusBadge.test.tsx` — cycle forward, stop at completed
- [x] 4.4 `tests/components/ProgressRing.test.tsx` — weighted percentage calculation
- [x] 4.5 `tests/components/ProgressBar.test.tsx` — domain completion ratio
- [x] 4.6 `tests/components/ResourceForm.test.tsx` — URL validation + type selector
- [x] 4.7 `tests/stores/ui-store.test.ts` — sidebar toggle, expanded set, active topic
