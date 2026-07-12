# Tasks: Project Invitation Response Flow

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 380-460 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | Single PR with size exception; if split is required, backend core → UI wiring → tests |
| Delivery strategy | single-pr-default |
| Chain strategy | size-exception |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Backend invitation response lifecycle | PR 1 | Migration, model, service, policy, notification |
| 2 | Inertia and route wiring | PR 1 | Controller, routes, transformer, project payload, types |
| 3 | Verification | PR 1 | Keep tests aligned with each behavior slice; use one PR only if size exception is accepted |

## Phase 1: Foundation

- [x] 1.1 Add `database/migrations/*_add_responded_at_to_project_invitations_table.php` with nullable `responded_at` and no changes to existing cancel behavior.
- [x] 1.2 Update `app/Models/ProjectInvitation.php` with `STATUS_ACCEPTED`, `STATUS_REJECTED`, `responded_at` casting/fillable, and pending-only `pending_invitation_key` logic.

## Phase 2: Core Implementation

- [x] 2.1 Implement `accept()` and `reject()` in `app/Services/ProjectInvitationService.php`; accept must use a transaction, `syncWithoutDetaching()`, and notify the creator only after success.
- [x] 2.2 Widen `hasActiveInvitation()` to block `pending`, `accepted`, and `rejected`, and extend `app/Policies/ProjectInvitationPolicy.php` with invited-user-only `accept`/`reject` gates.
- [x] 2.3 Create `app/Notifications/ProjectInvitationAccepted.php` with database + broadcast payload for project id/slug/title and invited user details.

## Phase 3: Integration / Wiring

- [x] 3.1 Add `accept`/`reject` actions to `app/Http/Controllers/ProjectInvitationController.php` and POST routes in `routes/web.php`; redirect to `projects.show` after each response.
- [x] 3.2 Pass the viewer's pending invitation from `app/Http/Controllers/ProjectController.php` through `app/Helpers/ApiResourceTransformer.php`; expose `responded_at` and new statuses in `resources/js/types/index.ts`.
- [x] 3.3 Render Accept/Reject actions in `resources/js/pages/projects/show.tsx` and handle `project_invitation_accepted` in `resources/js/components/notification-list.tsx`.

## Phase 4: Testing / Verification

- [x] 4.1 Extend `tests/Unit/Services/ProjectInvitationServiceTest.php` for accept/reject, duplicate blocking after response, and rejected invitations not affecting `JoinRequest`.
- [x] 4.2 Extend `tests/Unit/Policies/ProjectInvitationPolicyTest.php` and `tests/Unit/Helpers/ProjectInvitationTransformerTest.php` for the new authorization and payload fields.
- [x] 4.3 Add feature coverage for accept/reject routes and update `resources/js/pages/projects/show.test.tsx` plus a new `resources/js/components/notification-list.test.tsx` for UI visibility and routing.
