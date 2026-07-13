# Design: Dark Mode Toggle

## Technical Approach

Class-based dark mode via Tailwind v4 `@custom-variant dark` — all existing `dark:` prefixes become active when the `dark` class is present on `<html>`. Theme state lives in Zustand (`ui-store.ts`) with localStorage persistence. An inline script in `index.html` prevents FOUC by reading localStorage synchronously before React mounts.

## Architecture Decisions

| Decision | Choice | Alternatives Considered | Rationale |
|---|---|---|---|
| Theme storage | Zustand + localStorage | Dexie (IndexedDB), CSS-only | Theme is UI-only, not domain data. Zustand matches existing pattern. localStorage is synchronous — required for FOUC prevention. |
| Dark mode strategy | `@custom-variant dark` class-based | `@media (prefers-color-scheme)` | User choice must override OS pref. Class toggle is trivially testable. |
| Side-effect location | `App.tsx` `useEffect` | Store middleware, inline in actions | Keeps store pure. `useEffect` is idiomatic React for DOM side effects. Inline script handles the pre-mount case. |
| SVG hardcoded colors | Replace `stroke` attributes with Tailwind classes | CSS variables, `currentColor` | `stroke-*` utilities in TW v4 replace the `#` colors directly. No new CSS infra needed. |
| System default detection | `getInitialTheme()` in store + inline script both read `prefers-color-scheme` | Server-side, React-only | Both inline script and store init must agree. Duplicating the logic is safer than coupling. |

## Data Flow

```
[Page Load]
  ─► Inline script (index.html <head>)
      reads localStorage('clf-theme')
      ─► fallback: prefers-color-scheme
      ─► applies/removes .dark on <html> (synchronous, before paint)

[React Mount]
  ─► Zustand store init: getInitialTheme() reads localStorage → system pref → 'light'
  ─► App.tsx useEffect: syncs store.theme → <html>.classList + localStorage.setItem
      (no-op if inline script already applied the same value)

[User clicks Toggle]
  ─► ThemeToggle calls useUIStore.getState().toggleTheme()
  ─► Zustand state changes → App.tsx useEffect fires
  ─► <html>.classList.toggle('dark')
  ─► localStorage.setItem('clf-theme', theme)
```

## File Changes

### Create

| File | Description |
|------|-------------|
| `src/components/layout/ThemeToggle.tsx` | Sun/Moon icon button. Reads theme from Zustand, calls `toggleTheme`. Accessible `button` with `aria-label` that reflects current action ("Switch to dark/light mode"). |

### Modify

| File | Changes |
|------|---------|
| `src/index.css` | Add `@custom-variant dark (&:where(.dark, .dark *));` after `@import "tailwindcss"` |
| `index.html` | Add inline `<script>` in `<head>` that reads localStorage + `prefers-color-scheme`, applies/removes `.dark` on `<html>`. Remove `bg-gray-50 text-gray-900` from `<body>` class (these go on individual surfaces now). |
| `src/stores/ui-store.ts` | Add `Theme` type, `theme` state, `setTheme()`, `toggleTheme()`. Add `getInitialTheme()` helper that reads localStorage → `prefers-color-scheme` → `'light'`. |
| `src/App.tsx` | Add `useEffect` that subscribes to `store.theme`, syncs to `<html>.classList` and `localStorage`. |
| `src/components/layout/AppLayout.tsx` | Import `ThemeToggle`, render it in the `<header>` before the `<h2>` heading. Add `dark:` classes to header's `bg-white/80`, `border-gray-200`, `text-gray-500` elements. |
| `src/components/layout/Sidebar.tsx` | Add `dark:` overrides to all `bg-white`, `border-gray-200`, `text-gray-*`, `hover:bg-gray-100` and `bg-brand-50` classes. |
| `src/components/progress/ProgressRing.tsx` | Replace hardcoded `stroke="#e5e7eb"` with `className="stroke-gray-200 dark:stroke-gray-700"` and `stroke="#2563eb"` with `className="stroke-brand-500 dark:stroke-brand-400"`. Add `dark:` to inner `text-gray-900`/`text-gray-500`. |
| `src/components/progress/ProgressBar.tsx` | Add `dark:bg-gray-700` to track background (`bg-gray-200`). |
| `src/components/checklist/StatusBadge.tsx` | Add `dark:` variants for status dot and `getStatusColor` classes (inline conditionals). |
| `src/components/checklist/DomainCard.tsx` | Add `dark:` to card `border-gray-200`, `bg-white`, `hover:bg-gray-50`, `text-gray-900`, `border-t border-gray-100`, `divide-gray-50`. |
| `src/components/checklist/TopicItem.tsx` | Add `dark:` to `hover:bg-gray-50`, `text-gray-800`, `text-gray-400`, `text-gray-300`/`hover:text-gray-500`. |
| `src/components/resources/ResourceForm.tsx` | Add `dark:` to `bg-gray-50`, `border-gray-200`, `bg-white`, `border-gray-300`, `hover:bg-brand-50`, `text-gray-*`, `bg-brand-50/50`, `hover:text-gray-600`. |
| `src/components/resources/ResourceItem.tsx` | Add `dark:` to `border-brand-200`/`bg-brand-50/50`, `border-gray-300`, `text-gray-*`, `hover:text-gray-600`/`hover:text-brand-600`/`hover:text-red-600`. |
| `src/components/resources/ResourceList.tsx` | Add `dark:divide-gray-700` to `divide-gray-100`. |
| `src/pages/DashboardPage.tsx` | Add `dark:` to page text, skeleton loading `bg-gray-200`, card borders, `text-gray-*`. |
| `src/pages/ChecklistPage.tsx` | Add `dark:` to page text, skeleton loading `bg-gray-200`. |
| `src/pages/TopicDetailPage.tsx` | Add `dark:` to page text, back button, loading states. |

## Color Override Table

### Systemic Replacements (apply to every file where pattern appears)

| Pattern | Light | Dark |
|---|---|---|
| Page background | `bg-gray-50` | `dark:bg-gray-950` |
| Card/surface | `bg-white` | `dark:bg-gray-900` |
| Card border | `border-gray-200` | `dark:border-gray-700` |
| Subtle divider | `border-gray-100` | `dark:border-gray-800` |
| Divide color | `divide-gray-50` / `divide-gray-100` | `dark:divide-gray-800` |
| Primary text | `text-gray-900` | `dark:text-gray-100` |
| Secondary text | `text-gray-500` | `dark:text-gray-400` |
| Tertiary text | `text-gray-400` | `dark:text-gray-500` |
| Muted text | `text-gray-300` | `dark:text-gray-600` |
| Input/text field bg | `bg-white` | `dark:bg-gray-800` |
| Input border | `border-gray-300` | `dark:border-gray-600` |
| Hover bg (items) | `hover:bg-gray-50` / `hover:bg-gray-100` | `dark:hover:bg-gray-800` |
| Skeleton loading | `bg-gray-200` | `dark:bg-gray-700` |

### Component-Specific

| File | Element | Light | Dark |
|---|---|---|---|
| `ProgressRing.tsx` | Track circle stroke | `stroke="#e5e7eb"` → `stroke-gray-200` | `dark:stroke-gray-700` |
| `ProgressRing.tsx` | Fill circle stroke | `stroke="#2563eb"` → `stroke-brand-500` | `dark:stroke-brand-400` |
| `ProgressRing.tsx` | Percentage text | `text-gray-900` | `dark:text-gray-100` |
| `ProgressBar.tsx` | Track background | `bg-gray-200` | `dark:bg-gray-700` |
| `Sidebar.tsx` | Overlay | `bg-black/30` | `dark:bg-black/50` |
| `Sidebar.tsx` | Active nav link | `bg-brand-50 text-brand-700` | `dark:bg-brand-900/30 dark:text-brand-300` |
| `Sidebar.tsx` | Inactive nav link | `text-gray-600 hover:bg-gray-100 hover:text-gray-900` | `dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100` |
| `Sidebar.tsx` | Brand title | `text-brand-600` | `dark:text-brand-400` |
| `Sidebar.tsx` | Footer text | `text-gray-400` | `dark:text-gray-500` |
| `AppLayout.tsx` | Header | `bg-white/80 border-gray-200` | `dark:bg-gray-900/80 dark:border-gray-700` |
| `AppLayout.tsx` | Header heading | `text-gray-500` | `dark:text-gray-400` |
| `AppLayout.tsx` | Menu button | `text-gray-500 hover:text-gray-700` | `dark:text-gray-400 dark:hover:text-gray-200` |
| `StatusBadge.tsx` | not_started dot | `bg-gray-400` | `dark:bg-gray-500` |
| `StatusBadge.tsx` | in_progress dot | `bg-amber-500` | (unchanged) |
| `StatusBadge.tsx` | completed dot | `bg-green-500` | (unchanged) |
| `StatusBadge.tsx` | not_started badge | `text-gray-400 bg-gray-100` | `dark:text-gray-500 dark:bg-gray-800` |
| `StatusBadge.tsx` | in_progress badge | `text-amber-700 bg-amber-100` | `dark:text-amber-400 dark:bg-amber-900/30` |
| `StatusBadge.tsx` | completed badge | `text-green-700 bg-green-100` | `dark:text-green-400 dark:bg-green-900/30` |
| `ResourceForm.tsx` | Form container | `bg-gray-50 border-gray-200` | `dark:bg-gray-800/50 dark:border-gray-700` |
| `ResourceForm.tsx` | Label text | `text-gray-500` | `dark:text-gray-400` |
| `ResourceForm.tsx` | Select trigger | `bg-white border-gray-300` | `dark:bg-gray-800 dark:border-gray-600` |
| `ResourceForm.tsx` | Select portal content | `bg-white border-gray-200` | `dark:bg-gray-800 dark:border-gray-700` |
| `ResourceForm.tsx` | Select item hover | `hover:bg-brand-50` | `dark:hover:bg-brand-900/20` |
| `ResourceForm.tsx` | Submit button | `bg-brand-600 hover:bg-brand-700` | (unchanged — brand has sufficient contrast) |
| `ResourceForm.tsx` | Cancel button | `text-gray-400 hover:text-gray-600` | `dark:text-gray-500 dark:hover:text-gray-300` |
| `ResourceItem.tsx` | Viewing state | `text-gray-800` | `dark:text-gray-100` |
| `ResourceItem.tsx` | Link | `text-brand-600 hover:text-brand-800` | `dark:text-brand-400 dark:hover:text-brand-300` |
| `ResourceItem.tsx` | Edit container | `border-brand-200 bg-brand-50/50` | `dark:border-brand-800 dark:bg-brand-900/20` |
| `ResourceItem.tsx` | Action buttons | `text-gray-400 hover:text-brand-600` / `hover:text-red-600` | `dark:text-gray-500` (hover unchanged) |
| `DomainCard.tsx` | Trigger background | `bg-white hover:bg-gray-50` | `dark:bg-gray-900 dark:hover:bg-gray-800` |
| `DomainCard.tsx` | Sub-topic container | `border-l border-gray-100` | `dark:border-gray-800` |
| `TopicItem.tsx` | Hover background | `hover:bg-gray-50` | `dark:hover:bg-gray-800` |
| `TopicItem.tsx` | External link icon | `text-gray-300 group-hover:text-gray-500` | `dark:text-gray-600 dark:group-hover:text-gray-400` |
| `ResourceList.tsx` | Empty state | `text-gray-400` | `dark:text-gray-500` |

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit — `ui-store.ts` | `setTheme`, `toggleTheme` update state correctly | Direct store action calls, assert `getState().theme` |
| Unit — `ThemeToggle.tsx` | Renders correct icon for current theme, `aria-label` reflects opposite action | Render with `useUIStore` in light/dark, assert icon and label |
| Integration — `App.tsx` | Theme sync: store change → `<html>` class + localStorage | Mock localStorage, call `setTheme`, assert DOM class and storage value |
| Integration — FOUC prevention | Inline script reads localStorage and applies class before React | Mock localStorage, load page fresh (JSDOM), assert `<html>` has correct class before `createRoot` |
| Visual — all pages | No invisible/low-contrast elements in dark mode | Manual QA on Dashboard, Checklist, TopicDetail pages in dark mode |

## Rollback Plan

Revert is safe and additive-only:

1. **`index.css`**: Remove `@custom-variant dark` line — all `dark:` classes become no-ops
2. **`index.html`**: Remove inline `<script>` block from `<head>`
3. **`ThemeToggle.tsx`**: Delete file and remove import/usage from `AppLayout.tsx`
4. **`ui-store.ts`**: Remove `theme`, `setTheme`, `toggleTheme`, `getInitialTheme` — no other state depends on them
5. **All components**: Revert `dark:` class additions by deleting the lines — each is an independent additive change

## Open Questions

None — all decisions are scoped within the proposal and spec constraints.
