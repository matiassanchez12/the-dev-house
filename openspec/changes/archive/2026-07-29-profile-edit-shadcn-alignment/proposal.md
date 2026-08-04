# Proposal: Profile Edit — shadcn/ui Alignment (Scope 1)

## Intent

The profile edit page uses raw `<div className="bg-card ...">` wrappers and `space-y-*` spacing instead of the installed shadcn/ui `Card` and `flex gap-*` patterns. This scope aligns the three simplest partials with the project's shadcn/ui conventions and adds missing tests.

The current workspace also includes three small collateral fixes that must be documented honestly for review: shared `Input` ref forwarding to preserve focus-on-error behavior, landing hero/stats copy restoration to match existing test expectations, and deterministic public milestone ordering across database `NULL` sort differences.

## Scope

### In Scope (Scope 1)
- `update-profile-information-form.tsx` — Card composition, gap layout, tests
- `update-password-form.tsx` — Card composition, gap layout, tests
- `delete-user-form.tsx` — Card composition, DialogTitle for a11y, tests
- `edit.tsx` — Remove raw wrapper divs around the three partials above
- `resources/js/components/ui/input.tsx` — Forward refs through the shared `Input` wrapper so scope-1 focus management keeps working
- `resources/js/pages/landing.tsx`, `hero-headline.tsx`, `hero-wordmark.tsx` — Restore already-expected landing stats/trust/wordmark content used by the existing landing tests
- `app/Http/Controllers/PublicMilestoneController.php`, `tests/Feature/MilestonesTest.php` — Keep milestone ordering deterministic during verification

### Out of Scope
- `update-privacy-form.tsx` — deferred to Scope 2
- `update-notification-settings-form.tsx` — deferred to Scope 2
- `update-profile-complete-form.tsx` — deferred to Scope 3 (needs Slider/Accordion)
- `social-links-edit-form.tsx` — deferred to Scope 4

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- None

> The primary user-facing scope is still a refactor. The extra landing/input/milestone files are collateral reviewability fixes, not a separate product scope.

## Approach

1. Replace each partial's outer `<section>` with full `Card` composition (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`).
2. Replace `space-y-*` with `flex flex-col gap-*` per shadcn spacing rules.
3. Add missing `DialogTitle` (visually hidden if needed) inside `delete-user-form.tsx` Dialog.
4. Strip the raw wrapper `<div>` from `edit.tsx` for the three aligned partials.
5. Add Vitest tests for each partial, mocking `@inertiajs/react` per existing project patterns.
6. Forward refs in the shared `Input` wrapper so delete/password error handlers can continue focusing the underlying input.
7. Restore the landing hero/stats content expected by the existing landing tests.
8. Keep public milestone ordering deterministic even when `completed_at` is `NULL`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `resources/js/pages/profile/partials/update-profile-information-form.tsx` | Modified | Card + gap layout, tests added |
| `resources/js/pages/profile/partials/update-password-form.tsx` | Modified | Card + gap layout, tests added |
| `resources/js/pages/profile/partials/delete-user-form.tsx` | Modified | Card + gap layout, DialogTitle, tests added |
| `resources/js/pages/profile/edit.tsx` | Modified | Remove raw wrappers for scope-1 partials |
| `resources/js/components/ui/input.tsx` | Modified | Add `forwardRef` support for shared focus management |
| `resources/js/pages/landing.tsx` | Modified | Re-enable `LandingStats` below the hero |
| `resources/js/components/landing/hero/hero-headline.tsx` | Modified | Restore live trust badge copy |
| `resources/js/components/landing/hero/hero-wordmark.tsx` | Modified | Restore visible wordmark and strapline |
| `app/Http/Controllers/PublicMilestoneController.php` | Modified | Preserve deterministic completed-first ordering when `completed_at` is `NULL` |
| `tests/Feature/MilestonesTest.php` | Modified | Prove the deterministic pending/completed ordering contract |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Visual regression from Card swap | Low | Keep padding and max-width identical; visual diff before/after |
| Missing DialogTitle causes a11y lint failure | Low | Add `DialogTitle` with `className="sr-only"` if visual title already exists |
| Test mocking drift | Low | Copy `useForm` mock pattern from existing `update-privacy-form.test.tsx` |
| Collateral files look unrelated during review | Medium | Call them out explicitly as shared-input, landing-test, and milestone-verification follow-ups instead of hiding them |

## Rollback Plan

Revert the four scope-1 frontend files above to undo the refactor. If the collateral fixes must also be rolled back, revert `resources/js/components/ui/input.tsx`, the three landing files, and `app/Http/Controllers/PublicMilestoneController.php` plus `tests/Feature/MilestonesTest.php` in the same change.

## Dependencies

- Existing shadcn/ui primitives: `card`, `dialog`, `field`, `input`, `button`
- Existing test patterns in `update-privacy-form.test.tsx` for Inertia mocking
- Existing landing tests that expect the stats section, live trust badge, and visible wordmark copy

## Success Criteria

- [ ] Scope-1 partials render with `CardHeader/CardTitle/CardDescription/CardContent/CardFooter`
- [ ] No `space-y-*` remains inside scope-1 form layouts; replaced with `flex flex-col gap-*`
- [ ] `delete-user-form.tsx` Dialog contains an accessible `DialogTitle`
- [ ] `edit.tsx` no longer wraps scope-1 partials in raw `bg-card` divs
- [ ] Each scope-1 partial has a passing Vitest test file
- [ ] The shared `Input` component forwards refs so focus-on-error remains intact
- [ ] Landing focused Vitest files pass with the restored stats/trust/wordmark content
- [ ] `npm run build` and `php artisan test` pass
