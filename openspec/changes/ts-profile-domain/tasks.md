# Tasks: ts-profile-domain

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~70-90 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr-default |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Fix profile page and partial form typing | PR 1 | Keep all profile TS fixes together; no cross-domain changes |
| 2 | Finish profile form null-handling and test fixtures | PR 1 | Same PR; verify compile + targeted test + build |

## Phase 1: Foundation / Types

- [x] 1.1 In `resources/js/pages/profile/edit.tsx`, replace `userTechs: unknown[]` with `UserTech[]` and type `techs` as `Tech[]` from `usePage` without the unsafe cast.
- [x] 1.2 In `resources/js/pages/profile/partials/update-profile-complete-form.tsx`, type `usePage().props.auth.user` as `User` so profile fields are accessed safely.

## Phase 2: Core Implementation

- [x] 2.1 In `resources/js/pages/profile/partials/delete-user-form.tsx`, change `useRef()` to `useRef<HTMLInputElement>(null)` and annotate `deleteUser(e: React.FormEvent)`.
- [x] 2.2 In `resources/js/pages/profile/partials/update-password-form.tsx`, change both refs to `useRef<HTMLInputElement>(null)` and annotate `updatePassword(e: React.FormEvent)`.
- [x] 2.3 In `resources/js/pages/profile/partials/update-profile-information-form.tsx`, annotate `submit(e: React.FormEvent)`.
- [x] 2.4 In `resources/js/pages/profile/partials/social-links-edit-form.tsx`, normalize `onValueChange` with `value ?? ''` before calling `updateLink`.

## Phase 3: Verification

- [x] 3.1 Update `resources/js/pages/profile/partials/update-profile-complete-form.test.tsx` mock `UserTech` and `Tech` fixtures with `created_at` and `updated_at`.
- [x] 3.2 Run `npx tsc --noEmit` and confirm the profile-domain TS2352/TS2554/TS7006/TS18046/TS2322/TS2571/TS2345/TS2739 errors are gone.
- [x] 3.3 Run `npm run build` and `npm run test -- update-profile-complete-form.test.tsx` (or the repo’s existing Vitest target for that file) to confirm no regression.

## Phase 4: Cleanup

- [x] 4.1 Re-check `resources/js/pages/profile/*.tsx` for any unused profile-only type imports after the fixes.
