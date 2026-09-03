# Proposal: Onboarding Idea Recommendations

## Intent

Onboarding step 5 only offers existing projects to **join**. Users who want to **build** reach the end of onboarding with no next action and land on an empty dashboard — an activation dead end. Follow-up to the shipped `project-idea-inspiration` (#181): surface a compact teaser of the idea catalog on step 5 so a builder finishes onboarding already inside `/projects/create` with an idea pre-selected.

## Scope

### In Scope

- New autowired `App\Services\ProjectIdeaService` with `publishedForDisplay()` (the current inline `create()` query, verbatim) and `featuredForOnboarding()` (one idea per category, `ProjectIdeaCategory` enum order, ~5 total).
- `ProjectController@create` consumes the service (method-inject); `projectIdeas` prop shape and values stay identical.
- `OnboardingController@index` adds a `featuredIdeas` Inertia prop (no new endpoint).
- `SaveStep4Request` gains `idea_slug` => `nullable|string` + published-scoped exists check, Spanish message.
- `OnboardingController@saveStep4` branches its redirect on `idea_slug`; join requests still send.
- New presentational `resources/js/components/onboarding/onboarding-idea-teaser.tsx`, wired into step 5 below the join recommendations.
- Types (`types/index.ts`, `types/onboarding.ts`), `use-onboarding-validation.ts`, and test updates.

### Out of Scope (non-goals)

- No new onboarding step; `totalSteps` stays 5.
- No `is_featured` column, no migration.
- No change to `GET /onboarding/recommendations` or `OnboardingService::getRecommendations`.
- No behavior change to the `/projects/create` `projectIdeas` prop.
- No dependency on #236 (idea cover images / `illustration_path`).
- No analytics, no multi-select of ideas, no reuse of `ProjectIdeaCard`.

## Capabilities

### New Capabilities

- `onboarding-idea-recommendations`: featured-idea selection rules, the step-5 teaser, and the post-completion handoff to `/projects/create?idea=<slug>`.

### Modified Capabilities

- None. The `ProjectController@create` refactor is behavior-preserving, so `project-idea-inspiration` requirements are unchanged; the `app` capability's "Onboarding Flow Steps" requirement is unaffected (still 5 steps).

## Approach

Extract the catalog query into `ProjectIdeaService`. `featuredForOnboarding()` reuses `publishedForDisplay()`, groups in PHP by category, picks the lowest `sort_order` (tie-break `id` asc), and emits enum order — one query, no new SQL, DB-portable, empty-safe. Both controllers serialize through `ApiResourceTransformer::projectIdeas()`, which already owns ordering, so the create-page payload is byte-identical.

Validation uses `Rule::exists('project_ideas','slug')->where('is_published', true)` rather than bare `exists:project_ideas,slug`: the create page silently ignores an unpublished slug anyway, and rejecting it at the boundary keeps the contract honest for ~0 extra cost.

The redirect branch lives **inside `saveStep4()`**, never in `private complete()`, because `skip()` shares `complete()` and must keep going to the dashboard.

Frontend: a presentational teaser (~5 compact cards: title, summary, difficulty badge, tech names), single-select, plain `<a href="/projects/create">` for "ver todas las ideas" (no Ziggy inside the component), rendering `null` when `featuredIdeas` is empty. The exact single-select primitive (`RadioGroup` vs `ToggleGroup`) is left to sdd-design.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/Services/ProjectIdeaService.php` | New | `publishedForDisplay()` + `featuredForOnboarding()` |
| `app/Http/Controllers/ProjectController.php` | Modified | `create()` method-injects the service; prop unchanged |
| `app/Http/Controllers/OnboardingController.php` | Modified | `index()` adds `featuredIdeas`; `saveStep4()` branches redirect |
| `app/Http/Requests/Onboarding/SaveStep4Request.php` | Modified | `idea_slug` rule, message, attribute |
| `resources/js/components/onboarding/onboarding-idea-teaser.tsx` | New | Compact single-select teaser |
| `resources/js/pages/onboarding/index.tsx` | Modified | Step-5 section, `selectedIdeaSlug`, POST body |
| `resources/js/types/index.ts`, `types/onboarding.ts` | Modified | `featuredIdeas`, optional `idea_slug` |
| `resources/js/hooks/use-onboarding-validation.ts` | Modified | `step4Schema` optional `idea_slug` |
| `tests/Unit/Services/ProjectIdeaServiceTest.php` | New | Selection + ordering + empty-safe |
| `tests/Feature/OnboardingTest.php` | Modified | Adds slug-redirect cases |
| `resources/js/pages/onboarding/index.test.tsx` | Modified | Mock props gain `featuredIdeas` (+ `techs` if read) |

**Non-regression guarantees (not scenario edits):** `tests/Feature/OnboardingTest.php` step-4 and skip assertions stay `/dashboard` because they post no slug; `tests/Feature/ProjectIdeaInspirationTest.php` stays unchanged because the refactor is behavior-preserving.

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Redirect logic leaks into shared `complete()` and hijacks `skip()` | Med | Branch only in `saveStep4()`; keep a skip -> `/dashboard` test |
| Create-page prop drift breaks `ProjectIdeaInspirationTest` | Low | `publishedForDisplay()` reproduces the query verbatim; transformer owns ordering |
| Vitest mock lacks new props | Med | Default-guard props in the component; update the mock |
| `featuredIdeas` payload on every onboarding render | Low | ~5 ideas, ~3-5 KB; accepted |
| Ziggy `route()` inside the teaser breaks vitest | Low | Plain `<a href>` only |

## Rollback Plan

Pure additive; no migration, no data change. Revert in one commit: drop `app/Services/ProjectIdeaService.php` and restore the inline query in `ProjectController@create`; remove the `featuredIdeas` prop and the `saveStep4()` redirect branch (falls back to `complete()` -> dashboard); remove the `idea_slug` rule; delete the teaser component and its wiring in `index.tsx`, types, and zod schema; revert the two test files. Existing catalog, seeder, and `/projects/create` behavior are untouched, so partial revert of only the onboarding half is also safe.

## Dependencies

- Shipped `project-idea-inspiration` (#181) catalog, transformer, and seeder on `development`.
- Explicitly **not** dependent on #236.

## Success Criteria

- [ ] `/projects/create` `projectIdeas` prop is unchanged; `ProjectIdeaInspirationTest` passes with zero edits.
- [ ] `featuredForOnboarding()` returns exactly one published idea per non-empty category in enum order, and `[]` on an empty catalog.
- [ ] Step 5 shows the teaser below the join recommendations, hides it entirely when `featuredIdeas` is empty, and allows at most one selection.
- [ ] Posting step-4 with a valid `idea_slug` completes onboarding and redirects to `/projects/create?idea=<slug>`; join requests still send.
- [ ] Posting step-4 without a slug, and `skip()`, still redirect to `/dashboard`.
- [ ] An unpublished or unknown `idea_slug` fails validation with a Spanish message.
- [ ] `php artisan test`, `npm test`, and `npm run build` pass.

## Assumptions

Recorded under `auto-force`; correct any before sdd-spec.

1. `featuredForOnboarding()` picks exactly one idea per category — 5 with the current seeder; fewer if a category has no published idea.
2. Validation uses `Rule::exists('project_ideas','slug')->where('is_published', true)` (published-scoped), not bare `exists:project_ideas,slug`.
3. The whole teaser section, including the "ver todas las ideas" link, is hidden when `featuredIdeas` is empty.
4. The idea redirect fires only from `saveStep4()`; `skip()` always goes to `/dashboard`.
5. Join-request selection and idea selection coexist; picking an idea does not cancel join requests.
6. Code identifiers and comments are English; user-facing copy is Spanish.
7. The teaser shows tech **names**, so it may read the global shared `techs` prop; the vitest mock is updated accordingly.
