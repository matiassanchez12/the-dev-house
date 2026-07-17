# Apply Progress: notification-preferences-by-category

**Mode**: Strict TDD
**Artifact store mode**: OpenSpec
**Status**: All planned tasks implemented; verification still has unrelated project/image failures in the full PHP suite.

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1.1 | `tests/Feature/Database/UserNotificationSettingsMigrationTest.php` | Integration | ✅ Related migration tests were already green | ✅ Written | ✅ Passed | ✅ 2 scenarios | ✅ Clean |
| 1.2 | `tests/Unit/Models/UserNotificationSettingTest.php` | Unit | ✅ Related model tests were already green | ✅ Written | ✅ Passed | ✅ Default + factory | ✅ Clean |
| 1.3 | `tests/Unit/Services/UserNotificationServiceTest.php` | Unit | ✅ Related service tests were already green | ✅ Written | ✅ Passed | ✅ Multiple update paths | ✅ Clean |
| 2.1 | `tests/Unit/Models/UserTest.php` | Unit | ✅ Related model tests were already green | ✅ Written | ✅ Passed | ✅ Legacy fallback + default true | ✅ Clean |
| 2.2 | `tests/Unit/Services/UserPrivacyServiceTest.php` / `tests/Feature/Privacy/PrivacySettingsTest.php` | Unit + Integration | ✅ Related privacy tests were already green | ✅ Written | ✅ Passed | ✅ Privacy-only updates + hydration | ✅ Clean |
| 2.3 | `tests/Feature/Privacy/PrivacySettingsTest.php` | Integration | ✅ Related profile hydration tests were already green | ✅ Written | ✅ Passed | ✅ Update route + edit hydration | ✅ Clean |
| 2.4 | `tests/Feature/NotificationTest.php` | Integration | ✅ Related notification tests were already green | ✅ Written | ✅ Passed | ✅ Optional mail suppression cases | ✅ Clean |
| 3.1 | `resources/js/pages/profile/edit.test.tsx` / `resources/js/pages/profile/partials/update-notification-settings-form.test.tsx` | Integration | ✅ Existing profile UI tests were already green | ✅ Written | ✅ Passed | ✅ Separate notification card + form submit | ✅ Clean |
| 3.2 | `resources/js/pages/profile/partials/update-privacy-form.test.tsx` | Integration | ✅ Existing privacy form tests were already green | ✅ Written | ✅ Passed | ✅ Toggle removed from privacy form | ✅ Clean |
| 3.3 | `resources/js/pages/profile/edit.test.tsx` / `resources/js/pages/profile/partials/*.test.tsx` | Integration | ✅ Existing frontend tests were already green | ✅ Written | ✅ Passed | ✅ Multiple render/update paths | ✅ Clean |
| 4.1 | `tests/Unit/Models/UserNotificationSettingTest.php` / `tests/Unit/Services/UserNotificationServiceTest.php` | Unit | ✅ Existing unit coverage was already green | ✅ Written | ✅ Passed | ✅ Defaults + no-duplicate-row behavior | ✅ Clean |
| 4.2 | `resources/js/pages/profile/partials/update-privacy-form.test.tsx` / `tests/Feature/Privacy/PrivacySettingsTest.php` | Integration | ✅ Existing privacy coverage was already green | ✅ Written | ✅ Passed | ✅ Explicit absence assertion added | ✅ Clean |
| 4.3 | `tests/Feature/Auth/PasswordResetTest.php` / `tests/Feature/NotificationTest.php` | Integration | ✅ Existing auth/notification coverage was already green | ✅ Written | ✅ Passed | ✅ Optional emails disabled does not affect auth/security mail | ✅ Clean |
| 5.1 | `resources/js/types/index.ts` / `app/Models/UserPrivacySetting.php` | Unit/Type | ✅ Type coverage already green after cleanup | ✅ Written | ✅ Passed | ➖ Single cleanup path | ✅ Clean |

## Test Summary

- **Total tests written**: 14 task slices, 5 updated test files, 1 build config fix
- **Total tests passing**: `php artisan test` = 487 passed, 5 unrelated failures; targeted PHP/Vitest files pass; `npx tsc --noEmit` passes; `npm run build` passes
- **Layers used**: Unit, Integration
- **Approval tests**: None
- **Pure functions created**: 0

## Notes

- Added direct coverage for the two missing spec scenarios: privacy no longer owns the collaboration email toggle, and auth/security email delivery is unaffected when `collaboration_emails=false`.
- The remaining full-suite PHP failures are in `ProjectServiceTest` / `ProjectTest` and do not appear related to this notification-preferences change.
