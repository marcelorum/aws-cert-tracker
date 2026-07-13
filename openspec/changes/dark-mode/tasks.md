# Tasks: Dark Mode

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~280–340 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Decision needed before apply | No |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation + ThemeToggle + class sync + all `dark:` overrides + tests | PR 1 | All additive, no chaining needed |

## Phase 1: Foundation

- [ ] 1.1 `src/index.css` — add `@custom-variant dark (&:where(.dark, .dark *));` after `@import "tailwindcss"`
- [ ] 1.2 `src/stores/ui-store.ts` — add `type Theme = 'light' | 'dark' | 'system'`, `theme` state, `setTheme`, `toggleTheme`, `getInitialTheme()` helper (reads localStorage → `prefers-color-scheme` → `'light'`)
- [ ] 1.3 `src/stores/ui-store.ts` — wrap store with Zustand `persist` middleware, key `'clf-theme'`, storage via `localStorage`, partialize only `theme` field
- [ ] 1.4 `index.html` — add inline `<script>` in `<head>` that reads `localStorage.getItem('clf-theme')`, falls back to `window.matchMedia('(prefers-color-scheme: dark)')`, applies/removes `dark` class on `<html>` before paint. Remove `bg-gray-50 text-gray-900` from `<body>` class.

## Phase 2: ThemeToggle Component

- [ ] 2.1 Create `src/components/layout/ThemeToggle.tsx` — button with Lucide `Sun`/`Moon` icon based on store theme, calls `toggleTheme` on click, `aria-label` reflects opposite action (`"Switch to light mode"` / `"Switch to dark mode"`), keyboard accessible
- [ ] 2.2 `src/components/layout/AppLayout.tsx` — import `ThemeToggle`, render in `<header>` before the `<h2>` heading, add `dark:` classes to header (`dark:bg-gray-900/80 dark:border-gray-700`)

## Phase 3: Class Sync & System Detection

- [ ] 3.1 `src/App.tsx` — add `useEffect` subscribing to `useUIStore((s) => s.theme)`, syncs `dark` class on `<html>` and writes to `localStorage.setItem('clf-theme', theme)`
- [ ] 3.2 `src/App.tsx` — add `useEffect` for `matchMedia('(prefers-color-scheme: dark)')` listener when theme is `'system'`, updates class on OS toggle

## Phase 4: Component Dark Overrides

- [ ] 4.1 `src/components/progress/ProgressRing.tsx` — replace hardcoded `stroke="#e5e7eb"` with `className="stroke-gray-200 dark:stroke-gray-700"`, replace `stroke="#2563eb"` with `className="stroke-brand-500 dark:stroke-brand-400"`, add `dark:text-gray-100` to percentage text, `dark:text-gray-400` to label
- [ ] 4.2 `src/components/progress/ProgressBar.tsx` — add `dark:bg-gray-700` to track `bg-gray-200`
- [ ] 4.3 `src/components/layout/Sidebar.tsx` — add `dark:` overrides for all `bg-white`/`bg-brand-50`/`hover:bg-gray-100`/`text-gray-*`/`border-gray-200` patterns, plus `dark:bg-black/50` for overlay, `dark:bg-brand-900/30 dark:text-brand-300` for active nav, `dark:text-brand-400` for brand title, `dark:text-gray-500` for footer
- [ ] 4.4 `src/components/checklist/StatusBadge.tsx` — add `dark:bg-gray-500` to `not_started` dot, add `dark:` variants to badge background/text colors per design table (status badges use `getStatusColor()` — either modify the function to accept dark mode or add `dark:` classes inline)
- [ ] 4.5 `src/components/checklist/DomainCard.tsx` — add `dark:` overrides to card border, card background, trigger hover, text colors, border-t divider, divide-y colors, sub-topic container border-l
- [ ] 4.6 `src/components/checklist/TopicItem.tsx` — add `dark:` overrides to hover background, text colors, external link icon colors
- [ ] 4.7 `src/components/resources/ResourceForm.tsx` — add `dark:` overrides to form container, all labels, select trigger, select portal content, select item hover, input borders, textarea borders, cancel button
- [ ] 4.8 `src/components/resources/ResourceItem.tsx` — add `dark:` overrides to edit container, viewing text, link colors, action button text, all border colors, notes text
- [ ] 4.9 `src/components/resources/ResourceList.tsx` — add `dark:divide-gray-700` to `divide-gray-100`, add `dark:text-gray-500` to empty state text
- [ ] 4.10 `src/pages/DashboardPage.tsx` — add `dark:` to page text colors, skeleton loading `bg-gray-200`, domain card backgrounds/borders, progress text, loading state elements
- [ ] 4.11 `src/pages/ChecklistPage.tsx` — add `dark:` to page text, skeleton loading, loading text
- [ ] 4.12 `src/pages/TopicDetailPage.tsx` — add `dark:` to page text, back button, loading text, resource section heading

## Phase 5: Testing

- [ ] 5.1 Unit tests for theme store — `setTheme` updates state, `toggleTheme` cycles light↔dark, `initTheme` respects localStorage, `initTheme` falls back to system preference, persistence round-trip via localStorage
- [ ] 5.2 Component test for ThemeToggle — renders Moon icon in light mode, renders Sun icon in dark mode, click calls toggleTheme, aria-label reflects opposite action, keyboard accessible (Enter/Space)
- [ ] 5.3 Integration test — App.tsx useEffect syncs store theme to `<html>` class and localStorage on toggle

## Phase 6: Verification

- [ ] 6.1 Visual check — navigate all 3 pages (Dashboard, Checklist, TopicDetail) in light mode, then dark mode — verify no invisible or low-contrast elements
- [ ] 6.2 FOUC check — set dark mode, reload page, verify no flash of light mode before paint
- [ ] 6.3 System preference — set theme to `'system'`, toggle OS dark mode, verify app follows without manual toggle
