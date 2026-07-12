# Design: Project Invitation Response Flow

## Technical Approach

Extend the existing `ProjectInvitation` lifecycle from creator-only send/cancel to invited-user accept/reject. V1 stays inside the current Laravel service/controller/policy pattern: controllers authorize and redirect, `ProjectInvitationService` owns state transitions, and Inertia receives the viewer's pending invitation for project-page actions.

## Architecture Decisions

| Area | Choice | Alternatives considered | Rationale |
|------|--------|-------------------------|-----------|
| Lifecycle | Add `accepted`, `rejected`, and nullable `responded_at`; keep `cancelled_at` for owner cancellation. | Separate accept/reject tables or overloading `cancelled_at`. | Minimal schema change and clear audit semantics. |
| Response writes | Implement `accept(ProjectInvitation)` and `reject(ProjectInvitation)` in `ProjectInvitationService`. | Put transition logic in controller. | Matches existing service layer; keeps controller thin. |
| Participant attach | On accept, run a DB transaction and attach via `syncWithoutDetaching([$invited_user_id])`. | Pre-check then `attach()`. | Idempotent against duplicate pivot races while still updating invitation once. |
| Notifications | Emit `ProjectInvitationAccepted` to `project.creator` after successful accept. | Notify inside transaction or email in V1. | Avoids notification for rolled-back changes; proposal limits V1 to database + broadcast. |
| Re-invitation | Treat `pending`, `accepted`, and `rejected` as active for duplicate blocking; leave `cancelled` re-invitable. | Block every historical row forever. | Preserves cancel/reinvite behavior while making responses final. |

## Data Flow

Accept flow:

```text
Project page → ProjectInvitationController@accept → policy.accept
  → ProjectInvitationService@accept
    → transaction: lock/update invitation + syncWithoutDetaching participant
  → notify creator: ProjectInvitationAccepted
  → redirect projects.show
```

Reject flow:

```text
Project page → ProjectInvitationController@reject → policy.reject
  → ProjectInvitationService@reject
    → update status=rejected, responded_at=now()
  → redirect projects.show
```

JoinRequest remains independent: rejected invitations only block future creator invitations through `ProjectInvitationService::hasActiveInvitation()`; they MUST NOT be read by `JoinRequestService::validateCanCreate()`.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `database/migrations/*_add_response_fields_to_project_invitations_table.php` | Create | Add nullable `responded_at`; do not edit existing migration. |
| `app/Models/ProjectInvitation.php` | Modify | Add `STATUS_ACCEPTED`, `STATUS_REJECTED`, fillable/cast for `responded_at`; keep `pending_invitation_key` pending-only. |
| `app/Services/ProjectInvitationService.php` | Modify | Add `accept()`/`reject()` and widen `hasActiveInvitation()` to pending/accepted/rejected. |
| `app/Policies/ProjectInvitationPolicy.php` | Modify | Add `accept` and `reject`: only invited user and pending invitations. |
| `app/Http/Controllers/ProjectInvitationController.php` | Modify | Add `accept`/`reject` action methods with Gate authorization and redirects. |
| `routes/web.php` | Modify | Add authenticated POST routes for invitation accept/reject before public project slug routes. |
| `app/Notifications/ProjectInvitationAccepted.php` | Create | Database + broadcast notification to creator. |
| `app/Helpers/ApiResourceTransformer.php` | Modify | Expose `responded_at`; expose viewer pending invitation to project payload. |
| `app/Http/Controllers/ProjectController.php` | Modify | Load/pass viewer pending invitation for `projects/show`. |
| `resources/js/types/index.ts` | Modify | Extend `ProjectInvitation` statuses and add `responded_at`; add optional `viewerInvitation` to `Project`. |
| `resources/js/pages/projects/show.tsx` | Modify | Render accept/reject actions only for pending viewer invitation. |
| `resources/js/components/notification-list.tsx` | Modify | Add `project_invitation_accepted` handling and route to project page. |

## Interfaces / Contracts

```php
ProjectInvitation::STATUS_PENDING = 'pending';
ProjectInvitation::STATUS_ACCEPTED = 'accepted';
ProjectInvitation::STATUS_REJECTED = 'rejected';
ProjectInvitation::STATUS_CANCELLED = 'cancelled';
```

Routes:

```php
POST /project-invitations/{projectInvitation}/accept
POST /project-invitations/{projectInvitation}/reject
```

Notification payload type: `project_invitation_accepted` with project id/slug/title and invited user id/name.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|--------------|----------|
| Unit | Service accepts, rejects, duplicate blocking after response, rejected invite does not affect JoinRequest. | Extend service tests with `RefreshDatabase` and `Notification::fake()`. |
| Unit | Policy allows only invited user for pending response. | Extend `ProjectInvitationPolicyTest`. |
| Feature | Routes authorize, mutate state, redirect. | Authenticated POST tests for accept/reject. |
| Frontend | Button visibility and route invocation. | If existing frontend test harness is available; otherwise covered by build/type checks. |

## Migration / Rollout

No data migration required beyond adding nullable `responded_at`. Existing pending/cancelled invitations remain valid.

## Open Questions

- [ ] None.
