# Proposal: Public Project Update Read State

## Intent

Activate the `seen_at` seam shipped in `project-follow-foundation` so followers can see whether a project has unread public updates, and mark those updates as seen on valid surfaces. Add guest `localStorage` persistence for follows and seen state so guest viewers get the same unread awareness.

## Scope

### In Scope
- Backend `hasUnreadPublicUpdates()` and `markSeen()` in `ProjectFollowService`
- Eager marking on `projects.show` and `milestones.index` for authenticated followers
- Guest follow list and seen-state CRUD in versioned `localStorage`
- Unread indicator on `ProjectFollowCard` for authenticated and guest viewers
- Update `follow()` to initialize `seen_at = now()` so new follows don't show a false backlog

### Out of Scope
- Follow/unfollow foundation behavior (already shipped)
- In-app notification generation or delivery
- Email preference/delivery
- Public update types beyond phase `created`/`updated`
- Unread indicators on surfaces other than `projects.show` and `milestones.index`

## Capabilities

### New Capabilities
- `project-public-update-read-state`: unread/seen computation, eager marking on valid surfaces, and guest `localStorage` read-state support.

### Modified Capabilities
- `project-follow`: the `seen_at` seam transitions from reserved to active; follow initialization now sets `seen_at`, and `ProjectFollowService` exposes read-state queries.

## Approach

Backend-computed freshness: `ProjectFollowService` compares `project_follows.seen_at` against `GREATEST(phases.created_at, phases.updated_at)` per project. Controllers call `markSeen()` before rendering. A single bulk query powers the milestones page to avoid N+1.

Guest path: a `useGuestFollows` hook manages versioned `localStorage` keys (`devcollab:guest-follows:v1`, `devcollab:guest-seen:v1:{projectId}`). The hook provides `follow`, `unfollow`, `markSeen`, and `hasUnread`. All writes are wrapped in `try/catch` for quota errors.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/Services/ProjectFollowService.php` | Modified | Add `markSeen`, `hasUnreadPublicUpdates`, `unreadFlagsForProjects`; update `follow()` to set `seen_at` |
| `app/Http/Controllers/ProjectController.php` | Modified | Call `markSeen()` and inject `has_unread_public_updates` into payload |
| `app/Http/Controllers/PublicMilestoneController.php` | Modified | Bulk-mark seen for followed projects on current page; inject unread flags into milestone payloads |
| `app/Helpers/ApiResourceTransformer.php` | Modified | Surface `has_unread_public_updates` on project shapes when present |
| `resources/js/types/index.ts` | Modified | Add `has_unread_public_updates?: boolean` to `Project` type |
| `resources/js/components/projects/show/project-follow-card.tsx` | Modified | Display unread dot/badge when flag is true; check guest hook for guests |
| `resources/js/hooks/use-guest-follows.ts` | New | Versioned localStorage CRUD for guest follows and seen state |
| `tests/Feature/ProjectFollowTest.php` | Modified | Expand coverage for read-state backend behavior |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Guest follow persistence missing from foundation | Med | Add `localStorage` hook in this slice; keep it isolated and versioned |
| Milestones page marking too broad (clears all follows) | Low | Mark only projects whose phases appear on the current paginated response |
| Freshness query performance on milestones page | Low | Use a single bulk query per user for the unique project IDs on the page |

## Rollback Plan

1. Revert controller changes: remove `markSeen()` calls and `has_unread_public_updates` injection.
2. Revert `ProjectFollowService` read-state methods but keep `seen_at` nullable (no schema change).
3. Remove `use-guest-follows.ts` and frontend unread indicator logic.
4. Revert `follow()` `seen_at` initialization if it causes issues (safe because `seen_at` is nullable).

## Dependencies

- `project-follow-foundation` must be shipped (provides `project_follows` table and `ProjectFollowService`).

## Success Criteria

- [ ] `projects.show` marks the followed project as seen and exposes an accurate `has_unread_public_updates` flag
- [ ] `milestones.index` marks only followed projects on the current page as seen and exposes unread flags per milestone project
- [ ] Following a project initializes `seen_at` to the current time
- [ ] Guest `localStorage` persists follows and seen state across page loads
- [ ] `ProjectFollowCard` shows an unread indicator for both authenticated and guest followers when updates exist
- [ ] Feature tests cover authenticated read-state behavior; frontend tests cover guest hook behavior
