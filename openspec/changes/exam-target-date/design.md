# Design: Exam Target Date + Countdown + Pace Tracker

## Architecture Overview

Three new UI components (`ExamDatePicker`, `CountdownBadge`, `PaceTracker`) render on the Dashboard, all driven by a single new hook (`useExamSchedule`). The hook reads the `Exam` row (id=1) via `useLiveQuery` and derives all countdown and pace values purely from the persisted `targetDate` + `dateSet` fields + the existing topics table. No new stores, no new DB tables — just one schema version bump and two new fields on `Exam`.

```
┌─────────────────────────────────────────────┐
│                 DashboardPage                │
│  ┌─────────────────────────────────────────┐ │
│  │          ProgressRing (existing)        │ │
│  ├─────────────────────────────────────────┤ │
│  │  ┌─────────────────────────────────┐    │ │
│  │  │   Exam Schedule Card (NEW)      │    │ │
│  │  │  ┌──────────────────────────┐   │    │ │
│  │  │  │    ExamDatePicker        │   │    │ │
│  │  │  │    CountdownBadge        │   │    │ │
│  │  │  │    PaceTracker           │   │    │ │
│  │  │  └──────────────────────────┘   │    │ │
│  │  └─────────────────────────────────┘    │ │
│  ├─────────────────────────────────────────┤ │
│  │        Domain Cards (existing)          │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
        ▲              useExamSchedule()              ▲
        │              (useLiveQuery)                  │
        │                                             │
  ┌─────┴─────┐                               ┌──────┴──────┐
  │  Dexie v2 │◄──── db.exam.update(1, ...) ──┤  ExamDate   │
  │  Exam     │                               │  Picker     │
  │  table    │                               └─────────────┘
  └───────────┘
```

---

## 1. Database Schema — `src/db/schema.ts`

### Version bump: v1 → v2

```typescript
// v1 (current)
this.version(1).stores({
  exam: '++id, name',
  domain: '++id, examId, weight',
  topic: '++id, domainId, parentTopicId, status',
  resource: '++id, topicId, resourceType, url, createdAt',
});

// v2 (new)
this.version(2).stores({
  exam: '++id, name, targetDate',
  domain: '++id, examId, weight',
  topic: '++id, domainId, parentTopicId, status',
  resource: '++id, topicId, resourceType, url, createdAt',
}).upgrade(async (tx) => {
  // No data migration needed — existing Exam rows simply lack targetDate
  // Dexie handles the new indexed column without data loss
});
```

### Why `targetDate` as an indexed string?

- **Storage**: `YYYY-MM-DD` string (no timezone ambiguity). Storing `Date` objects in IndexedDB triggers UTC serialization quirks; a string is deterministic across timezones.
- **Indexed**: `targetDate` is declared in the schema string so Dexie knows about it during upgrade and can filter/sort by date in the future. Single-exam row makes indexing academic, but correctness matters.
- **New field `dateSet`**: NOT indexed (no query needs to filter by it). Dexie stores it as part of the object automatically even without declaring it in the schema string.

---

## 2. Type Definitions — `src/lib/types.ts`

```typescript
export interface Exam {
  id?: number;
  name: string;
  code: string;
  targetDate?: string;   // NEW: YYYY-MM-DD, e.g. "2026-08-15"
  dateSet?: number;      // NEW: Date.now() timestamp when targetDate was last set/changed
}
```

Both fields are optional — existing seeded exams and fresh installs work without them.

---

## 3. New Hook — `useExamSchedule()` — `src/db/hooks.ts`

### Return type

```typescript
interface ExamSchedule {
  targetDate: string | null;
  setTargetDate: (date: string) => Promise<void>;
  clearTargetDate: () => Promise<void>;
  daysRemaining: number | null;
  daysElapsed: number | null;
  pace: {
    targetPerDay: number;      // remaining topics / daysRemaining
    actualPerDay: number;      // completed topics / daysElapsed
    ratio: number | null;      // actualPerDay / targetPerDay (null if no target)
    status: 'ahead' | 'on_track' | 'behind' | 'complete' | 'no_date' | 'today';
  };
}
```

### Algorithm

```typescript
function useExamSchedule(): ExamSchedule {
  const exam = useLiveQuery(() => db.exam.get(1), [], undefined);
  const allTopics = useAllTopics(); // already exists

  const targetDate = exam?.targetDate ?? null;
  const dateSet = exam?.dateSet ?? null;

  // ---- derive dates ----
  const today = new Date();
  today.setHours(0, 0, 0, 0); // local midnight

  let daysRemaining: number | null = null;
  let daysElapsed: number | null = null;

  if (targetDate) {
    const target = new Date(targetDate + 'T00:00:00'); // local midnight
    const diffMs = target.getTime() - today.getTime();
    daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (dateSet) {
      const start = new Date(dateSet);
      start.setHours(0, 0, 0, 0);
      daysElapsed = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    } else {
      daysElapsed = 0; // date was set but dateSet not tracked (legacy data)
    }
  }

  // ---- derive pace ----
  const totalTopics = allTopics.length;
  const completedTopics = allTopics.filter((t) => t.status === 'completed').length;
  const remainingTopics = totalTopics - completedTopics;

  let pace: ExamSchedule['pace'];

  if (!targetDate) {
    pace = { targetPerDay: 0, actualPerDay: 0, ratio: null, status: 'no_date' };
  } else if (completedTopics === totalTopics && totalTopics > 0) {
    pace = { targetPerDay: 0, actualPerDay: 0, ratio: null, status: 'complete' };
  } else if (daysRemaining !== null && daysRemaining <= 0) {
    pace = { targetPerDay: 0, actualPerDay: 0, ratio: null, status: 'today' };
  } else {
    const targetPerDay = daysRemaining! > 0
      ? remainingTopics / daysRemaining!
      : 0;
    const actualPerDay = daysElapsed! > 0
      ? completedTopics / daysElapsed!
      : 0;
    const ratio = targetPerDay > 0 ? actualPerDay / targetPerDay : 0;

    let status: 'ahead' | 'on_track' | 'behind';
    if (ratio >= 1.0) status = 'ahead';
    else if (ratio >= 0.9) status = 'on_track';
    else status = 'behind';

    pace = { targetPerDay, actualPerDay, ratio, status };
  }

  // ---- setters ----
  const setTargetDate = async (date: string) => {
    await db.exam.update(1, { targetDate: date, dateSet: Date.now() });
  };

  const clearTargetDate = async () => {
    await db.exam.update(1, { targetDate: undefined, dateSet: undefined });
  };

  return { targetDate, setTargetDate, clearTargetDate, daysRemaining, daysElapsed, pace };
}
```

### Key edge cases handled

| Condition | `daysRemaining` | `daysElapsed` | `pace.status` | UI behavior |
|---|---|---|---|---|
| No date set | `null` | `null` | `no_date` | Prompt to set date |
| All topics complete | any | any | `complete` | "All topics complete!" — green |
| Exam today (`daysRemaining ≤ 0`) | ≤ 0 | any | `today` | "Exam is today!" — no pace bar |
| Just set date (`daysElapsed === 0`) | > 0 | 0 | `behind` | actualPerDay = 0, bar at 0% |
| Legacy row (no `dateSet`) | > 0 | 0 | `behind` | Same as just-set — acceptable degradation |

### Why `Math.ceil` for both day values?

- `daysRemaining = Math.ceil(diffMs / DAY_MS)`: If the exam is 1.5 days away, `ceil` rounds up to 2. This is conservative — you have 2 days to prepare, not 1. The target pace calculation uses this larger denominator, making the target slightly more relaxed (fewer topics/day needed).
- `daysElapsed = Math.ceil(diffMs / DAY_MS)`: If 0.5 days have passed, `ceil` rounds up to 1. This is also conservative — actual pace uses a larger denominator, making actual slightly lower. Slightly pessimizes pace for partial days, which is safer (encourages more study).

---

## 4. New Components

### 4.1 `ExamDatePicker` — `src/components/exam/ExamDatePicker.tsx`

```
Props: none (reads from useExamSchedule)
State: local isOpen for Popover
```

**Structure**:
```
<Popover.Root>
  <Popover.Trigger asChild>
    <button>
      {hasDate ? targetDate : "Set your exam date"}
    </button>
  </Popover.Trigger>
  <Popover.Content>
    <input type="date" value={targetDate ?? ''} onChange={...} />
    <button onClick={clearTargetDate}>Clear date</button>
  </Popover.Content>
</Popover.Root>
```

**Design choices**:
- Radix `Popover` for the trigger/panel interaction (already in stack).
- Native `<input type="date">` inside the popover — no third-party date picker needed. Radix has no date picker primitive; native input is the correct choice.
- The input gets the full date picker UX from the browser (calendar dropdown, keyboard input).
- A "Clear" button in the popover footer removes the date.
- Styled with Tailwind `dark:` variants to match existing component patterns.
- The popover's `onOpenChange` and the date input's `onChange` handle the flow.

**States**:
- No date: trigger shows "📅 Set your exam date" (text only — no emoji per guidelines, use `Calendar` icon from Lucide).
- Date set: trigger shows the formatted date (e.g., "Aug 15, 2026" via `Intl.DateTimeFormat`).
- Clear removes date, triggers `expose` return to empty state.

### 4.2 `CountdownBadge` — `src/components/exam/CountdownBadge.tsx`

```
Props: { daysRemaining: number | null; hasDate: boolean }
```

**Structure**: Single `<div>` with text + optional icon.

**States**:
| `hasDate` | `daysRemaining` | Render |
|---|---|---|
| `false` | `null` | `null` (hidden by parent — empty state handled by ExamDatePicker) |
| `true` | `> 0` | "30 days until exam" |
| `true` | `=== 0` | "Exam is today! 🎯" (use `Target` icon) |
| `true` | `< 0` | "Exam was 5 days ago" |

Pure presentational — no hooks, no logic. Receives everything from parent.

### 4.3 `PaceTracker` — `src/components/exam/PaceTracker.tsx`

```
Props: { pace: ExamSchedule['pace']; daysRemaining: number | null }
```

**Structure**:
```
<div>
  {status === 'complete' && <SuccessBanner />}
  {status === 'today' && <TodayMessage />}
  {status === 'no_date' && null}
  {(status === 'ahead' | 'on_track' | 'behind') && <PaceBar />}
</div>
```

**PaceBar**:
- Label text: "X.X/day needed · Y.Y/day actual · {Status label}" (e.g., "1.2/day needed — 0.2/day actual — Behind")
- Visual bar:
  - Full width = target pace (100%, gray track)
  - Filled width = `Math.min(ratio, 1) * 100` percent of track
  - Fill color: `green` (ratio >= 1.0), `yellow/amber` (ratio >= 0.9), `red` (ratio < 0.9)

**Why NOT reuse `ProgressBar` directly**: Existing `ProgressBar` uses static `bg-brand-500` and has no color-switching mechanism. Adding a `color` prop (e.g., `fillClass`) would change the existing API. Better to render a standalone bar in PaceTracker with Tailwind dynamic classes:
```tsx
const barColor = pace.status === 'ahead' ? 'bg-green-500'
  : pace.status === 'on_track' ? 'bg-amber-500'
  : 'bg-red-500';
```

If we later want to consolidate, we can add `fillClassName` to `ProgressBar` as a non-breaking enhancement.

---

## 5. Layout on DashboardPage

The three new components sit inside a new card placed between the ProgressRing section and the Domain cards section:

```
<div ... className="max-w-3xl mx-auto space-y-8">
  {/* Header — existing */}
  {/* Overall Progress Ring — existing */}

  {/* ⬇ NEW: Exam Schedule Card */}
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

    {targetDate && (
      <>
        <CountdownBadge daysRemaining={daysRemaining} hasDate={!!targetDate} />
        {pace.status !== 'no_date' && pace.status !== 'complete' && (
          <PaceTracker pace={pace} daysRemaining={daysRemaining} />
        )}
        {pace.status === 'complete' && (
          <PaceTracker pace={pace} daysRemaining={daysRemaining} />
        )}
      </>
    )}
  </div>
  {/* ⬆ END NEW */}

  {/* Domain Progress Cards — existing */}
</div>
```

This layout means:
- **No date**: Only `ExamDatePicker` shows (with prompt text). `CountdownBadge` and `PaceTracker` don't render.
- **Date set**: All three render.
- **All complete**: `CountdownBadge` + `PaceTracker` with success state.

---

## 6. Data Flow

```
User picks date in ExamDatePicker
  → onChange calls setTargetDate(newDateStr)
    → db.exam.update(1, { targetDate, dateSet: Date.now() })
      → Dexie triggers on('changes') / useLiveQuery re-fires
        → useExamSchedule() recomputes all derived values
          → DashboardPage re-renders
            → CountdownBadge shows new countdown
            → PaceTracker shows new pace status + bar
```

```
User clicks "Clear" in ExamDatePicker
  → clearTargetDate()
    → db.exam.update(1, { targetDate: undefined, dateSet: undefined })
      → same cascade, but:
        → CountdownBadge hides
        → PaceTracker hides
        → ExamDatePicker shows "Set your exam date"
```

All mutations go through Dexie. No Zustand store involved — the exam schedule data is persistent DB state, not ephemeral UI state.

---

## 7. Pace Calculation Detail

```
                  remainingTopics
targetPerDay = ─────────────────────
                  daysRemaining
                  
                  completedTopics
actualPerDay  = ─────────────────
                  daysElapsed

                  actualPerDay
paceRatio     = ──────────────  (null if targetPerDay === 0)
                  targetPerDay

pace.status = paceRatio >= 1.0  → 'ahead'
              paceRatio >= 0.9  → 'on_track'
              paceRatio <  0.9  → 'behind'
```

All division-by-zero cases are gated by the conditions in §3.

---

## 8. Files Summary

| File | Action | Details |
|---|---|---|
| `src/db/schema.ts` | **Modify** | Add `targetDate` to exam schema string; bump to v2 with upgrade stub |
| `src/lib/types.ts` | **Modify** | Add `targetDate?: string` and `dateSet?: number` to `Exam` interface |
| `src/db/hooks.ts` | **Modify** | Add `useExamSchedule()` hook with all derivation logic + setters |
| `src/lib/progress.ts` | **Modify** | Add `calcPace()` pure function for testability (optional — math can live in hook) |
| `src/components/exam/ExamDatePicker.tsx` | **Create** | Radix Popover + native date input + clear action |
| `src/components/exam/CountdownBadge.tsx` | **Create** | Pure presentational countdown text |
| `src/components/exam/PaceTracker.tsx` | **Create** | Pace bar with dynamic color + status text |
| `src/pages/DashboardPage.tsx` | **Modify** | Add Exam Schedule card with 3 components between ProgressRing and Domain cards |

**Not modified**: `openspec/specs/exam-schedule/spec.md` (already finalized).

---

## 9. Dark Mode

All new components use the existing Tailwind dark mode convention:
- Text: `text-gray-900 dark:text-gray-100` (headings), `text-gray-500 dark:text-gray-400` (subtitles)
- Borders: `border-gray-200 dark:border-gray-700`
- Card bg: `bg-white dark:bg-gray-800` (or transparent as currently in DashboardPage)
- Pace bar track: `bg-gray-200 dark:bg-gray-700`
- Popover content: inherits from Radix with `bg-white dark:bg-gray-800` + `border-gray-200 dark:border-gray-700`

No `useTheme()` or JS-based dark mode switching needed — Tailwind's `dark:` class strategy is already wired.

---

## 10. Risks and Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Native `<input type="date">` styling varies per browser/OS | Medium | Style minimally (font, size, bg match); accept OS-native date picker UX; tested against Chrome, Safari, Firefox |
| `dateSet` not tracked for existing users after v2 upgrade | Low | When `dateSet` is undefined but `targetDate` exists, `daysElapsed = 0` and `actualPerDay = 0` → pace shows "behind". Acceptable degradation — user can re-set the date to fix. Document in migration. |
| `useLiveQuery` overhead with two queries (exam + allTopics) | Low | Both queries are cheap (single-row lookup + in-memory array). No measurable perf impact on Dashboard. |
| `Math.ceil` rounding gives unnatural target pace (e.g., 1.03 → 2) | Low | Using float division (not ceil) for pace ratio. Display rounds to 1 decimal. Ceil is only for day count, not pace per-day. |

---

## 11. Rollback Plan

Steps (in order):

1. **Components**: Delete `src/components/exam/ExamDatePicker.tsx`, `CountdownBadge.tsx`, `PaceTracker.tsx`
2. **Dashboard**: Remove imports and JSX for the 3 components from `DashboardPage.tsx`
3. **Hooks**: Remove `useExamSchedule()` from `src/db/hooks.ts`
4. **Types**: Remove `targetDate` and `dateSet` from `Exam` interface in `src/lib/types.ts`
5. **Schema**: Revert `this.version(2).stores(...)` to `this.version(1).stores(...)` in `schema.ts`
6. **Progress**: Remove `calcPace()` from `src/lib/progress.ts` (if added)

**Dexie note**: IndexedDB doesn't support schema downgrade. After rollback, the `targetDate` column remains in the IndexedDB object store but is ignored by the v1 schema. User data is not corrupted — the orphaned column is harmless. No data clearing required.

---

## 12. Open Questions / Design Decisions

1. **`dateSet` tracking**: Should `dateSet` reset on every `setTargetDate` call, or only when the date value actually changes? **Decision**: Always update `dateSet` to `Date.now()` on every set. This treats re-selecting the same date as a reaffirmation and resets the pace clock. Simple, predictable.

2. **paceRatio for completed topics**: When all topics are complete, `pace.status = 'complete'` and no bar renders (only success text). The pace ratio is irrelevant because studying is done.

3. **Negative daysRemaining display**: `daysRemaining = -5` → CountdownBadge shows "Exam was 5 days ago" (absolute value). The hook internally keeps the signed value; display logic handles the sign.
