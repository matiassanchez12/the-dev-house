# Proposal: Project Creation Contextual Invitations

## Intent

Project creators currently publish projects and wait passively for applicants. There is no way to proactively reach relevant collaborators during or immediately after creation. This change adds an optional post-creation step that suggests users whose techs overlap with the project's techs, letting the creator send contextual invitations without leaving the creation flow.

## Scope

### In Scope
- `ProjectInvitation` primitive: migration, model, policy, notification
- Post-creation redirect to a new `/projects/{slug}/collaborators` suggestion page
- Tech-overlap suggestion query (basic overlap, no scoring)
- Send and cancel invitations from the suggestion page
- Exclude creator, existing participants, and already-invited users from suggestions

### Out of Scope
- Multi-step wizard during creation
- Advanced matching/scoring algorithms (reserved for #155)
- Direct messaging (DMs) between users
- Invitation acceptance/rejection UI (handled by notification + implicit accept when user joins)
- Bulk invitation actions

## Capabilities

### New Capabilities
- `project-invitation`: Outbound invitation primitive with model, migration, policy, and notification
- `collaborator-suggestions`: Basic tech-overlap query service to find relevant users for a project

### Modified Capabilities
- None

## Approach

Adopt **Post-Creation Redirect Step** from exploration. `POST /projects` remains unchanged. After `ProjectService::create()` succeeds, redirect to a new `GET /projects/{slug}/collaborators` page. This page loads suggestions via a dedicated `CollaboratorSuggestionService` and renders an invitation UI. The creator can skip the step freely.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `database/migrations/` | New | `project_invitations` table |
| `app/Models/Project.php` | Modified | Add `invitations()` relation |
| `app/Models/User.php` | Modified | Add `receivedInvitations()` relation |
| `app/Services/` | New | `CollaboratorSuggestionService`, `ProjectInvitationService` |
| `app/Policies/` | New | `ProjectInvitationPolicy` |
| `app/Notifications/` | New | `ProjectInvitationReceived` |
| `routes/web.php` | Modified | Routes for suggestions and invitation CRUD |
| `resources/js/pages/projects/` | New | `collaborators.tsx` suggestion page |
| `resources/js/components/projects/` | New | Invitation UI components |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Concept collision with `JoinRequest` | Med | Strict naming: `Invitation` = outbound, `Request` = inbound |
| Suggestion query performance | Low | Index `project_tech` and `user_tech` pivot tables; monitor `withCount` |
| #155 later refactors matching logic | Med | Isolate query in `CollaboratorSuggestionService` |

## Rollback Plan

1. Remove new routes.
2. Drop `project_invitations` migration.
3. Revert redirect in `ProjectController::store()` to original behavior.
4. Delete new frontend page and components.

## Dependencies

- Existing Reverb notification infrastructure
- Existing `techs` / `project_tech` / `user_tech` pivot tables

## Success Criteria

- [ ] Project creator is redirected to suggestions page after creation
- [ ] Suggested users share at least one tech with the project
- [ ] Creator, participants, and already-invited users are excluded from suggestions
- [ ] Creator can send an invitation; recipient receives a notification
- [ ] Creator can cancel a sent invitation
- [ ] Creator can skip the step without blocking project creation
