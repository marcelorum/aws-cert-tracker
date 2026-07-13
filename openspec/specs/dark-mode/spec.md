# Dark Mode Specification

## Purpose

Define how the app SHALL support light/dark/system theme toggling with persistent user preference, flash-of-unstyled-content (FOUC) prevention, and dark mode styling applied to all existing components.

## Requirements

### Requirement: Theme Preference Persistence

The user's theme choice SHALL persist across sessions via `localStorage` under key `clf-theme`. When no stored preference exists, the system SHALL default to the OS-level preference via `prefers-color-scheme`. The system MUST NOT use Dexie or IndexedDB — theme state is UI-only.

#### Scenario: Persistence across page reload

- GIVEN the user toggles to dark mode
- WHEN the page is reloaded
- THEN the app SHALL render in dark mode
- AND the stored preference SHALL be unchanged

#### Scenario: System preference as default

- GIVEN no stored theme preference exists
- AND `prefers-color-scheme: dark` is active
- WHEN the app initializes
- THEN the app SHALL render in dark mode
- AND the toggle SHALL reflect the dark state

### Requirement: Theme Toggle UI

The system SHALL render a `<button>` in the AppLayout header area. It SHALL display a Lucide `Sun` icon when dark mode is active (indicating "switch to light") and a Lucide `Moon` icon when light mode is active (indicating "switch to dark"). The button SHALL be keyboard-accessible (Tab to focus, Enter/Space to activate) and SHALL include an `aria-label` that describes the current action (e.g. `"Switch to light mode"` / `"Switch to dark mode"`).

#### Scenario: Toggle from light to dark

- GIVEN the app is in light mode
- WHEN the user clicks the toggle or presses Enter/Space while focused
- THEN the `<html>` element SHALL receive the `dark` class
- AND the icon SHALL change to `Sun`
- AND the `aria-label` SHALL read "Switch to light mode"

#### Scenario: Toggle from dark to light

- GIVEN the app is in dark mode
- WHEN the user activates the toggle
- THEN the `dark` class SHALL be removed from `<html>`
- AND the icon SHALL change to `Moon`
- AND the `aria-label` SHALL read "Switch to dark mode"

### Requirement: Theme Application

The system SHALL apply the `dark` class to `<html>` when dark mode is active. Tailwind v4 SHALL use `@custom-variant dark (&:where(.dark, .dark *))` in `index.css` for class-based matching. All existing light-mode classes SHALL remain — dark overrides SHALL be additive only. Components SHALL receive `dark:` prefixed variants per the color mapping below.

#### Scenario: Color overrides render correctly

- GIVEN the app is in dark mode
- WHEN the user navigates through all pages (Dashboard, Checklist, TopicDetail)
- THEN every background, card, text, and border SHALL apply its `dark:` override
- AND no element SHALL have invisible or low-contrast text

#### Color Override Table

| Element | Light | Dark |
|---|---|---|
| Page background | `bg-gray-50` | `dark:bg-gray-950` |
| Card/surface | `bg-white` | `dark:bg-gray-900` |
| Card border | `border-gray-200` | `dark:border-gray-700` |
| Primary text | `text-gray-900` | `dark:text-gray-100` |
| Secondary text | `text-gray-500` | `dark:text-gray-400` |
| Sidebar background | `bg-white` | `dark:bg-gray-900` |
| Sidebar border | `border-gray-200` | `dark:border-gray-700` |

### Requirement: Flash Prevention

The system SHALL include an inline `<script>` in `index.html` that reads `localStorage.getItem("clf-theme")` and applies the `dark` class to `<html>` synchronously inside `<head>`, before React hydrates or the browser paints. This MUST prevent a flash of light mode on return visits when the user prefers dark.

#### Scenario: No FOUC on page load

- GIVEN the user has dark mode preference stored
- WHEN the HTML page loads
- THEN the `<html>` element SHALL carry the `dark` class before the first paint
- AND no flash of light mode SHALL be visible during load
