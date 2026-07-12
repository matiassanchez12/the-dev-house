# Proposal: Project Status Transition Guard

## Intent

`ProjectService::updateStatus()` currently writes any status to the database without checking if the transition is valid. The `ProjectStatus` enum already contains a correct transition matrix, but the service never uses it. This causes the failing test `ProjectStatusTest::test_invalid_transition_returns_validation_error`, where an invalid `completed → open` transition succeeds silently instead of returning a validation error.

## Scope

### In Scope
- Add `canTransitionTo` guard in `ProjectService::updateStatus()`
- Preserve existing controller exception-to-validation mapping

### Out of Scope
- User profile failures
- Wider status workflow redesign
- Backend CI changes
- Test changes (expectations are already correct)

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `app`: `ProjectService::updateStatus()` MUST validate status transitions using `ProjectStatus::canTransitionTo()` before persisting.

## Approach

Insert a guard clause at the start of `ProjectService::updateStatus()` that throws `\InvalidArgumentException` when the target status is not in the allowed transitions for the current status. The `ProjectStatusController` already catches this exception and maps it to a Laravel validation error on the `status` field.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/Services/ProjectService.php` | Modified | Add `canTransitionTo` check in `updateStatus()` (~3 lines) |
| `app/Http/Controllers/ProjectStatusController.php` | None | Catch block already correct, no changes needed |
| `app/Enums/ProjectStatus.php` | None | Transition matrix already correct |
| `tests/Feature/ProjectStatusTest.php` | None | Test expectation is correct, no changes needed |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| External callers rely on unvalidated transitions | Low | Grep confirmed no other `updateStatus()` callers during exploration |

## Rollback Plan

Revert the single commit adding the guard clause. The method returns to its previous behavior of accepting any status value.

## Dependencies

- None

## Success Criteria

- [ ] `ProjectStatusTest::test_invalid_transition_returns_validation_error` passes
- [ ] All other `ProjectStatusTest` assertions continue to pass
- [ ] Valid transitions (e.g., `open → in_progress`) still succeed
