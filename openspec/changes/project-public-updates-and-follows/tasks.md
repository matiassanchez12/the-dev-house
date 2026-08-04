# Tasks: Project Public Updates and Follows

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 320-420 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR with backend → UI → tests slices |
| Delivery strategy | single-pr-default |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Schema + domain contracts | PR 1 | `php artisan test tests/Feature/Database/UserNotificationSettingsMigrationTest.php tests/Unit/Services/PhaseServiceTest.php` | `php artisan test tests/Feature/Projects/ShowTest.php --filter=viewer_role` | `database/migrations/*project_follows*, Project.php, User.php, UserNotificationSetting.php` |
| 2 | Follow service + fan-out flow | PR 1 | `php artisan test tests/Feature/NotificationTest.php --filter="public update|follow_project_emails"` | `php artisan test tests/Feature/Projects/PhaseTest.php` | `ProjectFollowService, ProjectFollowController, NotifyFollowersOfPhase, PhasePublicUpdate, PhaseService, routes/web.php` |
| 3 | UI + shared props | PR 1 | `npm run test -- resources/js/pages/projects/show.test.tsx resources/js/components/notification-list.test.tsx resources/js/pages/profile/partials/update-notification-settings-form.test.tsx` | `npm run test -- resources/js/pages/projects/show.test.tsx` | `resources/js/pages/projects/show.tsx, resources/js/pages/milestones.tsx, notification-list.tsx, types/index.ts, profile/edit.tsx` |

## Phase 1: Foundation

- [ ] 1.1 Add `project_follows` and `follow_project_emails` migrations, plus factory/default updates in `database/factories/UserNotificationSettingFactory.php`.
- [ ] 1.2 Extend `app/Models/Project.php`, `app/Models/User.php`, and `app/Models/UserNotificationSetting.php` with follow relations, casts, and the email preference helper.

## Phase 2: Core Implementation

- [ ] 2.1 Add RED tests for `tests/Unit/Services/ProjectFollowServiceTest.php` covering follow/unfollow, self-follow rejection, unread count, and mark-seen behavior.
- [ ] 2.2 Implement `app/Services/ProjectFollowService.php` and `app/Http/Controllers/ProjectFollowController.php`; register routes in `routes/web.php`.
- [ ] 2.3 Create `app/Jobs/NotifyFollowersOfPhase.php` and `app/Notifications/PhasePublicUpdate.php`; dispatch after commit from `app/Services/PhaseService.php`.
- [ ] 2.4 Update `app/Http/Controllers/ProjectController.php` and `app/Http/Controllers/PublicMilestoneController.php` to expose `is_following` and `unread_public_updates_count`.

## Phase 3: Integration / Wiring

- [ ] 3.1 Wire the follow button, unread badge, and guest `localStorage` state into `resources/js/pages/projects/show.tsx` and `resources/js/components/projects/show/project-phases-section.tsx`.
- [ ] 3.2 Update `resources/js/pages/milestones.tsx`, `resources/js/components/notification-list.tsx`, and `resources/js/pages/profile/partials/update-notification-settings-form.tsx` for follow-aware navigation and the new toggle.
- [ ] 3.3 Extend `resources/js/types/index.ts` and `resources/js/pages/profile/edit.tsx` with the new props and notification-setting shape.

## Phase 4: Testing / Verification

- [ ] 4.1 Add feature coverage for follow/unfollow, creator rejection, read-state on show/milestones, and guest fallback in `tests/Feature/Projects/*` and `tests/Feature/MilestonesTest.php`.
- [ ] 4.2 Add notification coverage for queued fan-out, broadcast/database payloads, and `follow_project_emails` opt-in/out in `tests/Feature/NotificationTest.php`.
- [ ] 4.3 Refresh Vitest coverage for project show, notification list, and notification settings form to prove the UI wiring.
