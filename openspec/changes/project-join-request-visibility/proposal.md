# Proposal: Project Join Request Visibility

## Intent

Project pages currently show the join form to eligible viewers even when they already have a pending request. This creates duplicate-action confusion and hides useful status feedback. The change should expose viewer-specific join request state and replace the form with a pending-state UI.

## Scope

### In Scope
- Add `viewerJoinRequest` to the project show payload for the authenticated viewer.
- Replace the join form with a pending-state surface when `viewerJoinRequest.status === 'pending'`.
- Cover payload + visibility behavior with backend and frontend tests under strict TDD.

### Out of Scope
- Approval/rejection experience redesign beyond preserving contract compatibility.
- Reworking join request creation, moderation rules, or participant management flows.

## Capabilities

### New Capabilities
- `project-join-request-visibility`: Viewer-specific join-request state on the project detail experience.

### Modified Capabilities
- `app`: Project show/join UI requirements now depend on viewer-specific join request visibility.

## Approach

- Backend: load the viewer's project join request in `ProjectController.php` and append `viewerJoinRequest` in `app/Helpers/ApiResourceTransformer.php`.
- Frontend: in `resources/js/pages/projects/show.tsx` and `resources/js/components/projects/show/project-join-form.tsx`, render the join form only when the viewer is eligible and has no pending request.
- Test intent: start with failing feature tests for payload + visibility rules via `php artisan test`; add frontend coverage only if UI logic is isolated enough to warrant `npm run test`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/Http/Controllers/ProjectController.php` | Modified | Load viewer join request context |
| `app/Helpers/ApiResourceTransformer.php` | Modified | Expose `viewerJoinRequest` |
| `resources/js/pages/projects/show.tsx` | Modified | Gate join UI by payload state |
| `resources/js/components/projects/show/project-join-form.tsx` | Modified | Show pending replacement instead of form |
| `tests/Feature/ProjectTest.php` | Modified | Assert project payload contract |
| `tests/Feature/JoinRequestTest.php` | Modified | Assert duplicate/pending visibility behavior |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Payload/view mismatch | Med | Lock contract with feature tests before implementation |
| Extra query cost | Low | Eager-load or fetch viewer request once per show action |

## Rollback Plan

Revert the payload field and restore unconditional eligible-user form rendering on the project show page.

## Dependencies

- Clean implementation branch created from `master`
- Existing join request validation in `JoinRequestService`

## Success Criteria

- [ ] Authenticated viewers with pending requests receive `viewerJoinRequest` on project show.
- [ ] Pending viewers do not see the join form; eligible viewers without a pending request still do.
