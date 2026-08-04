## Exploration: Project Public Updates and Follows

### Current State
- **Phases (milestones)** live in the `phases` table, owned by a `Project`. `PhaseService` handles create/update/delete; `PhaseController` gates mutations to the project creator via `PhasePolicy`.
- **Public milestone listing** is served by `PublicMilestoneController`, which returns all phases ordered by `created_at` with project and creator eager-loaded. No filtering by project visibility.
- **Project show** (`ProjectController::show`) loads phases for every viewer (guest, member, creator). The `ProjectPhasesSection` component renders them for all roles.
- **Notifications** use Laravel's built-in polymorphic `notifications` table. Existing in-app types are limited to join-request and project-invitation events. `NotificationController` handles marking read. `notification-bell.tsx` subscribes to `Echo.private('user.{id}')` and increments the unread badge on broadcast.
- **User notification settings** are stored in `user_notification_settings` (`UserNotificationSetting`) with one boolean: `collaboration_emails`. This is updated via `ProfileController::updateNotificationSettings` and consumed by `UserNotificationService`.
- **No follow/bookmark system** exists. Guest state is minimal; only theme preferences use `localStorage`.

### Affected Areas
- `database/migrations/` — `project_follows` table; `follow_project_emails` on `user_notification_settings`
- `app/Models/Project.php` — `followers()` BelongsToMany
- `app/Models/User.php` — `followedProjects()` BelongsToMany; `isFollowing(Project)` helper
- `app/Models/UserNotificationSetting.php` — add `follow_project_emails` cast/fillable
- `app/Services/FollowService.php` — new; follow/unfollow/read-state/self-follow guard
- `app/Services/PhaseService.php` — dispatch fan-out job after create/update
- `app/Services/UserNotificationService.php` — update to handle new `follow_project_emails` field
- `app/Jobs/NotifyFollowersOfPhase.php` — queued fan-out job
- `app/Notifications/PhasePublicUpdate.php` — new notification class
- `app/Http/Controllers/ProjectController.php` — inject `is_following` and `unread_public_updates_count` into show payload
- `app/Http/Controllers/ProfileController.php` — extend `updateNotificationSettings` to accept new toggle
- `resources/js/types/index.ts` — add `phase_created` / `phase_updated` to `NotificationItem['data']['type']`; add follow-related fields to `Project`
- `resources/js/pages/projects/show.tsx` — render Follow/Unfollow button and unread indicator
- `resources/js/components/notification-list.tsx` — labels and routing for new phase notification types
- `resources/js/components/public/milestone-card.tsx` — optional unread dot for guests (localStorage) or auth users
- `tests/Unit/Services/PhaseServiceTest.php` — assert job dispatch on create/update
- `tests/Feature/Projects/PhaseTest.php` — assert no regression; add follow-auth tests

### Approaches
1. **Synchronous fan-out** — Inside `PhaseService`, after persisting a phase, loop followers and insert `DatabaseNotification` rows immediately.
   - Pros: Simplest implementation; no queue worker needed; easy to assert in PHPUnit.
   - Cons: Milestone publish latency grows with follower count, directly violating the performance constraint.
   - Effort: Low

2. **Queued job fan-out (Recommended)** — `PhaseService` dispatches a `NotifyFollowersOfPhase` job (implements `ShouldQueue`) after the DB transaction commits. The job queries followers, creates in-app notifications, and sends emails only to users with `follow_project_emails = true`.
   - Pros: Keeps request path fast; scales with queue workers; aligns with existing Laravel service-layer and queue patterns.
   - Cons: Requires `QUEUE_CONNECTION` not `sync` in production; needs failed-job handling and retry policy.
   - Effort: Medium

3. **Generic Activity Stream** — Polymorphic `activities` table + follower `last_activity_id` cursor.
   - Pros: Handles future public edits (project description, status changes) without schema changes.
   - Cons: Over-engineered for current scope; adds migration, model, query complexity not justified by today's requirement (phase created/updated only).
   - Effort: High

### Recommendation
Adopt **Approach 2 (Queued job fan-out)** with these specifics:
- **Follow storage**: `project_follows` pivot (`user_id`, `project_id`, `last_seen_public_activity_at`, timestamps). `last_seen_public_activity_at` is updated on every visit to `projects.show` or `milestones.index` (both surfaces count as "seen").
- **Guest state**: Versioned `localStorage` key `tdh:follows:v1` storing `{[projectSlug]: lastSeenAt}`. Used to render an unread dot on the milestone card or project link. This is the minimal viable guest experience.
- **Auth read state**: `project_follows.last_seen_public_activity_at`. A follower's unread count for a project = phases where `updated_at > last_seen_public_activity_at`.
- **Self-follow prevention**: `FollowService::follow` aborts with `ValidationException` if `user_id === project->user_id`. Enforced at service level and backed by a FormRequest rule.
- **Global email preference**: Add `follow_project_emails` (boolean, default `true`) to `user_notification_settings`. Migrate existing users to `true` to preserve current opt-in behavior. Reuse the existing `POST /profile/notifications` endpoint.
- **Notification payload**: Backend `PhasePublicUpdate` notification carries `project_slug`, `project_title`, `phase_id`, `phase_title`, and `event` (`created` | `updated`). Frontend `notification-list.tsx` maps these to links pointing to the project show page with a `#phases` hash.

### Risks
- **Queue misconfiguration**: If production still uses `QUEUE_CONNECTION=sync`, the job runs synchronously and the performance constraint is broken. Must document the requirement to switch to `database` or `redis`.
- **Notification noise / spam**: Phase edits by creators could generate multiple notifications in quick succession. A future throttle (e.g., "notify only if last phase update for this project was >5 min ago") is recommended but out of MVP scope.
- **localStorage limitations**: Guest follows are device-bound and lost on private-browsing exit. Acceptable per product constraints.
- **N+1 in show payload**: Computing `unread_public_updates_count` per project for the authenticated user must be done via a single subselect or a dedicated `FollowService` query, not in a loop. The current `ProjectController::show` already uses service delegation; this fits cleanly.
- **Broadcast race condition**: `notification-bell.tsx` increments its badge on broadcast and also calls `router.reload`. If the new notification is not yet in the DB when the reload happens, the badge may flicker. Existing pattern already handles this; we just need to ensure the notification is committed before broadcast (queue job must broadcast after DB insert).

### Ready for Proposal
Yes. The feature boundaries are tight, the existing architecture (service layer, queued jobs, Inertia shared props, Echo broadcasts) supports it directly, and the smallest safe slices are clear. The only open product question is whether to repurpose the existing `collaboration_emails` toggle or add the dedicated `follow_project_emails` column recommended above.
