# Proposal: Dark Mode Toggle

## Intent

The app has light mode only, with hardcoded light-mode Tailwind classes (`text-gray-*`, `bg-white`, `border-gray-200`, etc.). Users studying for CLF-C02 often work in low-light environments. A dark mode toggle eliminates eye strain, follows accessibility best practices, and meets user expectation for modern SPAs.

## Scope

### In Scope
- Sun/moon toggle button in the header area to switch light/dark themes
- System preference (`prefers-color-scheme`) as default on first visit
- User choice persisted across sessions (localStorage + Zustand)
- `dark:` prefix overrides on ALL existing light-mode Tailwind classes across every component
- Tailwind v4 `@custom-variant` config to switch `dark:` from `@media` to `.dark` class strategy
- Accessible toggle (keyboard, `aria-label`, screen-reader-friendly)

### Out of Scope
- CSS variable / CSS-only approach (tailwind `dark:` prefix only)
- Custom color scheme editor or theme picker beyond light/dark
- Target date, countdown, or study reminders
- Any backend or IndexedDB schema changes

## Capabilities

### New Capabilities
- `dark-mode`: Theme toggle and dark mode styling across the full app

### Modified Capabilities
- None — no spec-level behavior changes to existing capabilities (topic-checklist, progress-tracking, resource-management, local-persistence remain identical)

## Approach

1. **Tailwind v4 dark mode strategy**: Add `@custom-variant dark (&:where(.dark, .dark *));` in `index.css` to switch `dark:` from media-query to class-based matching.
2. **Theme state**: Add `theme: 'light' | 'dark'` to Zustand `ui-store.ts`. On init, read from `localStorage('clf-theme')`, fallback to `prefers-color-scheme`, then apply/remove `.dark` class on `<html>`.
3. **Toggle component**: New `ThemeToggle` component (sun/moon Lucide icons) placed in `AppLayout` header, next to the sidebar hamburger. Accessible `button` with `aria-label`.
4. **Dark class application**: In `App.tsx` (or `main.tsx` via `useEffect`), sync Zustand theme → `<html>.dark` on mount and on change. Persist to `localStorage` on every change.
5. **Dark overrides**: Add `dark:` prefixed variants to every light-mode class in all 11 components + 3 pages. Use `dark:bg-gray-900`, `dark:text-gray-100`, `dark:border-gray-700`, `dark:hover:bg-gray-800` etc.
6. **Hardcoded SVG colors**: Fix ProgressRing `<circle>` stroke attributes (`#e5e7eb`, `#2563eb`) to use Tailwind classes with `dark:` overrides or compute via CSS variable for the ring background.
7. **Brand colors**: Dark mode needs adjusted brand tones (`dark:text-brand-400`, `dark:bg-brand-900/20` etc.) for sufficient contrast.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/index.css` | Modified | Add `@custom-variant dark` + dark `@theme` overrides |
| `src/stores/ui-store.ts` | Modified | Add theme state + toggle action |
| `src/App.tsx` | Modified | Sync theme state → `<html>` class |
| `src/components/layout/AppLayout.tsx` | Modified | Add ThemeToggle in header; dark overrides |
| `src/components/layout/Sidebar.tsx` | Modified | `dark:` overrides |
| `src/components/checklist/DomainCard.tsx` | Modified | `dark:` overrides |
| `src/components/checklist/TopicItem.tsx` | Modified | `dark:` overrides |
| `src/components/checklist/StatusBadge.tsx` | Modified | `dark:` overrides (via `getStatusColor`) |
| `src/components/progress/ProgressBar.tsx` | Modified | `dark:` overrides |
| `src/components/progress/ProgressRing.tsx` | Modified | SVG stroke colors → Tailwind classes |
| `src/components/resources/ResourceForm.tsx` | Modified | `dark:` overrides |
| `src/components/resources/ResourceItem.tsx` | Modified | `dark:` overrides |
| `src/components/resources/ResourceList.tsx` | Modified | `dark:` overrides |
| `src/pages/DashboardPage.tsx` | Modified | `dark:` overrides |
| `src/pages/ChecklistPage.tsx` | Modified | `dark:` overrides |
| `src/pages/TopicDetailPage.tsx` | Modified | `dark:` overrides |
| `src/lib/utils.ts` | Modified | `getStatusColor()` needs `dark:` variants |
| `src/db/hooks.ts` | Unchanged | No DB changes needed |
| `tailwind.config.ts` | Unchanged | Tailwind v4 config is CSS-based |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Missed `dark:` overrides cause invisible text/broken contrast in some components | Medium | Systematic pass: search every `.tsx` for color classes, test each page in dark mode |
| Hardcoded SVG colors in ProgressRing break contrast | Low | Refactor to use Tailwind classes or `currentColor` with `dark:` variants |
| Flash of light mode on page load before React hydrates | Medium | Add inline `<script>` in `index.html` to read `localStorage` and apply `.dark` before paint |
| Radix UI Select portal content (rendered at `body`) doesn't inherit `.dark` | Medium | Style Radix content explicitly with `dark:` classes; or render portal inside element that carries `.dark` |

## Rollback Plan

- **Simple**: Remove `@custom-variant dark` from `index.css`, remove theme state from Zustand, revert `main.tsx` / `App.tsx` theme-sync effect, delete `ThemeToggle` component. All `dark:` classes are additive — removing them leaves light-mode intact.
- **Per-component**: Revert individual file changes. Each `dark:` prefix is a no-op without the `.dark` class on `<html>`, so partial rollback is safe.

## Dependencies

- None. Tailwind v4 supports `@custom-variant` natively. No new npm packages needed (Lucide sun/moon icons are likely already in the set — verify; if not, add `lucide-react` icons).

## Success Criteria

- [ ] Toggle button visible in header, switches between sun/moon icon
- [ ] Clicking toggle switches all UI to dark mode with no elements invisible or unreadable
- [ ] First visit respects `prefers-color-scheme` (test: toggle OS theme, clear localStorage, reload)
- [ ] Choice persists across page reloads and browser restarts
- [ ] No flash of light mode before React mounts (inline script in `index.html`)
- [ ] All 3 pages (Dashboard, Checklist, TopicDetail) render correctly in dark mode
- [ ] Keyboard accessible (Tab to toggle, Enter/Space activates)
- [ ] Screen reader announces state changes
