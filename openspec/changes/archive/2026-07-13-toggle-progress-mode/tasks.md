# Tasks: Toggle Progress Mode

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 160–230 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

## Phase 1: Foundation — Store & Pure Function

- [x] 1.1 **ui-store.ts** — Export `ProgressMode = 'flat' | 'weighted'`, add `progressMode: ProgressMode` to state (default `'flat'`), add `setProgressMode(mode: ProgressMode)` action
- [x] 1.2 **ui-store.ts** — Extend `partialize` selector to include `progressMode` alongside `themeMode`
- [x] 1.3 **progress.ts** — Export `calcWeightedOverallProgress(topics, domains[] with weight)` implementing weighted formula from design; return 0 for empty inputs; handle domains with zero topics

## Phase 2: UI Wiring — Dashboard Integration

- [x] 2.1 **DashboardPage.tsx** — Import `useUIStore` for `progressMode` + `setProgressMode`; add native `<button>` segmented control beside ProgressRing (Flat | Weighted) with active state styling using Tailwind
- [x] 2.2 **DashboardPage.tsx** — Switch `useMemo` to compute `overallProgress` via ternary: `flat` → existing `calcOverallProgress(allTopics)`, `weighted` → new `calcWeightedOverallProgress(allTopics, domains)`
- [x] 2.3 **DashboardPage.tsx** — Update the label below ProgressRing to show current mode: "Overall Progress (Flat)" or "Overall Progress (Weighted)"

## Phase 3: Testing — Coverage

- [x] 3.1 **tests/lib/progress.test.ts** — Add `describe('calcWeightedOverallProgress')` with: empty topics → 0, no completions → 0, all complete → 100, partial across two weighted domains matching spec scenario (30% result), zero-topic domain excluded, modes diverge with asymmetric topic distribution
- [x] 3.2 **tests/lib/progress.test.ts** — Verify existing `calcOverallProgress` tests still pass unchanged (regression guard)

## Phase 4: Verification

- [x] 4.1 Run `pnpm test:run` — all tests green
- [x] 4.2 Run `pnpm build` — clean type-check and build

## Implementation Order

Phase 1 first (shared dependencies), then Phase 2 (consumer wiring), then Phase 3 (tests), then Phase 4 (verification). No ordering constraints within phases 3/4.
