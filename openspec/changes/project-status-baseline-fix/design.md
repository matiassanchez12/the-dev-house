# Design: Project Status Transition Guard

## Technical Approach

Add the missing state-machine guard inside `ProjectService::updateStatus()` before persisting the new status. The controller already validates that the submitted value is a known `ProjectStatus` value and already converts `\InvalidArgumentException` into a field-level validation error, so the fix should stay focused on enforcing the business transition rule in the service.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|----------|--------|-------------------------|-----------|
| Guard location | Put transition validation in `ProjectService::updateStatus()` | Duplicate transition checks in `ProjectStatusController`; add a new validator/request object | The service owns project business logic in this codebase. Keeping the guard there protects every current or future caller, while the controller remains thin: authorize, validate input shape, call service, return response. |
| Transition source | Use `$currentStatus->canTransitionTo($newStatus)` | Rebuild the matrix in the service or controller; hard-code only the failing `completed → open` case | `ProjectStatus` already defines the canonical transition matrix through `transitions()` and `canTransitionTo()`. Reusing it avoids drift and fixes all invalid transitions consistently, not just the failing test case. |
| Controller/test scope | Avoid controller and test changes unless implementation reveals a mismatch | Change error handling or rewrite tests around the new guard | `ProjectStatusController` already catches `\InvalidArgumentException` and maps it to `status` validation errors. `ProjectStatusTest::test_invalid_transition_returns_validation_error` is correct; the failing behavior is service drift, not a stale expectation. |

## Data Flow

```text
PATCH /projects/{project}/status
  └─ ProjectStatusController::update()
       ├─ Gate::authorize('updateStatus', $project)
       ├─ validate status is one of ProjectStatus::values()
       └─ ProjectService::updateStatus($project, $newStatus)
            ├─ normalize current status to ProjectStatus
            ├─ reject if ! $currentStatus->canTransitionTo($newStatus)
            └─ persist allowed status
```

Invalid transitions throw `\InvalidArgumentException`; the existing controller catch block turns that into `ValidationException::withMessages(['status' => ...])`.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `app/Services/ProjectService.php` | Modify | Add the transition guard in `updateStatus()` before `$project->update(...)`. |
| `app/Http/Controllers/ProjectStatusController.php` | No change | Existing exception-to-validation mapping already matches the needed behavior. |
| `app/Enums/ProjectStatus.php` | No change | Existing transition matrix and `canTransitionTo()` are the source of truth. |
| `tests/Feature/ProjectStatusTest.php` | No change expected | Existing assertions already cover valid transitions, invalid transition rejection, authorization, and guests. |

## Interfaces / Contracts

`ProjectService::updateStatus(Project $project, ProjectStatus $newStatus): void` keeps the same signature and exception contract. Implementation should follow this shape:

```php
if (! $currentStatus->canTransitionTo($newStatus)) {
    throw new \InvalidArgumentException('Invalid project status transition.');
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Feature | Valid status transitions still persist | Existing `ProjectStatusTest` valid transition cases. |
| Feature | Invalid transition returns a validation error and does not persist | Existing `test_invalid_transition_returns_validation_error`. |
| Unit | Enum transition matrix | No new test required; behavior is exercised through the service-backed feature tests. |

## Migration / Rollout

No migration required. This is a server-side business rule fix with no schema, route, or UI contract changes.

## Open Questions

- [ ] None.
