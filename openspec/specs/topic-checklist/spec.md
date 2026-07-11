# Topic Checklist Specification

## Purpose

Render the CLF-C02 exam domain/topic hierarchy as an interactive checklist with expandable tree navigation and per-item status toggling through `not_started` → `in_progress` → `completed`.

## Requirements

### Requirement: Load and display seed hierarchy

The system SHALL load the CLF-C02 domain/topic/ sub-topic tree from seed data on first visit. The hierarchy MUST reflect exactly four domains — Cloud Concepts (24%), Security and Compliance (30%), Cloud Technology and Services (34%), Billing/Pricing/Support (12%) — each with their official topics and sub-topics per the AWS CLF-C02 exam guide.

#### Scenario: Seed data renders complete hierarchy

- GIVEN the user opens the app for the first time
- WHEN the checklist screen loads
- THEN all four domains SHALL display with correct weights
- AND each domain SHALL be expandable to show its topics and sub-topics

#### Scenario: Stale seed data after Dexie upgrade

- GIVEN the seed data schema changes in a new version
- WHEN the app initializes
- THEN the system SHALL re-seed any missing or structurally changed records
- AND SHALL NOT duplicate existing records

### Requirement: Topic status lifecycle

Each topic and sub-topic MUST support a three-state status: `not_started` (default), `in_progress`, `completed`. Clicking a status badge SHALL cycle through the states in order: `not_started → in_progress → completed → not_started`. No state is terminal — the user SHALL be able to reset a topic to `not_started` from any state.

#### Scenario: Cycle status forward

- GIVEN a topic with `not_started` status
- WHEN the user clicks its status badge once
- THEN status advances to `in_progress`
- WHEN the user clicks again
- THEN status advances to `completed`

#### Scenario: Cannot cycle past completed or back

- GIVEN a topic with `completed` status
- WHEN the user clicks its status badge
- THEN status SHALL NOT change
- AND the UI SHALL display a visual indicator that no further transitions exist

### Requirement: Expandable tree navigation

The domain hierarchy MUST support expand and collapse. Domain-level rows SHALL act as collapsible groups. A SHALL indicator such as a chevron icon SHALL show whether a section is expanded or collapsed. Expanding a domain SHALL reveal its topics; expanding a topic SHALL reveal its sub-topics.

#### Scenario: Collapse remembers children state

- GIVEN a domain with three topics, two marked `completed`
- WHEN the user collapses and re-expands the domain
- THEN the `completed` status on those two topics SHALL persist
- AND all children SHALL render in their previous expand/collapse state

#### Scenario: Single-item domain with no sub-topics

- GIVEN a domain entry that has topics but no sub-topics under a topic
- WHEN the user expands that domain
- THEN topics render without further expand controls
- AND each topic still shows its status badge

### Requirement: Domain-level completion inference

A domain SHALL inherit the aggregate status from its children. A domain SHALL show `completed` when all its topics are `completed`. It SHALL show `in_progress` when at least one topic is not `not_started`. Otherwise it SHALL show `not_started`.

#### Scenario: Domain auto-marks completed

- GIVEN a domain with five topics
- WHEN the user marks the last remaining `not_started` topic as `in_progress`
- THEN the domain status SHALL become `in_progress`
- WHEN the user marks all five topics `completed`
- THEN the domain status SHALL become `completed`
