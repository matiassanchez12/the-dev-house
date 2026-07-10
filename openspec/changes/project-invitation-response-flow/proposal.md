# Proposal: project-invitation-response-flow

## Intent

Project creators can invite users, but invited users currently have no way to respond. They arrive at the project page with no visible action, creating confusion and dead-end UX. This change adds explicit Accept and Reject actions so invited users can complete the invitation lifecycle and join projects directly from the notification flow.

## Scope

### In Scope
- Accept invitation: attach user as project participant, mark invitation `accepted`.
- Reject invitation: mark invitation `rejected`, keep audit trail.
- Creator notification when invitation is accepted (`ProjectInvitationAccepted`).
- Frontend Accept/Reject actions on the project show page when viewer has a pending invitation.
- Update notification list to surface the new accepted type.
- Policy gates: only the invited user may accept or reject.
- Service layer: `accept()` and `reject()` with transaction safety.
- Block re-invitation after any non-cancelled response (pending, accepted, rejected).

### Out of Scope
- Re-inviting a user after rejection (they may still send a `JoinRequest`).
- Direct messaging or chat around invitations.
- Email delivery of the accepted notification (database + broadcast only in V1).
- Bulk accept/reject or invitation management dashboard.
- Undo/revert after accept or reject.

## Capabilities

### New Capabilities
- `project-invitation-response`: Accept and reject incoming project invitations with participant attachment on accept.

### Modified Capabilities
- `project-invitation`: Extend lifecycle requirements to include `accept` and `reject` transitions; update duplicate-blocking rule to cover all non-cancelled statuses.

## Approach

Adopt **Approach 1** from exploration: extend `ProjectInvitation` with `STATUS_ACCEPTED`, `STATUS_REJECTED`, and a single `responded_at` timestamp. `accept()` runs inside a DB transaction that attaches the invited user to `project_participants` (guarding against duplicate pivots), sets `status = accepted`, and sets `responded_at = now()`. `reject()` sets `status = rejected` and `responded_at = now()`. `hasActiveInvitation()` widens to `status IN (pending, accepted, rejected)` so creators cannot re-invite a user who ever responded.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/Models/ProjectInvitation.php` | Modified | Add `STATUS_ACCEPTED`, `STATUS_REJECTED`, and `responded_at` handling |
| `database/migrations/` | New | Migration adding `responded_at` to `project_invitations` |
| `app/Services/ProjectInvitationService.php` | Modified | Add `accept()` and `reject()`; update `hasActiveInvitation()` |
| `app/Policies/ProjectInvitationPolicy.php` | Modified | Add `accept` and `reject` gates for invited user only |
| `app/Http/Controllers/ProjectInvitationController.php` | Modified | Add `accept` and `reject` action methods |
| `routes/web.php` | Modified | Add routes for accept/reject (e.g., PATCH/POST) |
| `app/Notifications/ProjectInvitationAccepted.php` | New | Notify creator on accept |
| `resources/js/pages/projects/show.tsx` | Modified | Show Accept/Reject when viewer has pending invitation |
| `resources/js/components/notification-list.tsx` | Modified | Handle `project_invitation_accepted` type |
| `app/Helpers/ApiResourceTransformer.php` | Modified | Expose `responded_at` in invitation transformer |
| `tests/Unit/Services/ProjectInvitationServiceTest.php` | Modified | Tests for accept/reject logic |
| `tests/Unit/Policies/ProjectInvitationPolicyTest.php` | Modified | Tests for accept/reject authorization |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Re-invitation semantics change breaks existing cancel-only mental model | Med | Document in spec; add explicit test for re-invite blocked after rejection |
| Participant pivot race condition on accept | Low | Use transaction + `syncWithoutDetaching` or explicit duplicate check |
| Notification list breaks on unhandled new type | Low | Add type to union/label map before backend starts emitting it |
| JoinRequest after rejection path unclear | Low | Add explicit test proving rejected invitation does NOT block JoinRequest |

## Rollback Plan

1. Revert the migration that adds `responded_at`.
2. Revert controller, policy, service, and route changes.
3. Remove `ProjectInvitationAccepted` notification class.
4. Revert frontend changes in `show.tsx` and `notification-list.tsx`.
5. No data loss risk: `accepted`/`rejected` rows remain in DB but are not surfaced while code is rolled back.

## Dependencies

- `project-invitation` spec is already implemented and merged.
- `project-join-request` logic must remain untouched (this change only reads it, never writes via JoinRequestService).

## Success Criteria

- [ ] Invited user sees Accept and Reject buttons on the project show page.
- [ ] Accept attaches the user to project participants and marks invitation accepted.
- [ ] Reject marks invitation rejected with no participant change.
- [ ] Creator receives a notification when invitation is accepted.
- [ ] Owner cannot re-invite a user who has accepted or rejected.
- [ ] Rejected user can still send a JoinRequest.
- [ ] All new and modified logic is covered by unit/feature tests.
- [ ] Notification list handles the new accepted type without errors.
