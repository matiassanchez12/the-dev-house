# Delta for App

## MODIFIED Requirements

### Requirement: Project status transition validation

The system MUST validate project status changes before persisting them. `ProjectService::updateStatus()` SHALL allow only transitions permitted by the current `ProjectStatus` state and MUST reject disallowed transitions with validation-style feedback on the `status` field.

Allowed transitions SHALL be:
- `open` → `in_progress`, `closed`
- `in_progress` → `completed`, `closed`
- `completed` → `closed`
- `closed` → none

(Previously: status updates were persisted without checking whether the transition was allowed.)

#### Scenario: valid transition from open succeeds

- GIVEN a project with status `open`
- WHEN the creator updates status to `in_progress`
- THEN the project status is persisted as `in_progress`
- AND no validation errors are returned

#### Scenario: valid transition to closed succeeds

- GIVEN a project with status `in_progress`
- WHEN the creator updates status to `closed`
- THEN the project status is persisted as `closed`
- AND no validation errors are returned

#### Scenario: invalid transition is rejected with validation feedback

- GIVEN a project with status `completed`
- WHEN the creator updates status to `open`
- THEN the request fails with a validation error on `status`
- AND the project remains `completed`
