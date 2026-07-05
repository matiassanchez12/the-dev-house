# Proposal: Form Accessibility and shadcn Foundation

## Intent

Rehydrate the existing plan into OpenSpec for the current branch. Slices 1 and 2 are already merged in code, so the active implementation focus is Slice 3: onboarding and profile-complete forms.

## Scope

### In Scope
- Keep the existing shadcn/ui form foundation as the baseline.
- Migrate onboarding and profile-complete forms to accessible shadcn/ui controls.
- Preserve current Inertia `useForm` behavior and Laravel validation contracts.
- Keep onboarding step flow, endpoints, and copy unchanged.

### Out of Scope
- New backend validation rules or routes.
- Additional pages outside onboarding and profile-complete.
- Visual redesign, theming, or site-wide accessibility auditing.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `onboarding-flow`
- `profile-complete-form`

## Approach

Apply the established form foundation to the remaining slice: replace raw controls with shadcn/ui primitives, keep labels programmatic, wire invalid state and error announcements, and preserve the current submission flow.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `resources/js/pages/onboarding/index.tsx` | Modified | Accessible shadcn/ui controls for the remaining onboarding slice |
| `resources/js/pages/profile/partials/update-profile-complete-form.tsx` | Modified | Accessible shadcn/ui controls for profile-complete |
| `resources/js/components/ui/field.tsx` | Existing | Reused as the form wiring baseline |
| `resources/js/components/ui/form-error.tsx` | Existing | Reused for error announcements |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Visual regression from control swaps | Medium | Keep the migration limited to Slice 3 and verify the affected pages manually |
| Test drift from DOM changes | Medium | Update form assertions alongside the slice |
| Focus behavior changes | Low | Preserve current step flow and avoid new focus abstractions |

## Rollback Plan

Revert the Slice 3 page updates and restore the prior onboarding/profile-complete markup if the migration causes regressions.

## Dependencies

- Existing shadcn/ui foundation from the earlier slices
- Current Laravel validation contracts

## Success Criteria

- [ ] Onboarding and profile-complete fields use accessible shadcn/ui controls.
- [ ] Invalid fields expose `aria-invalid` and stable error associations.
- [ ] Onboarding flow and backend contracts remain unchanged.
