# Tasks: Core Pages UI Redesign

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 200-300 |
| 400-line budget risk | Low-Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low-Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Install Tabs, update shared components, redesign user profile | PR 1 | Foundation + profile page |
| 2 | Redesign project detail page, verify build + tests | PR 2 | Project page + verification |

## Phase 1: Foundation (Install Tabs, Update Shared Components)

- [x] 1.1 Install shadcn Tabs: run `npx shadcn@latest add tabs`, verify `resources/js/components/ui/tabs.tsx` created
- [x] 1.2 Update `resources/js/components/user/user-profile-header.tsx`: replace `size="lg"` with explicit `size-20` on Avatar, add `font-display` to name, add `line-clamp-3` to bio, style member date as muted caption
- [x] 1.3 Update `resources/js/components/user/tech-showcase.tsx`: group techs by proficiency level (Experto, Avanzado, Intermedio, Principiante) as labeled sections with `SectionLabel` heading per group, replace `space-y-3` with `gap-3`
- [x] 1.4 Update `resources/js/components/user/project-showcase.tsx`: replace custom tab buttons with shadcn `Tabs` + `TabsList` + `TabsTrigger` + `TabsContent`, replace `space-y-4` with `gap-4`

## Phase 2: User Profile Page

- [x] 2.1 Redesign `resources/js/pages/users/show.tsx`: replace Card stacking with hero layout (gradient bg container), stats row (created/participating/techs count as inline flex with `cn()` stat items), wider `max-w-5xl` container
- [x] 2.2 Replace all `space-y-6` with `gap-6` in `resources/js/pages/users/show.tsx`
- [x] 2.3 Write test: `tests/Feature/Users/ShowTest.php` — `test_profile_page_renders_hero_layout` — assert hero section, stats row, and tech groups render with correct data
- [x] 2.4 Write test: `tests/Feature/Users/ShowTest.php` — `test_profile_page_shows_empty_state_for_no_projects` — assert Empty component renders when user has no projects

## Phase 3: Project Detail Page

- [x] 3.1 Redesign `resources/js/pages/projects/show.tsx`: hero section with main image as full-width banner (gradient overlay fallback when no image), two-column `grid-cols-1 lg:grid-cols-3` layout (main 2 cols, sidebar 1 col)
- [x] 3.2 Move metadata (status badge, creator link with avatar, techs list, external URLs) to sidebar column
- [x] 3.3 Replace all `space-y-6` and `space-y-4` with `gap-6` and `gap-4` in `resources/js/pages/projects/show.tsx`
- [x] 3.4 Write test: `tests/Feature/Projects/ShowTest.php` — `test_project_detail_renders_hero_and_sidebar` — assert hero image, two-column grid, sidebar metadata
- [x] 3.5 Write test: `tests/Feature/Projects/ShowTest.php` — `test_project_detail_responsive_layout` — assert single-column layout classes present for mobile breakpoint

## Phase 4: Verification

- [x] 4.1 Run `npm run build` — verify build succeeds with no errors
- [x] 4.2 Run `php artisan test` — verify all tests pass (new + existing)
- [x] 4.3 Manual responsive check: verify both pages collapse to single column on mobile viewport (<1024px)
- [x] 4.4 Accessibility check: verify shadcn Tabs have proper ARIA roles and keyboard navigation works
