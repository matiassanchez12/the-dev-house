# Proposal: ts-profile-domain

## Intent

Eliminate 16 TypeScript compilation errors concentrated in the profile domain (`resources/js/pages/profile/`). All errors are compile-time with zero runtime impact. This change hardens type safety for profile page props, refs, event handlers, form auth typing, select null handling, and test fixtures.

## Scope

### In Scope
- Fix `useRef()` + event handler types in `delete-user-form.tsx`, `update-password-form.tsx`, `update-profile-information-form.tsx`
- Fix unsafe `usePage` cast and prop types in `profile/edit.tsx`
- Type `auth.user` from `usePage` in `update-profile-complete-form.tsx`
- Handle Select `null` value in `social-links-edit-form.tsx`
- Complete mock fixture fields in `update-profile-complete-form.test.tsx`

### Out of Scope
- Shared app-shell types (covered by `ts-shared-app-types`)
- Projects, onboarding, users, auth, join-requests domains
- Runtime behavior changes

## Capabilities

### New Capabilities
None

### Modified Capabilities
None — this is a type-hardening refactor with no spec-level requirement changes.

## Approach

Adopt **per-file targeted fixes** (Approach A from exploration). Each error is fixed at its source without cross-file refactors:

1. `useRef()` → `useRef<HTMLInputElement>(null)` where missing
2. Event handlers → `React.FormEvent` annotations
3. `usePage` casts → proper typing or removal
4. Select null → `value ?? ''`
5. Test fixtures → add `created_at` / `updated_at`

## Affected Areas

| File | Impact | Description |
|------|--------|-------------|
| `resources/js/pages/profile/edit.tsx` | Modified | Remove unsafe `usePage` cast; type `userTechs` as `UserTech[]` |
| `resources/js/pages/profile/partials/delete-user-form.tsx` | Modified | Type `useRef`, type `deleteUser` event handler |
| `resources/js/pages/profile/partials/update-password-form.tsx` | Modified | Type `useRef`s, type `updatePassword` event handler |
| `resources/js/pages/profile/partials/update-profile-information-form.tsx` | Modified | Type `submit` event handler |
| `resources/js/pages/profile/partials/update-profile-complete-form.tsx` | Modified | Type `auth.user` from `usePage` |
| `resources/js/pages/profile/partials/social-links-edit-form.tsx` | Modified | Handle Select `null` value |
| `resources/js/pages/profile/partials/update-profile-complete-form.test.tsx` | Modified | Add missing `created_at`/`updated_at` to mocks |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `useRef<HTMLInputElement>(null)` accessed before mount | Very Low | `.current` only accessed in `onError` callbacks after render |
| `usePage` cast drifts from backend prop shape | Low | Defensive cast; changes surface at runtime or in page tests |
| Test fixture additions break assertions | Very Low | Mocks isolated to this file; no assertions depend on fields being absent |
| Select null handling changes form behavior | Very Low | `value ?? ''` preserves existing default for new links |

## Rollback Plan

Revert the single PR. All changes are type-only with no migration, config, or schema changes.

## Dependencies

- `ts-shared-app-types` (shared app-shell types) should be applied first or in parallel — profile domain builds on those shared types.

## Success Criteria

- [ ] `npx tsc --noEmit` reports zero errors in all 7 profile files
- [ ] `npm run build` still succeeds
- [ ] No new TypeScript errors introduced
