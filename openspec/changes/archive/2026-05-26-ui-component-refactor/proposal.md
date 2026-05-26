# Proposal: UI Component Refactor

## Intent

Replace legacy Laravel Breeze UI components with shadcn equivalents to achieve visual consistency, theme awareness, and better UX. Three related improvements:
1. **Buttons** — 3 legacy components with hardcoded styles → shadcn `Button` with theme-aware variants
2. **Delete dialogs** — blocking `alert()`/`confirm()` → non-blocking shadcn `Dialog`
3. **Toast notifications** — zero feedback after API ops → `sonner` toast system

## Scope

### In Scope
- Replace `PrimaryButton` → `Button` (variant `default`) — 24 usages across auth + profile pages
- Replace `SecondaryButton` → `Button` (variant `secondary`) — 2 usages in `delete-user-form.tsx`
- Replace `DangerButton` → `Button` (variant `destructive`) — 3 usages (fixes hardcoded `bg-red-600`)
- Delete legacy button components after migration
- Replace `confirm()` in `delete-user-form.tsx` and `projects/show.tsx` with shadcn `Dialog`
- Install `sonner` and add toast feedback for: project CRUD, join request actions, profile updates, account deletion

### Out of Scope
- Full app component audit (deferred)
- New page creation
- Backend/validation changes
- Other Breeze components (InputError, InputLabel, etc.)

## Capabilities

### New Capabilities
- `ui-button-migration`: Replace legacy button components with shadcn `Button` variants across all pages
- `ui-delete-dialog`: Replace `window.confirm()` with accessible shadcn `Dialog` for destructive actions
- `ui-toast-feedback`: Add `sonner` toast notifications for API operation feedback

### Modified Capabilities
- None (no existing spec requirements change at the behavioral level)

## Approach

**Phase 1 — Buttons**: Map each legacy component to shadcn `Button` variant. Update imports in 10 files. Delete `primary-button.tsx`, `secondary-button.tsx`, `danger-button.tsx`.

**Phase 2 — Delete Dialogs**: Replace `confirm()` in `delete-user-form.tsx` (profile) and `projects/show.tsx` (project deletion) with controlled shadcn `Dialog` components.

**Phase 3 — Toasts**: Install `sonner`, add `<Toaster />` to root layout. Wire `toast()` calls to `onSuccess`/`onError` callbacks in Inertia form submissions.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `resources/js/components/primary-button.tsx` | Removed | Legacy component deleted |
| `resources/js/components/secondary-button.tsx` | Removed | Legacy component deleted |
| `resources/js/components/danger-button.tsx` | Removed | Legacy component deleted |
| `resources/js/pages/auth/*.tsx` | Modified | Button imports updated (8 files) |
| `resources/js/pages/profile/partials/*.tsx` | Modified | Button imports + delete dialog (4 files) |
| `resources/js/pages/projects/show.tsx` | Modified | Delete dialog replacement |
| `resources/js/layouts/app-layout.tsx` | Modified | Add `<Toaster />` |
| `package.json` | Modified | Add `sonner` dependency |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Visual regression from button style differences | Medium | Side-by-side comparison before deletion |
| Dialog state management bugs | Low | shadcn Dialog is well-tested; keep state local |
| Toast duplicate notifications on rapid actions | Low | Use `sonner`'s built-in deduplication |

## Rollback Plan

1. Revert git commit — all legacy button files are deleted only after migration, so a single `git revert` restores everything
2. If toasts cause issues: remove `<Toaster />` from layout and `toast()` calls; `sonner` removal is safe (no DB/schema changes)
3. If dialogs regress: temporarily restore `confirm()` calls (one-liner per location)

## Dependencies

- `sonner` npm package (install via `npm install sonner`)
- Existing shadcn `ui/button` and `ui/dialog` components (already present)

## Success Criteria

- [ ] Zero references to `PrimaryButton`, `SecondaryButton`, `DangerButton` in codebase
- [ ] Zero `window.confirm()` or `alert()` calls for delete confirmations
- [ ] Toast appears after: project create/update/delete, join request approve/reject/cancel, profile save, account delete
- [ ] All button variants are theme-aware (visible in both light and dark mode)
- [ ] All tests pass
