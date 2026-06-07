```markdown
## Exploration: Project Join Request Lifecycle Visibility

### Current State
The system currently handles join requests with three states: `pending`, `approved`, and `rejected`. The `pending` state visibility was recently implemented, showing applicants their pending request on the project show page. However, the `approved` and `rejected` states are not yet visible to applicants.

**Backend Behavior:**
- `approved`: The applicant is attached as a project participant. The join request record is updated but not displayed.
- `rejected`: The join request record is updated but not displayed. No further action is taken.
- The `JoinRequestService` enforces:
  - Unique constraint only applies to `pending` requests (users can re-apply after rejection).
  - Approval is idempotent (safe to call multiple times).
  - Rejection does not prevent re-application.

**Frontend Behavior:**
- The `ProjectJoinForm` component only handles:
  - `pending`: Shows a "Solicitud enviada" card with a cancel button.
  - No visibility for `approved` or `rejected` states.
- The `viewerJoinRequest` prop only includes `id` and `status` (no `reviewed_at` or `message`).

**Key Files:**
- `app/Models/JoinRequest.php`: Defines the model and relationships.
- `app/Services/JoinRequestService.php`: Handles approval, rejection, and validation logic.
- `app/Http/Controllers/JoinRequestController.php`: Manages routes and responses.
- `resources/js/components/projects/show/project-join-form.tsx`: Handles UI for pending requests.
- `resources/js/types/index.ts`: Defines `JoinRequest` type (missing `reviewed_at` and full `message`).

### Affected Areas
- `resources/js/components/projects/show/project-join-form.tsx` — Must extend UI to show `approved`/`rejected` states.
- `resources/js/types/index.ts` — Must include `reviewed_at` and `message` in `JoinRequest` type for display.
- `app/Http/Resources/JoinRequestResource.php` (if exists) — Must transform `reviewed_at` and `message` for frontend.
- `app/Services/JoinRequestService.php` — Already implements logic but does not enforce UI visibility rules.
- `tests/Feature/JoinRequestTest.php` — Must add tests for UI visibility of `approved`/`rejected` states.

### Approaches

#### 1. **Minimal UI Extension**
- Extend `ProjectJoinForm` to show `approved`/`rejected` states with static messages.
- **Pros**: Low effort, minimal backend changes.
- **Cons**: No context for decisions (e.g., rejection reason), poor UX.
- **Effort**: Low.

#### 2. **Contextual UI with Backend Support**
- Extend `viewerJoinRequest` prop to include `reviewed_at` and `message`.
- Show contextual messages (e.g., "Aprobado el [date]", "Rechazado: [message]").
- Allow re-application for `rejected` requests if the project is still open.
- **Pros**: Better UX, aligns with existing patterns.
- **Cons**: Requires backend changes (API resource, type updates).
- **Effort**: Medium.

#### 3. **Full Lifecycle Dashboard**
- Add a new section to the project show page for join request history.
- Show all past requests (pending, approved, rejected) with timestamps and messages.
- Allow re-application from the dashboard.
- **Pros**: Comprehensive UX, aligns with user expectations.
- **Cons**: High effort, scope creep.
- **Effort**: High.

### Recommendation
**Approach 2: Contextual UI with Backend Support**
- Extend the `viewerJoinRequest` prop to include `reviewed_at` and `message`.
- Update `ProjectJoinForm` to show:
  - `approved`: "Fuiste aprobado como participante el [date]."
  - `rejected`: "Tu solicitud fue rechazada: [message]." + re-apply button if project is open.
- Update `JoinRequestResource` to transform `reviewed_at` and `message`.
- Add tests for UI visibility and re-application flow.

This balances UX and effort while aligning with the existing codebase patterns.

### Risks
- **Membership State Supersedes Join Request State**: If a user is already a participant, the `approved` state should not be shown. The UI must check `project.participants` before showing join request state.
- **Re-application Logic**: The backend already allows re-application after rejection, but the UI must ensure the project is still open.
- **Data Consistency**: The `reviewed_at` and `message` fields must be included in the API response to avoid frontend errors.
- **Type Safety**: The `JoinRequest` type must be updated to reflect the new fields.

### Open Product Questions
1. **Should `rejected` requests show the creator's rejection message?**
   - Current: The `message` field is only used for the applicant's initial request.
   - Proposal: Add a `rejection_message` field to `JoinRequest` for creator feedback.
   - Decision: **Not required for this change** — defer to future iteration.

2. **Should `approved` users see the join request card at all?**
   - Current: The card is hidden if the user is a participant.
   - Proposal: Show a success message (e.g., "You are now a participant") for transparency.
   - Decision: **Yes** — show a static success message for `approved` users.

3. **Should re-application be allowed immediately after rejection?**
   - Current: The backend allows it, but the UI must enforce project openness.
   - Proposal: Allow re-application only if the project is still `open`.
   - Decision: **Yes** — align with existing project status rules.

### Ready for Proposal
**Yes** — The exploration clarifies the current state, affected areas, and recommended approach. The orchestrator should:
1. Confirm the product decisions (rejection messages, re-application rules).
2. Proceed with the **Contextual UI with Backend Support** approach.
3. Highlight the risks (membership state, data consistency) for mitigation in the design phase.
```