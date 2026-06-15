## Exploration: project-phases-viewer-rules-and-date-picker

### Current State

On the `projects/{slug}` page, the `ProjectPhasesSection` component is **always rendered** regardless of the viewer's role or whether phases exist. The only role-based differentiation today is the `isCreator` boolean prop, which toggles:
- The create-phase form (`ProjectPhaseForm`)
- Edit/delete actions on each phase item (`ProjectPhaseItem`)

The empty state uses a **creator-centric message** (`"Todavía no registraste logros"`), which is misleading for guests or project members.

The date input for `completed_at` is a plain `<Input type="date" />` — used in both `ProjectPhaseForm` (create) and `ProjectPhaseItem` (edit inline). The project already has `date-fns` installed, but no shadcn `Calendar` or `Popover` components.

### Affected Areas

- `resources/js/pages/projects/show.tsx` — computes `isCreator` and `isParticipant`; must pass a richer viewer-state prop to the phases section
- `resources/js/components/projects/show/project-phases-section.tsx` — must implement conditional visibility rules and role-aware empty states
- `resources/js/components/projects/show/project-phases-section.test.tsx` — unit tests need new cases for guest (hidden) and member (no create form, custom empty state)
- `tests/Feature/Projects/ShowTest.php` — backend feature tests should verify the section still renders the correct data payload, and ideally assert that phases are present for all viewers when they exist
- `resources/js/components/projects/show/project-phase-form.tsx` — optional date-picker replacement (create form)
- `resources/js/components/projects/show/project-phase-item.tsx` — optional date-picker replacement (edit inline form)

### Approaches

#### 1. Minimal Visibility Rules (No Date Picker)
- **Description**: Change `ProjectPhasesSection` to accept a `viewerRole` enum (`'guest' | 'creator' | 'member'`) and implement the three visibility rules. Keep the existing `<Input type="date" />`.
- **Pros**: Tight scope, no new dependencies, low risk, easy to test.
- **Cons**: Date input remains plain HTML; no shadcn calendar UX.
- **Effort**: Low

#### 2. Visibility Rules + shadcn Calendar/Popover Date Picker
- **Description**: Same as #1, plus install `@shadcn/calendar` and `@shadcn/popover`, then build a `DatePicker` component wrapping the calendar in a popover. Replace `type="date"` inputs in both create and edit forms.
- **Pros**: Consistent with shadcn design system; `date-fns` already installed; calendar and popover are standard shadcn primitives.
- **Cons**: Adds two new UI components to maintain; increases test surface (need to mock or interact with popover in tests); slightly more implementation work.
- **Effort**: Medium

#### 3. Visibility Rules + Date Picker as Separate Follow-up Task
- **Description**: Do #1 now, and open a separate task for the date picker so it can be reviewed independently.
- **Pros**: Keeps each change under the 400-line review budget; decouples UI enhancement from behavior logic.
- **Cons**: Two PRs instead of one; slightly more overhead.
- **Effort**: Low (for this scope)

### Recommendation

Adopt **Approach 1** for the core change, and **Approach 2** for the date picker if the user wants it in the same PR. The visibility rules are a clear behavioral fix and should be the primary deliverable. The date picker is a nice UX enhancement but not a requirement — the current `type="date"` input works correctly.

If the user insists on the date picker in the same change, we should chain it into two review slices:
1. **Slice A**: Viewer rules + empty states (frontend + tests)
2. **Slice B**: shadcn Calendar/Popover integration + date input replacement

### Risks

- **Member detection**: The show page currently computes `isParticipant` on the frontend via `useMemo` against `project.participants`. We need to pass this (or a derived `viewerRole`) down to `ProjectPhasesSection`. This is straightforward but must be consistent with the backend's `isMember()` logic.
- **Guest experience**: Hiding the entire section for guests when there are no phases means the page layout will simply skip that grid row. This is correct, but we should verify no layout jumps occur.
- **shadcn calendar bloat**: Adding `calendar` and `popover` adds ~2 new component files. They are small, but any future shadcn CLI update may overwrite them.
- **Test coverage**: The existing `project-phases-section.test.tsx` only tests `isCreator={true/false}`. We need to add `guest` and `member` scenarios.

### Open Questions

1. Does the user want the date picker in the same PR, or as a follow-up task?
2. Should the member empty state message be a specific string (e.g., `"No achievements recorded yet"`), or reuse the creator empty state with modified wording?
3. Are there any analytics or tracking events tied to the phases section visibility that would break if we hide it for guests?

### Ready for Proposal

**Yes** — the scope is clear, the files are identified, and the viewer-state model (`guest | creator | member`) is simple and fits the existing codebase. The only blocker is the user's preference on whether to include the date picker in this change or split it.

### Skill Resolution

- `paths-injected` — 4 skills (laravel-patterns, laravel-specialist, shadcn, vitest)
