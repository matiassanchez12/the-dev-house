# Proposal: Redesign users directory and project forms

## Intent

The users directory (`users/index.tsx`) lacks layout consistency with recently redesigned public pages — no layout wrapper, raw HTML `<select>` for tech filtering, raw pagination with `dangerouslySetInnerHTML`, and a basic empty state. Project forms (`project-form.tsx`) use raw HTML checkboxes for tech selection, raw file inputs for images, hardcoded error colors, and no image preview. Both pages are visually inconsistent with the established shadcn/ui design system.

## Scope

### In Scope
- **users/index.tsx** — wrap in PublicLayout, replace raw `<select>` with shadcn Select, replace raw pagination with shadcn Pagination, add shadcn Empty component, add search icon to Input
- **project-form.tsx** — replace raw checkboxes with shadcn Checkbox grid, build ImageUploader component with drag-drop + previews, extract FormError component, add Separator for form sections, add character counters
- **projects/create.tsx & edit.tsx** — minor polish to match new form structure
- **public.tsx** — add "Developers" nav link to PublicLayout navigation

### Out of Scope
- Backend validation changes (StoreProjectRequest, UpdateProjectRequest remain unchanged)
- New API endpoints or controller changes
- Database schema changes
- Project form business logic (service layer untouched)

## Capabilities

### New Capabilities
None — this is a pure UI refactor within existing capabilities.

### Modified Capabilities
- `app`: UI requirement updates — users/index and project-form components must use shadcn/ui primitives matching established visual patterns (PublicLayout/AuthedLayout wrappers, semantic tokens, gap spacing)

## Approach

Replace raw HTML elements with shadcn/ui equivalents already installed in the project. The users directory gets wrapped in PublicLayout (matching other discovery pages) with consistent container rhythm (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12`). The project form gets a Checkbox grid for tech selection, a new ImageUploader component with drag-drop zone and thumbnail previews, and a FormError component replacing hardcoded `text-red-500` spans. All styling uses semantic tokens (`bg-card`, `text-muted-foreground`) and `gap-*` spacing (no `space-y-*`).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `resources/js/pages/users/index.tsx` | Modified | Layout wrapper, shadcn Select/Pagination/Empty, search icon |
| `resources/js/components/projects/project-form.tsx` | Modified | Checkbox grid, FormError, Separator, character counters |
| `resources/js/components/projects/image-uploader.tsx` | New | Drag-drop image upload with previews, max 5 files |
| `resources/js/pages/projects/create.tsx` | Modified | Minor polish to match new form structure |
| `resources/js/pages/projects/edit.tsx` | Modified | Minor polish to match new form structure |
| `resources/js/layouts/public.tsx` | Modified | Add "Developers" nav link |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| ImageUploader drag-drop behavior differs across browsers | Low | Use standard HTML5 drag-drop API, test on Chrome/Firefox/Edge |
| Checkbox grid layout breaks on small screens | Low | Use responsive grid (`grid-cols-2 sm:grid-cols-3`) |
| FormError component misses edge cases from current inline errors | Medium | Audit all current error paths before extracting component |
| Pagination behavior change with shadcn component | Low | Match existing Inertia pagination links exactly |

## Rollback Plan

Revert the git commit. All changes are frontend-only — no database migrations or backend changes to undo. The previous versions of `users/index.tsx`, `project-form.tsx`, `create.tsx`, `edit.tsx`, and `public.tsx` will be restored. Delete the new `image-uploader.tsx` file.

## Dependencies

- shadcn components already installed: Checkbox, Select, Empty, Pagination, FormError, Separator, Badge, Card, Button, Input, Textarea, Label, Dialog
- Existing `forceFormData: true` on project form (multipart submission)
- Existing validation rules: techs array min:1, images max 5 at 2MB each

## Success Criteria

- [ ] users/index.tsx renders inside PublicLayout with consistent container rhythm
- [ ] Tech filter uses shadcn Select (no raw `<select>`)
- [ ] Pagination uses shadcn Pagination component (no `dangerouslySetInnerHTML`)
- [ ] Empty state uses shadcn Empty component
- [ ] Project form uses shadcn Checkbox grid for tech selection
- [ ] ImageUploader shows drag-drop zone + thumbnail previews
- [ ] Form errors use FormError component (no hardcoded `text-red-500`)
- [ ] "Developers" link appears in PublicLayout navigation
- [ ] `npm run build` succeeds with zero TypeScript errors
- [ ] All existing project form functionality works (create, edit, image upload, tech selection)
