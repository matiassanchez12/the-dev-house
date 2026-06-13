# Tasks: Project Join Request Lifecycle Visibility

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 180–250 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | ask-always |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Backend payload + frontend precedence + tests, all in one slice | PR 1 | base: main; full scope fits well under 400 lines |

## Phase 1: Backend payload contract (TDD — RED first)

- [ ] 1.1 RED: add `test_show_payload_includes_approved_and_rejected_states` to `tests/Feature/ProjectTest.php`; assert `viewerJoinRequest.{id, status, message}` for participant / approved / rejected / no-request. Run `php artisan test --filter=ProjectTest` — fails.
- [ ] 1.2 GREEN: add `JoinRequestService::getViewerFullRequest(Project, User): ?JoinRequest` in `app/Services/JoinRequestService.php` returning the latest record regardless of status (or `null`).
- [ ] 1.3 GREEN: replace the pending-only call in `app/Http/Controllers/ProjectController.php` with the new method; keep payload key name `viewerJoinRequest`.
- [ ] 1.4 GREEN: extend `ApiResourceTransformer::project()` in `app/Helpers/ApiResourceTransformer.php` to serialize `status` (cast) and `message`; keep `null` shape for non-applicants.
- [ ] 1.5 REFACTOR: re-run `php artisan test --filter=ProjectTest`; dedupe fixture setup across the 4 cases.

## Phase 2: Frontend types

- [ ] 2.1 Update `Project.viewerJoinRequest` in `resources/js/types/index.ts` to include `status: 'pending' | 'approved' | 'rejected' | null` and `message: string | null`.

## Phase 3: Frontend component (TDD — RED first)

- [ ] 3.1 RED: add three tests in `resources/js/components/projects/show/project-join-form.test.tsx` — rejected renders spec message + `/projects` link, approved returns `null`, participant (via new `isParticipant` prop) returns `null`. Run `npm run test -- project-join-form` — fails.
- [ ] 3.2 GREEN: add `isParticipant?: boolean` prop; precedence becomes `isCreator → !isOpen → isParticipant → user? → status? (approved→null, rejected→message, pending→pending UI, else CTA)`.
- [ ] 3.3 GREEN: render rejected branch with the literal spec copy plus `<Link href="/projects">explore other projects</Link>`.
- [ ] 3.4 REFACTOR: re-run frontend tests; confirm pending and no-request paths still pass.

## Phase 4: Page wiring

- [ ] 4.1 In `resources/js/pages/projects/show.tsx`, compute `isParticipant` (e.g. `project.participants?.some(p => p.id === user?.id) ?? false`) and pass it to `<ProjectJoinForm isParticipant={...} />`.

## Phase 5: Verification

- [ ] 5.1 `php artisan test --filter=ProjectTest` — all 4 payload scenarios green.
- [ ] 5.2 `npm run test -- project-join-form` — all 5 precedence branches green.
- [ ] 5.3 Manual smoke: visit `projects/show` as creator, participant, approved, rejected, pending, guest; verify the 5 scenarios in `specs/app/spec.md`.

## Phase 6: Cleanup

- [ ] 6.1 Remove `getViewerPendingRequest` from `JoinRequestService` if no longer referenced elsewhere.
- [ ] 6.2 Confirm `npm run build` succeeds (Vite + Inertia type-check).
