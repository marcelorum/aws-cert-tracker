# Design: Toggle Progress Mode

## Technical Approach

Add a `progressMode` toggle (`'flat' | 'weighted'`) to the existing Zustand ui-store, persisted via localStorage alongside `themeMode`. Add `calcWeightedOverallProgress()` as a pure function in `src/lib/progress.ts`. In `DashboardPage`, read the mode, switch calculation, and render a native-HTML segmented control beside the progress ring. No new components, no new stores, no data migration.

The weighted formula: `Σ(domain_ratio × domain.weight) / Σ(domain.weight) × 100` — each domain contributes proportionally to its CLF-C02 exam weight, so a domain with 34% weight and 50% completion contributes 17 of the 100 points.

## Architecture Decisions

### Decision: Extend existing ui-store vs. create a separate store

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Add `progressMode` to `ui-store.ts` | Single persist config, follows `themeMode` pattern, reuses `'theme-storage'` key | **Chosen** — minimal diff, zero new imports |
| Create `progress-store.ts` | Cleaner separation, but adds file, persist config, and import overhead | Rejected — over-engineering for one boolean |

### Decision: Toggle as native HTML vs. Radix ToggleGroup

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Native `<button>` group | Zero deps, matches proposal's "no new component", trivial styling with Tailwind | **Chosen** — two buttons, conditional `active` class |
| Radix `ToggleGroup` | ARIA-perfect, but adds a dependency import for a trivial control | Rejected — not worth the import |

### Decision: Persist name change

Keep `'theme-storage'` as the localStorage key. Renaming would invalidate existing `themeMode` preferences for no benefit. Add `progressMode` to the `partialize` selector — visitors without the key default to `'flat'`.

## Data Flow

```
User clicks "Weighted" button
       │
       ▼
useUIStore.setProgressMode('weighted')
       │
       ├── Zustand persist → localStorage { progressMode: 'weighted' }
       │
       ▼
DashboardPage re-renders (mode changed)
       │
       ▼
useMemo recalculates:
  progressMode === 'flat'
    → calcOverallProgress(allTopics)
  progressMode === 'weighted'
    → calcWeightedOverallProgress(allTopics, domains)
       │
       ▼
ProgressRing receives new percentage (no internal change)
```

Scenarios map to spec: flat mode = existing behavior unchanged; weighted mode = new function; toggle instant via Zustand reactivity; persisted mode restored on reload via `partialize`.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/stores/ui-store.ts` | Modify | Add `progressMode`, `setProgressMode`, extend `partialize` |
| `src/lib/progress.ts` | Modify | Add `calcWeightedOverallProgress()` pure function |
| `src/pages/DashboardPage.tsx` | Modify | Read mode, derive `overallProgress` with ternary, render toggle |
| `tests/lib/progress.test.ts` | Modify | Add `calcWeightedOverallProgress` test suite |
| `openspec/specs/progress-tracking/spec.md` | Modify | Merge delta spec (handled by archive phase) |

### No changes to
- `ProgressRing.tsx` — already takes a `percentage` prop, no internal awareness of mode
- `DomainProgressCard.tsx` — per-domain bars are unchanged per specs
- `db/hooks.ts` — `useDomains()` already returns `Domain[]` with `weight` field
- `lib/types.ts` — no new types needed

## Interfaces / Contracts

```typescript
// ——— src/stores/ui-store.ts ———

export type ProgressMode = 'flat' | 'weighted';

// Added to existing UIState interface:
progressMode: ProgressMode;
setProgressMode: (mode: ProgressMode) => void;

// Default: 'flat'
// partialize extended: (state) => ({ themeMode: state.themeMode, progressMode: state.progressMode })

// ——— src/lib/progress.ts ———

export function calcWeightedOverallProgress(
  topics: TopicSummary[],
  domains: { id: number; weight: number }[],
): number
```

`calcWeightedOverallProgress` algorithm:

```
1. If topics or domains empty → return 0
2. For each domain in domains:
   a. Filter topics where topic.domainId === domain.id
   b. ratio = completed / total (0 if total === 0)
   c. weightedSum += ratio × domain.weight
   d. totalWeight += domain.weight
3. If totalWeight === 0 → return 0
4. Return (weightedSum / totalWeight) × 100
```

**Edge cases handled**:
- Empty topics → 0 (noop)
- Domain with 0 topics → ratio = 0, contributes nothing
- Topics with domainId not in domains array → ignored (defensive, shouldn't occur)
- All domains empty → returns 0

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `calcWeightedOverallProgress` | 6+ cases: empty, no completions, all complete, single domain, partial across domains, zero-topic domain |
| Unit | Weighted ≠ flat when domains have unequal topic counts | Prove the modes diverge with asymmetric topic distribution |
| Visual | Toggle renders, switches mode, persists | Manual verification in browser (no E2E infra) |

New tests go in existing `tests/lib/progress.test.ts` — follows project convention of vitest + describe/it without setup bloat.

## Migration / Rollout

No migration required. Old `theme-storage` localStorage entries lack `progressMode` — the store default `'flat'` applies gracefully. If the persist key were renamed, old `themeMode` would be lost; since we're extending `partialize` with the same key name, nothing breaks.

## Open Questions

None.
