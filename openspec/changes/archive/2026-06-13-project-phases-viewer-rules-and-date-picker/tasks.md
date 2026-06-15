# Tasks: Project Phases Viewer Rules and Date Picker

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 320-460 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 backend payload + tests → PR 2 frontend visibility + date picker |
| Delivery strategy | ask-always |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|---|---|---|---|
| 1 | Add backend-owned `viewer_role` to the project show payload | PR 1 | `ProjectController`, `ProjectService`, `ApiResourceTransformer`, `resources/js/types/index.ts`, Feature tests |
| 2 | Switch phases UI to role-based visibility and empty states | PR 2 | `show.tsx`, `project-phases-section.tsx`, `project-phase-item.tsx` |
| 3 | Replace native phase date inputs with a shadcn date picker | PR 2 | Add `calendar` + `popover`, create `phase-date-picker.tsx`, update phase form/item |

## Phase 1: Backend payload and contracts

- [x] 1.1 Add `ProjectService::viewerRole(Project $project, ?User $viewer): string` in `app/Services/ProjectService.php`.
- [x] 1.2 Update `app/Http/Controllers/ProjectController.php::show()` to resolve the viewer role and pass it to the transformer.
- [x] 1.3 Extend `app/Helpers/ApiResourceTransformer.php::project()` to accept `viewerRole` and emit `viewer_role` in the payload.
- [x] 1.4 Add `ProjectViewerRole` and `viewer_role` to `resources/js/types/index.ts`.

## Phase 2: Phases visibility wiring

- [x] 2.1 Update `resources/js/pages/projects/show.tsx` to use `project.viewer_role` and pass it to `ProjectPhasesSection`.
- [x] 2.2 Refactor `resources/js/components/projects/show/project-phases-section.tsx` to hide guest + empty state, show member empty state, and keep creator controls.
- [x] 2.3 Update `resources/js/components/projects/show/project-phase-item.tsx` to accept `canManage` and keep read-only rendering for non-creators.

## Phase 3: shadcn date picker integration

- [x] 3.1 Add shadcn `calendar` and `popover` source components under `resources/js/components/ui/`.
- [x] 3.2 Create `resources/js/components/projects/show/phase-date-picker.tsx` that stores `YYYY-MM-DD` in form state and renders the Calendar inside a Popover.
- [x] 3.3 Replace the native `<input type="date">` in `project-phase-form.tsx` and the edit form in `project-phase-item.tsx` with `PhaseDatePicker`.

## Phase 4: Backend verification

- [x] 4.1 Extend `tests/Feature/Projects/ShowTest.php` with guest, creator, and member assertions for `viewer_role`.
- [x] 4.2 Update `tests/Feature/Projects/PhaseTest.php` to assert `completed_at` persists from a `YYYY-MM-DD` submission.
- [x] 4.3 Run `php artisan test` for the touched Feature suites only; do not add frontend tests unless backend contract validation fails.
