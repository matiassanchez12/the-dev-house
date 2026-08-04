# Tasks: Public Project Update Read State

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 280-360 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR; 3 reviewable work units |
| Delivery strategy | single-pr-default |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| 1 | Authenticated read-state on project show | PR 1 | `php artisan test --filter=ProjectFollowTest` | GET `/projects/{slug}` as follower/creator | `app/Services/ProjectFollowService.php`, `app/Http/Controllers/ProjectController.php`, `app/Helpers/ApiResourceTransformer.php` |
| 2 | Milestones page bulk read-state | PR 1 | `php artisan test --filter=ProjectFollowTest` | GET `/milestones` with mixed followed/unfollowed projects | `app/Http/Controllers/PublicMilestoneController.php`, `app/Helpers/ApiResourceTransformer.php` |
| 3 | Guest localStorage hook and unread badges | PR 1 | `npm run test -- use-guest-follows project-follow-card` | Open show/milestones pages as guest with seeded storage | `resources/js/hooks/use-guest-follows.ts`, `resources/js/components/projects/show/project-follow-card.tsx`, `resources/js/components/public/milestone-card.tsx`, `resources/js/pages/projects/show.tsx`, `resources/js/pages/milestones.tsx` |

## Phase 1: Contracts / Foundation

- [x] 1.1 Add `has_unread_public_updates?: boolean` to `resources/js/types/index.ts` and preserve it in `app/Helpers/ApiResourceTransformer.php`.
- [x] 1.2 Extend `app/Services/ProjectFollowService.php` with `markSeen()`, `hasUnreadPublicUpdates()`, `unreadFlagsForProjects()`, and `follow()` initialization of `seen_at = now()`.

## Phase 2: Core Read-State Flow

- [x] 2.1 Update `app/Http/Controllers/ProjectController.php` to compute unread state for authenticated followers, mark seen before render, and expose the flag.
- [x] 2.2 Update `app/Http/Controllers/PublicMilestoneController.php` to bulk-compute unread flags for visible projects, mark only rendered followed projects seen, and attach the flag to nested projects.
- [x] 2.3 Add `resources/js/hooks/use-guest-follows.ts` for versioned `localStorage` follow/seen/unread CRUD with `try/catch` guards.

## Phase 3: UI Wiring

- [x] 3.1 Wire `resources/js/pages/projects/show.tsx` and `resources/js/components/projects/show/project-follow-card.tsx` to show unread state and mark guest-seen on valid show visits.
- [x] 3.2 Wire `resources/js/pages/milestones.tsx` and `resources/js/components/public/milestone-card.tsx` to surface unread indicators for rendered milestone projects and mark guest-seen per visible project.

## Phase 4: Testing / Verification

- [x] 4.1 RED: expand `tests/Feature/ProjectFollowTest.php` for `seen_at` initialization, unread after phase create/update, and project show marking.
- [x] 4.2 RED: add milestones-page feature coverage for only-current-page follows being marked seen and unrelated follows staying untouched.
- [x] 4.3 RED: add `resources/js/hooks/use-guest-follows.test.tsx` and extend `resources/js/components/projects/show/project-follow-card.test.tsx` for guest unread UI and storage-failure cases.
- [x] 4.4 GREEN/REFactor: run `php artisan test` and targeted Vitest coverage; tighten queries/props if payload regressions surface.
