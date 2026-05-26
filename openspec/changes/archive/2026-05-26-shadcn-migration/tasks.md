# Tasks: shadcn-migration

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~150–250 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: stacked-to-main
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Full migration | PR 1 | All phases in one PR; minimal scope |

---

## Phase 1: Infrastructure — Install Dependencies

- [x] 1.1 Run `npm install @radix-ui/react-dropdown-menu`
- [x] 1.2 Run `npx shadcn@latest add progress --yes`
- [x] 1.3 Verify `package.json` updated with new dependencies

## Phase 2: Foundation — Create ui-dropdown Wrapper

- [x] 2.1 Create `resources/js/components/ui/dropdown.tsx` as compound component wrapper exposing `Dropdown.Trigger`, `Dropdown.Content`, `Dropdown.Link`, `Dropdown.Separator` using `@radix-ui/react-dropdown-menu` primitives
- [x] 2.2 Create `resources/js/components/ui/dropdown.tsx` with Inertia `Link` support for `Dropdown.Link` (method/as props)

## Phase 3: Core Implementation — Migrate Components

- [x] 3.1 Update `resources/js/layouts/authenticated.tsx` to import `Dropdown` from `ui/dropdown` instead of local `dropdown.tsx`
- [x] 3.2 Update `resources/js/pages/profile/partials/delete-user-form.tsx` to replace `<Modal>` with `ui/dialog` (`Dialog` + `DialogContent`); use `open` prop and `onOpenChange` callback
- [x] 3.3 Update `resources/js/pages/profile/partials/update-profile-complete-form.tsx` to replace `<img>` preview with `Avatar` + `AvatarImage` + `AvatarFallback`
- [x] 3.4 Update `resources/js/layouts/onboarding.tsx` to replace inline div progress bar with `<Progress value={percent}>`

## Phase 4: Cleanup — Remove Legacy Files

- [x] 4.1 Delete `resources/js/components/dropdown.tsx`
- [x] 4.2 Delete `resources/js/components/modal.tsx`
- [x] 4.3 Audit for remaining `@headlessui/react` usages; remove from `package.json` only if zero usages remain

## Phase 5: Verification

- [x] 5.1 Run `npm run dev` — manually verify dropdown opens/closes, keyboard nav (Arrow keys, Enter, Escape), modal focus behavior
- [x] 5.2 Run `npm run build` — verify production build succeeds
- [x] 5.3 Run `php artisan test` — verify all tests pass
- [x] 5.4 Visual inspection of avatar preview in profile form and progress bar in onboarding layout
