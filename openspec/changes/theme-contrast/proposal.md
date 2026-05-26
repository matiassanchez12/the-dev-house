# Proposal: theme-contrast

## Intent

Fix contrast issues and modernize legacy UI components by replacing hardcoded Tailwind gray utilities with semantic CSS token classes. The existing CSS variable system (--background, --foreground, --primary, etc.) is properly defined in `app.css` but components still use legacy hardcoded values like `border-gray-300` and `bg-gray-800`, causing:
- WCAG AA contrast failures (e.g., text-muted-foreground on bg-muted ~3:1)
- Inconsistent dark mode behavior
- Brittleness when design tokens change

## Scope

### In Scope
1. `text-input.tsx`: `border-gray-300` → `border-input`, `focus:ring-indigo-500` → `focus:ring-ring`
2. `primary-button.tsx`: `bg-gray-800`, `text-white` → `bg-primary`, `text-primary-foreground`, `focus:ring-ring`
3. `secondary-button.tsx`: `border-gray-300 bg-white` → semantic tokens
4. `checkbox.tsx`: `border-gray-300`, `text-indigo-600` → `border-input`, `text-primary`, `focus:ring-ring`
5. `input-label.tsx`: `text-gray-700` → `text-foreground`
6. `nav-link.tsx`: `text-gray-900/500`, `border-indigo-400` → semantic tokens
7. `modal.tsx`: `bg-gray-500/75` → `bg-black/50`, `bg-white` → `bg-card`
8. `dropdown.tsx`: menu items → semantic tokens
9. `tech-showcase.tsx`: proficiency badges → semantic tokens
10. Auth pages (register, forgot-password, confirm-password, verify-email): `text-gray-600` → `text-muted-foreground`

### Out of Scope
- Changing CSS variable values (already correctly defined)
- Adding new colors or tokens
- Refactoring the form system (separate change)

## Approach

Find-and-replace operation mapping legacy Tailwind utilities to semantic tokens. Each component receives targeted className replacements. The approach is surgical — no component logic changes, only class strings.

Estimated impact: ~15-20 files, most changes are single className string replacements.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `resources/js/components/ui/text-input.tsx` | Modified | border-input, focus:ring-ring |
| `resources/js/components/ui/primary-button.tsx` | Modified | bg-primary, text-primary-foreground |
| `resources/js/components/ui/secondary-button.tsx` | Modified | Semantic tokens |
| `resources/js/components/ui/checkbox.tsx` | Modified | border-input, text-primary |
| `resources/js/components/ui/input-label.tsx` | Modified | text-foreground |
| `resources/js/components/ui/nav-link.tsx` | Modified | Active/inactive semantic tokens |
| `resources/js/components/ui/modal.tsx` | Modified | Overlay + card tokens |
| `resources/js/components/ui/dropdown.tsx` | Modified | Menu item tokens |
| `resources/js/components/ui/tech-showcase.tsx` | Modified | Badge tokens |
| `resources/js/pages/auth/*.tsx` | Modified | text-muted-foreground |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Dark mode regression if token lacks dark variant | Low | Verify all tokens have .dark class defined |
| Missed hardcoded gray classes | Low | Grep for `gray-` patterns post-change |

## Rollback Plan

Revert via `git checkout <files>` to restore hardcoded Tailwind utilities. No database or external state affected.

## Dependencies

- None (pure frontend token mapping)

## Success Criteria

- [ ] Zero hardcoded `gray-*` utilities in target components
- [ ] All components render correctly in dark mode
- [ ] `php artisan test` passes
