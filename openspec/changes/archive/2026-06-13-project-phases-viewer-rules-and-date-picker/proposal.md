# Proposal: Project Phases Viewer Rules and Date Picker

## Intent

The `ProjectPhasesSection` on the project show page is always rendered regardless of the viewer's role. The empty state message is creator-centric (`"Todavía no registraste logros"`), which is confusing for guests and members. Additionally, the `completed_at` date input uses a plain HTML `<input type="date">`, which is inconsistent with the shadcn/ui design system.

## Scope

### In Scope
- Backend-owned `viewer_role` field (`guest | creator | member`) in the project show payload
- Role-based visibility rules for `ProjectPhasesSection`:
  - **Guest**: hide section when no phases; show read-only list when phases exist (no CTA)
  - **Member**: show list; hide create form; custom empty state
  - **Creator**: full control (existing behavior)
- Role-aware empty state messages (creator vs member)
- Replace native date inputs with a shadcn-compatible `DatePicker` component that still submits `YYYY-MM-DD`
- Frontend and backend tests for new behavior

### Out of Scope
- The duplicate `messages.sender` eager-load fix (already resolved separately)
- Changes to phase CRUD logic beyond visibility and date input UX

## Capabilities

### New Capabilities
- `project-phases-visibility`: Role-based rendering and empty states for the project phases section
- `project-phase-date-picker`: shadcn Calendar + Popover date picker for `completed_at` fields

### Modified Capabilities
- None

## Approach

1. Add `viewer_role` to the Inertia payload in the project show controller/response
2. Replace `isCreator` boolean with `viewer_role` in `ProjectPhasesSection` and downstream components
3. Implement conditional rendering and role-aware empty states
4. Install `calendar` and `popover` from shadcn/ui, compose a `DatePicker` wrapper, and swap `type="date"` inputs
5. Update tests to cover guest, member, and creator scenarios

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/Http/Controllers/ProjectController.php` | Modified | Add `viewer_role` to Inertia response |
| `resources/js/pages/projects/show.tsx` | Modified | Pass `viewer_role` to `ProjectPhasesSection` |
| `resources/js/components/projects/show/project-phases-section.tsx` | Modified | Implement role-based visibility and empty states |
| `resources/js/components/projects/show/project-phase-form.tsx` | Modified | Replace native date input with `DatePicker` |
| `resources/js/components/projects/show/project-phase-item.tsx` | Modified | Replace native date input with `DatePicker` |
| `tests/Feature/Projects/ShowTest.php` | Modified | Assert `viewer_role` in payload |
| `resources/js/components/projects/show/project-phases-section.test.tsx` | Modified | Add guest and member tests |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `viewer_role` computed differently on frontend vs backend | Low | Derive role in backend controller; frontend consumes only |
| shadcn Calendar/Popover increase bundle size | Low | Components are tree-shakeable; only two small primitives |
| Popover date picker breaks form submission format | Low | Enforce `YYYY-MM-DD` format in `DatePicker` wrapper |

## Rollback Plan

Revert the commit. The change is additive: removing `viewer_role` and the `DatePicker` component restores the previous `isCreator`-only behavior and native date inputs.

## Dependencies

- `date-fns` (already installed)

## Success Criteria

- [ ] `viewer_role` is present in the project show Inertia payload for all authenticated users
- [ ] Guest sees no phases section when phases are empty; read-only list when phases exist
- [ ] Member sees phase list with custom empty state and no create form
- [ ] Creator retains full create/edit/delete functionality
- [ ] `DatePicker` submits `YYYY-MM-DD` and is used in both create and edit phase forms
- [ ] All new behavior is covered by passing tests
