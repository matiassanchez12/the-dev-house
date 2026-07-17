# Design: Notification Preferences by Category

## Technical Approach

Move optional collaboration-email preferences out of privacy settings into a dedicated 1:1 `user_notification_settings` table. Keep the existing `email_notifications_enabled` column for one release as a legacy fallback, but make new reads/writes use `collaboration_emails`. The profile page will hydrate both privacy and notification settings through Inertia, render a new notification settings form, and post to a dedicated profile notification endpoint.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Storage boundary | Create `UserNotificationSetting` with `collaboration_emails` defaulting true | Keep flag on `user_privacy_settings`; JSON preferences | The spec requires privacy and notification domains to be separate. A normalized 1:1 table matches the existing privacy settings pattern and keeps future categories additive. |
| Transition behavior | `User::receivesOptionalEmailNotifications()` reads `notificationSetting.collaboration_emails`, then falls back to legacy `privacySetting.email_notifications_enabled`, then true | Hard switch to new table only | Preserves behavior for any user missed by migration or code path during the transition window. |
| UI integration | Add `UpdateNotificationSettingsForm` as a separate card on `profile/edit` | Add a tabbed settings page; keep toggle in privacy form | A separate card matches current profile section composition and avoids introducing navigation complexity for one category. |
| Update endpoint | Add `UpdateNotificationSettingsRequest`, `UserNotificationService`, and `POST /profile/notifications` handled by `ProfileController` | Reuse `UpdatePrivacyRequest` and `UserPrivacyService` | Keeps controllers thin while preventing notification keys from leaking back into privacy service logic. |

## Data Flow

```text
ProfileController@edit
  ├─ UserPrivacyService::getFor(user) ───────────────→ privacySetting prop
  └─ UserNotificationService::getFor(user) ──────────→ notificationSetting prop

UpdateNotificationSettingsForm
  └─ POST profile.notifications.update
      └─ UpdateNotificationSettingsRequest
          └─ UserNotificationService::update(user, collaboration_emails)

Optional collaboration notification via()
  └─ User::receivesOptionalEmailNotifications()
      ├─ notificationSetting.collaboration_emails
      ├─ legacy privacySetting.email_notifications_enabled
      └─ true default
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `database/migrations/*_create_user_notification_settings_table.php` | Create | Add 1:1 table, seed rows for all users from legacy privacy flag, default missing legacy rows to true. |
| `app/Models/UserNotificationSetting.php` | Create | Model with `DEFAULTS`, fillable `collaboration_emails`, boolean cast, `user()` relation. |
| `database/factories/UserNotificationSettingFactory.php` | Create | Factory mirroring privacy factory conventions. |
| `app/Services/UserNotificationService.php` | Create | `getFor()` and `update()` for notification settings. |
| `app/Http/Requests/Profile/UpdateNotificationSettingsRequest.php` | Create | Validate `collaboration_emails` boolean. |
| `app/Models/User.php` | Modify | Add `notificationSetting()` and update optional-email helper with legacy fallback. |
| `app/Http/Controllers/ProfileController.php` | Modify | Inject notification service, hydrate `notificationSetting`, add update action. |
| `routes/web.php` | Modify | Add authenticated profile notification settings route. |
| `app/Models/UserPrivacySetting.php` | Modify | Mark `email_notifications_enabled` as deprecated transition field. |
| `app/Services/UserPrivacyService.php`, `UpdatePrivacyRequest.php` | Modify | Remove notification key from privacy updates/validation. |
| `resources/js/types/index.ts` | Modify | Add `NotificationSetting`; remove notification field from `PrivacySetting` consumers where possible. |
| `resources/js/pages/profile/edit.tsx` | Modify | Pass `notificationSetting` to a new form card. |
| `resources/js/pages/profile/partials/update-privacy-form.tsx` | Modify | Remove collaboration email toggle. |
| `resources/js/pages/profile/partials/update-notification-settings-form.tsx` | Create | Dedicated collaboration email toggle form. |
| `tests/**` and `resources/js/**/*.test.tsx` | Modify/Create | Move privacy expectations to notification settings and cover migration/fallback behavior. |

## Interfaces / Contracts

```php
// UserNotificationSetting::DEFAULTS
['collaboration_emails' => true]

// UserNotificationService
public function getFor(User $user): UserNotificationSetting;
public function update(User $user, array $data): UserNotificationSetting;
```

```ts
export interface NotificationSetting {
  id: number;
  user_id: number;
  collaboration_emails: boolean;
  created_at: string;
  updated_at: string;
}
```

Mandatory auth/security emails are not routed through `receivesOptionalEmailNotifications()` and require no channel gating changes.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Service defaults, partial updates, no duplicate rows, legacy fallback helper | PHPUnit unit tests with `RefreshDatabase`. |
| Integration | Profile hydration/update route, migration preserves false and defaults missing legacy data to true, optional notifications suppress only mail | Feature tests and existing notification tests updated to use notification settings. |
| E2E | Not applicable | No E2E suite configured. |

## Migration / Rollout

Create `user_notification_settings`, insert one row per user using left joins against `user_privacy_settings`, and default `collaboration_emails` to true when no legacy row exists. Keep `email_notifications_enabled` for one release and remove it in a later cleanup change.

## Open Questions

None.
