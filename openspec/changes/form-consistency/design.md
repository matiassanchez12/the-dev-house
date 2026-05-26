# Design: form-consistency

## Technical Approach

Refactor 5 legacy form components to use shadcn/ui semantic tokens (`border-input`, `text-foreground`, `bg-primary`, etc.) and create 2 new ui/ components (`FormError`, `Checkbox`). Auth pages consume the updated components and add input placeholders.

**Approach**: Option A — fix legacy component internals (not replacing them with ui/ equivalents). This preserves the existing component APIs while achieving visual consistency.

## Architecture Decisions

### Decision: Use `cn()` utility for class merging

**Choice**: Import and use `cn()` from `@/lib/utils` in all new components
**Alternatives considered**: Template literal concatenation (existing pattern)
**Rationale**: `cn()` properly merges Tailwind classes, handling conflicts gracefully. Required for `FormError` and `Checkbox` where extra `className` may be passed.

### Decision: Minimal component changes — class strings only

**Choice**: Only modify `className` strings in legacy components, no structural or prop changes
**Alternatives considered**: Rewrite using shadcn/ui primitives wholesale
**Rationale**: These components have stable APIs used across ~20 pages. Rewriting them risks breaking changes. The spec explicitly calls for internal-only fixes.

### Decision: `text-destructive` for error messages

**Choice**: Use `text-destructive` (not hardcoded red-600) for FormError
**Alternatives considered**: Keep `text-red-600` from existing InputError
**Rationale**: `text-destructive` respects theme customization and aligns with shadcn/ui error conventions.

### Decision: Native `<input type="checkbox">` for Checkbox

**Choice**: Wrap native checkbox, not a Radix/BaseUI primitive
**Alternatives considered**: Radix UI Checkbox primitive
**Rationale**: The existing legacy checkbox is a simple native input. Using a primitive would change behavior and accessibility characteristics. Keep it simple and native.

## Data Flow

No data flow changes — pure presentational refactor.

```
Auth Page
  └── <TextInput>        → uses border-input, focus:ring-ring
  └── <PrimaryButton>     → uses bg-primary, text-primary-foreground
  └── <FormError>         → uses text-destructive
  └── <Checkbox>         → uses border-input, text-primary
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `resources/js/components/ui/form-error.tsx` | Create | New error display component |
| `resources/js/components/ui/checkbox.tsx` | Create | New shadcn-style checkbox |
| `resources/js/components/text-input.tsx` | Modify | Replace hardcoded colors with semantic tokens |
| `resources/js/components/input-label.tsx` | Modify | Replace `text-gray-700` with `text-foreground` |
| `resources/js/components/primary-button.tsx` | Modify | Replace gray palette with `bg-primary` variant |
| `resources/js/components/secondary-button.tsx` | Modify | Replace hardcoded colors with semantic tokens |
| `resources/js/components/checkbox.tsx` | Modify | Replace hardcoded colors with semantic tokens |
| `resources/js/pages/auth/login.tsx` | Modify | Add placeholders, use FormError |
| `resources/js/pages/auth/register.tsx` | Modify | Add placeholders, use FormError, fix focus rings |
| `resources/js/pages/auth/forgot-password.tsx` | Modify | Add placeholders, use FormError |
| `resources/js/pages/auth/reset-password.tsx` | Modify | Add placeholders, use FormError, add missing id |
| `resources/js/pages/auth/confirm-password.tsx` | Modify | Add placeholder, use FormError, fix text colors |
| `resources/js/pages/auth/verify-email.tsx` | Modify | Fix focus rings, replace hardcoded text colors |

## Implementation Order

1. **form-error.tsx** — No dependencies, creates new pattern
2. **checkbox.tsx** (ui/) — Uses `cn()`, establishes new checkbox pattern
3. **text-input.tsx** — Low risk, internal only
4. **input-label.tsx** — Low risk, internal only
5. **primary-button.tsx** — Medium risk, used everywhere; verify tests pass
6. **secondary-button.tsx** — Medium risk, used everywhere; verify tests pass
7. **checkbox.tsx** (legacy) — Medium risk, used in login/register
8. **Auth pages batch** — Add placeholders, replace InputError with FormError

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Integration | Component rendering after changes | Run `php artisan test` after each batch |
| Integration | Auth pages (login, register, etc.) | AuthTest covers these |
| Visual | Component token application | Manual spot-check |

**Batch test runs:**
- After step 2: Run `php artisan test --filter=ProfileTest`
- After steps 3-5: Run `php artisan test --filter=AuthTest`
- After step 8: Run full `php artisan test`

## Migration / Rollback

No migration required — purely presentational refactor.

**Rollback:**
```bash
git checkout HEAD -- \
  resources/js/components/text-input.tsx \
  resources/js/components/input-label.tsx \
  resources/js/components/primary-button.tsx \
  resources/js/components/secondary-button.tsx \
  resources/js/components/checkbox.tsx

rm resources/js/components/ui/form-error.tsx \
   resources/js/components/ui/checkbox.tsx
```

## Open Questions

None — spec defines all required changes precisely.
