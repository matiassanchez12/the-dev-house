# Proposal: Migrate Custom Components to shadcn/ui

## Intent

Replace `@headlessui/react` modal and dropdown components with shadcn/ui (built on `@base-ui/react` and `@radix-ui/react-dropdown-menu`) to improve accessibility, dark mode consistency, and reduce code duplication. The current implementation relies on a custom `Modal` and `Dropdown` that don't fully handle focus trapping, keyboard navigation, or ARIA attributes.

## Scope

### In Scope
- Install `@radix-ui/react-dropdown-menu` for dropdown replacement
- Install `Progress` shadcn component for onboarding progress bar
- Migrate `modal.tsx` → `ui/dialog` (already installed)
- Migrate `dropdown.tsx` → `@radix-ui/react-dropdown-menu`
- Migrate profile form avatar → `ui/avatar` (already installed)
- Replace onboarding progress bar with `Progress` component

### Out of Scope
- Other headlessui usages (if any exist)
- Other UI component migrations
- Backend changes

## Capabilities

### New Capabilities
- `ui-dropdown`: Accessible dropdown menu with keyboard navigation (Arrow keys, Enter, Escape, Tab)

### Modified Capabilities
- None — existing capabilities remain unchanged; implementation only.

## Approach

1. **Install dependencies**: `@radix-ui/react-dropdown-menu` and `Progress` component via shadcn CLI
2. **Migrate Modal**: Replace `@headlessui/react` `Dialog` with `ui/dialog` (`@base-ui/react`)
3. **Migrate Dropdown**: Replace `@headlessui/react` `Transition` + context pattern with `@radix-ui/react-dropdown-menu`
4. **Migrate Avatar**: Update profile form to use `ui/avatar` components (`Avatar`, `AvatarImage`, `AvatarFallback`)
5. **Migrate Progress**: Replace inline div progress bar with `Progress` component in onboarding layout
6. **Remove**: Uninstall `@headlessui/react` after all migrations complete

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `resources/js/components/modal.tsx` | Removed | Replaced by `ui/dialog` |
| `resources/js/components/dropdown.tsx` | Removed | Replaced by `@radix-ui/react-dropdown-menu` |
| `resources/js/layouts/onboarding.tsx` | Modified | Uses `Progress` component |
| `resources/js/components/ui/avatar.tsx` | Modified | Already installed, profile form needs update |
| `resources/js/pages/Profile/Edit.tsx` | Modified | Uses `ui/avatar` |
| `package.json` | Modified | Remove `@headlessui/react` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `@headlessui/react` uninstall breaks other usages | Low | Audit before removal; keep if needed |
| Radix dropdown API differs from current pattern | Medium | Use shadcn wrapper pattern; test keyboard nav |
| Dark mode styling gaps in new components | Low | Review with `dark:` classes; use design tokens |

## Rollback Plan

1. Run `npx shadcn@latest add dialog --force` to restore shadcn versions
2. Revert components to previous implementation from git
3. Re-install `@headlessui/react` if removed prematurely
4. No database migration needed — pure UI refactor

## Dependencies

- `@radix-ui/react-dropdown-menu` package
- `Progress` shadcn component (via `npx shadcn@latest add progress`)

## Success Criteria

- [ ] `modal.tsx` and `dropdown.tsx` removed from `resources/js/components/`
- [ ] All modal triggers use `ui/dialog` with proper focus management
- [ ] Dropdown menus support Arrow Up/Down navigation, Enter, Escape
- [ ] Profile avatar uses `ui/avatar` with `Avatar`, `AvatarImage`, `AvatarFallback`
- [ ] Onboarding progress bar uses `Progress` component
- [ ] `@headlessui/react` uninstalled (if no other usages)
- [ ] All tests pass: `php artisan test`
- [ ] Build succeeds: `npm run build`