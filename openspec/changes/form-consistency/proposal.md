# Proposal: form-consistency

## Intent

Unify the codebase's form component system by migrating all legacy components (TextInput, InputLabel, InputError, Checkbox, PrimaryButton, SecondaryButton, DangerButton) to use shadcn/ui-style semantic tokens, eliminating the visual inconsistency between auth/profile pages and the modern project forms.

## Scope

### In Scope
- Create `resources/js/components/ui/form-error.tsx` — dedicated error component (`text-destructive text-sm`)
- Create `resources/js/components/ui/checkbox.tsx` — shadcn-style checkbox
- Update 6 auth pages (login, register, forgot-password, reset-password, confirm-password, verify-email) to use modern UI components
- Update 4 profile partials (update-profile-information, update-password, update-profile-complete, delete-user) to use modern UI components
- Fix legacy TextInput, InputLabel, PrimaryButton, SecondaryButton, DangerButton to use semantic tokens (`border-input`, `focus:ring-ring`, etc.)

### Out of Scope
- project-form.tsx (already modern)
- Backend validation (FormRequest classes are fine)
- New functionality

## Approach

**Option A — Fix legacy, keep structure**: Update legacy component internals to use semantic tokens while preserving their exported API. Auth/pages stay untouched.

**Option B — Replace with shadcn equivalents throughout**: Deprecate legacy components, update all consumers to use shadcn Button/Input/Label directly. Remove legacy after migration.

**Recommended: Option A** — Lower risk, smaller surface area. Update legacy components to use semantic tokens internally (e.g., `border-input` instead of `border-gray-300`, `focus:ring-ring` instead of `focus:ring-indigo-500`). Create new `form-error.tsx` and `checkbox.tsx` for gaps not covered by existing shadcn equivalents. Auth pages remain unchanged.

Rationale: The legacy components export a stable API used across ~10 pages. Replacing all consumers at once introduces risk and review overload. Token-fixing the internals achieves visual consistency with minimal churn.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `resources/js/components/` | Modified | Fix 5 legacy components: TextInput, InputLabel, PrimaryButton, SecondaryButton, DangerButton |
| `resources/js/components/ui/` | New | Add form-error.tsx, checkbox.tsx |
| `resources/js/pages/auth/*.tsx` | Modified | 6 auth pages consume updated components |
| `resources/js/pages/profile/partials/*.tsx` | Modified | 4 profile partials consume updated components |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Token migration breaks existing focus styles | Low | Test each component manually; use `aria-invalid` for error states |
| Auth pages break after import changes | Medium | Run `php artisan test` after each page; commit per page |

## Rollback Plan

1. Revert `resources/js/components/` changes: `git checkout HEAD -- resources/js/components/text-input.tsx resources/js/components/input-label.tsx resources/js/components/primary-button.tsx`
2. Delete new files: `rm resources/js/components/ui/form-error.tsx resources/js/components/ui/checkbox.tsx`
3. Run tests: `php artisan test`

## Dependencies

- None

## Success Criteria

- [ ] `TextInput` uses `border-input` and `focus:ring-ring`
- [ ] `InputLabel` uses `text-foreground` (not `text-gray-700`)
- [ ] `PrimaryButton` uses `bg-primary` variant (not hardcoded gray)
- [ ] Auth pages render without visual regression
- [ ] `php artisan test` passes