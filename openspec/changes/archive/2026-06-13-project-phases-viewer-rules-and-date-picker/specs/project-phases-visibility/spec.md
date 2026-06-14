# project-phases-visibility Specification

## Purpose

Define how the project phases section behaves based on the backend-provided viewer role on the project show page.

## Requirements

### Requirement: Backend viewer role in show payload

The system MUST include `viewer_role` in the project show payload for every request that renders a project show page. `viewer_role` MUST be derived on the server and MUST indicate the current viewer as `guest`, `creator`, or `member`.

#### Scenario: guest payload

- GIVEN the viewer is not the project creator or a participant
- WHEN the project show page is rendered
- THEN the payload MUST expose `viewer_role=guest`

#### Scenario: creator payload

- GIVEN the authenticated user is the project creator
- WHEN the project show page is rendered
- THEN the payload MUST expose `viewer_role=creator`

#### Scenario: member payload

- GIVEN the authenticated user participates in the project but does not own it
- WHEN the project show page is rendered
- THEN the payload MUST expose `viewer_role=member`

### Requirement: Role-aware phases section visibility

The system MUST render the phases section according to `viewer_role` and the current phase list.

#### Scenario: guest with phases sees only the list

- GIVEN `viewer_role=guest`
- AND the project has at least one phase
- WHEN the project show page is rendered
- THEN the phases list MUST be visible
- AND create/edit controls MUST be hidden

#### Scenario: guest with no phases sees no section

- GIVEN `viewer_role=guest`
- AND the project has no phases
- WHEN the project show page is rendered
- THEN the phases section MUST not be shown

#### Scenario: creator retains full control

- GIVEN `viewer_role=creator`
- WHEN the project show page is rendered
- THEN the phases list, create form, and item actions MUST be visible

### Requirement: Role-specific empty state copy

When the project has no phases, the system MUST show a creator-specific empty state to creators and a member-specific empty state to members. Guests with no phases MUST not see an empty state section.

#### Scenario: member empty state

- GIVEN `viewer_role=member`
- AND the project has no phases
- WHEN the phases section is rendered
- THEN the member empty state copy MUST be shown
- AND the create form MUST remain hidden

#### Scenario: creator empty state

- GIVEN `viewer_role=creator`
- AND the project has no phases
- WHEN the phases section is rendered
- THEN the creator empty state copy MUST be shown
- AND the create form MUST remain available
