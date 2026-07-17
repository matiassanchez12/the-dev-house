# Proposal: Notification Preferences by Category

## Intent

Decouple notification preferences from privacy settings. Today, a single `email_notifications_enabled` flag on `user_privacy_settings` gates all optional emails, conflating two distinct domains. We need category-based rules so users can opt out of collaboration emails while still receiving mandatory auth/security emails.

## Scope

### In Scope
- Create `user_notification_settings` table (1:1 with `users`) with `collaboration_emails` boolean
- Backward-compatible migration that seeds new table from existing `email_notifications_enabled` values
- New `UserNotificationSetting` model and `UserNotificationService`
- New "Notification settings" UI section with `collaboration_emails` toggle
- Update optional notifications to check the new setting
- Deprecate `email_notifications_enabled` on `user_privacy_settings` (keep for one release)

### Out of Scope
- Granular per-event categories (invitation, join request, approval, rejection)
- Marketing or digest email categories
- Dropping the old column immediately
- Changes to mandatory auth/security email delivery

## Capabilities

### New Capabilities
- `user-notification-settings`: Dedicated notification preferences domain — model, service, migration, profile UI section, and API endpoint for updating `collaboration_emails`.

### Modified Capabilities
- None at the spec-requirement level. Notification delivery conditions change in implementation only.

## Approach

Create a normalized 1:1 `user_notification_settings` table starting with one category column: `collaboration_emails` (default `true`). Migrate existing `user_privacy_settings.email_notifications_enabled` values into it, creating rows for all users. Update `User::receivesOptionalEmailNotifications()` to prefer the new table with a fallback to the old column during the transition window. Move the toggle from the privacy form to a new notification settings section. Update `ProjectInvitationReceived`, `JoinRequestReceived`, `JoinRequestApproved`, and `JoinRequestRejected` notifications to respect the new setting. Mark the old column as deprecated in code comments.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/Models/User.php` | Modified | `receivesOptionalEmailNotifications()` reads new table |
| `app/Models/UserNotificationSetting.php` | New | 1:1 model with `collaboration_emails` |
| `app/Services/UserNotificationService.php` | New | Update notification preferences |
| `app/Notifications/ProjectInvitationReceived.php` | Modified | `via()` checks new setting |
| `app/Notifications/JoinRequest*.php` | Modified | `via()` checks new setting |
| `resources/js/pages/profile/partials/` | New/Modified | New notification form; remove toggle from privacy form |
| `database/migrations/` | New | Create table + data migration |
| `tests/` | Modified | Update test factories and assertions |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Users without privacy rows default incorrectly | Low | Migration creates rows for **all** users, defaulting to `true` |
| Missing test updates cause false positives | Med | Search-and-replace audit of all `email_notifications_enabled` references |
| Users can't find moved toggle | Med | Add clear navigation label; keep profile settings page structure |
| Scope creep to per-event categories | Med | Explicitly defer in proposal; code review gate |

## Rollback Plan

1. Revert migration (drop `user_notification_settings` table).
2. Restore `User::receivesOptionalEmailNotifications()` to read `privacySetting?->email_notifications_enabled`.
3. Restore toggle in privacy form.
4. Revert notification `via()` logic to old check.

## Dependencies

None.

## Success Criteria

- [ ] Every user has a `user_notification_settings` row after migration
- [ ] `collaboration_emails = false` suppresses optional collaboration emails
- [ ] Auth/security emails remain unconditional
- [ ] Privacy settings form no longer contains email notification toggle
- [ ] All existing and new tests pass
