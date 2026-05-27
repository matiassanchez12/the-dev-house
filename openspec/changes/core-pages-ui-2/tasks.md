# Tasks: Redesign users directory and project forms

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~350-420 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: users/index redesign + nav link, PR 2: project forms |
| Delivery strategy | stacked-to-main |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Users index redesign (layout, Select, Pagination, Empty, search icon) | PR 1 | Independent — no dependencies on other units |
| 2 | Project form redesign (ImageUploader, Checkbox grid, FormError, Separators, counters) | PR 1 | Depends on unit 1 only for shared shadcn imports |
| 3 | Navigation + page polish (Developers link, create/edit minor updates) | PR 1 | Depends on unit 2 (FormError extraction) |

## Phase 1: Foundation — New Components & Navigation

- [ ] 1.1 Create `resources/js/components/projects/image-uploader.tsx` — drag-drop zone with HTML5 DnD API, file preview thumbnails (URL.createObjectURL), size validation (2MB limit), max 5 files enforcement, visual feedback on drag-over, remove button per preview
- [x] 1.2 Add "Developers" NavLink to `resources/js/layouts/public.tsx` — desktop nav alongside "Proyectos", mobile menu entry, active state via `route().current('users.*')`
- [ ] 1.3 Audit all `text-red-500` error spans in `project-form.tsx` — enumerate every error path (title, description, techs, repository_url, demo_url, images) to ensure FormError extraction covers all cases

## Phase 2: Users Index Redesign

- [x] 2.1 Wrap `resources/js/pages/users/index.tsx` content in `PublicLayout` — remove `min-h-screen bg-background` wrapper div, add `PublicLayout` with `header` prop containing the "Discover Developers" heading, keep `Head` outside layout
- [x] 2.2 Replace raw `<select>` tech filter with shadcn `Select` — import `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from `@/components/ui/select`, map `techs` to `SelectItem`, wire `onValueChange` to existing `handleTechChange`
- [x] 2.3 Add Search icon to search Input — wrap Input in relative container, add `Search` icon (lucide-react) absolutely positioned left with `left-3 top-1/2 -translate-y-1/2`, add `pl-9` to Input for text offset
- [x] 2.4 Replace `dangerouslySetInnerHTML` pagination with shadcn `Pagination` — import `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationNext`, `PaginationPrevious` from `@/components/ui/pagination`, map `users.links` to `PaginationLink` preserving Inertia `router.get()` navigation, highlight active page
- [x] 2.5 Replace empty state Card with shadcn `Empty` — import `Empty`, `EmptyContent`, `EmptyDescription`, `EmptyTitle` from `@/components/ui/empty`, show when `users.data.length === 0`, include "Clear filters" Button when `hasActiveFilters`

## Phase 3: Project Form Redesign

- [ ] 3.1 Replace raw checkbox tech selection with shadcn `Checkbox` grid — import `Checkbox` from `@/components/ui/checkbox` and `Label`, each tech renders `<Checkbox>` + `<Label htmlFor>` pair inside existing grid (`grid-cols-2 sm:grid-cols-3`), wire to existing `handleTechChange`, add `errors.techs` FormError below grid
- [ ] 3.2 Extract `FormError` component usage — replace all `<p className="text-red-500 text-sm mt-1">` with `<FormError message={errors.field} />` for title, description, techs, repository_url, demo_url, images fields
- [ ] 3.3 Add `Separator` between form sections — import `Separator` from `@/components/ui/separator`, place between Basic Info (title/description/vision), Tech Stack, URLs, and Media sections
- [ ] 3.4 Replace raw file input with `ImageUploader` component — remove existing `<Input type="file">` and existing image display block, insert `<ImageUploader>` that receives current files, existing images (edit mode), and callbacks to update form data
- [ ] 3.5 Add character counters to title and description — show `data.title.length / 255` below title Input, `data.description.length / 1000` below description Textarea, use `text-muted-foreground text-xs` styling, update on every keystroke (already reactive via Inertia form)

## Phase 4: Page Polish & Integration

- [ ] 4.1 Update `resources/js/pages/projects/create.tsx` — verify ProjectForm integration works with new component structure (Separator, FormError, ImageUploader), no structural changes needed beyond confirming props compatibility
- [ ] 4.2 Update `resources/js/pages/projects/edit.tsx` — pass existing `project.images` to ImageUploader for existing image display with remove buttons, verify form data flows correctly with new `remove_images` handling

## Phase 5: Verification

- [ ] 5.1 Run `npm run build` — confirm zero TypeScript errors and zero build warnings across all modified/new files
- [ ] 5.2 Run `php artisan test` — confirm all existing tests pass (no backend changes, but verify no regressions)
- [ ] 5.3 Manual verification checklist — users/index renders in PublicLayout, tech filter works with Select, pagination navigates correctly, empty state shows, project form Checkbox grid works, ImageUploader drag-drop + previews work, FormError displays on validation errors, Developers link navigates to /users, character counters update in real-time
