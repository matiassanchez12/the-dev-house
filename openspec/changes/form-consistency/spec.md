# SDD: form-consistency

## Change Overview

| Field | Value |
|-------|-------|
| **Change ID** | form-consistency |
| **Type** | refactor |
| **Intent** | Unify form components using shadcn/ui semantic tokens |
| **Approach** | Fix legacy component internals; create new FormError and Checkbox components |
| **Status** | spec |

## Requirements

### Requirement: form-error-component

Create `resources/js/components/ui/form-error.tsx` as a dedicated error display component.

**Component spec:**
- File: `resources/js/components/ui/form-error.tsx`
- Props interface:
  ```ts
  interface FormErrorProps {
    message?: string;
    className?: string;
  }
  ```
- Behavior: If `message` is empty, null, or undefined, render nothing (`null`)
- Rendering: `<p>` element with classes `text-destructive text-sm` plus any `className`
- Uses `cn()` utility from `@/lib/utils` for class merging

**Acceptance criteria:**
- [ ] Renders nothing when `message` is falsy
- [ ] Renders `<p>` with `text-destructive text-sm` when message exists
- [ ] Merges custom `className` correctly

---

### Requirement: checkbox-component

Create `resources/js/components/ui/checkbox.tsx` as a shadcn-style checkbox component.

**Component spec:**
- File: `resources/js/components/ui/checkbox.tsx`
- Props interface:
  ```ts
  interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    id: string;
    name: string;
    checked?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label?: string;
    className?: string;
  }
  ```
- Rendering: `<input type="checkbox">` with semantic token classes
  - Unchecked: `rounded border-input bg-transparent shadow-sm`
  - Checked: `text-primary` (via `accent-color` or similar)
  - Focus: `focus-visible:ring-ring focus-visible:ring-offset-2`
- If `label` provided, render checkbox + label text in `<label>` wrapper
- Use `cn()` utility for class merging

**Acceptance criteria:**
- [ ] Renders native checkbox input with semantic classes
- [ ] Unchecked state uses `border-input`
- [ ] Checked state uses `text-primary`
- [ ] Focus ring uses `focus-visible:ring-ring`
- [ ] Optional `label` prop renders wrapped label

---

### Requirement: text-input-semantic

Update `resources/js/components/text-input.tsx` to use semantic tokens.

**Current state (line 24):**
```tsx
className={
    'rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ' +
    className
}
```

**Required changes:**
- `border-gray-300` → `border-input`
- `focus:border-indigo-500 focus:ring-indigo-500` → `focus:border-ring focus:ring-ring`

**Updated line:**
```tsx
className={
    'rounded-md border-input shadow-sm focus:border-ring focus:ring-ring ' +
    className
}
```

**Acceptance criteria:**
- [ ] `border-input` is used instead of `border-gray-300`
- [ ] Focus state uses `focus:border-ring focus:ring-ring`
- [ ] API (props interface) unchanged — drop-in replacement

---

### Requirement: input-label-semantic

Update `resources/js/components/input-label.tsx` to use semantic tokens.

**Current state (line 18):**
```tsx
`block text-sm font-medium text-gray-700 ` +
```

**Required change:**
- `text-gray-700` → `text-foreground`

**Updated line:**
```tsx
`block text-sm font-medium text-foreground ` +
```

**Acceptance criteria:**
- [ ] `text-foreground` is used instead of `text-gray-700`
- [ ] API (props interface) unchanged — drop-in replacement

---

### Requirement: primary-button-semantic

Update `resources/js/components/primary-button.tsx` to use semantic tokens.

**Current state (line 18):**
```tsx
`inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900 ${
    disabled && 'opacity-25'
} ` + className
```

**Required changes:**
- `bg-gray-800 hover:bg-gray-700 active:bg-gray-900` → `bg-primary hover:bg-primary/80 active:bg-primary/90`
- `text-white` → `text-primary-foreground`
- `focus:ring-indigo-500` → `focus:ring-ring`

**Updated line:**
```tsx
`inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition duration-150 ease-in-out hover:bg-primary/80 focus:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 active:bg-primary/90 ${
    disabled && 'opacity-25'
} ` + className
```

**Acceptance criteria:**
- [ ] Uses `bg-primary` variant instead of hardcoded `bg-gray-800`
- [ ] Hover state uses `hover:bg-primary/80`
- [ ] Active state uses `active:bg-primary/90`
- [ ] Text uses `text-primary-foreground`
- [ ] Focus ring uses `focus:ring-ring`

---

### Requirement: secondary-button-semantic

Update `resources/js/components/secondary-button.tsx` to use semantic tokens.

**Current state (line 13):**
```tsx
`inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 ${
    disabled && 'opacity-25'
} ` + className
```

**Required changes:**
- `border-gray-300` → `border-input`
- `bg-white` → `bg-background`
- `text-gray-700` → `text-foreground`
- `hover:bg-gray-50` → `hover:bg-muted`
- `focus:ring-indigo-500` → `focus:ring-ring`

**Updated line:**
```tsx
`inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-xs font-semibold uppercase tracking-widest text-foreground shadow-sm transition duration-150 ease-in-out hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-25 ${
    disabled && 'opacity-25'
} ` + className
```

**Acceptance criteria:**
- [ ] Border uses `border-input`
- [ ] Background uses `bg-background`
- [ ] Text uses `text-foreground`
- [ ] Hover uses `hover:bg-muted`
- [ ] Focus ring uses `focus:ring-ring`

---

### Requirement: checkbox-semantic

Update `resources/js/components/checkbox.tsx` to use semantic tokens.

**Current state (line 7):**
```tsx
'rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 ' +
```

**Required changes:**
- `border-gray-300` → `border-input`
- `text-indigo-600` → `text-primary`
- `focus:ring-indigo-500` → `focus:ring-ring`

**Updated line:**
```tsx
'rounded border-input text-primary shadow-sm focus:ring-ring ' +
```

**Acceptance criteria:**
- [ ] Uses `border-input` instead of `border-gray-300`
- [ ] Uses `text-primary` instead of `text-indigo-600`
- [ ] Focus ring uses `focus:ring-ring`

---

### Requirement: auth-pages-migration

Update 6 auth pages to add input placeholders and use updated components.

**Files to update:**
1. `resources/js/pages/auth/login.tsx`
2. `resources/js/pages/auth/register.tsx`
3. `resources/js/pages/auth/forgot-password.tsx`
4. `resources/js/pages/auth/reset-password.tsx`
5. `resources/js/pages/auth/confirm-password.tsx`
6. `resources/js/pages/auth/verify-email.tsx`

**Required changes across all auth pages:**

1. **Add placeholders** to TextInput components:
   - Email field: `placeholder="email@example.com"`
   - Password field: `placeholder="Enter your password"`
   - Name field: `placeholder="Your name"`
   - Confirm password: `placeholder="Confirm your password"`

2. **Replace inline `<p>` error messages** with `FormError` component from `@/components/ui/form-error`:
   - Import: `import FormError from '@/components/ui/form-error';`
   - Replace: `<p className="text-sm text-red-600">` with `<FormError message={...} />`

3. **Replace `InputError` usages** with `FormError` where the component is already imported (check each file — some may not use InputError)

**Auth page-specific changes:**

**login.tsx:**
- Add `placeholder="email@example.com"` to email TextInput
- Add `placeholder="Enter your password"` to password TextInput
- Replace `<InputError>` with `<FormError>` (line 49, 65)

**register.tsx:**
- Add `placeholder="Your name"` to name TextInput
- Add `placeholder="email@example.com"` to email TextInput
- Add `placeholder="Enter your password"` to password TextInput
- Add `placeholder="Confirm your password"` to confirm password TextInput
- Replace `<InputError>` with `<FormError>` (lines 43, 60, 77, 100)
- Fix Link focus ring: `focus:ring-indigo-500` → `focus:ring-ring` (line 108)

**forgot-password.tsx:**
- Add `placeholder="email@example.com"` to email TextInput
- Replace `<InputError>` with `<FormError>` (line 45)

**reset-password.tsx:**
- Add `placeholder="email@example.com"` to email TextInput
- Add `placeholder="Enter your password"` to password TextInput
- Add `placeholder="Confirm your password"` to confirm password TextInput
- Replace `<InputError>` with `<FormError>` (lines 42, 59, 81)
- Add missing `id="email"` to first TextInput

**confirm-password.tsx:**
- Add `placeholder="Enter your password"` to password TextInput
- Replace `<InputError>` with `<FormError>` (line 44)
- Replace hardcoded text `text-gray-600` with `text-muted-foreground` (line 25)

**verify-email.tsx:**
- Fix Link focus ring: `focus:ring-indigo-500` → `focus:ring-ring` (line 42)
- Replace `text-gray-600` with `text-muted-foreground` (line 18)
- Replace `text-green-600` with `text-primary` (line 26)

**Acceptance criteria:**
- [ ] All 6 auth pages have input placeholders
- [ ] All 6 auth pages use FormError for error display
- [ ] All hardcoded gray text replaced with semantic tokens
- [ ] Focus rings use `focus:ring-ring`

---

## Test Scenarios

### Scenario: login-form-styles

**Given** the login page is rendered
**When** the user views the form inputs
**Then** the TextInput uses `border-input` and `focus:ring-ring`
**And** the PrimaryButton uses `bg-primary` with `text-primary-foreground`
**And** the error message (if any) uses `text-destructive text-sm`

### Scenario: register-form-placeholders

**Given** the register page is rendered
**When** the user has not interacted with any input
**Then** the name field shows placeholder "Your name"
**And** the email field shows placeholder "email@example.com"
**And** the password fields show appropriate placeholders

### Scenario: profile-form-error-display

**Given** a profile form has a validation error
**When** the error message is rendered
**Then** it displays in `text-destructive text-sm` (red)
**And** renders nothing when no error exists

### Scenario: checkbox-checked-state

**Given** the checkbox component is rendered
**When** the `checked` prop is `true`
**Then** the checkbox displays with `text-primary` color
**And** the focus state shows `focus:ring-ring`

---

## File Inventory

| File | Action | Description |
|------|--------|-------------|
| `resources/js/components/ui/form-error.tsx` | create | New dedicated error display component |
| `resources/js/components/ui/checkbox.tsx` | create | New shadcn-style checkbox component |
| `resources/js/components/text-input.tsx` | modify | Replace hardcoded colors with semantic tokens |
| `resources/js/components/input-label.tsx` | modify | Replace `text-gray-700` with `text-foreground` |
| `resources/js/components/primary-button.tsx` | modify | Replace hardcoded gray with `bg-primary` variant |
| `resources/js/components/secondary-button.tsx` | modify | Replace hardcoded colors with semantic tokens |
| `resources/js/components/checkbox.tsx` | modify | Replace hardcoded colors with semantic tokens |
| `resources/js/pages/auth/login.tsx` | modify | Add placeholders, use FormError |
| `resources/js/pages/auth/register.tsx` | modify | Add placeholders, use FormError, fix focus rings |
| `resources/js/pages/auth/forgot-password.tsx` | modify | Add placeholders, use FormError |
| `resources/js/pages/auth/reset-password.tsx` | modify | Add placeholders, use FormError, add missing id |
| `resources/js/pages/auth/confirm-password.tsx` | modify | Add placeholder, use FormError, fix text colors |
| `resources/js/pages/auth/verify-email.tsx` | modify | Fix focus rings, replace hardcoded text colors |

---

## Dependencies

None — all changes are self-contained frontend refactoring.

---

## Rollback Plan

1. Revert component changes:
   ```bash
   git checkout HEAD -- \
     resources/js/components/text-input.tsx \
     resources/js/components/input-label.tsx \
     resources/js/components/primary-button.tsx \
     resources/js/components/secondary-button.tsx \
     resources/js/components/checkbox.tsx
   ```
2. Remove new files:
   ```bash
   rm resources/js/components/ui/form-error.tsx \
      resources/js/components/ui/checkbox.tsx
   ```
3. Run tests:
   ```bash
   php artisan test
   ```