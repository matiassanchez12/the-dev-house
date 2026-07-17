# Tasks: Notification Preferences by Category

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 320-420 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr-default |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Backend/data boundary: new table, model, service, request, helper fallback | PR 1 | Includes migration and unit coverage |
| 2 | UI/wiring boundary: profile edit, routes, form, type updates | PR 1 | Same PR; no chain needed |

## Phase 1: Foundation / Data Model

- [x] 1.1 Add a migration for `user_notification_settings` with `user_id` unique, `collaboration_emails` default true, and data seeding from `user_privacy_settings.email_notifications_enabled`.
- [x] 1.2 Create `app/Models/UserNotificationSetting.php` plus `database/factories/UserNotificationSettingFactory.php` with `DEFAULTS`, casts, fillable, and `user()` relation.
- [x] 1.3 Add `app/Services/UserNotificationService.php` and `app/Http/Requests/Profile/UpdateNotificationSettingsRequest.php` for `collaboration_emails` only.

## Phase 2: Core Implementation

- [x] 2.1 Update `app/Models/User.php` to add `notificationSetting()` and make `receivesOptionalEmailNotifications()` prefer new settings, then legacy privacy fallback, then true.
- [x] 2.2 Remove `email_notifications_enabled` from `app/Services/UserPrivacyService.php` and `app/Http/Requests/Profile/UpdatePrivacyRequest.php`; keep privacy updates scoped to visibility and phone.
- [x] 2.3 Extend `app/Http/Controllers/ProfileController.php` and `routes/web.php` with notification-settings hydration and `POST /profile/notifications` update handling.
- [x] 2.4 Keep `ProjectInvitationReceived`, `JoinRequestReceived`, `JoinRequestApproved`, and `JoinRequestRejected` gated through the shared optional-email helper only.

## Phase 3: UI Wiring

- [x] 3.1 Add `resources/js/pages/profile/partials/update-notification-settings-form.tsx` and render it from `resources/js/pages/profile/edit.tsx` as a separate card.
- [x] 3.2 Remove the collaboration email toggle from `resources/js/pages/profile/partials/update-privacy-form.tsx` and update `resources/js/types/index.ts` with `NotificationSetting`.
- [x] 3.3 Update `resources/js/pages/profile/edit.test.tsx` and `update-privacy-form.test.tsx` to reflect the new notification card and slimmer privacy form.

## Phase 4: Testing / Verification

- [x] 4.1 Add `tests/Unit/Services/UserNotificationServiceTest.php` and `tests/Unit/Models/UserNotificationSettingTest.php` for defaults, updates, and no-duplicate-row behavior.
- [x] 4.2 Update `tests/Feature/Privacy/PrivacySettingsTest.php` to assert the privacy form no longer owns the email toggle and the new notification section is hydrated.
- [x] 4.3 Update `tests/Feature/NotificationTest.php` and notification unit tests to cover legacy migration, fallback reads, optional mail suppression, and unchanged auth/security flows.

## Phase 5: Cleanup

- [x] 5.1 Mark `email_notifications_enabled` as deprecated in `app/Models/UserPrivacySetting.php` and remove stale assertions/copy once the new path is covered.
