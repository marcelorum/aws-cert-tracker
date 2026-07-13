# Tasks: Exam Target Date + Countdown + Pace Tracker

**Change**: `exam-target-date`  
**Spec**: `openspec/specs/exam-schedule/spec.md`  
**Design**: `openspec/changes/exam-target-date/design.md`  
**Estimated lines**: ~250–350  
**Chained PRs**: No  

---

## Phase 1 — Database Schema & Types

### Task 1.1 — Add `targetDate` and `dateSet` to `Exam` type

**File**: `src/lib/types.ts`

**Do**:
1. Add `targetDate?: string` to `Exam` interface
2. Add `dateSet?: number` to `Exam` interface

**Details**:
- `targetDate` = YYYY-MM-DD string, no timezone
- `dateSet` = `Date.now()` timestamp when targetDate was last set/changed
- Both optional — existing seeded rows work without them

**Expected diff**: +2 lines

---

### Task 1.2 — Bump Dexie schema v1 → v2

**File**: `src/db/schema.ts`

**Do**:
1. Add `this.version(2).stores({...})` block after v1
2. Add `targetDate` to the `exam` store schema string: `'++id, name, targetDate'`
3. Add `.upgrade(async (tx) => { /* no-op */ })` callback

**Details**:
- No data migration needed — existing rows simply lack `targetDate`
- `domain`, `topic`, `resource` stores unchanged from v1
- `++id` stays as primary key for all stores

**Expected diff**: ~8 lines added

---

## Phase 2 — Hook & Pure Function

### Task 2.1 — Extract `calcExamPace()` as pure function in `progress.ts`

**File**: `src/lib/progress.ts`

**Do**:
Add exported pure function `calcExamPace()` with this signature:

```typescript
interface ExamPaceInput {
  targetDate: string | null;
  dateSet: number | null;
  totalTopics: number;
  completedTopics: number;
}

interface ExamPaceResult {
  daysRemaining: number | null;
  daysElapsed: number | null;
  targetPerDay: number;
  actualPerDay: number;
  ratio: number | null;
  status: 'ahead' | 'on_track' | 'behind' | 'complete' | 'no_date' | 'today';
}

function calcExamPace(input: ExamPaceInput): ExamPaceResult
```

**Algorithm** (from design §3):

```
today = local midnight
if targetDate:
  target = new Date(targetDate + 'T00:00:00')   // local midnight
  daysRemaining = Math.ceil((target - today) / DAY_MS)
  if dateSet:
    start = new Date(dateSet); start.setHours(0,0,0,0)
    daysElapsed = Math.ceil((today - start) / DAY_MS)
  else:
    daysElapsed = 0    // legacy data degradation

remainingTopics = totalTopics - completedTopics

status logic:
  no targetDate → status = 'no_date'
  completedTopics === totalTopics && totalTopics > 0 → status = 'complete'
  daysRemaining <= 0 → status = 'today'
  else → calculate targetPerDay, actualPerDay, ratio, then:
    ratio >= 1.0  → 'ahead'
    ratio >= 0.9  → 'on_track'
    ratio <  0.9  → 'behind'
```

**Edge cases covered** (from design §3 table):

| Condition | `daysRemaining` | `daysElapsed` | `pace.status` |
|---|---|---|---|
| No date set | `null` | `null` | `no_date` |
| All topics complete | any | any | `complete` |
| Exam today (≤0) | ≤ 0 | any | `today` |
| Just set date (0 elapsed) | > 0 | 0 | `behind` |
| Legacy row (no `dateSet`) | > 0 | 0 | `behind` |

**Critical**: Export both `calcExamPace` and the `ExamPaceInput`/`ExamPaceResult` types so they can be imported by the hook AND by tests.

---

### Task 2.2 — Create `useExamSchedule()` hook

**File**: `src/db/hooks.ts`

**Do**:
1. Add import for `calcExamPace` from `../lib/progress`
2. Add and export `function useExamSchedule(): ExamSchedule`

**Return type** (define inline or as exported interface):

```typescript
interface ExamSchedule {
  targetDate: string | null;
  setTargetDate: (date: string) => Promise<void>;
  clearTargetDate: () => Promise<void>;
  daysRemaining: number | null;
  daysElapsed: number | null;
  pace: {
    targetPerDay: number;
    actualPerDay: number;
    ratio: number | null;
    status: 'ahead' | 'on_track' | 'behind' | 'complete' | 'no_date' | 'today';
  };
}
```

**Hook body**:

```typescript
function useExamSchedule(): ExamSchedule {
  const exam = useLiveQuery(() => db.exam.get(1), [], undefined);
  const allTopics = useAllTopics();  // already exists

  const targetDate = exam?.targetDate ?? null;
  const dateSet = exam?.dateSet ?? null;

  const totalTopics = allTopics.length;
  const completedTopics = allTopics.filter(t => t.status === 'completed').length;

  const paceResult = calcExamPace({ targetDate, dateSet, totalTopics, completedTopics });

  const setTargetDate = async (date: string) => {
    await db.exam.update(1, { targetDate: date, dateSet: Date.now() });
  };

  const clearTargetDate = async () => {
    await db.exam.update(1, { targetDate: undefined, dateSet: undefined });
  };

  return {
    targetDate,
    setTargetDate,
    clearTargetDate,
    daysRemaining: paceResult.daysRemaining,
    daysElapsed: paceResult.daysElapsed,
    pace: {
      targetPerDay: paceResult.targetPerDay,
      actualPerDay: paceResult.actualPerDay,
      ratio: paceResult.ratio,
      status: paceResult.status,
    },
  };
}
```

**Why two tasks?** The pure function (`calcExamPace`) is testable without Dexie. The hook wires it to live data. Separating them means unit tests don't need IndexedDB mocks.

---

## Phase 3 — Components

### Task 3.1 — Create `ExamDatePicker.tsx`

**File**: `src/components/exam/ExamDatePicker.tsx` (create)

**Imports**: `useExamSchedule` from `../../db/hooks`, Radix `Popover` from `@radix-ui/react-popover`, `Calendar` icon from `lucide-react`

**Structure**:

```
<Popover.Root>
  <Popover.Trigger asChild>
    <button>
      {targetDate ? formattedDate : "Set your exam date"}
    </button>
  </Popover.Trigger>
  <Popover.Content>
    <input type="date" value={targetDate ?? ''} onChange={...} />
    {targetDate && <button onClick={clearTargetDate}>Clear date</button>}
  </Popover.Content>
</Popover.Root>
```

**Details**:
- Format displayed date with `Intl.DateTimeFormat('en-US', { dateStyle: 'long' })` → e.g. "August 15, 2026"
- `onChange` calls `setTargetDate(e.target.value)` immediately (no confirm button needed — native date picker selection is the confirmation)
- Clear button removes the date, triggering `clearTargetDate()`
- No local `isOpen` state needed — Radix Popover manages its own open/close
- Styles match existing Tailwind dark mode:
  - Trigger button: `text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200`
  - Popover content: `bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg`
  - Date input: `w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`

---

### Task 3.2 — Create `CountdownBadge.tsx`

**File**: `src/components/exam/CountdownBadge.tsx` (create)

**Props**:
```typescript
interface CountdownBadgeProps {
  daysRemaining: number | null;
  hasDate: boolean;
}
```

**States**:

| `hasDate` | `daysRemaining` | Render |
|---|---|---|
| `false` | `null` | Return `null` (hidden) |
| `true` | `> 0` | `"X days until exam"` — blue/gray text |
| `true` | `=== 0` | `"Exam is today!"` — green text |
| `true` | `< 0` | `"Exam was X days ago"` — `Math.abs(daysRemaining)` |

**Icons**: `Calendar` icon from lucide-react (or none — keep it simple)

**Styling**: Same dark mode pattern — `text-sm font-medium text-gray-600 dark:text-gray-400`

Pure presentational — no hooks, no DB calls.

---

### Task 3.3 — Create `PaceTracker.tsx`

**File**: `src/components/exam/PaceTracker.tsx` (create)

**Props**:
```typescript
interface PaceTrackerProps {
  pace: {
    targetPerDay: number;
    actualPerDay: number;
    ratio: number | null;
    status: 'ahead' | 'on_track' | 'behind' | 'complete' | 'no_date' | 'today';
  };
  daysRemaining: number | null;
}
```

**Structure** (from design §4.3):

```
{status === 'complete' && <SuccessMessage />}
{status === 'today' && <TodayMessage />}
{status === 'no_date' && null}
{(status === 'ahead' | 'on_track' | 'behind') && <PaceBar />}
```

**PaceBar**:
- Text: `"X.X/day needed · Y.Y/day actual · {Status}"` where numbers round to 1 decimal
- Visual bar:
  - Outer track: gray (`bg-gray-200 dark:bg-gray-700`), full width (represents 100% = target pace)
  - Inner fill: width = `Math.min(ratio, 1) * 100` percent
  - Fill color by status:
    - `ahead` → `bg-green-500`
    - `on_track` → `bg-amber-500`
    - `behind` → `bg-red-500`
- Status label text:
  - `ahead` → "Ahead" (with check icon)
  - `on_track` → "On track" (with info icon)
  - `behind` → "Behind" (with alert icon)

**Success message**: `"All topics complete!"` — green text, large check icon
**Today message**: `"Exam is today!"` — green text

**Design note**: Standalone bar, NOT reusing `ProgressBar` component. See design §4.3 for rationale.

---

## Phase 4 — Integration

### Task 4.1 — Wire components into `DashboardPage.tsx`

**File**: `src/pages/DashboardPage.tsx`

**Do**:
1. Import `useExamSchedule` from `../db/hooks`
2. Import `Calendar` from `lucide-react` (if not already imported)
3. Import `ExamDatePicker` from `../components/exam/ExamDatePicker`
4. Import `CountdownBadge` from `../components/exam/CountdownBadge`
5. Import `PaceTracker` from `../components/exam/PaceTracker`
6. Call `const examSchedule = useExamSchedule()` in the component body (alongside `useDomains`, `useAllTopics`)
7. Insert Exam Schedule card between the Progress Ring section and the Domain Cards section:

```tsx
{/* Exam Schedule Card — NEW */}
<div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
  <div className="flex items-center justify-between">
    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
      Exam Schedule
    </h2>
  </div>

  <div className="flex items-center gap-3">
    <Calendar className="w-4 h-4 text-gray-400" />
    <ExamDatePicker />
  </div>

  {examSchedule.targetDate && (
    <>
      <CountdownBadge
        daysRemaining={examSchedule.daysRemaining}
        hasDate={!!examSchedule.targetDate}
      />
      {examSchedule.pace.status !== 'no_date' && examSchedule.pace.status !== 'complete' && (
        <PaceTracker pace={examSchedule.pace} daysRemaining={examSchedule.daysRemaining} />
      )}
      {examSchedule.pace.status === 'complete' && (
        <PaceTracker pace={examSchedule.pace} daysRemaining={examSchedule.daysRemaining} />
      )}
    </>
  )}
</div>
```

---

## Phase 5 — Testing

### Task 5.1 — Unit tests for `calcExamPace()`

**File**: `src/lib/progress.test.ts` (create)

**Test cases** (from spec scenarios + edge cases in design §3):

| # | Scenario | Input | Expected |
|---|----------|-------|----------|
| 1 | No date set | `targetDate: null` | `status: 'no_date'`, `daysRemaining: null`, `daysElapsed: null` |
| 2 | All topics complete | `completedTopics === totalTopics`, targetDate valid | `status: 'complete'` |
| 3 | Exam today / past | `daysRemaining <= 0` | `status: 'today'` |
| 4 | Ahead (ratio >= 1.0) | 10 done / 10 days, 40 remaining / 40 days | `status: 'ahead'`, `ratio >= 1.0` |
| 5 | On track (0.9 <= ratio < 1.0) | 8 done / 10 days, 42 remaining / 40 days | `status: 'on_track'`, `ratio ~0.95-0.96` |
| 6 | Behind (ratio < 0.9) | 2 done / 10 days, 48 remaining / 40 days | `status: 'behind'`, `ratio < 0.9` |
| 7 | Legacy data (no dateSet) | `dateSet: null`, `targetDate` valid | `daysElapsed: 0`, `actualPerDay: 0`, `status: 'behind'` |
| 8 | Just set (0 elapsed) | `dateSet: Date.now()`, `targetDate` today | `status: 'today'` |
| 9 | Zero topics | `totalTopics: 0`, `completedTopics: 0` | `ratio: null`, doesn't crash |

**Framework**: Use existing test setup (Vitest, if present; otherwise note what's used).

---

### Task 5.2 — Integration test for `useExamSchedule()`

**File**: `src/db/hooks.test.ts` or create `__tests__/useExamSchedule.test.ts`

**Do**:
1. Create a fake in-memory Dexie instance with the v2 schema
2. Seed an `Exam` row (id=1) and relevant topics
3. Call hook in a test component via `renderHook` (React Testing Library)
4. Assert returned values match expected schedule/pace

**Cover**:
- Returns correct `daysRemaining` for a known target date
- Returns `no_date` status when no date is set
- `setTargetDate` persists and updates live query response
- `clearTargetDate` removes data and returns empty state

**Tooling**: `@testing-library/react`, Vitest, fake Dexie (no real IndexedDB — use `dexie` in-memory or mock `useLiveQuery`)

---

## Phase 6 — Verification

### Task 6.1 — Build + test pass

```bash
npm run build    # or tsc --noEmit
npm test         # or vitest run
```

**Check**: Zero type errors, zero test failures. No lint violations.

---

### Task 6.2 — Manual smoke test

1. Open Dashboard → see "Set your exam date" prompt on the exam schedule card
2. Click prompt → popover opens with date input
3. Select a date 30 days in the future → confirm popover closes
4. Verify countdown badge shows "30 days until exam"
5. Verify pace bar appears (status depends on completed topics)
6. Set exam to today → verify "Exam is today!" message
7. Set exam to 5 days ago → verify "Exam was 5 days ago"
8. Clear the date → verify prompt reappears, countdown and pace hide
9. Complete all topics → verify "All topics complete!" with green indicator

---

## Effort Estimate

| Phase | Tasks | Est. lines | Est. time |
|-------|-------|-----------|-----------|
| 1 — Schema & Types | 2 | ~10 | 5 min |
| 2 — Hook & Pure fn | 2 | ~80 | 20 min |
| 3 — Components | 3 | ~90 | 30 min |
| 4 — Integration | 1 | ~25 | 10 min |
| 5 — Testing | 2 | ~100 | 30 min |
| 6 — Verification | 2 | — | 10 min |
| **Total** | **12** | **~305** | **~1.75 h** |

## Review Workload Forecast

- **File complexity**: Low (no state management changes, no new stores, no new DB tables)
- **Review surface**: 8 files (2 modified DB layer, 4 new components, 1 modified page, 2 test files)
- **Risk areas**: 
  - Dexie version bump can fail silently if `upgrade` isn't called correctly
  - `useLiveQuery` with the v2 schema must wire the `targetDate` index properly
  - `Math.ceil` edge cases for negative days and partial days
- **Review effort**: ~20–30 min for an experienced reviewer

## Next Recommended Phase

After these tasks are implemented and verified:

1. **Pace persistence** — store `pace.status` snapshots over time for a trend chart
2. **Email/calendar reminder** — integrate with `navigator.permissions` and push notifications
3. **Multiple exam support** — extend single-exam row to support multiple exams with independent dates
