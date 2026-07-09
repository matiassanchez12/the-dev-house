# Tasks: Project Creation Contextual Invitations

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~520-700 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 foundation/reuse → PR 2 collaborator flow → PR 3 tests/cleanup |
| Delivery strategy | single-pr-default |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Reuse #179 invitation foundation or create outbound invite primitives | PR 1 | Migration/model/policy/notification/service scaffolding; keep invitation naming distinct from `JoinRequest`. |
| 2 | Build collaborator suggestion flow | PR 2 | Redirect, collaborator page, routes, controller, transformer, TS types. |
| 3 | Verify and polish | PR 3 | Feature/unit/RTL tests, notification list, cleanup. |

## Phase 1: Foundation / Reuse

- [x] 1.1 Inspect any #179 output; reuse `ProjectInvitation` naming if present, otherwise create `database/migrations/*_create_project_invitations_table.php` and `app/Models/ProjectInvitation.php` with pending/cancelled status plus unique pending `project_id + invited_user_id`.
- [x] 1.2 Add `app/Policies/ProjectInvitationPolicy.php` and `app/Notifications/ProjectInvitationReceived.php`; mirror `JoinRequestReceived` channels/data but target invitation recipients.
- [x] 1.3 Add `Project::invitations()` and `User::receivedInvitations()` plus safe transformer support in `app/Helpers/ApiResourceTransformer.php` for invitation/suggestion payloads.

## Phase 2: Core Implementation

- [ ] 2.1 Implement `app/Services/CollaboratorSuggestionService.php` with overlap-only user lookup excluding creator, participants, and already-invited users.
- [ ] 2.2 Implement `app/Services/ProjectInvitationService.php` for create/cancel flows and duplicate-active invitation checks.
- [ ] 2.3 Add `app/Http/Controllers/ProjectCollaboratorController.php` and `ProjectInvitationController.php` with policy authorization and service wiring.
- [ ] 2.4 Update `ProjectController::store()` and `routes/web.php` to redirect to `projects.collaborators` and register authenticated collaborator/invitation routes before `{project:slug}`.

## Phase 3: Integration / Frontend

- [ ] 3.1 Create `resources/js/pages/projects/collaborators.tsx` and `resources/js/components/projects/collaborator-suggestion-card.tsx` with invite, cancel, and skip-to-show actions.
- [ ] 3.2 Extend `resources/js/types/index.ts` for `ProjectInvitation` and `CollaboratorSuggestion`; update `resources/js/components/notification-list.tsx` to route invitation notifications to project show for V1.
- [ ] 3.3 Ensure page props include project, suggestions, and pending invitation state via `ApiResourceTransformer`.

## Phase 4: Testing / Cleanup

- [ ] 4.1 Add feature tests for create redirect, unauthorized access, invite/cancel, duplicate active invite prevention, and notification dispatch.
- [ ] 4.2 Add service tests for tech-overlap suggestions and exclusion rules (creator, participants, already-invited users).
- [ ] 4.3 Add frontend tests if the harness is available for empty state, invite/cancel button states, and skip link; remove temporary comments or TODOs.
