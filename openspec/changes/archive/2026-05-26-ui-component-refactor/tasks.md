# Tasks: ui-component-refactor

## Phase 1: Button Migration

- [x] 1.1 Map PrimaryButton → Button default, migrate all 24 usages across auth and profile pages
- [x] 1.2 Map SecondaryButton → Button secondary, migrate 2 usages in delete-user-form.tsx
- [x] 1.3 Map DangerButton → Button destructive, migrate 3 usages (delete-user-form.tsx)
- [x] 1.4 Delete legacy button files (primary-button.tsx, secondary-button.tsx, danger-button.tsx)

## Phase 2: Delete Dialogs

- [x] 2.1 Replace confirm() in projects/show.tsx with shadcn Dialog for project deletion
- [x] 2.2 Audit and verify no remaining confirm() usages in resources/js/

## Phase 3: Toast Notifications

- [x] 3.1 Install sonner package and add <Toaster /> to root layout
- [x] 3.2 Add toast feedback to project CRUD operations (create, update, delete)
- [x] 3.3 Add toast feedback to join request actions (approve, reject, cancel)
- [x] 3.4 Add toast feedback to profile update operations (profile save, password change)

## Phase 4: Verification

- [x] 4.1 Run npm run build — verify zero errors
- [x] 4.2 Run php artisan test — verify all pass (5 pre-existing failures unrelated to this change)
- [x] 4.3 Visual check — verify button variants render correctly in light and dark mode

---

## Review Workload Forecast

- **Estimated changed lines**: ~200-300 (all frontend)
- **400-line budget risk**: Low-Medium (may approach 400 if many pages)
- **Chained PRs recommended**: No
- **Delivery strategy**: single-pr
- **Decision needed before apply**: No
