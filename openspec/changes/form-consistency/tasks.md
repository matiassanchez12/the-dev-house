# Tasks: form-consistency

## Overview

Break down the form-consistency change into executable tasks. Each task has: File, Change, Verify, Rollback.

**Stack**: Laravel 12 + React 18 + Inertia.js + TypeScript, Tailwind v3 with CSS variables, strict TDD.

---

## NEW FILES

### Task 1: Create FormError component [x]

- **File**: `resources/js/components/ui/form-error.tsx`
- **Change**: Create new FormError component
  - Render `<p className="text-destructive text-sm">` if message exists, `null` otherwise
  - Props: `message?: string`, `className?: string`
  - Use `cn()` from `@/lib/utils` for class merging
- **Verify**: Run `php artisan test --filter=ProfileTest` — component renders without errors
- **Rollback**: `rm resources/js/components/ui/form-error.tsx`

---

### Task 2: Create Checkbox component (ui/) [x]

- **File**: `resources/js/components/ui/checkbox.tsx`
- **Change**: Create new Checkbox component using shadcn pattern
  - Props: `id`, `name`, `checked?`, `onChange?`, `disabled?`, `label?`, `className?`
  - Classes: `rounded border-input bg-transparent shadow-sm` (unchecked), `text-primary` (checked), `focus-visible:ring-ring focus-visible:ring-offset-2` (focus)
  - If `label` provided, render checkbox + label in `<label>` wrapper
  - Use `cn()` from `@/lib/utils` for class merging
- **Verify**: Run `php artisan test --filter=ProfileTest` — checkbox renders in register form context
- **Rollback**: `rm resources/js/components/ui/checkbox.tsx`

---

## LEGACY COMPONENT UPDATES (internal token fixes)

### Task 3: Update TextInput semantic tokens [x]

- **File**: `resources/js/components/text-input.tsx`
- **Change**: Replace hardcoded colors with semantic tokens (line ~24)
  - `border-gray-300` → `border-input`
  - `focus:border-indigo-500 focus:ring-indigo-500` → `focus:border-ring focus:ring-ring`
- **Verify**: Run `php artisan test --filter=AuthTest` — all auth tests pass
- **Rollback**: `git checkout HEAD -- resources/js/components/text-input.tsx`

---

### Task 4: Update InputLabel semantic tokens [x]

- **File**: `resources/js/components/input-label.tsx`
- **Change**: Replace hardcoded color with semantic token (line ~18)
  - `text-gray-700` → `text-foreground`
- **Verify**: Run `php artisan test --filter=AuthTest` — all auth tests pass
- **Rollback**: `git checkout HEAD -- resources/js/components/input-label.tsx`

---

### Task 5: Update PrimaryButton semantic tokens [x]

- **File**: `resources/js/components/primary-button.tsx`
- **Change**: Replace hardcoded gray palette with semantic tokens (line ~18)
  - `bg-gray-800` → `bg-primary`
  - `hover:bg-gray-700` → `hover:bg-primary/80`
  - `active:bg-gray-900` → `active:bg-primary/90`
  - `text-white` → `text-primary-foreground`
  - `focus:ring-indigo-500` → `focus:ring-ring`
- **Verify**: Run `php artisan test --filter=DashboardTest` — dashboard tests pass
- **Rollback**: `git checkout HEAD -- resources/js/components/primary-button.tsx`

---

### Task 6: Update SecondaryButton semantic tokens [x]

- **File**: `resources/js/components/secondary-button.tsx`
- **Change**: Replace hardcoded colors with semantic tokens (line ~13)
  - `border-gray-300` → `border-input`
  - `bg-white` → `bg-background`
  - `text-gray-700` → `text-foreground`
  - `hover:bg-gray-50` → `hover:bg-muted`
  - `focus:ring-indigo-500` → `focus:ring-ring`
- **Verify**: Run `php artisan test --filter=AuthTest` — all auth tests pass
- **Rollback**: `git checkout HEAD -- resources/js/components/secondary-button.tsx`

---

### Task 7: Update legacy Checkbox semantic tokens [x]

- **File**: `resources/js/components/checkbox.tsx`
- **Change**: Replace hardcoded colors with semantic tokens (line ~7)
  - `border-gray-300` → `border-input`
  - `text-indigo-600` → `text-primary`
  - `focus:ring-indigo-500` → `focus:ring-ring`
- **Verify**: Run `php artisan test --filter=AuthTest` — auth login/register tests pass
- **Rollback**: `git checkout HEAD -- resources/js/components/checkbox.tsx`

---

## AUTH PAGE UPDATES

### Task 8: Add placeholders to login page [x]

- **File**: `resources/js/pages/auth/login.tsx`
- **Change**:
  - Add `placeholder="email@example.com"` to email TextInput
  - Add `placeholder="Enter your password"` to password TextInput
  - Replace `<InputError>` with `<FormError>` (lines ~49, ~65)
- **Verify**: `php artisan test --filter=AuthTest` passes + visual spot-check
- **Rollback**: `git checkout HEAD -- resources/js/pages/auth/login.tsx`

---

### Task 9: Add placeholders to register page [x]

- **File**: `resources/js/pages/auth/register.tsx`
- **Change**:
  - Add `placeholder="Your name"` to name TextInput
  - Add `placeholder="email@example.com"` to email TextInput
  - Add `placeholder="Enter your password"` to password TextInput
  - Add `placeholder="Confirm your password"` to confirm password TextInput
  - Replace `<InputError>` with `<FormError>` (lines ~43, ~60, ~77, ~100)
  - Fix Link focus ring: `focus:ring-indigo-500` → `focus:ring-ring` (line ~108)
- **Verify**: `php artisan test --filter=AuthTest` passes + visual spot-check
- **Rollback**: `git checkout HEAD -- resources/js/pages/auth/register.tsx`

---

### Task 10: Add placeholders to forgot-password page [x]

- **File**: `resources/js/pages/auth/forgot-password.tsx`
- **Change**:
  - Add `placeholder="email@example.com"` to email TextInput
  - Replace `<InputError>` with `<FormError>` (line ~45)
  - Replace `text-gray-600` with `text-muted-foreground` (line ~25)
- **Verify**: `php artisan test --filter=AuthTest` passes
- **Rollback**: `git checkout HEAD -- resources/js/pages/auth/forgot-password.tsx`

---

### Task 11: Add placeholders to reset-password page [x]

- **File**: `resources/js/pages/auth/reset-password.tsx`
- **Change**:
  - Add `placeholder="email@example.com"` to email TextInput
  - Add `placeholder="Enter your password"` to password TextInput
  - Add `placeholder="Confirm your password"` to confirm password TextInput
  - Replace `<InputError>` with `<FormError>` (lines ~42, ~59, ~81)
  - Add missing `id="email"` to first TextInput (line ~66)
- **Verify**: `php artisan test --filter=AuthTest` passes
- **Rollback**: `git checkout HEAD -- resources/js/pages/auth/reset-password.tsx`

---

### Task 12: Fix confirm-password page [x]

- **File**: `resources/js/pages/auth/confirm-password.tsx`
- **Change**:
  - Add `placeholder="Enter your password"` to password TextInput
  - Replace `<InputError>` with `<FormError>` (line ~44)
  - Replace `text-gray-600` with `text-muted-foreground` (line ~25)
- **Verify**: `php artisan test --filter=AuthTest` passes
- **Rollback**: `git checkout HEAD -- resources/js/pages/auth/confirm-password.tsx`

---

### Task 13: Fix verify-email page [x]

- **File**: `resources/js/pages/auth/verify-email.tsx`
- **Change**:
  - Fix Link focus ring: `focus:ring-indigo-500` → `focus:ring-ring` (line ~42)
  - Replace `text-gray-600` with `text-muted-foreground` (line ~18)
  - Replace `text-green-600` with `text-primary` (line ~26)
- **Verify**: `php artisan test --filter=AuthTest` passes
- **Rollback**: `git checkout HEAD -- resources/js/pages/auth/verify-email.tsx`

---

## PROFILE PAGE FIXES

### Task 14: Verify profile page has no hardcoded colors

- **File**: `resources/js/pages/profile/partials/update-profile-complete-form.tsx`
- **Change**: Inspect for remaining hardcoded colors (gray-*, red-*, indigo-*). Fix if any found. (Prior session fixed most; confirm no残留.)
- **Verify**: `php artisan test --filter=ProfileTest` passes
- **Rollback**: `git checkout HEAD -- resources/js/pages/profile/partials/update-profile-complete-form.tsx`

---

## Rollback All

```bash
git checkout HEAD -- \
  resources/js/components/text-input.tsx \
  resources/js/components/input-label.tsx \
  resources/js/components/primary-button.tsx \
  resources/js/components/secondary-button.tsx \
  resources/js/components/checkbox.tsx \
  resources/js/pages/auth/login.tsx \
  resources/js/pages/auth/register.tsx \
  resources/js/pages/auth/forgot-password.tsx \
  resources/js/pages/auth/reset-password.tsx \
  resources/js/pages/auth/confirm-password.tsx \
  resources/js/pages/auth/verify-email.tsx

rm -f resources/js/components/ui/form-error.tsx \
       resources/js/components/ui/checkbox.tsx
```

---

## Review Workload Forecast

| Metric | Value |
|--------|-------|
| Estimated changed lines | ~200-300 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Single PR sufficient | Yes |

---

## Batch Test Schedule

| After Task | Run |
|------------|-----|
| Task 2 | `php artisan test --filter=ProfileTest` |
| Tasks 3-7 | `php artisan test --filter=AuthTest` |
| Tasks 8-13 | `php artisan test --filter=AuthTest` |
| Task 14 | `php artisan test --filter=ProfileTest` |
| Final | `php artisan test` (full suite) |