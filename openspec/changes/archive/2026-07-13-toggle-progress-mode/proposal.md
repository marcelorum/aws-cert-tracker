# Proposal: Toggle Progress Mode

## Intent

The current Overall Progress ring calculates flat `completed / total × 100`, treating every topic equally. CLF-C02 domains have different exam weights (e.g., Security & Compliance = 30%, Billing = 12%), so flat progress misrepresents exam readiness. Users need a toggle between Flat and Weighted modes to see both their topic-level completion and their exam-weighted progress.

## Scope

### In Scope
- Add `progressMode: 'flat' | 'weighted'` to Zustand `ui-store`, persisted via localStorage (same mechanism as `themeMode`)
- Re-implement weighted calculation as a pure function `calcWeightedOverallProgress()` in `src/lib/progress.ts`
- Wire the store mode into `DashboardPage` to switch which calculation feeds the `ProgressRing`
- Add a segmented control toggle (Flat / Weighted) adjacent to the overall progress ring
- Update the existing `progress-tracking` spec for the modified overall progress requirement

### Out of Scope
- Per-domain progress bars — they already show domain-internal ratio and are unaffected
- Any new UI components beyond the toggle control
- Adding/modifying test infrastructure for weighted calculation
- Visual effects or animations on mode switch

## Capabilities

### New Capabilities
None

### Modified Capabilities
- `progress-tracking`: The overall progress indicator requirement SHALL change from always-flat to toggleable between flat mode (`completed / total × 100`) and weighted mode (`Σ(domain_ratio × domain_weight) / Σ(domain_weights) × 100`). The note in the existing spec already anticipates this change.

## Approach

1. **Store**: Add `progressMode` alongside `themeMode` in `ui-store.ts`. Extend `partialize` to include it (currently only persists `themeMode`). No new store file.
2. **Library**: Add `calcWeightedOverallProgress(topics, domains)` to `src/lib/progress.ts`. It groups topics by `domainId`, computes per-domain ratio, then applies the exam weight from the `Domain.weight` field. Pure function, zero side effects.
3. **UI**: In `DashboardPage.tsx`, read `progressMode` from the store. Derive `overallProgress` via `useMemo` with a ternary between `calcOverallProgress` and `calcWeightedOverallProgress`, passing domains as additional dependency. Add a small segmented control using native HTML (no new component) above or beside the ring label.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/stores/ui-store.ts` | Modified | Add `progressMode` state + action, extend `partialize` |
| `src/lib/progress.ts` | Modified | Add `calcWeightedOverallProgress()` pure function |
| `src/pages/DashboardPage.tsx` | Modified | Read mode, pick calc, add toggle control |
| `openspec/specs/progress-tracking/spec.md` | Modified | Update overall progress requirement for mode toggle |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Weighted calc on empty domains (no topics) | Low | `calcWeightedOverallProgress` handles zero-topic domains by returning 0 ratio — denominator skips them |
| Persisted `progressMode` conflicts with stale stored value after code change | Low | Default to `'flat'` if unrecognized — stores upgrade gracefully |
| Zustand persist only saves `themeMode` today; adding `progressMode` changes localStorage shape | Low | Add to `partialize` — old stored data without the key will use the default `'flat'` |

## Rollback Plan

Revert `ui-store.ts` changes (remove `progressMode` state, restore `partialize`), remove `calcWeightedOverallProgress` from `progress.ts`, restore `DashboardPage.tsx` to read `calcOverallProgress` directly. This is a pure additive change with no data migration — rollback is a clean revert of 3 files.

## Dependencies

None. All data (topics, domain weights) is already available in the store via existing hooks.

## Success Criteria

- [ ] Toggle renders next to the progress ring, defaults to "Flat"
- [ ] Flat mode shows identical value to current `calcOverallProgress`
- [ ] Weighted mode produces a different percentage when domains have unequal topic counts
- [ ] Choice persists across page reload (localStorage)
- [ ] Per-domain progress bars unchanged in both modes
