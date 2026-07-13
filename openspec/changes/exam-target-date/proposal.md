# Proposal: Exam Target Date + Countdown + Pace Tracker

## Intent

Progress percentage alone doesn't answer "am I studying fast enough?". Users need a target exam date to gauge pace, stay motivated, and avoid cramming. This change adds a persisted exam date with a live countdown and a pace-comparison bar on the Dashboard.

## Scope

### In Scope
- Exam target date picker (persisted in Dexie, visible on Dashboard)
- Countdown display: "X days until exam" or "Exam was X days ago"
- Pace tracker bar: needed topics/day vs actual pace, with green/yellow/red indicator
- All three sub-features live on the Dashboard

### Out of Scope
- Study reminders or notifications
- Progress charts over time
- Calendar integration or date range selection
- Multiple exam dates or exam switching

## Capabilities

### New Capabilities
- `exam-schedule`: Exam target date storage, countdown calculation, and pace-tracking visualization

### Modified Capabilities
- None — existing specs (topic-checklist, progress-tracking, resource-management, local-persistence, dark-mode) remain unchanged

## Approach

1. **Dexie schema v2**: Add optional `targetDate` (ISO date string) field to the existing `Exam` table. One row, one exam date — simplest path.
2. **New custom hook**: `useExamSchedule()` — reads `Exam.targetDate` via `useLiveQuery`, computes `daysRemaining`, `daysElapsed`, `paceNeeded`, `paceActual`. Returns structured state for all three sub-features.
3. **Date picker**: Radix `Popover.Trigger` + native `<input type="date">` (Radix lacks a date picker primitive). Styled with Tailwind `dark:` variants.
4. **CountdownBadge**: Presentational component — receives `daysRemaining`, renders "X days until exam" or "Exam was X days ago".
5. **PaceTracker**: Presentational component — receives `topicsPerDayNeeded`, `topicsPerDayActual`. Renders comparison text + color bar (green ≥ needed, yellow ±10%, red < needed).
6. **Pace math**: `needed = remainingTopics / daysRemaining` (ceiling). `actual = completedTopics / daysElapsed` (ceiling). Only use days remaining vs topics remaining (not elapsed) for the pace indicator.
7. **Edge cases**: No date → prompt to set one; exam passed → show "Exam was X days ago", pace stops; zero topics remaining → show "All topics complete!"; zero days remaining → show "Exam is today!".
8. **Dark mode**: All new components use existing dark mode pattern (`dark:` variants).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/db/schema.ts` | Modified | Add `targetDate?: string` to `exam` store, bump to v2 |
| `src/lib/types.ts` | Modified | Add `targetDate?: string` to `Exam` interface |
| `src/db/hooks.ts` | Modified | Add `useExamSchedule()` hook |
| `src/lib/progress.ts` | Modified | Add pace calculation utilities |
| `src/pages/DashboardPage.tsx` | Modified | Integrate countdown + pace tracker below progress ring |
| `src/components/exam/ExamDatePicker.tsx` | New | Date picker popover trigger |
| `src/components/exam/CountdownBadge.tsx` | New | Days-remaining display |
| `src/components/exam/PaceTracker.tsx` | New | Pace comparison bar |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Radix lacks date picker, native `<input type="date">` varies across browsers | Medium | Style the native input consistently with Tailwind; use Radix Popover only for the trigger button |
| Timezone confusion with date-only storage | Low | Store `YYYY-MM-DD` without time component; comparison uses local midnight via `setHours(0,0,0,0)` |
| Dexie v1→v2 migration on existing IndexedDB | Low | `dexie.version(2)` handles migration gracefully. Orphaned column if rollback is harmless |

## Rollback Plan

Revert schema.ts to v1 (remove `targetDate`), delete new components under `src/components/exam/`, revert `DashboardPage.tsx`, revert `hooks.ts`. Dexie doesn't support version downgrade — the orphaned column in IndexedDB is harmless and ignored. Safer than clearing user data.

## Dependencies

- None. All APIs are native (`Date`, `Intl`) or already in the stack.

## Success Criteria

- [ ] User can set/change exam date via the date picker button on Dashboard
- [ ] Countdown shows correct days until exam, reactive to date changes
- [ ] After exam date passes, text changes to "Exam was X days ago"
- [ ] Pace tracker shows needed vs actual topics/day with correct color indicator
- [ ] All states handled: no date (prompt), exam passed, zero topics, zero days
- [ ] Works in dark mode with no invisible text or broken contrast
- [ ] Date persists across reload and survives page refresh
- [ ] None of the existing features (topic tree, progress rings, bars, resource management) are broken
