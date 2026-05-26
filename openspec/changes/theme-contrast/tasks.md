# Tasks: theme-contrast

Pure token mapping — replace hardcoded Tailwind gray utilities with semantic CSS tokens.

**Review Workload Forecast**
- Estimated changed lines: ~100-150
- 400-line budget risk: Low
- Chained PRs recommended: No
- Single PR sufficient

---

## Task 1: nav-link.tsx

**File**: `resources/js/components/nav-link.tsx`

**Change**: Replace gray utilities with semantic tokens

```diff
- ? 'border-indigo-400 text-gray-900 focus:border-indigo-700'
+ ? 'border-primary text-foreground focus:border-primary'

- : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700'
+ : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground focus:border-border focus:text-foreground'
```

**Verify**: `php artisan test --filter DashboardTest`
- Navigation links render with proper active/inactive states

**Rollback**: `git checkout HEAD -- resources/js/components/nav-link.tsx`

---

## Task 2: responsive-nav-link.tsx

**File**: `resources/js/components/responsive-nav-link.tsx`

**Change**: Replace gray utilities with semantic tokens

```diff
- active
-   ? 'border-indigo-400 bg-indigo-50 text-indigo-700 focus:border-indigo-700 focus:bg-indigo-100 focus:text-indigo-800'
+ active
+   ? 'border-primary bg-primary/10 text-foreground focus:border-primary focus:bg-primary/10 focus:text-foreground'

- : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus:border-gray-300 focus:bg-gray-50 focus:text-gray-800'
+ : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground focus:border-border focus:bg-muted focus:text-foreground'
```

**Verify**: `php artisan test --filter DashboardTest`
- Responsive navigation renders correctly on mobile breakpoints

**Rollback**: `git checkout HEAD -- resources/js/components/responsive-nav-link.tsx`

---

## Task 3: modal.tsx

**File**: `resources/js/components/modal.tsx`

**Change**: Replace gray overlay and white card with semantic tokens

```diff
- <div className="absolute inset-0 bg-gray-500/75" />
+ <div className="absolute inset-0 bg-black/50" />

- className={`mb-6 transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:mx-auto sm:w-full ${maxWidthClass}`}
+ className={`mb-6 transform overflow-hidden rounded-lg bg-card shadow-xl transition-all sm:mx-auto sm:w-full ${maxWidthClass}`}
```

**Verify**: `php artisan test --filter ProfileTest`
- Modal overlay is dark, card uses card background

**Rollback**: `git checkout HEAD -- resources/js/components/modal.tsx`

---

## Task 4: dropdown.tsx

**File**: `resources/js/components/dropdown.tsx`

**Change**: Replace gray utilities in DropdownLink with semantic tokens

```diff
- 'block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none '
+ 'block w-full px-4 py-2 text-start text-sm leading-5 text-foreground transition duration-150 ease-in-out hover:bg-muted focus:bg-muted focus:outline-none '
```

**Verify**: `php artisan test --filter DashboardTest`
- User dropdown menu items use proper text and hover colors

**Rollback**: `git checkout HEAD -- resources/js/components/dropdown.tsx`

---

## Task 5: tech-showcase.tsx

**File**: `resources/js/components/user/tech-showcase.tsx`

**Change**: Replace gray badge base classes with semantic tokens (keep proficiency colors intact)

```diff
- { min: 0, label: 'Principiante', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
+ { min: 0, label: 'Principiante', className: 'bg-muted text-foreground dark:bg-muted dark:text-muted-foreground' },
```

**Verify**: `php artisan test --filter UserProfileTest`
- Tech badges render with proper contrast in light and dark modes

**Rollback**: `git checkout HEAD -- resources/js/components/user/tech-showcase.tsx`

---

## Task 6: auth/forgot-password.tsx

**File**: `resources/js/pages/auth/forgot-password.tsx`

**Change**: Replace gray text and add dark mode to success message

```diff
- <div className="mb-4 text-sm text-gray-600">
+ <div className="mb-4 text-sm text-muted-foreground">

- <div className="mb-4 text-sm font-medium text-green-600">
+ <div className="mb-4 text-sm font-medium text-green-600 dark:text-green-400">
```

**Verify**: `php artisan test --filter AuthTest`
- Forgot password page renders correctly, success message visible in dark mode

**Rollback**: `git checkout HEAD -- resources/js/pages/auth/forgot-password.tsx`

---

## Task 7: auth/confirm-password.tsx

**File**: `resources/js/pages/auth/confirm-password.tsx`

**Change**: Replace gray text with semantic token

```diff
- <div className="mb-4 text-sm text-gray-600">
+ <div className="mb-4 text-sm text-muted-foreground">
```

**Verify**: `php artisan test --filter AuthTest`
- Confirm password page renders correctly

**Rollback**: `git checkout HEAD -- resources/js/pages/auth/confirm-password.tsx`

---

## Task 8: auth/verify-email.tsx

**File**: `resources/js/pages/auth/verify-email.tsx`

**Change**: Replace gray text and add dark mode to success message

```diff
- <div className="mb-4 text-sm text-gray-600">
+ <div className="mb-4 text-sm text-muted-foreground">

- <div className="mb-4 text-sm font-medium text-green-600">
+ <div className="mb-4 text-sm font-medium text-green-600 dark:text-green-400">
```

**Verify**: `php artisan test --filter AuthTest`
- Verify email page renders correctly, success message visible in dark mode

**Rollback**: `git checkout HEAD -- resources/js/pages/auth/verify-email.tsx`

---

## Task 9: welcome.tsx

**File**: `resources/js/pages/welcome.tsx`

**Change**: Replace gray background and muted text

```diff
- <div className="bg-gray-50 text-black/50 dark:bg-black dark:text-white/50">
+ <div className="bg-muted text-muted-foreground dark:bg-black dark:text-white/50">
```

**Verify**: Load welcome page in browser
- Page renders without auth required, background and text colors work

**Rollback**: `git checkout HEAD -- resources/js/pages/welcome.tsx`

---

## Execution Order

1. **Batch 1**: nav-link + responsive-nav-link → DashboardTest
2. **Batch 2**: modal + dropdown → ProfileTest  
3. **Batch 3**: tech-showcase → UserProfileTest
4. **Batch 4**: Auth pages (forgot-password, confirm-password, verify-email) → AuthTest
5. **Batch 5**: welcome.tsx → Full test suite

## Final Verification

Run complete test suite: `php artisan test`

All tests must pass. No new tests required — this is pure token mapping with regression coverage.