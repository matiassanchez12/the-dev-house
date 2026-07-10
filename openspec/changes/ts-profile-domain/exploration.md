# Exploration: ts-profile-domain

## Executive Summary

The profile TypeScript domain has **16 type errors** out of 66 total in the codebase. These are concentrated in **6 files** under `resources/js/pages/profile/`. All errors are compile-time only with zero runtime impact. One focused PR is realistic: ~80 changed lines across 6 files, well under the 400-line review budget.

---

## Quick Path

1. Fix `edit.tsx`: replace `unknown[]` with proper `Tech[]`/`UserTech[]` types, remove unsafe `usePage` cast
2. Fix `delete-user-form.tsx`: add `useRef<HTMLInputElement>(null)`, type event handlers
3. Fix `update-password-form.tsx`: add `useRef<HTMLInputElement>(null)`, type event handlers
4. Fix `update-profile-information-form.tsx`: type the `submit` event handler
5. Fix `update-profile-complete-form.tsx`: type `user` from `usePage` (narrow `unknown` via interface or cast)
6. Fix `update-profile-complete-form.test.tsx`: add missing `created_at`/`updated_at` to mock data
7. Fix `social-links-edit-form.tsx`: handle `null` platform value from Select
8. Run `npx tsc --noEmit` and confirm profile errors are gone

---

## Current State

`npx tsc --noEmit` reports 66 errors total. After filtering to the profile domain, **16 errors** remain across 6 files:

### Error Inventory (Profile Scope)

| File | Line | Error | TS Code | Count | Root Cause |
|------|------|-------|---------|-------|------------|
| `edit.tsx` | 23 | `Conversion of type ... may be a mistake` | TS2352 | 1 | Unsafe `usePage().props as { techs: unknown[] }` |
| `edit.tsx` | 51 | `Type 'unknown[]' is not assignable to type 'UserTech[]'` | TS2322 | 1 | `userTechs` declared as `unknown[]` in Props |
| `edit.tsx` | 52 | `Type 'unknown[]' is not assignable to type 'Tech[]'` | TS2322 | 1 | `techs` from `usePage` casted to `unknown[]` |
| `delete-user-form.tsx` | 11 | `Expected 1 arguments, but got 0` | TS2554 | 1 | `useRef()` called without initial value |
| `delete-user-form.tsx` | 29 | `Parameter 'e' implicitly has an 'any' type` | TS7006 | 1 | Untyped `deleteUser(e)` event handler |
| `delete-user-form.tsx` | 37 | `'passwordInput.current' is of type 'unknown'` | TS18046 | 1 | `useRef()` returns `RefObject<unknown>` |
| `delete-user-form.tsx` | 88 | `Type 'RefObject<unknown>' is not assignable` | TS2322 | 1 | `ref` prop expects `HTMLInputElement` |
| `update-password-form.tsx` | 10 | `Expected 1 arguments, but got 0` | TS2554 | 1 | `useRef()` called without initial value |
| `update-password-form.tsx` | 11 | `Expected 1 arguments, but got 0` | TS2554 | 1 | `useRef()` called without initial value |
| `update-password-form.tsx` | 27 | `Parameter 'e' implicitly has an 'any' type` | TS7006 | 1 | Untyped `updatePassword(e)` event handler |
| `update-password-form.tsx` | 40 | `'passwordInput.current' is of type 'unknown'` | TS18046 | 1 | `useRef()` returns `RefObject<unknown>` |
| `update-password-form.tsx` | 45 | `'currentPasswordInput.current' is of type 'unknown'` | TS18046 | 1 | `useRef()` returns `RefObject<unknown>` |
| `update-password-form.tsx` | 67, 81 | `Type 'RefObject<unknown>' is not assignable` | TS2322 | 2 | `ref` prop expects `HTMLInputElement` |
| `update-profile-information-form.tsx` | 31 | `Parameter 'e' implicitly has an 'any' type` | TS7006 | 1 | Untyped `submit(e)` event handler |
| `update-profile-complete-form.tsx` | 47 | `Object is of type 'unknown'` | TS2571 | 1 | `usePage().props.auth.user` is `unknown` |
| `update-profile-complete-form.test.tsx` | 51 | Missing `created_at`, `updated_at` on mock UserTech | TS2739 | 1 | Incomplete test fixture data |
| `update-profile-complete-form.test.tsx` | 59 | Missing `created_at`, `updated_at` on mock Tech | TS2739 | 1 | Incomplete test fixture data |
| `social-links-edit-form.tsx` | 115 | `Argument of type 'string \| null' is not assignable to parameter of type 'string'` | TS2345 | 1 | Select `onValueChange` passes `null` when cleared |

### Error Grouping by Root Cause

#### Group 1: `useRef()` without initial value (7 errors)
**Pattern**: In strict React 18+ types, `useRef()` requires at least one argument. `useRef()` with no args defaults to `useRef<undefined>()` but the overload for `undefined` still requires the argument to be present. The actual call `useRef()` resolves to `useRef<unknown>()` which has no valid overload.

**Files**:
- `delete-user-form.tsx` (1 ref, 3 cascading errors)
- `update-password-form.tsx` (2 refs, 5 cascading errors)

**Fix**: Change `useRef()` → `useRef<HTMLInputElement>(null)` everywhere. This also fixes the downstream `passwordInput.current is unknown` and ref prop type errors.

#### Group 2: Implicit `any` on event handlers (3 errors)
**Pattern**: `submit(e)` and `deleteUser(e)` have no type annotations. With `strict: true` and `noImplicitAny`, event parameters must be explicitly typed.

**Files**:
- `delete-user-form.tsx` — `deleteUser(e)` → `deleteUser(e: React.FormEvent)`
- `update-password-form.tsx` — `updatePassword(e)` → `updatePassword(e: React.FormEvent)`
- `update-profile-information-form.tsx` — `submit(e)` → `submit(e: React.FormEvent)`

**Fix**: Add `React.FormEvent` type to each handler. Low effort, no runtime change.

#### Group 3: Unsafe `usePage` prop casting (3 errors)
**Pattern**: `edit.tsx` does `usePage().props as { techs: unknown[] }`. Inertia's `PageProps` has an index signature `[key: string]: unknown`, but the cast to `{ techs: unknown[] }` is a narrowing assertion that TypeScript rejects because `PageProps` does not sufficiently overlap.

**Files**:
- `edit.tsx` — `const { techs } = usePage().props as { techs: unknown[] }`

**Fix**: Either remove the cast and rely on the index signature (which gives `unknown[]`), or define a proper `ProfilePageProps` interface that extends `PageProps`. Given that `edit.tsx` already receives `userTechs` as a prop and only needs `techs` from the page, the simplest fix is to change the Props interface to use `Tech[]` instead of `unknown[]` and handle the `usePage` retrieval without an explicit cast (or with `as unknown as { techs: Tech[] }` if necessary).

#### Group 4: `auth.user` is `unknown` (1 error)
**Pattern**: `usePage().props.auth.user` resolves to `unknown` because Inertia's `PageProps` only guarantees `[key: string]: unknown`. Accessing `.name` or `.avatar` on `unknown` fails.

**Files**:
- `update-profile-complete-form.tsx` — `const user = usePage().props.auth.user`

**Fix**: Type the `user` variable by either:
- Using `usePage<{ auth: { user: User } }>()` (consistent with previous ts-shared-app-types approach)
- Casting: `const user = usePage().props.auth.user as User`
- Extracting to a typed hook

#### Group 5: Incomplete test fixtures (2 errors)
**Pattern**: Mock `UserTech` and `Tech` objects in tests are missing required fields `created_at` and `updated_at`.

**Files**:
- `update-profile-complete-form.test.tsx`

**Fix**: Add `created_at: '', updated_at: ''` to the mock objects.

#### Group 6: Select component null value (1 error)
**Pattern**: `Select` from shadcn/ui (Radix) `onValueChange` callback passes `string | null` when the selection is cleared. The `updateLink` function expects `string` for the `platform` field.

**Files**:
- `social-links-edit-form.tsx` — `updateLink(index, 'platform', value)` where `value: string | null`

**Fix**: Handle the null case explicitly: `updateLink(index, 'platform', value ?? '')`.

---

## Affected Areas

### In Scope (Profile Domain)

| File | Role | Why It Matters |
|------|------|----------------|
| `resources/js/pages/profile/edit.tsx` | Profile edit page shell | Routes all profile sub-forms; types the page props |
| `resources/js/pages/profile/partials/delete-user-form.tsx` | Account deletion dialog | `useRef` + event handler typing |
| `resources/js/pages/profile/partials/update-password-form.tsx` | Password update form | `useRef` + event handler typing |
| `resources/js/pages/profile/partials/update-profile-information-form.tsx` | Basic profile info | Event handler typing |
| `resources/js/pages/profile/partials/update-profile-complete-form.tsx` | Extended profile (bio, avatar, techs) | `usePage` auth user typing |
| `resources/js/pages/profile/partials/social-links-edit-form.tsx` | Social links editor | Select null handling |
| `resources/js/pages/profile/partials/update-profile-complete-form.test.tsx` | Test for complete form | Incomplete mock fixtures |

### Out of Scope

| File | Domain | Reason Excluded |
|------|--------|-----------------|
| `resources/js/components/ui/field.tsx` | Shared UI | Fixed in `ts-shared-app-types` |
| `resources/js/layouts/app-layout.tsx` | App shell | Fixed in `ts-shared-app-types` |
| `resources/js/pages/auth/*.tsx` | Auth | Separate auth-type change |
| `resources/js/pages/projects/**/*.tsx` | Projects | Separate project-type change |
| `resources/js/pages/onboarding/*.tsx` | Onboarding | Separate onboarding-type change |
| `resources/js/pages/join_requests/*.tsx` | Join requests | Separate join-request-type change |
| `resources/js/pages/users/*.tsx` | Users | Separate users-type change |

---

## Approaches

### Approach A — Per-File Targeted Fixes (Recommended)

Fix each error at its source without cross-file refactors.

1. **`delete-user-form.tsx`**:
   - `useRef()` → `useRef<HTMLInputElement>(null)`
   - `deleteUser(e)` → `deleteUser(e: React.FormEvent)`

2. **`update-password-form.tsx`**:
   - `useRef()` → `useRef<HTMLInputElement>(null)` (both refs)
   - `updatePassword(e)` → `updatePassword(e: React.FormEvent)`

3. **`update-profile-information-form.tsx`**:
   - `submit(e)` → `submit(e: React.FormEvent)`

4. **`edit.tsx`**:
   - Change `userTechs: unknown[]` → `userTechs: UserTech[]`
   - Remove or fix the `usePage` cast: `const { techs } = usePage().props as { techs: Tech[] }` (or accept `unknown[]` and cast after extraction)

5. **`update-profile-complete-form.tsx`**:
   - Type `user`: `const user = usePage().props.auth.user as User`

6. **`social-links-edit-form.tsx`**:
   - `updateLink(index, 'platform', value ?? '')` or narrow `value` type

7. **`update-profile-complete-form.test.tsx`**:
   - Add `created_at: '', updated_at: ''` to mock `UserTech` and `Tech`

- **Pros**: Minimal blast radius; no runtime changes; each fix is ~3–15 lines; well within review budget
- **Cons**: `usePage` typing remains ad-hoc per file
- **Effort**: Low

### Approach B — Extract Shared Profile Page Props

Create a `ProfilePageProps` interface extending Inertia's `PageProps` with `auth`, `techs`, etc., and refactor all profile consumers.

- **Pros**: One source of truth for profile-related page props
- **Cons**: Over-engineering for 6 files; would require importing the type across partials; not justified for this scope
- **Effort**: Medium

### Approach C — Ignore + Suppress

Add `// @ts-expect-error` or `// @ts-ignore` at each error site.

- **Pros**: Fastest; zero risk of regression
- **Cons**: Hides real type issues; accumulates technical debt; violates strict TypeScript mandate
- **Effort**: Trivial (not recommended)

---

## Recommendation

**Adopt Approach A.**

Rationale:
- The profile domain is a narrow slice (16 errors, 6 files, ~80 changed lines). Approach A resolves every error without touching out-of-scope files.
- The errors are mechanical and safe: `useRef` generic annotations, event handler typings, and null handling. No logic changes.
- Approach B is architecturally desirable but unnecessary for this scope. A central page-props type can be introduced later when multiple domains need it.
- This change builds on the foundation laid by `ts-shared-app-types` (shared app-shell types) and can proceed in parallel with other domain-specific changes.

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| `useRef<HTMLInputElement>(null)` causes runtime issues if ref is accessed before mount | Very Low | Low | `null` is the standard React pattern; `.current` is only accessed after mount (in `onError` callbacks, which run after render) |
| `usePage` cast in `edit.tsx` drifts from backend prop shape | Low | Medium | The cast is defensive; backend contract changes would surface at runtime or in page-level tests |
| Test fixture additions (`created_at`, `updated_at`) break unrelated assertions | Very Low | Low | The mocks are isolated to this test file; no assertions depend on these fields being absent |
| Select null handling changes form behavior | Very Low | Low | `value ?? ''` preserves existing behavior: empty platform string was the default for new links |
| Profile page relies on `UserTech` type that conflicts with `Tech` | Low | Medium | The `UserTech` interface in `update-profile-complete-form.tsx` (`extends Omit<Tech, 'pivot'>`) is local and may need alignment with the global `UserTech` type in `types/index.ts`. Review the relationship before fixing. |

---

## Ready for Proposal

**Yes.**

The scope is locked to 6 files and 16 errors. One PR is realistic at ~80 changed lines. The orchestrator should proceed to `sdd-propose` with the understanding that this change is a **domain-hardening slice** — it resolves the profile domain's TypeScript errors and can proceed independently of other domain-specific fixes.

---

## Likely Files to Change

1. `resources/js/pages/profile/edit.tsx` — **modify** (remove unsafe `usePage` cast, type `userTechs` as `UserTech[]`)
2. `resources/js/pages/profile/partials/delete-user-form.tsx` — **modify** (type `useRef`, type event handler)
3. `resources/js/pages/profile/partials/update-password-form.tsx` — **modify** (type `useRef`s, type event handler)
4. `resources/js/pages/profile/partials/update-profile-information-form.tsx` — **modify** (type event handler)
5. `resources/js/pages/profile/partials/update-profile-complete-form.tsx` — **modify** (type `auth.user` from `usePage`)
6. `resources/js/pages/profile/partials/social-links-edit-form.tsx` — **modify** (handle Select null value)
7. `resources/js/pages/profile/partials/update-profile-complete-form.test.tsx` — **modify** (complete mock fixtures)

---

## Verification Checklist (for Proposal/Spec)

- [ ] `npx tsc --noEmit` no longer reports TS2554 on `useRef()` in profile files
- [ ] `npx tsc --noEmit` no longer reports TS7006 on event handlers in profile files
- [ ] `npx tsc --noEmit` no longer reports TS18046/TS2322 on ref `.current` access in profile files
- [ ] `npx tsc --noEmit` no longer reports TS2352 on `usePage` cast in `edit.tsx`
- [ ] `npx tsc --noEmit` no longer reports TS2571 on `auth.user` in `update-profile-complete-form.tsx`
- [ ] `npx tsc --noEmit` no longer reports TS2345 on Select `onValueChange` in `social-links-edit-form.tsx`
- [ ] `npx tsc --noEmit` no longer reports TS2739 on test fixtures in `update-profile-complete-form.test.tsx`
- [ ] `npm run build` still succeeds
- [ ] No new TypeScript errors introduced

---

*Exploration completed: 2026-07-10*
*Method: file inspection + `tsc` error filtering + dependency graph analysis*
