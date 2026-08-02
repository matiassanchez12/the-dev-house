# Exploration: project-public-update-read-state

## Current State

The `project-follow-foundation` slice has already shipped:

- **`project_follows` table** with `project_id`, `user_id`, `seen_at` (nullable), `created_at`, `updated_at`, plus a unique composite index.
- **`ProjectFollowService`** providing `follow()`, `unfollow()`, and `isFollowing()` — follow/unfollow are idempotent, creator self-follow is rejected.
- **`ProjectController::show`** loads the project with phases and exposes `followers_count` (via `loadCount`) and `is_followed_by_viewer` (boolean) in the Inertia payload.
- **`PublicMilestoneController::index`** returns a paginated list of all phases across all projects, with no awareness of follows or read state.
- **Frontend `ProjectFollowCard`** handles authenticated follow/unfollow mutations and a guest CTA modal, but does NOT persist guest follows or display unread indicators.
- **`PhaseService::create/update`** mutate phases with no post-commit hooks for notification generation (that belongs to a later child slice).

**Critical gap discovered:** The foundation slice created a guest CTA modal but did **not** persist guest follows. This child slice must introduce guest follow persistence in `localStorage` in order to support guest read-state, as explicitly required by the parent epic tasks.

---

## Affected Areas

| File | Why it's affected |
|------|-----------------|
| `app/Services/ProjectFollowService.php` | Needs `markSeen()`, `hasUnreadPublicUpdates()`, and `unreadFollowedProjectIds()` methods. |
| `app/Http/Controllers/ProjectController.php` | Needs to call `markSeen()` on `show` for authenticated followers and inject `has_unread_public_updates` into the payload. |
| `app/Http/Controllers/PublicMilestoneController.php` | Needs to call `markSeen()` only for followed projects whose phases appear on the current paginated response, and inject unread flags into milestone project payloads. |
| `app/Helpers/ApiResourceTransformer.php` | Needs to surface `has_unread_public_updates` on project shapes when the flag is present. |
| `resources/js/types/index.ts` | Needs `has_unread_public_updates?: boolean` on `Project`. |
| `resources/js/components/projects/show/project-follow-card.tsx` | Needs an unread indicator (e.g., dot or "New updates" badge) when `has_unread_public_updates` is true. |
| `resources/js/components/public/milestone-card.tsx` | Optionally needs an unread dot on the project link if the milestone's project has unread updates. |
| `resources/js/pages/projects/show.tsx` | Receives the new flag; no structural change needed unless we add a `useEffect` for guest localStorage. |
| `resources/js/pages/milestones.tsx` | May need to trigger guest seen-state updates for rendered milestones. |
| `tests/Feature/ProjectFollowTest.php` | Needs expanded coverage for read-state backend behavior. |
| `resources/js/hooks/use-guest-follows.ts` (new) | Encapsulates guest follow list and seen-state CRUD in versioned `localStorage`. |

---

## Approaches

### 1. Backend-computed freshness, eager marking (Recommended)

**Description:** The backend computes `has_unread_public_updates` per project by comparing `project_follows.seen_at` against the most recent phase `created_at` or `updated_at` for that project. Controllers update `seen_at = now()` when rendering a valid surface. The frontend simply renders a pre-computed boolean.

- **Pros:**
  - Single source of truth for authenticated users.
  - Minimal frontend complexity; no hydration mismatch risk.
  - Easy to test with feature tests.
  - Follows existing Laravel pattern (controllers compute state, Inertia sends it).
- **Cons:**
  - Requires a subquery/join against `phases` per project; for the milestones page this must run across the unique projects on the current page.
  - Guest users need a separate frontend-local mechanism.
- **Effort:** Medium

### 2. Frontend-computed freshness, lazy marking

**Description:** The backend sends raw `seen_at` and phase timestamps. The frontend computes unread state in a `useMemo` or helper. Guest users naturally fit this model.

- **Pros:**
  - Reduces backend query complexity.
  - Guest and authenticated logic can share the same frontend helper.
- **Cons:**
  - Larger Inertia payload (sending all phase timestamps for comparison).
  - Risk of hydration mismatch for guest users if localStorage state differs across server/client.
  - Harder to feature-test end-to-end because the "mark seen" action is client-side.
- **Effort:** Medium-High

### 3. Hybrid: backend for auth, frontend for guest

**Description:** Authenticated users get the backend-computed flag; guests get a frontend-only computation using localStorage.

- **Pros:**
  - Auth path stays simple and testable.
  - Guest path stays fully client-side with no extra routes.
- **Cons:**
  - Two mechanisms to maintain, test, and debug.
  - Potential UX inconsistency if the two implementations diverge.
- **Effort:** High

---

## Recommendation

**Adopt Approach 1 (backend-computed freshness, eager marking)** with a clean, isolated frontend helper for guest localStorage.

**Rationale:**
- The codebase already follows the "backend computes, Inertia sends" pattern (e.g., `followers_count`, `is_followed_by_viewer`).
- Feature tests are the project's primary verification layer; keeping read-state logic server-side makes it testable with PHPUnit.
- The guest path is a deliberate product exception (device-local only). Accepting a small frontend helper for guests is acceptable because it is scoped and versioned.

---

## Detailed Implementation Sketch

### Authenticated DB Seam

Add to `ProjectFollowService`:

```php
public function markSeen(Project $project, User $user): void
{
    $project->followers()->updateExistingPivot($user->id, ['seen_at' => now()]);
}

public function hasUnreadPublicUpdates(Project $project, User $user): bool
{
    if (! $this->isFollowing($project, $user)) {
        return false;
    }

    $seenAt = $project->followers()
        ->whereKey($user->id)
        ->value('project_follows.seen_at');

    if ($seenAt === null) {
        return true;
    }

    $latestPhaseActivity = $project->phases()
        ->max(\DB::raw('GREATEST(created_at, updated_at)'));

    return $latestPhaseActivity !== null && $latestPhaseActivity > $seenAt;
}

/**
 * @return array<int, bool>  project_id => has_unread
 */
public function unreadFlagsForProjects(array $projectIds, User $user): array
{
    // Bulk query for milestones page efficiency
}
```

**Note on query performance:** `GREATEST(created_at, updated_at)` on `phases` may be computed inline; an index on `phases(project_id, created_at, updated_at)` would make this cheap. Given the table sizes expected in this slice, inline computation is acceptable, but we should document the index recommendation.

### Guest localStorage

Versioned keys:
- `devcollab:guest-follows:v1` → JSON array of `{projectId: number, slug: string, followedAt: string}`
- `devcollab:guest-seen:v1:{projectId}` → ISO-8601 timestamp string

Helper hook (`useGuestFollows`) responsibilities:
- `isFollowing(projectId): boolean`
- `follow(projectId, slug): void`
- `unfollow(projectId): void`
- `markSeen(projectId): void`
- `hasUnread(projectId, latestPhaseUpdatedAt): boolean`
- Wrap all reads/writes in `try/catch` for private-browsing quota errors.

### Valid Surfaces

1. **`projects.show`** (controller, server-side)
   - If `Auth::check()` and `isFollowing`, call `projectFollowService->markSeen()` before rendering.
   - Inject `has_unread_public_updates` into the project payload (false after marking).

2. **`milestones.index`** (controller, server-side)
   - Extract unique `project_id`s from the paginated phases collection.
   - For authenticated user, call `markSeen()` only for projects in that set that the user follows.
   - Inject `has_unread_public_updates` into each milestone's nested `project` payload.

3. **Guest surfaces** (frontend, client-side)
   - In `projects/show.tsx` `useEffect`: if guest and `isFollowing(project.id)` in localStorage, call `markSeen(project.id)`.
   - In `milestones.tsx` `useEffect`: if guest, iterate rendered milestones and call `markSeen(milestone.project.id)` for followed projects.

### Unread Indicator UX

- `ProjectFollowCard` displays a small dot or "New updates" badge next to the follower count when `has_unread_public_updates` is true.
- For guests, `ProjectFollowCard` must also check localStorage to show the dot (since the backend cannot compute it).

---

## Risks

1. **Guest follow persistence was not in foundation.** This child slice must both add guest follow storage AND guest seen-state storage. This widens the frontend surface slightly beyond pure "read-state" but is required by the parent epic's explicit scope.

2. **Milestones page marking semantics.** We must mark seen ONLY for projects whose phases are rendered on the current page. Marking all followed projects globally would contradict the "valid surface" definition and could clear unread state for projects the user hasn't actually viewed.

3. **Performance of freshness query.** Computing `has_unread` per project requires a phases subquery. For the milestones page (12 items), this means up to 12 unique projects. A single bulk query per user is preferable to N+1.

4. **Follower count divergence for guests.** Guest follows in localStorage do not affect the displayed `followers_count` (which is DB-backed). This is correct per epic constraints, but we should ensure the UI does not imply the guest's follow contributed to the count.

5. **What counts as "unread" for a brand-new follow?** If `seen_at` is `null` at follow time, `hasUnreadPublicUpdates` will return `true` even for old phases. The correct behavior is to set `seen_at = now()` at follow time so the user doesn't get a false backlog of "unread" updates. The existing foundation already inserts with `seen_at = null`; we should update `follow()` to initialize `seen_at` to `now()`.

6. **Index recommendation.** The `project_follows` table currently has no index on `seen_at`. The freshness query only reads it for a specific `(project_id, user_id)` pair (already covered by the unique index), so no new DB index is strictly required for this slice.

---

## Product / UX Ambiguities

| Ambiguity | Resolution |
|-----------|------------|
| Should following a project initially mark it as seen? | **Yes.** Update `follow()` to set `seen_at = now()` so the user doesn't see a false backlog. |
| Should unfollowing clear seen state? | **Yes implicitly.** Unfollowing deletes the `project_follows` row, so all read state is gone. |
| What about projects with zero phases? | `hasUnreadPublicUpdates` returns `false` because `latestPhaseActivity` is `null`. |
| Do we show unread on the project list (`projects.index`)? | **No.** The epic explicitly limits valid surfaces to `projects.show` and `milestones.index` only. |
| Should the milestones page show an unread dot per milestone card? | **Optional.** The minimum viable UX is unread awareness on `projects.show`. Adding a dot on milestone cards is a nice-to-have and can be deferred if review budget is tight. |

---

## Test Plan

### Backend (Feature Tests — PHPUnit)

- `test_project_show_marks_followed_project_as_seen_for_authenticated_user`
- `test_milestones_index_marks_followed_projects_on_current_page_as_seen`
- `test_followed_project_with_phase_created_after_seen_shows_unread`
- `test_followed_project_with_phase_updated_after_seen_shows_unread`
- `test_unfollowed_project_never_shows_unread_public_updates`
- `test_creator_never_shows_unread_public_updates_for_own_project`
- `test_following_project_initializes_seen_at_to_now`
- `test_guest_localStorage_follow_and_seen_state` (can mock localStorage in frontend tests, or test the hook in Vitest)

### Frontend (Unit Tests — Vitest)

- `useGuestFollows` hook tests:
  - `follow` adds project to localStorage
  - `unfollow` removes project
  - `markSeen` writes timestamp
  - `hasUnread` returns true when phase activity is newer than seen timestamp
  - Gracefully handles `localStorage` quota errors / private browsing

- `ProjectFollowCard` component tests:
  - Displays unread indicator when `has_unread_public_updates` is true
  - Does not display indicator when false or undefined

---

## Ready for Proposal

**Yes.**

The scope is clear, the foundation seam (`project_follows.seen_at`) is already in place, and the two valid surfaces (`projects.show`, `milestones.index`) are well-defined. The primary open question is guest follow persistence (not yet implemented), which this child slice must add alongside guest seen-state.

**What the orchestrator should tell the user:**
- Guest follow persistence (localStorage) was not built in the foundation slice and must be added here to enable guest read-state. This is within the agreed epic scope.
- The recommended approach keeps authenticated read-state server-side for testability, with a small, versioned frontend helper for guests.
- No new database migrations are required.
- Review budget forecast: ~250–350 changed lines, primarily in `ProjectFollowService`, two controllers, the follow card component, a new guest-follows hook, and expanded feature tests. This is within the 350-line child budget.
