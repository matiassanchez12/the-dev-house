# Tasks: Project Join Request Visibility

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 200–280 (1 new service method + service unit tests + 2 backend files + 2 frontend files + 3 test files) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR to `master` |
| Delivery strategy | ask-always (interpreted as ask-on-risk) |
| Chain strategy | pending — single PR is well under budget |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Service extracts viewer join request lookup; backend payload exposes `viewerJoinRequest`; frontend renders pending UI vs form by payload state | PR 1 | Single PR; base = clean branch off `master`; tests + types + both layers included |

## Phase 1: Service Extraction (TDD: RED → GREEN → REFACTOR)

- [ ] 1.1 RED — Create `tests/Unit/Services/JoinRequestServiceTest.php` with `test_get_viewer_join_request_returns_pending_for_viewer_with_pending_request`. Run `php artisan test --filter JoinRequestServiceTest`; confirm FAILS.
- [ ] 1.2 RED — Add `test_get_viewer_join_request_returns_null_for_viewer_without_request`. Run; confirm FAILS.
- [ ] 1.3 RED — Add `test_get_viewer_join_request_returns_null_for_creator_and_participant`. Run; confirm FAILS.
- [ ] 1.4 GREEN — Add `getViewerJoinRequest(Project $project, User $viewer): ?JoinRequest` to `app/Services/JoinRequestService.php` (query `JoinRequest::where(project_id, user_id)->where('status','pending')->first()`).
- [ ] 1.5 Verify — Run `php artisan test --filter JoinRequestServiceTest`; all green.
- [ ] 1.6 REFACTOR — Extract query to a single private method on the service if duplicated; keep public surface minimal.

## Phase 2: Backend Payload Contract (TDD: RED → GREEN)

- [ ] 2.1 RED — In `tests/Feature/ProjectTest.php` add `test_show_includes_viewer_join_request_when_pending` asserting `viewerJoinRequest.status === 'pending'`. Run; confirm FAILS.
- [ ] 2.2 RED — Add `test_show_viewer_join_request_is_null_for_eligible_user`. Run; confirm FAILS.
- [ ] 2.3 RED — Add `test_show_viewer_join_request_is_null_for_creator_and_participant`. Run; confirm FAILS.
- [ ] 2.4 GREEN — Modify `app/Http/Controllers/ProjectController.php` `show()`: call `JoinRequestService::getViewerJoinRequest($project, $viewer)` when authenticated; pass result to transformer (no Eloquent in controller).
- [ ] 2.5 GREEN — Modify `app/Helpers/ApiResourceTransformer.php` `project()`: accept optional `?JoinRequest $viewerJoinRequest`; append `viewerJoinRequest` (id, status, project_id, user_id) or `null`.
- [ ] 2.6 Verify — Run `php artisan test --filter ProjectTest`; all green.

## Phase 3: Frontend Rendering (TDD: RED → GREEN)

- [ ] 3.1 RED — In `resources/js/components/projects/show/__tests__/project-join-form.test.tsx` assert: when `viewerJoinRequest.status === 'pending'`, "Tu solicitud está pendiente" is rendered and the form `<Textarea>` is absent. Run `npm run test`; confirm FAILS.
- [ ] 3.2 RED — Assert: when `viewerJoinRequest === null` and viewer is eligible, the form `<Textarea>` is rendered. Run; confirm FAILS.
- [ ] 3.3 GREEN — Update `resources/js/components/projects/show/project-join-form.tsx`: add `viewerJoinRequest` prop; render pending-state Card with "Cancelar solicitud" (calls existing destroy route via `useForm().delete`) when `status === 'pending'`; else fall through to existing branches.
- [ ] 3.4 GREEN — Update `resources/js/pages/projects/show.tsx`: pass `viewerJoinRequest={project.viewerJoinRequest}` to `<ProjectJoinForm />`.
- [ ] 3.5 GREEN — Update `resources/js/types/index.ts` `Project` type: add `viewerJoinRequest: { id: number; status: 'pending' } | null`.

## Phase 4: Verification

- [ ] 4.1 Run `php artisan test` — full backend suite green (service + feature).
- [ ] 4.2 Run `npm run test` — frontend tests green.
- [ ] 4.3 Run `npx tsc --noEmit` — type check clean.
- [ ] 4.4 Manual smoke: pending viewer sees pending UI + cancel; eligible non-pending viewer sees form; creator sees no join UI; guest sees auth CTA; closed project hides all.
- [ ] 4.5 Confirm `viewerJoinRequest` is `null` for guests and when project status is `closed`.
