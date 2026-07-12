# Apply Progress: Project Status Baseline Fix

## Summary

- Added the missing transition guard in `ProjectService::updateStatus()`
- Reused `ProjectStatus::canTransitionTo()` instead of duplicating state-machine rules
- Preserved the controller's existing `InvalidArgumentException` → validation error mapping

## TDD Cycle Evidence

| Scope | Red | Green | Refactor |
|---|---|---|---|
| Invalid transition regression | Captured baseline `ProjectStatusTest::test_invalid_transition_returns_validation_error` failing because the service accepted `completed -> open` without complaint | Verified the test passes after adding the service guard | Kept the fix inside the service so the controller stays thin |
| Valid transition safety net | Captured a valid transition check (`completed -> closed`) as a guardrail | Verified valid transitions still pass after the service change | No enum or controller refactor required |

## Files Changed

- `app/Services/ProjectService.php`

## Verification Notes

- `php artisan test --filter=ProjectStatusTest` passes (8 tests)
- Full suite still fails only on the out-of-scope `UserProfileTest` issues
