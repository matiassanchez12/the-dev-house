# Design: Project Public Updates and Follows

## Technical Approach

Add project follows as a small Laravel service boundary: authenticated follow/read state lives in `project_follows`; guests keep device-local state in versioned `localStorage`. Phase create/update schedules a queued fan-out job after commit so milestone publishing stays fast. Project show and the global milestones page both call read-state marking for visible followed projects, matching the specs for project follows, phase visibility, notifications, and notification settings.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Follow persistence | `project_follows(user_id, project_id, last_seen_public_activity_at)` with a unique pair and indexes | JSON on users; generic activity stream | Normalized table matches existing conventions and keeps future public update types extensible. |
| Service boundary | New `App\Services\ProjectFollowService` used by controllers and read surfaces | Put Eloquent directly in controllers | Controllers stay thin; service owns self-follow, follow state, unread count, and mark-seen semantics. |
| Fan-out | `NotifyFollowersOfPhase` implements `ShouldQueue`, dispatched after commit from `PhaseService` | Notify inline; make notification itself queued only | One job keeps the request non-blocking and centralizes batching, follower filtering, and email preference checks. |
| Guest state | `tdh:follows:v1` localStorage map keyed by project slug/id | Guest DB rows; cookies | Device-local state is explicit, cheap, and avoids anonymous identifiers. |

## Data Flow

Follow/unfollow:

```text
Project show UI -> ProjectFollowController -> ProjectFollowService
    -> project_follows upsert/delete -> redirect back with refreshed payload
```

Phase update notification fan-out:

```text
PhaseController -> PhaseService -> DB phase write commits
    -> NotifyFollowersOfPhase queued job
        -> followers + notificationSetting eager load
        -> PhasePublicUpdate database/broadcast + optional mail
```

Read-state marking:

```text
ProjectController@show / PublicMilestoneController@index
    -> ProjectFollowService::markSeen(...)
    -> Project payload unread_public_updates_count = 0 for marked project(s)
```

## File Changes

| File | Action | Description |
|---|---|---|
| `database/migrations/*_create_project_follows_table.php` | Create | Follow pivot with `last_seen_public_activity_at`, unique pair, cascade deletes. |
| `database/migrations/*_add_follow_project_emails_to_user_notification_settings_table.php` | Create | Boolean default `true`; PostgreSQL-safe default/backfill. |
| `app/Models/Project.php`, `app/Models/User.php`, `app/Models/UserNotificationSetting.php` | Modify | Add relationships, casts/defaults, and `receivesFollowProjectEmails()`. |
| `app/Services/ProjectFollowService.php` | Create | Follow, unfollow, mark seen, unread count, visible milestones read marking. |
| `app/Http/Controllers/ProjectFollowController.php` | Create | Auth-only follow/unfollow endpoints. |
| `app/Services/PhaseService.php` | Modify | Dispatch `NotifyFollowersOfPhase` after create/update commits. |
| `app/Jobs/NotifyFollowersOfPhase.php` | Create | Batched follower fan-out; skips creator/self and honors email setting. |
| `app/Notifications/PhasePublicUpdate.php` | Create | Database, broadcast, and mail payload with project/phase/event fields. |
| `app/Http/Controllers/ProjectController.php`, `PublicMilestoneController.php` | Modify | Mark seen and expose follow/unread state. |
| `resources/js/types/index.ts`, `projects/show.tsx`, `components/projects/show/*`, `milestones.tsx`, `notification-list.tsx`, profile notification form | Modify | Typed follow state, follow button, unread badge, guest localStorage state, notification labels/routes, preference checkbox. |
| `tests/Feature`, `tests/Unit`, component tests | Modify/Create | RED coverage for routes, services, jobs, payloads, UI, settings. |

## Interfaces / Contracts

```php
ProjectFollowService::follow(User $user, Project $project): void
ProjectFollowService::unfollow(User $user, Project $project): void
ProjectFollowService::markSeen(User $user, Project|iterable $projects): void
ProjectFollowService::followState(Project $project, ?User $viewer): array{is_following: bool, unread_public_updates_count: int}
```

Notification `data.type`: `phase_created | phase_updated`; includes `project_id`, `project_slug`, `project_title`, `phase_id`, `phase_title`.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | `ProjectFollowService`, notification channel selection, model relationships | PHPUnit with factories and `RefreshDatabase`. |
| Feature | follow/unfollow auth + self-follow rejection; project show/milestones mark seen; phase create/update queues job; settings update | Laravel feature tests with `Queue::fake()` / `Notification::fake()`. |
| Frontend | follow button states, unread badge, guest localStorage restore, notification routing, settings checkbox | Existing Vitest/RTL component tests. |

## Threat Matrix

| Boundary | Applicability | Design response | Planned RED tests |
|---|---|---|---|
| Documentation-like paths | N/A: no executable-file classification. | None. | None. |
| Git repository selection | N/A: no VCS automation. | None. | None. |
| Commit state | N/A: no commit automation. | None. | None. |
| Push state | N/A: no push automation. | None. | None. |
| PR commands | N/A: no PR automation. | None. | None. |

## Migration / Rollout

No data migration beyond additive tables/columns. Deploy migrations first, ensure `QUEUE_CONNECTION` is not `sync` in production, then ship UI. Rollback disables routes/UI and job dispatch; persisted follows can remain safely unused.

## Open Questions

- [ ] None.
