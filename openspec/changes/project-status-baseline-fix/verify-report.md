# Verification Report: project-status-baseline-fix

## Verdict

- Scope-local implementation: PASS
- Archive readiness for this change: PASS WITH WARNINGS

The project status baseline fix is verified. The full suite remains red only because of the explicitly out-of-scope `Tests\Feature\UserProfileTest` failures.

## Evidence Commands

| Command | Outcome | Scope |
|---|---:|---|
| `php artisan test --filter=ProjectStatusTest` | PASS — 8 passed, 22 assertions | Scope-local |
| `php artisan test --filter='ProjectStatusTest::test_invalid_transition_returns_validation_error'` | PASS — 1 passed, 3 assertions | Scope-local invalid transition |
| `php artisan test --filter='ProjectStatusTest::test_creator_can_transition_from_completed_to_closed'` | PASS — 1 passed, 3 assertions | Scope-local valid transition |
| `./vendor/bin/pint --test app/Services/ProjectService.php` | PASS | Changed file formatting |
| `php artisan test` | FAIL — 2 failed, 406 passed, 1542 assertions | Out-of-scope failures only |

## Spec Compliance Matrix

| Scenario | Evidence | Status |
|---|---|---|
| Valid transition from `open` to `in_progress` succeeds | Covered by `ProjectStatusTest`; targeted suite passed | PASS |
| Valid transition to `closed` succeeds | `test_creator_can_transition_from_completed_to_closed` passed; targeted suite also covers `open -> closed` and `in_progress -> closed` | PASS |
| Invalid `completed -> open` transition returns validation error and preserves `completed` | `test_invalid_transition_returns_validation_error` passed | PASS |

## Design / Layering Check

| Check | Evidence | Status |
|---|---|---|
| Transition guard lives in service | `ProjectService::updateStatus()` normalizes current status and calls `$currentStatus?->canTransitionTo($newStatus)` before persistence | PASS |
| Controller remains thin | `ProjectStatusController` still authorizes, validates input shape, delegates to service, and maps `InvalidArgumentException` to `status` validation errors | PASS |
| Enum remains source of truth | `ProjectStatus::transitions()` / `canTransitionTo()` are unchanged and used by service | PASS |
| Apply-progress evidence exists | `openspec/changes/project-status-baseline-fix/apply-progress.md` contains TDD Cycle Evidence and verification notes | PASS |

## Out-of-Scope Full Suite Failures

`php artisan test` fails only in `Tests\Feature\UserProfileTest`, which the proposal marks out of scope:

- `profile shows techs sorted by proficiency`: `Undefined array key "years"` at `tests/Feature/UserProfileTest.php:203`
- `profile sends intermediate proficiency`: `Property [user.techs.0.proficiency] does not exist` at `tests/Feature/UserProfileTest.php:299`

These failures are unrelated to `ProjectService::updateStatus()` and project status transition validation.

## Issues

### CRITICAL

- None scope-local.

### WARNING

- Full suite remains red due to out-of-scope `UserProfileTest` failures.

### SUGGESTION

- Keep the out-of-scope profile failures tracked separately; do not expand this change beyond the project status baseline fix.
