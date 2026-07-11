# Resource Management Specification

## Purpose

Allow users to collect, organize, and manage study resources (links and notes) linked to specific topics. Support inline editing with type classification and validation.

## Requirements

### Requirement: Resource CRUD with topic FK

Each resource SHALL be linked to exactly one topic via `topicId`. The system MUST support full CRUD. Resources SHALL display grouped under their parent topic.

#### Scenario: Create resource and display under topic

- GIVEN the user is viewing a topic's detail area
- WHEN the user fills the resource form and submits
- THEN a new resource record SHALL persist in the `resource` store
- AND the resource SHALL appear under the topic's resource list immediately

#### Scenario: Delete resource removes from UI and DB

- GIVEN a topic has 3 linked resources
- WHEN the user deletes one resource
- THEN the resource SHALL be removed from the `resource` store
- AND the topic SHALL display only 2 resources

### Requirement: Resource type classification

Every resource MUST have a `resourceType` field chosen from a fixed enum: `video`, `article`, `practice_exam`, `aws_doc`, `note`, `flashcard`. The UI SHALL display a type selector with these exact six options.

#### Scenario: Valid type accepted

- GIVEN the user adds a resource
- WHEN the user selects `video` from the type selector
- THEN the resource SHALL be saved with `resourceType: "video"`

#### Scenario: Invalid type rejected

- GIVEN the user adds a resource
- WHEN the user attempts to enter a custom type not in the enum
- THEN the form SHALL reject the input
- AND SHALL display a validation error message

### Requirement: URL validation

When a resource has a non-empty `url` field, the system MUST validate it as a well-formed HTTP or HTTPS URL. Invalid URLs SHALL be rejected with an inline error message. The `url` field MAY be empty for resources of type `note`.

#### Scenario: Valid URL accepted

- GIVEN the user adds a resource of type `article`
- WHEN the URL `https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html` is entered
- THEN the resource SHALL be saved
- AND the URL SHALL be stored as provided

#### Scenario: Invalid URL rejected

- GIVEN the user adds a resource
- WHEN the URL `not-a-url` is entered
- THEN the system SHALL display "Enter a valid URL starting with http:// or https://"
- AND the resource SHALL NOT be saved

### Requirement: Note content size cap

Resources of type `note` MAY store free-text content. The content field SHALL be capped at 10,000 bytes (UTF-8). The UI SHALL display a remaining character count. Input beyond the limit SHALL be truncated or rejected.

#### Scenario: Note within limit

- GIVEN the user writes a note of 5,000 bytes
- WHEN the user saves
- THEN the note SHALL be persisted in full

#### Scenario: Note exceeds limit

- GIVEN the user writes a note of 12,000 bytes
- WHEN the user attempts to save
- THEN the system SHALL reject the save
- AND SHALL display "Note exceeds 10 KB limit. Please shorten it."

### Requirement: Inline editing

Resources SHALL support inline editing directly in the topic's resource list. Clicking a resource field SHALL convert it to an editable input. Pressing Enter or clicking outside SHALL save the change. Pressing Escape SHALL cancel the edit.

#### Scenario: Inline edit saves on blur

- GIVEN a resource with title "AWS Docs"
- WHEN the user clicks the title, edits to "AWS Documentation", and clicks outside the input
- THEN the resource SHALL be updated with the new title
- AND the input SHALL revert to display mode

#### Scenario: Inline edit cancels on Escape

- GIVEN a resource with title "AWS Docs"
- WHEN the user clicks the title, types "AWS Stuff", and presses Escape
- THEN the resource SHALL keep the original title "AWS Docs"
- AND the input SHALL revert to display mode without saving
