# Tasks: Project Card Redesign & Show Page Decomposition

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 450–550 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Foundation → PR 2: Show Decomposition → PR 3: Card Redesign |
| Delivery strategy | stacked-to-main |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Extract utils, create badge, fix closed status in existing card | PR 1 | Base = main; standalone reviewable; ~80 lines |
| 2 | Create 11 show section components, refactor show.tsx to compose them | PR 2 | Base = main (stacked); depends on PR 1 merged; ~350 lines |
| 3 | Redesign ProjectCard: thumbnail, meta row, featured ring | PR 3 | Base = main (stacked); depends on PR 1 merged; ~120 lines |

## Phase 1: Foundation (PR #1 — Utils + Badge)

- [ ] 1.1 Create `resources/js/components/projects/project-utils.ts` — export `statusConfig` (with `closed: 'bg-muted text-foreground'`), `getInitials(name)`, `storageUrl(path)`, `ProjectStatus` type, `StatusConfigEntry` interface
- [ ] 1.2 Create `resources/js/components/projects/project-status-badge.tsx` — accepts `status` + optional `className`, renders `Badge` with icon/label from `statusConfig`, falls back to `closed` for unknown status
- [ ] 1.3 Modify `resources/js/components/projects/project-card.tsx` — remove inline `statusConfig` and `getInitials`, import from `project-utils`, import/use `ProjectStatusBadge` in footer; verify `closed` status now visible
- [ ] 1.4 Modify `resources/js/pages/projects/show.tsx` — remove inline `statusConfig`, import from `project-utils` (keep rest of page unchanged for now)
- [ ] 1.5 Create `tests/Unit/project-utils.test.ts` — test `getInitials` edge cases (single name, multi-word, empty string) and `statusConfig` completeness (all 3 statuses have label/icon/className)
- [ ] 1.6 Run `npm run build` — verify zero TypeScript errors after imports updated
- [ ] 1.7 Run `php artisan test` — verify no regressions

## Phase 2: Show Page Decomposition (PR #2 — 11 Components)

- [ ] 2.1 Create `resources/js/components/projects/show/project-hero.tsx` — `ProjectHeroProps { title, status, image? }`; renders 16:9 banner with gradient overlay + title + `ProjectStatusBadge` when image exists, gradient fallback card otherwise
- [ ] 2.2 Create `resources/js/components/projects/show/project-description.tsx` — `ProjectDescriptionProps { description }`; renders `Card` with `whitespace-pre-line` paragraph
- [ ] 2.3 Create `resources/js/components/projects/show/project-vision.tsx` — `ProjectVisionProps { vision }`; renders `Card` with `whitespace-pre-line` paragraph (parent handles conditional)
- [ ] 2.4 Create `resources/js/components/projects/show/project-gallery.tsx` — `ProjectGalleryProps { images }`; renders `Card` with 2/3-col grid, `storageUrl()` for each image, `h-32 object-cover rounded-lg`
- [ ] 2.5 Create `resources/js/components/projects/show/project-participants.tsx` — `ProjectParticipantsProps { participants }`; renders `Card` with title count + `Badge variant="outline"` per participant
- [ ] 2.6 Create `resources/js/components/projects/show/project-creator-card.tsx` — `ProjectCreatorCardProps { creator }`; renders `Card` with `Avatar` (initials via `getInitials`), name, `Link` to `route('users.show', slug)`
- [ ] 2.7 Create `resources/js/components/projects/show/project-techs-card.tsx` — `ProjectTechsCardProps { techs }`; renders `Card` with `Badge variant="secondary"` per tech
- [ ] 2.8 Create `resources/js/components/projects/show/project-links-card.tsx` — `ProjectLinksCardProps { repositoryUrl?, demoUrl? }`; renders `Card` with `GitBranch`/`ExternalLink` icons + external links (parent handles conditional)
- [ ] 2.9 Create `resources/js/components/projects/show/project-join-form.tsx` — `ProjectJoinFormProps { projectId, isCreator, projectStatus, currentUser }`; renders join form (auth) or login/register CTA (unauth); uses `useForm` from Inertia
- [ ] 2.10 Create `resources/js/components/projects/show/project-delete-dialog.tsx` — `ProjectDeleteDialogProps { open, onOpenChange, onDelete, processing }`; renders `Dialog` with confirmation + cancel/delete buttons
- [ ] 2.11 Refactor `resources/js/pages/projects/show.tsx` — reduce to ~80 lines: import all 11 components, derive flat props per component, compose in return; use `gap-*` spacing (NOT `space-y-*`); use semantic tokens (`bg-card`, `text-muted-foreground`)
- [ ] 2.12 Run `npm run build` — verify zero TypeScript errors, all imports resolve
- [ ] 2.13 Run `php artisan test` — verify no regressions

## Phase 3: ProjectCard Redesign (PR #3 — Visual Changes)

- [ ] 3.1 Add image thumbnail to `ProjectCard` — `default` and `featured` variants show `project.images[0]` as 16:9 banner at card top (use `storageUrl()`); gradient placeholder when no images; `compact` variant shows NO image
- [ ] 3.2 Add meta row footer to `ProjectCard` — replace current footer with row containing: `ProjectStatusBadge`, participants count (hidden if `=== 0`), relative date (e.g., "hace 3 días"); use `gap-*` spacing
- [ ] 3.3 Enhance `featured` variant — add `ring-2 ring-primary/20` and `shadow-xl` for visual prominence; keep star icon
- [ ] 3.4 Update `ProjectCardProps` — add optional `createdAt?: string` for relative date; `UserProject` cards skip relative date (no `created_at` in type)
- [ ] 3.5 Run `npm run build` — verify zero TypeScript errors
- [ ] 3.6 Run `php artisan test` — verify no regressions
- [ ] 3.7 Visual verification — manually check: thumbnail renders with/without images, meta row shows correct elements, featured variant has gradient ring, compact variant unchanged
