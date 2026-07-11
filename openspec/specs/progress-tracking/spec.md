# Progress Tracking Specification

## Purpose

Visualize study progress as weighted per-domain progress bars and a circular overall indicator, with real-time reactivity to topic status changes.

## Requirements

### Requirement: Per-domain weighted progress bar

Each domain SHALL render a horizontal progress bar. The bar SHALL reflect the proportion of completed topics within that domain, weighted equally per topic (each topic contributes 1/N where N is the total topics in that domain). Sub-topics SHALL be treated as independent items with equal weight.

#### Scenario: Partial domain progress

- GIVEN Cloud Concepts domain has 4 topics and 6 sub-topics (10 total items)
- WHEN the user marks 3 items as `completed`
- THEN the domain progress bar SHALL display exactly 30% fill

#### Scenario: Domain with zero topics

- GIVEN a domain entry with no topics and no sub-topics
- WHEN the checklist renders
- THEN the progress bar SHALL render at 0%
- AND SHALL display a visual empty state (e.g., "No topics" label)

### Requirement: Overall circular progress indicator

The system SHALL render a circular/ring progress indicator showing overall exam readiness. The indicator SHALL calculate progress as `completed topics ÷ total topics × 100`, treating every topic and sub-topic as an independent item with equal weight.

#### Scenario: Overall progress calculation

- GIVEN the user has completed 15 out of 50 total topics
- WHEN the overall indicator renders
- THEN it SHALL display exactly 30%

> **Note**: A future toggle will switch between this topic-based mode and a domain-weighted mode (`Σ(domain_ratio × domain_weight) / Σ(domain_weights) × 100`). See Backlog in README.

#### Scenario: Full completion

- GIVEN the user marks all topics across all four domains as `completed`
- WHEN the overall indicator renders
- THEN it SHALL display 100%
- AND a congratulatory visual SHALL appear (e.g., checkmark or color change)

### Requirement: Reactive progress updates

Progress indicators SHALL react immediately when topic status changes. No manual refresh or page reload SHALL be required. The system MUST use Dexie's reactive `liveQuery` API to subscribe to topic status changes and recalculate progress.

#### Scenario: Multiple rapid toggles

- GIVEN the user rapidly clicks three topic statuses in succession
- WHEN each click completes
- THEN the progress bars SHALL update after each toggle
- AND SHALL reflect the final state without flickering or stale intermediate values

#### Scenario: Progress persists across reload

- GIVEN the user has completed 60% of topics
- WHEN the page is reloaded
- THEN the progress indicators SHALL render at exactly 60%
- AND SHALL match the persisted Dexie status values
