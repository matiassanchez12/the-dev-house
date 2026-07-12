# Tasks: TypeScript Projects Domain Typing Fixes

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | ~70-110 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr-default |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low
One PR realistic: Yes

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|---|---|---|---|
| 1 | Resolve all projects-domain TS mismatches | PR 1 | Keep type fixes, fixtures, and verification in one reviewable slice. |

## Phase 1: Foundation / Types

- [x] 1.1 Update `resources/js/pages/projects/index.tsx` so both `Select` handlers accept `string | null` and coerce `null` to `''` before calling state setters.
- [x] 1.2 Update `resources/js/pages/projects/show.tsx` to type `auth.user` as `User | null` and align `viewerJoinRequest` so `message` can remain optional.
- [x] 1.3 Update `resources/js/components/projects/show/project-status-manager.tsx` to type transitions as `Record<ProjectStatus, ProjectStatus[]> & { all: ProjectStatus[] }`.

## Phase 2: Fixture Alignment

- [x] 2.1 Fix `resources/js/components/projects/show/project-join-form.test.tsx` fixtures by adding `viewerJoinRequest.message` where props require it.
- [x] 2.2 Fix `resources/js/pages/projects/collaborators.test.tsx` fixtures by using `DiscoverableUser` or adding `created_projects_count` and `joined_projects_count`.
- [x] 2.3 Fix `resources/js/components/projects/collaborator-suggestion-card.test.tsx` tech fixtures with `created_at` / `updated_at`, and declare `route` in `resources/js/types/global.d.ts` as `var route`.
- [x] 2.4 Update `resources/js/pages/projects/show.test.tsx` with an explicit null guard before reading `capturedJoinFormProps.isOpen`.

## Phase 3: Verification

- [x] 3.1 Run `npx tsc --noEmit` and confirm the 18 projects-domain errors are gone.
- [x] 3.2 Run `npm run test -- resources/js/components/projects/show/project-join-form.test.tsx resources/js/pages/projects/collaborators.test.tsx resources/js/components/projects/collaborator-suggestion-card.test.tsx resources/js/pages/projects/show.test.tsx`.
- [x] 3.3 Run `npm run build` to verify the type-only cleanup does not affect the frontend bundle.

## Phase 4: Cleanup

- [x] 4.1 Remove any now-unused imports or temporary casts left behind by the type alignment.
