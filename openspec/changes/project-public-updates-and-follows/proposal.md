# Proposal: Project Public Updates and Follows

## Intent

Enable guests and registered users to follow public projects and receive in-app (and optionally email) notifications when project phases are created or updated. Today, project progress is invisible to interested outsiders; this closes that gap without adding a generic activity stream.

## Scope

### In Scope
- Follow/unfollow public projects with self-follow guard
- Read-state tracking (`last_seen_public_activity_at`) for authenticated followers
- Guest unread indicators via `localStorage`
- Queued fan-out job when phases are created/updated
- `PhasePublicUpdate` in-app notification with broadcast
- Dedicated `follow_project_emails` preference in notification settings
- Follow button + unread badge on project show page

### Out of Scope
- Throttling rapid phase edits
- Generic activity stream for other public changes
- Push notifications / SMS
- Follow counts or social discovery features

## Capabilities

### New Capabilities
- `project-follows`: Follow/unfollow, read-state, self-follow prevention, guest localStorage fallback
- `public-update-notifications`: Queued `NotifyFollowersOfPhase` job, `PhasePublicUpdate` notification class, broadcast to `Echo.private('user.{id}')`

### Modified Capabilities
- `user-notification-settings`: Add `follow_project_emails` boolean (default `true`) to the notification settings record and update endpoint
- `project-phases-visibility`: Inject `is_following` and `unread_public_updates_count` into the project show payload for authenticated viewers

## Approach

Use the existing Service + Queue pattern. `PhaseService` dispatches `NotifyFollowersOfPhase` after the DB transaction commits. The job inserts database notifications and sends emails only to followers with `follow_project_emails = true`. Auth read state lives on the `project_follows` pivot; guests use `tdh:follows:v1` in `localStorage`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `database/migrations` | New | `project_follows` table; `follow_project_emails` on `user_notification_settings` |
| `app/Models/Project.php` | Modified | Add `followers()` BelongsToMany |
| `app/Models/User.php` | Modified | Add `followedProjects()` and `isFollowing()` helper |
| `app/Services/FollowService.php` | New | Follow/unfollow/read-state logic |
| `app/Services/PhaseService.php` | Modified | Dispatch fan-out job after create/update |
| `app/Jobs/NotifyFollowersOfPhase.php` | New | Queued fan-out + broadcast |
| `app/Notifications/PhasePublicUpdate.php` | New | Notification payload class |
| `resources/js/pages/projects/show.tsx` | Modified | Render follow button + unread indicator |
| `resources/js/components/notification-list.tsx` | Modified | Labels/routing for `phase_created` / `phase_updated` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Queue runs sync in production | Med | Document `QUEUE_CONNECTION` requirement in runbook |
| Multiple edits spam followers | Low | Future throttle deferred; notify on every save for MVP |
| N+1 on unread count | Low | Compute via single subselect in `FollowService` |

## Rollback Plan

1. Disable the follow UI buttons (frontend toggle).
2. Stop dispatching `NotifyFollowersOfPhase` from `PhaseService`.
3. Drop `project_follows` table and remove `follow_project_emails` column via migration.
4. Existing notifications in the polymorphic `notifications` table remain readable; no data loss.

## Dependencies

- `QUEUE_CONNECTION` set to `database` or `redis` in production

## Success Criteria

- [ ] Authenticated user can follow/unfollow a public project; creators cannot follow their own
- [ ] Phase create/update dispatches a queued job that inserts in-app notifications for followers
- [ ] Followers with `follow_project_emails = true` receive an email
- [ ] Project show page displays correct `is_following` and `unread_public_updates_count` for auth users
- [ ] Guests see unread dots based on `localStorage` timestamp
- [ ] `php artisan test` passes with no regressions
