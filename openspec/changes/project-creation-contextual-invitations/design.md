# Design: Project Creation Contextual Invitations

## Technical Approach

Keep project creation as one submit. `ProjectController::store()` still delegates persistence to `ProjectService::create()`, then redirects the creator to `projects.collaborators` instead of `projects.show`. The new page is an optional post-creation step that loads tech-overlap suggestions and lets the creator send or cancel outbound invitations.

`ProjectInvitation` is a separate outbound primitive. `JoinRequest` remains inbound applicant-to-creator flow and should not be reused for creator-initiated invites.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Flow insertion | Redirect after successful `POST /projects` to `GET /projects/{project:slug}/collaborators` | Inline wizard; invitation payload in project create request | Smallest V1. Project creation cannot fail because invitation sending fails, and `ProjectForm` stays focused. |
| Invitation model | New `ProjectInvitation` table/model with `project_id`, `invited_user_id`, `status`, optional `message`, `cancelled_at` | Overload `JoinRequest` | Direction and ownership differ: invitations are creator → user; join requests are user → creator. Separate models avoid policy/status ambiguity. |
| Suggestion logic | New `CollaboratorSuggestionService::forProject(Project $project, int $limit = 12)` | Put query in controller or `ProjectService` | Keeps controllers thin and isolates matching so #155 can reuse, replace, or absorb the query later. |
| V1 matching | Users sharing at least one project tech, excluding creator, participants, and pending invited users | Weighted scoring/ranking | Proposal explicitly reserves advanced matching for #155; V1 only needs relevant suggestions. |

## Data Flow

```text
Create page ──POST /projects──> ProjectController::store
                                  │
                                  ├─ ProjectService::create(project + techs)
                                  └─ redirect projects.collaborators

Collaborators page ──GET──> ProjectCollaboratorController::index
                             ├─ authorize project creator
                             ├─ CollaboratorSuggestionService::forProject
                             └─ Inertia projects/collaborators

Invite button ──POST──> ProjectInvitationController::store
                         ├─ ProjectInvitationService::create
                         └─ ProjectInvitationReceived notification

Cancel button ──POST/DELETE──> ProjectInvitationController::cancel
```

## File Changes

| File | Action | Description |
|---|---|---|
| `database/migrations/*_create_project_invitations_table.php` | Create | Stores outbound invitations with cascade delete and unique pending `project_id + invited_user_id`. |
| `app/Models/ProjectInvitation.php` | Create | Invitation relationships: `project()`, `invitedUser()`. |
| `app/Models/Project.php` | Modify | Add `invitations()` relation. |
| `app/Models/User.php` | Modify | Add `receivedInvitations()` relation. |
| `app/Services/CollaboratorSuggestionService.php` | Create | Encapsulates tech-overlap user query for this V1 and future #155 reuse. |
| `app/Services/ProjectInvitationService.php` | Create | Creates/cancels invitations and dispatches notification. |
| `app/Policies/ProjectInvitationPolicy.php` | Create | Creator can create/cancel invitations for own projects. |
| `app/Http/Controllers/ProjectCollaboratorController.php` | Create | Renders suggestion step. |
| `app/Http/Controllers/ProjectInvitationController.php` | Create | Handles send/cancel actions. |
| `app/Http/Controllers/ProjectController.php` | Modify | Redirect `store()` to collaborators step after create. |
| `app/Notifications/ProjectInvitationReceived.php` | Create | Database/mail/broadcast notification mirroring existing notification channels. |
| `app/Helpers/ApiResourceTransformer.php` | Modify | Add safe invitation/suggestion transforms. |
| `routes/web.php` | Modify | Add authenticated collaborator and invitation routes before public `{project:slug}` route. |
| `resources/js/pages/projects/collaborators.tsx` | Create | Suggestion/invitation page with skip link to project show. |
| `resources/js/components/projects/collaborator-suggestion-card.tsx` | Create | Displays suggested user, matching techs, invite/cancel actions. |
| `resources/js/components/notification-list.tsx` | Modify | Recognize `project_invitation_received`; route to project show for V1. |
| `resources/js/types/index.ts` | Modify | Add `ProjectInvitation` and `CollaboratorSuggestion` interfaces. |

## Interfaces / Contracts

```php
// ProjectInvitation statuses for V1
pending | cancelled
```

Routes:
- `GET /projects/{project:slug}/collaborators` → `projects.collaborators`
- `POST /projects/{project:slug}/invitations` with `invited_user_id`, optional `message`
- `DELETE /project-invitations/{projectInvitation}` or `POST .../cancel` following existing route style

Suggestion shape:
```ts
interface CollaboratorSuggestion {
  user: User & { techs: Tech[] };
  matching_techs: Tech[];
  pending_invitation?: ProjectInvitation | null;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Suggestion exclusions and tech overlap | Service tests with users, techs, participants, invitations. |
| Feature | Redirect, authorization, invite send/cancel, notification creation | Laravel feature tests with `RefreshDatabase`. |
| Frontend | Collaborators page renders suggestions, invite/cancel buttons, skip link | Vitest/RTL for page and card components if frontend test harness remains available. |

## Migration / Rollout

No data backfill required. Add the table, routes, and redirect together. Existing project creation remains valid; rollback restores `projects.show` redirect and removes invitation surfaces.

## Open Questions

- [ ] #179 may already scaffold `ProjectInvitation`; if so, reuse its model/migration naming and only add missing V1 behavior.
- [ ] Notification click target can be project show for V1; #179 may later provide a dedicated invitation response surface.
