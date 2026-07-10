# Exploration: project-invitation-response-flow

## Current State

The `ProjectInvitation` foundation is fully merged into `development`.

- **Model**: `ProjectInvitation` has `pending` and `cancelled` statuses, plus `cancelled_at`. A `pending_invitation_key` enforces a unique constraint (`project_id + invited_user_id`) while the status is `pending`; it nulls out when cancelled.
- **Service**: `ProjectInvitationService` supports `create()` (sends `ProjectInvitationReceived` notification) and `cancel()` (sets status to `cancelled`).
- **Policy**: `ProjectInvitationPolicy` authorizes `create` and `cancel` for the project owner only.
- **Controller**: `ProjectInvitationController` exposes `store` and `destroy`.
- **Routes**:
  - `POST /projects/{project:slug}/invitations`
  - `DELETE /project-invitations/{projectInvitation}`
- **Frontend**: The collaborator suggestion page (`/projects/{slug}/collaborators`) renders pending invitations with a cancel action. The notification list already handles `project_invitation_received` and links to the project show page.
- **JoinRequest parity**: `JoinRequest` has `pending → approved|rejected`, attaches participants on approve, and notifies both applicant and creator at every step.

## Affected Areas

| File | Why it is affected |
|------|------------------|
| `app/Models/ProjectInvitation.php` | Needs `STATUS_ACCEPTED` and `STATUS_REJECTED` constants |
| `database/migrations/2026_07_08_000000_create_project_invitations_table.php` | Needs `responded_at` timestamp (or `accepted_at`/`rejected_at`) for the new statuses; a NEW migration must be created |
| `app/Services/ProjectInvitationService.php` | Needs `accept()` and `reject()` methods; `hasActiveInvitation()` must be widened to block re-invitation after ANY non-cancelled record |
| `app/Policies/ProjectInvitationPolicy.php` | Needs `accept` and `reject` gates (invited user only) |
| `app/Http/Controllers/ProjectInvitationController.php` | Needs `accept` and `reject` action methods |
| `routes/web.php` | Needs `PATCH/POST` routes for accept/reject |
| `app/Notifications/ProjectInvitationAccepted.php` | New notification to the creator when an invitation is accepted |
| `resources/js/components/notification-list.tsx` | May need to surface the new `project_invitation_accepted` type |
| `resources/js/pages/projects/show.tsx` | Needs to display Accept/Reject actions when the viewer has a pending invitation |
| `app/Helpers/ApiResourceTransformer.php` | May need to expose `responded_at` in the invitation transformer |
| `tests/Unit/Services/ProjectInvitationServiceTest.php` | New tests for accept/reject logic |
| `tests/Unit/Policies/ProjectInvitationPolicyTest.php` | New tests for accept/reject authorization |

## Approaches

### 1. Extend Invitation Model with `responded_at` + New Statuses (Recommended)

- Add `STATUS_ACCEPTED` and `STATUS_REJECTED` to the model.
- Add a single `responded_at` timestamp (mirrors `reviewed_at` in `JoinRequest`).
- `accept()` attaches the invited user to `project_participants` inside a transaction, sets `status = accepted`, sets `responded_at = now()`.
- `reject()` sets `status = rejected`, sets `responded_at = now()`.
- Update `hasActiveInvitation()` to check for `status IN (pending, accepted, rejected)` so a rejected user cannot be re-invited.
- Create `ProjectInvitationAccepted` notification (database + broadcast; mail is optional V1).

**Pros**: Minimal schema change; consistent with `JoinRequest` patterns; `pending_invitation_key` naturally clears on non-pending status so the unique constraint behaves correctly.  
**Cons**: Slightly less explicit than separate `accepted_at`/`rejected_at` columns.  
**Effort**: Medium

### 2. Add Separate `accepted_at` and `rejected_at` Columns

- Same as above, but with two dedicated timestamps.

**Pros**: Very explicit; easy to query "how many accepted vs rejected invitations".  
**Cons**: More migration churn; no other table in the codebase uses this pattern (JoinRequest uses a single `reviewed_at`).  
**Effort**: Medium

### 3. Treat Accept as "Delete + JoinRequest Auto-Approve"

- On accept, delete the invitation and trigger `JoinRequestService::create` + `approve` as if the user had applied.

**Pros**: Reuses all JoinRequest machinery.
**Cons**: Loses the audit trail of who was invited vs who applied; overcomplicates the flow; invitations and requests are semantically different directions.
**Effort**: High (and wrong abstraction)

## Recommendation

Adopt **Approach 1**. It is the smallest schema delta, mirrors the existing `JoinRequest` design, and keeps the invitation audit trail intact. The `responded_at` column is sufficient for V1 analytics.

## Risks

- **Re-invitation semantics change**: Widening `hasActiveInvitation()` from `pending`-only to `any non-cancelled` means a previously rejected user can NEVER be re-invited by the creator. This matches the business rule, but it changes the current behavior where cancelling was the only terminal state. Document this clearly in the spec.
- **JoinRequest after rejection**: A user with a rejected invitation can still create a `JoinRequest`. `JoinRequestService::validateCanCreate()` does NOT check invitations, which is correct per the requirement, but we should add an explicit test proving this works.
- **Participant attachment race condition**: `accept()` must guard against duplicate pivot rows (same pattern as `JoinRequestService::approve`).
- **Notification overload**: The creator will now receive a `ProjectInvitationAccepted` notification. Ensure the notification list does not break if the new type is unhandled; add it to the type union and label map.
- **Frontend entry point**: The notification currently links to the project show page. The Accept/Reject UI must be visible there when `viewerPendingInvitation` is present. We need to pass the viewer's pending invitation into the Inertia props for `projects.show`.

## Ready for Proposal

Yes. The exploration confirms a clean extension path with no structural refactoring required. The orchestrator should proceed to `sdd-propose`.
