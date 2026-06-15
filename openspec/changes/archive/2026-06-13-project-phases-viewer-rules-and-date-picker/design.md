# Design: Project Phases Viewer Rules and Date Picker

## Technical Approach

Add a backend-owned `viewer_role` to the project show payload, then make the project phases UI consume that role directly instead of recomputing ownership or membership from `auth.user`, `project.user_id`, or `participants`. Keep phase visibility in `ProjectPhasesSection` because the rule depends on both role and phase count. Introduce a project-scoped shadcn-compatible date picker wrapper for phase forms that stores and submits `completed_at` as `YYYY-MM-DD`.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Role derivation | Add `ProjectService::viewerRole(Project $project, ?User $viewer): string` and pass the result into `ApiResourceTransformer::project(...)` | Compute in React; compute inside transformer from auth; add database role column | Role is request-context business logic. Service keeps controllers thin and avoids coupling transformers/models to global auth. No schema change is needed. |
| Role precedence | `creator` if `project.user_id === viewer.id`; otherwise `member` if approved participant; otherwise `guest` | Treat creator as member; infer from join requests | Specs require distinct creator/member/guest. Join request state is not membership. |
| Frontend visibility | `ProjectPhasesSection` receives `viewerRole` and returns `null` for guest + empty phases; section derives `canManagePhases` | Hide section in page; pass `isCreator` into every child | The rule is section-specific and phase-count-dependent. The page should not duplicate phase policy details. |
| Date picker | Create `PhaseDatePicker` wrapper using shadcn `Popover` + `Calendar`; forms keep string state | Use raw `<input type="date">`; store `Date` in Inertia form | Wrapper matches the design system while preserving Laravel-compatible form payloads. String state avoids timezone drift in submissions. |

## Data Flow

```text
GET /projects/{project}
  -> ProjectController::show loads creator, techs, participants, phases
  -> ProjectService::viewerRole(project, Auth::user())
  -> ApiResourceTransformer::project(project, viewerJoinRequest, viewerRole)
  -> Inertia projects/show receives project.viewer_role
  -> ProjectPhasesSection(viewerRole, phases)
       -> creator: form + list + item actions
       -> member: list or member empty state
       -> guest: list only when phases exist, otherwise null
```

## File Changes

| File | Action | Description |
|---|---|---|
| `app/Services/ProjectService.php` | Modify | Add `viewerRole()` with creator-first precedence and participant lookup using loaded relation when available. |
| `app/Http/Controllers/ProjectController.php` | Modify | Resolve role in `show()` and pass it to the project transformer. |
| `app/Helpers/ApiResourceTransformer.php` | Modify | Accept optional `$viewerRole = 'guest'` and add `viewer_role` to project arrays. |
| `resources/js/types/index.ts` | Modify | Add `ProjectViewerRole = 'guest' \| 'creator' \| 'member'` and `Project.viewer_role`. |
| `resources/js/pages/projects/show.tsx` | Modify | Use `project.viewer_role` for creator UI and pass it to `ProjectPhasesSection`; keep participant derivation only for `ProjectJoinForm` until that component is redesigned. |
| `resources/js/components/projects/show/project-phases-section.tsx` | Modify | Replace `isCreator` prop with `viewerRole`; own section visibility, empty states, and manage controls. |
| `resources/js/components/projects/show/project-phase-item.tsx` | Modify | Replace `isCreator` prop with `canManage`; use `PhaseDatePicker` in edit mode. |
| `resources/js/components/projects/show/project-phase-form.tsx` | Modify | Use `PhaseDatePicker` in create mode; keep Inertia form field as string. |
| `resources/js/components/projects/show/phase-date-picker.tsx` | Create | Reusable project-phase date picker wrapper. |
| `resources/js/components/ui/calendar.tsx` | Create | Add via shadcn CLI. |
| `resources/js/components/ui/popover.tsx` | Create | Add via shadcn CLI. |
| `tests/Feature/Projects/ShowTest.php` | Modify | Assert `viewer_role` for guest, creator, and member payloads. |
| `resources/js/components/projects/show/project-phases-section.test.tsx` | Modify | Cover guest hidden/list-only, member empty state, and creator controls. |
| `resources/js/components/projects/show/phase-date-picker.test.tsx` | Create | Verify picker renders current value, selects `YYYY-MM-DD`, and clears to empty string. |

## Interfaces / Contracts

```ts
export type ProjectViewerRole = 'guest' | 'creator' | 'member';

export interface Project {
  viewer_role: ProjectViewerRole;
}

interface PhaseDatePickerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}
```

`PhaseDatePicker` parses incoming `YYYY-MM-DD` with date-fns, displays a localized label, and formats selected dates back to `yyyy-MM-dd`. Empty or invalid values render as no selected date and submit `''`.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Backend feature | `viewer_role` for guest, creator, member | Extend `tests/Feature/Projects/ShowTest.php` with Inertia assertions. |
| Frontend component | Section visibility and controls by role | Extend Vitest/RTL tests for `ProjectPhasesSection`; assert absence for guest empty case. |
| Frontend component | Date picker serialization | Vitest/RTL + `user-event`; mock calendar interactions only if shadcn internals are brittle in jsdom. |
| Regression | Existing phase CRUD payload format | Keep existing Laravel phase feature tests; add/update one request asserting `completed_at` date persistence if missing. |

## Migration / Rollout

No migration required. Add shadcn `calendar` and `popover` source components before implementing `PhaseDatePicker`. Rollback is a code revert; no persisted data shape changes.

## Open Questions

- [ ] None.
