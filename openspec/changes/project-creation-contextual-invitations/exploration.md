## Exploration: project-creation-contextual-invitations

### Current State
- Project creation is a single-step form (`ProjectForm`) posting to `POST /projects`.
- `ProjectService::create()` persists the project, slug, images, and syncs techs. No post-creation hooks exist.
- `JoinRequest` is the only request/invitation primitive. It is inbound (applicant → creator) with `pending|approved|rejected` status and a unique `project_id+user_id` constraint.
- Notifications (`JoinRequestReceived`, etc.) use `database+mail+broadcast` via Reverb.
- No `ProjectInvitation` model, migration, or UI exists.
- Existing "matching" logic lives only in `OnboardingService::getRecommendations()`, which finds open projects matching a user's techs. There is no reusable user-to-project tech overlap service.

### Affected Areas
- `app/Http/Controllers/ProjectController.php` — `store()` may need to accept invitation payload OR redirect to a suggestion step
- `app/Services/ProjectService.php` — `create()` is the insertion point; needs to remain decoupled from invitation logic
- `resources/js/pages/projects/create.tsx` — single-step form; suggestion UI could be added as a post-creation step or inline
- `resources/js/components/projects/project-form.tsx` — core form component; should NOT be bloated with invitation fields
- `app/Models/Project.php` — will need `invitations()` relation
- `app/Models/User.php` — will need `receivedInvitations()` relation
- `routes/web.php` — new routes for suggestions and invitation CRUD
- `app/Helpers/ApiResourceTransformer.php` — new transformer for invitations
- `database/migrations/` — new migration for `project_invitations` table
- `app/Notifications/` — new `ProjectInvitationReceived` notification

### Approaches
1. **Post-Creation Redirect Step (Recommended)**
   - Description: Keep `POST /projects` unchanged. After creation, redirect to a new `GET /projects/{slug}/collaborators` page that loads suggestions and lets the creator invite.
   - Pros: Clean separation of concerns; `ProjectService::create()` stays simple; invitation errors don't rollback project creation; easy to skip.
   - Cons: Slightly more routing/frontend work; requires a new page/component.
   - Effort: Medium

2. **Inline Wizard (Not Recommended)**
   - Description: Convert project creation into a multi-step wizard where step 2 is suggestions/invitations, and only one POST happens at the end.
   - Pros: Fewer network requests; "atomic" feel.
   - Cons: Breaks existing simple form; complicates validation (techs must be selected before suggestions can be fetched); harder to implement and test; increases form complexity.
   - Effort: High

3. **Same-Request Payload (Simplest Backend, Risky UX)**
   - Description: Add `invitations` array to the existing `POST /projects` payload and handle everything in `ProjectService`.
   - Pros: Minimal new routes; one transaction.
   - Cons: Blurs boundaries; validation becomes complex; if invitation fails, project creation might feel "tainted"; frontend form becomes heavy.
   - Effort: Low (backend), High (frontend/UX)

### Recommendation
Adopt **Approach 1 (Post-Creation Redirect Step)**. It respects the existing thin-controller/service-layer architecture, keeps project creation resilient, and gives the best UX for an optional action. The creator can skip it without friction.

### Risks
- **Concept Collision**: `JoinRequest` and `ProjectInvitation` are opposites in direction. We must keep naming unambiguous (`Invitation` = outbound creator→user, `Request` = inbound user→creator) in models, UI, and notifications.
- **Query Performance**: Tech-overlap suggestion queries (`user_tech` vs `project_tech`) need proper indexes on pivot tables. Without `withCount` or raw join ordering, large tables may be slow.
- **#155 Dependency**: This change will likely define the first reusable "matching by tech overlap" query. If #155 later adds scoring/ranking, we may need to refactor the suggestion query. Build it as a dedicated `CollaboratorSuggestionService` to isolate the query.
- **#179 Scope Overlap**: If #179 scaffolds `ProjectInvitation`, this change consumes it. If #179 doesn't exist yet, this change must introduce the full foundation (migration + model + notification + policy).

### Ready for Proposal
Yes. The exploration confirms a clean insertion point and a viable decoupled approach. The orchestrator should proceed to `sdd-propose`.
