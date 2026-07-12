# Tasks: Project Status Baseline Fix

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 10–25 (1 service guard + 1 existing regression test path + verification only) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr-default |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Enforce status transitions in `app/Services/ProjectService.php` and verify the existing `ProjectStatusTest` regression path | PR 1 | Base = current branch; one-file fix, no backend scope expansion |

## Phase 1: Service Guard

- [x] 1.1 Update `app/Services/ProjectService.php::updateStatus()` to reject invalid transitions with `ProjectStatus::canTransitionTo()` before `update()`.  
- [x] 1.2 Keep the method throwing `\InvalidArgumentException` so `app/Http/Controllers/ProjectStatusController.php` continues to convert it into a validation error.

## Phase 2: Regression Verification

- [x] 2.1 Run `php artisan test --filter ProjectStatusTest` and confirm `test_invalid_transition_returns_validation_error` now passes.
- [x] 2.2 Confirm the allowed path still works: `completed -> closed` remains successful in `ProjectStatusTest::test_creator_can_transition_from_completed_to_closed`.

## Phase 3: Full Validation

- [x] 3.1 Run `php artisan test` to verify no other project status behavior regressed.
- [x] 3.2 Review the diff for scope creep: only `app/Services/ProjectService.php` should change; user profile and unrelated backend failures stay out of scope.
