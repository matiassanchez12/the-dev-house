# Design: Public Project Update Read State

## Technical Approach

Use the existing `project_follows.seen_at` seam for authenticated viewers and a versioned guest `localStorage` helper for device-local state. Public update freshness is currently limited to phase `created_at` / `updated_at`. Controllers compute unread flags before marking the valid surface as seen, then persist `seen_at = now()` before returning the Inertia response so the first visit can display “new updates” while subsequent visits are clean.

## Architecture Decisions

| Option | Tradeoff | Decision |
|---|---|---|
| Backend computes authenticated unread state | Keeps PHP feature tests authoritative; requires phase aggregate queries. | Use `ProjectFollowService` for `hasUnreadPublicUpdates`, bulk unread flags, and seen writes. |
| Compute flag before vs. after marking seen | Before-mark shows the update that caused the visit; after-mark always hides it on valid surfaces. | Compute before mark, then mark seen before rendering. |
| Guest state in DB vs. browser | DB needs anonymous identity; browser is device-local and fallible. | Use versioned `localStorage` with guarded reads/writes. |
| Add new public update table now | More extensible but outside current source limit. | Use phases only; future update types can replace the service internals. |

## Data Flow

Project show authenticated:

```text
GET /projects/{slug}
  -> ProjectController::show
  -> ProjectFollowService::hasUnreadPublicUpdates(project, user)
  -> ProjectFollowService::markSeen(project, user)
  -> ApiResourceTransformer::project(has_unread_public_updates)
  -> resources/js/pages/projects/show.tsx -> ProjectFollowCard
```

Milestones authenticated:

```text
GET /milestones
  -> PublicMilestoneController::index paginates phases
  -> unique project IDs on current page
  -> ProjectFollowService::unreadFlagsForProjects(ids, user)
  -> ProjectFollowService::markSeenForProjects(ids, user)
  -> MilestoneCard receives project.has_unread_public_updates
```

Guest flow:

```text
ProjectFollowCard / Milestones page
  -> useGuestFollows reads devcollab:guest-follows:v1
  -> hasUnread(projectId, latestPhaseActivity)
  -> useEffect markSeen(projectId) on projects.show or rendered milestones
```

## File Changes

| File | Action | Description |
|---|---|---|
| `app/Services/ProjectFollowService.php` | Modify | Set `seen_at` on follow; add unread queries and seen mutation methods. |
| `app/Http/Controllers/ProjectController.php` | Modify | Compute unread flag and mark current followed project as seen on show. |
| `app/Http/Controllers/PublicMilestoneController.php` | Modify | Bulk compute and mark seen for followed projects represented by current page phases. |
| `app/Helpers/ApiResourceTransformer.php` | Modify | Preserve `has_unread_public_updates` boolean in project payloads. |
| `resources/js/types/index.ts` | Modify | Add `Project.has_unread_public_updates?: boolean`. |
| `resources/js/hooks/use-guest-follows.ts` | Create | Encapsulate guest follows, seen timestamps, and safe storage helpers. |
| `resources/js/pages/projects/show.tsx` | Modify | Pass unread/latest phase data into `ProjectFollowCard`; mark guest seen in an effect. |
| `resources/js/pages/public/milestones.tsx` | Modify | Mark rendered followed guest projects as seen. |
| `resources/js/components/projects/show/project-follow-card.tsx` | Modify | Render unread badge/dot and support guest follow persistence. |
| `resources/js/components/public/milestone-card.tsx` | Modify | Optionally show unread badge near the project link. |
| `tests/Feature/ProjectFollowTest.php` | Modify | Add authenticated read-state feature coverage. |
| `resources/js/hooks/use-guest-follows.test.tsx` | Create | Cover guest storage behavior. |

## Interfaces / Contracts

```php
public function hasUnreadPublicUpdates(Project $project, User $user): bool;
/** @return array<int, bool> project_id => has_unread */
public function unreadFlagsForProjects(array $projectIds, User $user): array;
public function markSeen(Project $project, User $user): void;
public function markSeenForProjects(array $projectIds, User $user): void;
```

Guest storage keys:
- `devcollab:guest-follows:v1` => `{ projectId, slug, followedAt }[]`
- `devcollab:guest-seen:v1:{projectId}` => ISO timestamp

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Feature | follow initializes `seen_at`; phase create/update after seen becomes unread; show and milestones mark seen only for followed/current-page projects | Expand `ProjectFollowTest` with `RefreshDatabase`. |
| Unit/Component | guest hook follow/unfollow/markSeen/hasUnread and storage failures; unread badge rendering | Vitest + Testing Library with mocked `localStorage`. |
| E2E | Not required | No E2E runner in config. |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required. Existing nullable `project_follows.seen_at` is activated; old `null` follows are treated unread only when phase activity exists, then normalized on the next valid surface visit.

## Open Questions

- [ ] None.
