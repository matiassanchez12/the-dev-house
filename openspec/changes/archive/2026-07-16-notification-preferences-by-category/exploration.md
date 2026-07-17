## Exploration: notification-preferences-by-category

### Current State

Notification delivery is currently gated by a single global flag, `email_notifications_enabled`, stored on the `user_privacy_settings` table (1:1 with `users`).

- **Backend check**: `User::receivesOptionalEmailNotifications()` reads `privacySetting?->email_notifications_enabled ?? true`.
- **Optional emails** that respect this flag:
  - `ProjectInvitationReceived`
  - `JoinRequestReceived`
  - `JoinRequestApproved`
  - `JoinRequestRejected`
  Each of these skips the `mail` channel in `via()` when the flag is `false`.
- **Mandatory emails** (auth/security) such as email verification are sent via Laravel's built-in mechanisms and do **not** consult this flag.
- **UI**: The toggle lives inside the Profile Privacy form (`update-privacy-form.tsx`), grouped with visibility settings (show email, show phone, discoverability, activity).
- **Backend layers**: `UserPrivacyService` manages the row, and `UpdatePrivacyRequest` validates the field.

This conflates two distinct domains—**privacy** (who can see what on my profile) and **notifications** (which emails I want to receive).

### Affected Areas

- `app/Models/User.php` — `receivesOptionalEmailNotifications()` must source from the new notification domain.
- `app/Models/UserPrivacySetting.php` — `email_notifications_enabled` should be deprecated and later removed.
- `app/Services/UserPrivacyService.php` — must stop managing the notification flag.
- `app/Http/Requests/Profile/UpdatePrivacyRequest.php` — validation for the notification toggle should move out.
- `app/Notifications/ProjectInvitationReceived.php` — `via()` logic needs new category-based check.
- `app/Notifications/JoinRequestReceived.php` — same.
- `app/Notifications/JoinRequestApproved.php` — same.
- `app/Notifications/JoinRequestRejected.php` — same.
- `resources/js/pages/profile/partials/update-privacy-form.tsx` — toggle should migrate to a new notification settings section.
- `resources/js/types/index.ts` — `PrivacySetting` will lose the field; new `NotificationSetting` type needed.
- `tests/Feature/Privacy/PrivacySettingsTest.php` — assertions on the old field must be removed or redirected.
- `tests/Feature/NotificationTest.php` — tests that create `privacySetting()->create(['email_notifications_enabled' => …])` must target the new table.
- `tests/Unit/Services/UserPrivacyServiceTest.php` — same.
- `tests/Unit/Notifications/ProjectInvitationReceivedTest.php` — same.

### Approaches

1. **New `user_notification_settings` table (1:1) with category columns**
   - **Description**: Create a dedicated `user_notification_settings` table (or reuse a generic `user_settings` table if one existed, but none does). Start with a `collaboration_emails` boolean (default `true`). Migrate existing `email_notifications_enabled` values into this column. Update `User` to expose `receivesCollaborationEmails()`. Deprecate the old column but keep it for one release.
   - **Pros**: Clean domain separation; aligns with the project's normalized-database convention; easy to add new categories later (e.g., `digest_emails`, `marketing_emails`); privacy table stays focused on visibility.
   - **Cons**: More migrations, a new model, a new service, and broader test updates.
   - **Effort**: Medium

2. **Add category columns directly to `user_privacy_settings`**
   - **Description**: Keep the existing table and simply rename/repurpose `email_notifications_enabled` to `collaboration_emails` (or add more granular columns). Reuse the existing `UserPrivacyService` and form request.
   - **Pros**: Fewer files to touch; no new table or service.
   - **Cons**: Violates domain boundaries—the table is named and documented for privacy, not notifications; future maintainers will be confused; harder to extract later.
   - **Effort**: Low–Medium

3. **JSON `notification_preferences` blob on `users` or `user_privacy_settings`**
   - **Description**: Store a JSON object like `{"collaboration": true, "digest": false}` in a single column.
   - **Pros**: Maximum flexibility; zero schema changes when adding categories.
   - **Cons**: The project convention explicitly discourages JSON/ARRAY columns for structured data ("Normalized database: Separate tables for techs... NO JSON/ARRAY columns for relations"). Loses queryability, type safety, and easy indexing.
   - **Effort**: Low

### Recommendation

**Adopt Approach 1: a new `user_notification_settings` table.**

It is the only option that keeps the architecture honest. Privacy and notifications are separate bounded contexts; mixing them in the same table created the current design debt. A dedicated table follows the existing 1:1 pattern (`user_privacy_settings`), stays normalized, and makes the next category trivial to add.

**Backward-compatibility plan**:
1. Create `user_notification_settings` migration with `collaboration_emails` (boolean, default `true`).
2. Seed the new table from existing `user_privacy_settings.email_notifications_enabled` in the same migration (treat missing rows as `true`).
3. Update `User` to prefer `notificationSetting?->collaboration_emails` and fall back to `privacySetting?->email_notifications_enabled` during the transition window.
4. Remove the toggle from the privacy form; add it to a new "Notification settings" section (new route + form component).
5. Update all optional notifications to check the new setting.
6. Mark `email_notifications_enabled` as deprecated in code/docs; drop it in a future release after the transition.

### Risks

- **Data-migration edge cases**: Users without a `user_privacy_settings` row currently default to `true`. The migration must create notification rows for **all** users, not just those with privacy rows.
- **Test churn**: A large number of existing tests instantiate `privacySetting()->create(['email_notifications_enabled' => false])`. Missing any of these will cause false positives in CI.
- **UX discontinuity**: Moving the toggle out of the privacy form requires a new UI section. If shipped without clear navigation, users may not find the new settings.
- **Scope creep**: The temptation to add many granular categories (join request, invitation, approval, rejection) immediately. Resist this—start with one `collaboration` category and split later if user feedback demands it.

### Ready for Proposal

**Yes.** The scope is clear: decouple notification preferences from privacy, introduce a `user_notification_settings` 1:1 table starting with a single `collaboration_emails` category, and preserve backward compatibility via a data migration and dual-read fallback.
