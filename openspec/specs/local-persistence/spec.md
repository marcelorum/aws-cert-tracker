# Local Persistence Specification

## Purpose

Define the Dexie.js / IndexedDB schema for all domain entities, provide seed data loading on first visit, and expose reactive CRUD queries. The system MUST operate fully offline with no backend dependency.

## Requirements

### Requirement: Dexie schema definition

The system SHALL define a Dexie database named `CLFTrackerDB` with four object stores: `exam`, `domain`, `topic`, and `resource`. The schema SHALL define these indexes:

- `exam`: `++id, name`
- `domain`: `++id, examId, weight`
- `topic`: `++id, domainId, parentTopicId, status`
- `resource`: `++id, topicId, resourceType, url, createdAt`

The `status` field on `topic` SHALL default to `"not_started"`. The `createdAt` field on `resource` SHALL default to `Date.now()`.

#### Scenario: Schema creates on first open

- GIVEN the user opens the app for the first time
- WHEN Dexie initializes
- THEN all four object stores SHALL exist with the defined indexes
- AND the database version SHALL be set to 1

#### Scenario: Schema upgrade preserves data

- GIVEN the user has existing topic and resource data in version 1
- WHEN a schema migration to version 2 occurs
- THEN existing records SHALL be preserved
- AND a migration handler SHALL be defined for each version increment

### Requirement: Seed data loading

On first database initialization (empty database), the system SHALL insert the CLF-C02 seed data: one exam record, four domain records with correct weights, and all official topics and sub-topics. Seed data SHALL be defined as a static JSON file imported at build time.

#### Scenario: Seed data loads once

- GIVEN the database is empty
- WHEN the app initializes
- THEN the `exam` store SHALL contain 1 record
- AND the `domain` store SHALL contain 4 records
- AND the `topic` store SHALL contain the full set of CLF-C02 topics and sub-topics

#### Scenario: No re-seeding on subsequent visits

- GIVEN the user has used the app and modified topic statuses
- WHEN the app initializes again
- THEN the seed data SHALL NOT be re-inserted
- AND existing user data SHALL remain unchanged

### Requirement: Reactive CRUD queries

The system SHALL expose CRUD operations via Dexie's `liveQuery()` for automatic UI reactivity. Topic status updates MUST flow through Dexie transactions. Resource CRUD (add, edit, delete) SHALL use Dexie table methods with `returning` for the newly created record.

#### Scenario: Status update triggers live refresh

- GIVEN a topic with `not_started` status
- WHEN the app calls `updateTopicStatus(id, "in_progress")`
- THEN any `liveQuery` subscription on the `topic` table SHALL emit the updated record
- AND downstream progress calculations SHALL re-evaluate

#### Scenario: Concurrent writes do not corrupt

- GIVEN two rapid status update calls on different topics
- WHEN both transactions complete
- THEN both topics SHALL reflect their respective new statuses
- AND the database SHALL not produce duplicate or partial writes

### Requirement: Offline-only constraint

The system MUST NOT make any network requests for data operations. All reads and writes SHALL go exclusively to IndexedDB via Dexie. The system SHALL function identically when the browser is offline.

#### Scenario: No network on seed load

- GIVEN the app initializes with no network connectivity
- WHEN seed data loads from the bundled JSON
- THEN all seed records SHALL be present in IndexedDB
- AND no network errors SHALL be thrown
