# Delta for Progress Tracking

## MODIFIED Requirements

### Requirement: Overall circular progress indicator

The system SHALL render a circular/ring progress indicator showing overall exam readiness. The indicator SHALL support two calculation modes, toggled by the user:

1. **Flat mode** (default): `completed topics ÷ total topics × 100` — each item has equal weight.
2. **Weighted mode**: `Σ(domain_ratio × domain_weight) / Σ(domain_weights) × 100` — each domain contributes at its CLF-C02 exam weight.

The active mode SHALL persist across page reloads via localStorage. The indicator SHALL re-render immediately when toggling modes. The per-domain progress bars SHALL remain unchanged in both modes.
(Previously: always-flat calculation with a single formula. The future-toggle note in the original spec is superseded.)

#### Scenario: Flat mode — overall calculation

- GIVEN the user has completed 15 out of 50 total topics
- WHEN the overall indicator renders in Flat mode
- THEN it SHALL display exactly 30%

#### Scenario: Weighted mode — overall calculation

- GIVEN Domain A (30% exam weight) has 10/10 topics completed
- AND Domain B (50% exam weight) has 0/10 topics completed
- AND Domain C (20% exam weight) has 0/10 topics completed
- WHEN the user switches to Weighted mode
- THEN the indicator SHALL display exactly 30% (30% × 1.0 + 50% × 0.0 + 20% × 0.0)

#### Scenario: Toggle between modes

- GIVEN the indicator displays in Flat mode
- WHEN the user clicks the Weighted toggle
- THEN the indicator SHALL recalculate and show the weighted percentage
- WHEN the user clicks the Flat toggle
- THEN the indicator SHALL return to the flat percentage

#### Scenario: Mode persists across reload

- GIVEN the user has selected Weighted mode
- WHEN the page is reloaded
- THEN the indicator SHALL render using Weighted mode

#### Scenario: First-time user defaults to Flat

- GIVEN no stored `progressMode` value exists in localStorage
- WHEN the indicator renders
- THEN the system SHALL use Flat mode

#### Scenario: Full completion in either mode

- GIVEN all topics across all domains are marked `completed`
- WHEN the overall indicator renders
- THEN it SHALL display 100% in both modes
- AND a congratulatory visual SHALL appear (e.g., checkmark or color change)
