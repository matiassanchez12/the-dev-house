# Verification Report

**Change**: notification-preferences-by-category  
**Version**: N/A  
**Mode**: Strict TDD  
**Artifact store mode**: OpenSpec  
**Verified at**: 2026-07-14

## Executive Summary

The remediation pass resolved the prior verification blockers: `apply-progress.md` now exists with Strict TDD evidence, targeted change tests pass, `npx tsc --noEmit` passes, `npm run build` passes, and all six spec scenarios now have direct passing runtime coverage. The only remaining red gate is the known unrelated full-suite `php artisan test` failure in project image/storage tests; because the required runner exits non-zero, the final Strict TDD verdict remains **FAIL**.

## Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 14 |
| Tasks complete | 14 |
| Tasks incomplete | 0 |
| Proposal/spec/design/tasks present | Yes |
| Apply-progress present | Yes |

## Build & Tests Execution

**Build**: ✅ Passed

```text
Command: npm run build
Result: PASS

vite v7.3.3 building client environment for production...
✓ 4197 modules transformed.
✓ built in 6.24s
```

**Backend tests**: ❌ Failed full suite; ✅ targeted change suite passed

```text
Command: php artisan test
Result: FAIL
Tests: 5 failed, 487 passed (1871 assertions)

Failing tests:
- Tests\Unit\Services\ProjectServiceTest > update handles remove images
- Tests\Unit\Services\ProjectServiceTest > delete removes images from storage
- Tests\Feature\ProjectTest > creator can view edit form
- Tests\Feature\ProjectTest > update only deletes images owned by project
- Tests\Feature\ProjectTest > delete images guard rejects unsafe paths

Failure evidence points to existing project image/storage expectations, e.g.
Found unexpected file or directory at path [projects/...jpg], and one URL mismatch:
expected http://localhost:10000/storage/projects/edit-image.jpg, actual /storage/projects/edit-image.jpg.
```

```text
Command: php artisan test tests/Unit/Models/UserNotificationSettingTest.php tests/Unit/Models/UserTest.php tests/Unit/Services/UserNotificationServiceTest.php tests/Unit/Notifications/ProjectInvitationReceivedTest.php tests/Feature/Database/UserNotificationSettingsMigrationTest.php tests/Feature/Privacy/PrivacySettingsTest.php tests/Feature/NotificationTest.php tests/Feature/Auth/PasswordResetTest.php
Result: PASS
Tests: 61 passed (179 assertions)
```

**Frontend tests**: ✅ Passed

```text
Command: npm test
Result: PASS
Test Files: 27 passed (27)
Tests: 78 passed (78)
```

**Type checking**: ✅ Passed

```text
Command: npx tsc --noEmit
Result: PASS
```

**Coverage**: ➖ Not available

```text
php -m did not show Xdebug or PCOV. package.json has no frontend coverage script.
Changed-file coverage was skipped because no coverage tool is available.
```

## TDD Compliance

| Check | Result | Details |
|-------|--------|---------|
| TDD Evidence reported | ✅ | `apply-progress.md` contains a TDD Cycle Evidence table. |
| All tasks have tests | ✅ | 14/14 task slices map to test files or type/build cleanup evidence. |
| RED confirmed (tests exist) | ✅ | Referenced PHP and Vitest test files exist. |
| GREEN confirmed (tests pass) | ✅ | All related targeted PHP tests pass; all Vitest tests pass. Full PHP suite failure is unrelated to this change. |
| Triangulation adequate | ✅ | Multi-scenario requirements have multiple runtime tests; cleanup task is correctly marked single-path. |
| Safety Net for modified files | ✅ | Apply-progress reports related pre-existing safety-net runs for modified areas. |

**TDD Compliance**: 6/6 checks passed for the notification-preferences change scope.

## Test Layer Distribution

| Layer | Tests | Files | Tools |
|-------|-------|-------|-------|
| Unit | 14 | 4 | PHPUnit |
| Integration | 55 | 7 | PHPUnit, Vitest + React Testing Library |
| E2E | 0 | 0 | Not configured |
| **Total** | **69 related tests** | **11 files** | |

Related files counted:
- `tests/Unit/Models/UserNotificationSettingTest.php`
- `tests/Unit/Models/UserTest.php`
- `tests/Unit/Services/UserNotificationServiceTest.php`
- `tests/Unit/Notifications/ProjectInvitationReceivedTest.php`
- `tests/Feature/Database/UserNotificationSettingsMigrationTest.php`
- `tests/Feature/Privacy/PrivacySettingsTest.php`
- `tests/Feature/NotificationTest.php`
- `tests/Feature/Auth/PasswordResetTest.php`
- `resources/js/pages/profile/edit.test.tsx`
- `resources/js/pages/profile/partials/update-notification-settings-form.test.tsx`
- `resources/js/pages/profile/partials/update-privacy-form.test.tsx`

## Changed File Coverage

Coverage analysis skipped — no PHP coverage driver detected and no frontend coverage script is configured.

## Assertion Quality

**Assertion quality**: ✅ All reviewed related assertions verify real behavior.

Notes:
- No tautologies like `expect(true).toBe(true)` or `assertTrue(true)` were found in related changed tests.
- No ghost loops were found in related changed tests.
- Frontend tests assert rendered labels/state and Inertia submission wiring, not only smoke rendering.

## Quality Metrics

**Linter**: ➖ Not available (`package.json` has no lint script)  
**Type Checker**: ✅ `npx tsc --noEmit` passed  
**Build**: ✅ `npm run build` passed

## Spec Compliance Matrix

| Requirement | Scenario | Runtime evidence | Result |
|-------------|----------|------------------|--------|
| Dedicated notification preferences are stored separately from privacy settings | User opens notification settings | `PrivacySettingsTest::test_profile_edit_hydrates_default_notification_setting_true`; `edit.test.tsx`; `update-notification-settings-form.test.tsx`; targeted PHPUnit and Vitest passed | ✅ COMPLIANT |
| Dedicated notification preferences are stored separately from privacy settings | Privacy settings no longer own the email toggle | `update-privacy-form.test.tsx` asserts `queryByText(/recibir emails opcionales de colaboración/i)` is absent; `update-privacy-form.tsx` renders only privacy/contact fields; Vitest passed | ✅ COMPLIANT |
| Collaboration emails can be enabled or disabled | User disables collaboration emails | `PrivacySettingsTest::test_authenticated_user_can_update_notification_settings`; `NotificationTest` skip-mail cases for received/approved/rejected join requests; `ProjectInvitationReceivedTest::test_project_invitation_received_skips_mail_when_user_disables_optional_emails`; targeted PHPUnit passed | ✅ COMPLIANT |
| Collaboration emails can be enabled or disabled | Mandatory emails are unaffected | `PasswordResetTest::test_reset_password_link_is_sent_when_optional_collaboration_emails_are_disabled` creates `collaboration_emails=false` and asserts `ResetPassword` is sent; targeted PHPUnit passed | ✅ COMPLIANT |
| Existing email notification data is preserved during migration | Legacy false value is migrated | `UserNotificationSettingsMigrationTest::test_legacy_false_value_is_migrated_to_collaboration_emails_false`; targeted PHPUnit passed | ✅ COMPLIANT |
| Existing email notification data is preserved during migration | Missing legacy data defaults to enabled | `UserNotificationSettingsMigrationTest::test_missing_legacy_privacy_row_defaults_to_enabled`; targeted PHPUnit passed | ✅ COMPLIANT |

**Compliance summary**: 6/6 scenarios compliant.

## Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| Dedicated storage | ✅ Implemented | `user_notification_settings` migration creates unique `user_id` and `collaboration_emails` default true; `UserNotificationSetting` model and factory exist. |
| Separate service/request endpoint | ✅ Implemented | `UserNotificationService`, `UpdateNotificationSettingsRequest`, `ProfileController::updateNotificationSettings`, and `POST /profile/notifications` exist. |
| Prefer new setting with legacy fallback | ✅ Implemented | `User::receivesOptionalEmailNotifications()` checks `notificationSetting`, then legacy `privacySetting.email_notifications_enabled`, then true. |
| Privacy updates scoped away from notification settings | ✅ Implemented | `UserPrivacyService` and `UpdatePrivacyRequest` no longer accept `email_notifications_enabled`. |
| Optional collaboration notifications respect preference | ✅ Implemented | `ProjectInvitationReceived`, `JoinRequestReceived`, `JoinRequestApproved`, and `JoinRequestRejected` gate `mail` through `receivesOptionalEmailNotifications()`. |
| UI has separate notification card | ✅ Implemented | `UpdateNotificationSettingsForm` is rendered from `profile/edit.tsx`. |
| Legacy privacy field deprecated | ✅ Implemented | `UserPrivacySetting` and TypeScript `PrivacySetting` mark `email_notifications_enabled` as deprecated. |

## Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| Create `UserNotificationSetting` with `collaboration_emails` defaulting true | ✅ Yes | Model, factory, migration, and service match the design. |
| Transition reads prefer notification setting, fallback to privacy, then true | ✅ Yes | Implemented in `User::receivesOptionalEmailNotifications()`. |
| Add separate `UpdateNotificationSettingsForm` card on profile edit | ✅ Yes | Implemented and rendered after privacy/contact card. |
| Add dedicated request/service/profile route | ✅ Yes | `UpdateNotificationSettingsRequest`, `UserNotificationService`, and route exist. |
| Migration seeds all users from legacy privacy values | ✅ Yes | Migration left-joins `user_privacy_settings`; missing rows default to true. |

## Issues Found

### CRITICAL

1. Required full backend runner remains red: `php artisan test` exits non-zero with 5 failures in pre-existing project image/storage tests. This is the only remaining failed gate and does not appear related to the notification-preferences implementation.

### WARNING

1. Changed-file coverage was skipped because no PHP coverage driver was detected and no frontend coverage script is configured.

### SUGGESTION

1. Track the unrelated project image/storage failures separately so this change can be archived once the required full-suite gate is green or an explicit waiver is granted.

## Verdict

FAIL

The notification-preferences change itself is complete, coherent, and covered by passing targeted runtime tests for all spec scenarios. Strict verification still fails because the required `php artisan test` command exits non-zero due the known unrelated project image/storage test failures.
