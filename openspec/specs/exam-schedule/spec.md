# Exam Schedule Specification

## Purpose

Allow users to set an AWS CLF-C02 exam target date and visualize countdown and study pace against remaining time on the Dashboard.

## Requirements

### Requirement: Exam Date Persistence

The system SHALL persist an optional exam target date (YYYY-MM-DD string) in the Dexie `exam` table. The date SHALL survive page reload and browser restart. If no date is set, the system SHALL display an empty-state prompt ("Set your exam date"). The user SHALL be able to clear or change the date at any time.

#### Scenario: First-time date set

- GIVEN the user has never set an exam date
- WHEN the user selects a date via the date picker and confirms
- THEN the date SHALL be persisted in Dexie
- AND the empty-state prompt SHALL be replaced by the countdown display

#### Scenario: Clear existing date

- GIVEN the user has an exam date set
- WHEN the user invokes the clear action on the date picker
- THEN the date SHALL be removed from Dexie
- AND the empty-state prompt SHALL reappear

### Requirement: Countdown Display

When an exam date is set, the system SHALL display the number of full days remaining until midnight of that date. The countdown SHALL update reactively via `useLiveQuery`. If the exam date has passed, the system SHALL display "Exam was X days ago" where X is the elapsed days since the exam date. If the exam is today, the system SHALL display "Exam is today!".

#### Scenario: Countdown shows correct days remaining

- GIVEN the exam date is set to 30 days from today
- WHEN the Dashboard renders
- THEN the countdown SHALL display "30 days until exam"

#### Scenario: Exam date has passed

- GIVEN the exam date is 5 days in the past
- WHEN the Dashboard renders
- THEN the countdown SHALL display "Exam was 5 days ago"

#### Scenario: Exam is today

- GIVEN the exam date is set to today
- WHEN the Dashboard renders
- THEN the countdown SHALL display "Exam is today!"

### Requirement: Pace Tracker

When an exam date is set and topics exist, the system SHALL calculate and display:

- **Target pace**: `ceil(remaining topics / days remaining)` — topics per day needed to finish on time
- **Actual pace**: `ceil(completed topics / elapsed days since exam set)` — topics per day completed so far

If days remaining is zero, the system SHALL skip pace calculation and display "Exam is today!". If all topics are completed, the system SHALL display "All topics complete!" with a green success indicator. The system SHALL render a visual bar comparing actual pace (filled) against target pace (total). Color coding SHALL be: green if actual >= target, yellow if actual >= 90% of target, red if actual < 90% of target.

#### Scenario: Pace shows on track when ahead

- GIVEN the user has completed 10 of 50 topics over 10 elapsed days (1.0/day actual)
- AND the exam is 40 days away with 40 topics remaining (1.0/day needed)
- WHEN the PaceTracker renders
- THEN the bar SHALL be green
- AND SHALL display "1.0/day needed — 1.0/day actual — On track"

#### Scenario: Pace shows behind when behind

- GIVEN the user has completed 2 of 50 topics over 10 elapsed days (0.2/day actual)
- AND the exam is 40 days away with 48 topics remaining (1.2/day needed)
- WHEN the PaceTracker renders
- THEN the bar SHALL be red
- AND SHALL display "1.2/day needed — 0.2/day actual — Behind"

#### Scenario: Pace shows close (yellow) when slightly behind

- GIVEN the user has completed 8 of 50 topics over 10 elapsed days (0.8/day actual)
- AND the exam is 40 days away with 42 topics remaining (1.05/day needed)
- WHEN the PaceTracker renders
- THEN the bar SHALL be yellow
- AND SHALL display with a warning indicator

#### Scenario: All topics completed

- GIVEN the user has completed all topics
- AND an exam date is set
- WHEN the PaceTracker renders
- THEN it SHALL display "All topics complete!" with a green success indicator
- AND the pace bar SHALL show full fill

### Requirement: Dashboard Integration

The date picker, countdown badge, and pace tracker SHALL be placed on the Dashboard page below the existing overall progress ring. New components SHALL live under `src/components/exam/`. Data SHALL be provided by a new `useExamSchedule()` hook that reads from Dexie and computes all pace values via `useLiveQuery` for real-time reactivity.

#### Scenario: Empty state on first visit

- GIVEN the user opens the Dashboard
- AND no exam date has been set
- WHEN the page renders
- THEN the date picker SHALL show a "Set your exam date" prompt
- AND neither countdown badge nor pace tracker SHALL be visible
