# Proposal: UI Fixes — Dropdown Styling & Component Consistency

## Intent

Fix visual inconsistencies in the header user dropdown (transparent background) and standardize component styling patterns across the authenticated layout. The `Dropdown.Content` component renders without background, shadow, or border — making it appear broken on any non-solid background.

## Scope

### In Scope
- Fix `Dropdown.Content` in `resources/js/components/ui/dropdown.tsx` — add `bg-card`, `shadow-md`, `rounded-lg`, `border border-border`, `min-w-[8rem]`, `p-1`
- Standardize `nav-link.tsx` and `responsive-nav-link.tsx` to use `cn()` utility instead of string concatenation
- Audit and fix any remaining Breeze-style hardcoded classes (gray-xxx patterns)

### Out of Scope
- Full component audit (deferred to future work)
- Theming or color palette changes
- New component additions

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `ui-dropdown`: Visual styling requirements — dropdown content MUST have visible background (`bg-card`), elevation (`shadow-md`), border (`border border-border`), and minimum width (`min-w-[8rem]`)

## Approach

1. **Fix `Dropdown.Content`**: Add missing Tailwind classes to the `cn()` call in `resources/js/components/ui/dropdown.tsx` line 21
2. **Refactor `nav-link.tsx`**: Replace string concatenation with `cn()` utility for consistency
3. **Refactor `responsive-nav-link.tsx`**: Replace template literal with `cn()` utility
4. **Audit**: Search for remaining Breeze-style classes (`bg-white`, `dark:bg-gray-*`, `border-gray-*`, `text-gray-*`) across `resources/js/`

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `resources/js/components/ui/dropdown.tsx` | Modified | Add bg-card, shadow, border, rounded, min-width, padding to Content |
| `resources/js/components/nav-link.tsx` | Modified | Use `cn()` instead of string concatenation |
| `resources/js/components/responsive-nav-link.tsx` | Modified | Use `cn()` instead of template literal |
| `resources/js/` | Audited | Search for remaining Breeze-style hardcoded classes |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Dropdown styling conflicts with dark mode | Low | Uses design tokens (`bg-card`, `border-border`) — already theme-aware |
| `cn()` refactor changes class precedence | Low | `cn()` handles deduplication; order preserved |
| Undiscovered Breeze classes in pages | Medium | Grep audit before implementation; fix if found |

## Rollback Plan

1. Revert the 3 component files from git — pure UI changes, no data migration
2. No database or config changes to undo

## Dependencies

- None — uses existing Tailwind design tokens and `cn()` utility

## Success Criteria

- [ ] User dropdown in header has visible background, shadow, and border in both light and dark mode
- [ ] `Dropdown.Content` renders with `bg-card shadow-md rounded-lg border border-border min-w-[8rem] p-1`
- [ ] `nav-link.tsx` and `responsive-nav-link.tsx` use `cn()` utility
- [ ] No remaining `bg-white`, `dark:bg-gray-*`, `border-gray-*`, or `text-gray-*` classes in `resources/js/`
- [ ] All tests pass: `php artisan test`
- [ ] Build succeeds: `npm run build`
