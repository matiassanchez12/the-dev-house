# Proposal: Project Join Request Lifecycle Visibility

## Intent

`projects/show` currently handles pending requests but leaves approved/rejected applicants without clear lifecycle feedback. This creates ambiguity after moderation and can show join-request UI even when membership already answers the user’s state.

## Scope

### In Scope
- Update only the project detail view (`resources/js/pages/projects/show.tsx`).
- Extend the project show payload contract so authenticated viewers can receive `viewerJoinRequest` for approved/rejected states needed by the detail UI.
- Show a rejected-state message explaining the creator started the project and link users to `/projects`.
- Hide the join-request section entirely when membership or an approved state supersedes it.
- Add backend + frontend tests first (`php artisan test`, `npm run test`) for payload, precedence, and visibility behavior.

### Out of Scope
- Dashboards, project listings, notifications, and inbox/history surfaces.
- Reworking approval/rejection workflows, moderation rules, or request copy beyond this detail-page message.
- Adding rejection reasons, timestamps, or re-application flows.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `app`: Project detail join-request visibility MUST cover approved/rejected lifecycle outcomes with membership precedence.

## Approach

- Backend: update `app/Http/Controllers/ProjectController.php` and `app/Helpers/ApiResourceTransformer.php` so `projects/show` exposes viewer-specific join-request state required by the UI.
- Frontend: update `resources/js/pages/projects/show.tsx`, `resources/js/components/projects/show/project-join-form.tsx`, and related types so rendering is driven by membership first, then join-request state.
- UX: `rejected` shows the informational message + `/projects` link; `approved` shows no join-request section.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/Http/Controllers/ProjectController.php` | Modified | Load viewer lifecycle state for show payload |
| `app/Helpers/ApiResourceTransformer.php` | Modified | Serialize contract for detail-view join-request visibility |
| `resources/js/pages/projects/show.tsx` | Modified | Apply page-level precedence rules |
| `resources/js/components/projects/show/project-join-form.tsx` | Modified | Render rejected state or hide section |
| `resources/js/types/index.ts` | Modified | Align frontend types with payload contract |
| `tests/Feature/ProjectTest.php` | Modified | Assert payload + precedence |
| `resources/js/components/projects/show/project-join-form.test.tsx` | Modified | Assert approved/rejected detail behavior |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Payload/UI drift | Med | Lock contract with backend + component tests first |
| State precedence bugs | Med | Test participant, approved, rejected, and eligible-no-request paths explicitly |

## Rollback Plan

Revert the new payload fields/branches and restore the current pending-only detail-page behavior.

## Dependencies

- Existing `viewerJoinRequest` pending-state contract
- Current join request moderation lifecycle in `JoinRequestService`

## Success Criteria

- [ ] On `projects/show`, rejected applicants see the approved product message and `/projects` link.
- [ ] On `projects/show`, approved users and participants do not see the join-request section.
- [ ] No other application surface changes behavior.
