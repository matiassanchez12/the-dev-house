# Tasks: Onboarding Idea Recommendations

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~595 (~350 tests) |
| 400-line budget risk | High |
| Chained PRs recommended | No |
| Suggested split | Single PR — `feat/onboarding-idea-recommendations` → `development` |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: High

Within the session-accepted 800-line `single-pr` budget (595 < 800); flagged for the reviewer, not sliced. No threat-matrix RED tests — design Threat Matrix is `N/A`.

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Whole slice (service + onboarding handoff + teaser) | PR 1 | `php artisan test --filter=ProjectIdeaServiceTest && npm test` | `php artisan test` + `npm run build` | Delete `ProjectIdeaService`, revert 3 controllers/request, delete teaser + wiring, revert 2 test files |

## Phase 1: ProjectIdeaService [Req: Catalog query service, Featured selection]

- [x] 1.1 RED: create `tests/Unit/Services/ProjectIdeaServiceTest.php` — `publishedForDisplay()` returns published-only, enum-order-then-`sort_order`, camelCase prefill keys, `''` for null vision, integer `techIds`; equals `ApiResourceTransformer::projectIdeas()` over same query.
- [x] 1.2 RED: same file — `featuredForOnboarding()`: one idea per category (lowest `sort_order`), `id` tie-break, enum order, unpublished excluded, `[]` on empty catalog, shape matches `publishedForDisplay()`.
- [x] 1.3 GREEN: create `app/Services/ProjectIdeaService.php` (`final`) with `publishedForDisplay(): array`, `featuredForOnboarding(): array`, private `publishedIdeas(): Collection` per design; single transformer call each.
- [x] 1.4 Run `php artisan test --filter=ProjectIdeaServiceTest`; `./vendor/bin/pint --dirty`.

## Phase 2: ProjectController refactor [Req: Existing behavior preserved]

- [x] 2.1 Edit `app/Http/Controllers/ProjectController.php@create` — method-inject `ProjectIdeaService`, replace inline query with `publishedForDisplay()`, add `use`, drop now-unused `ProjectIdea` import if unreferenced.
- [x] 2.2 Run `tests/Feature/ProjectIdeaInspirationTest.php` with ZERO edits — must stay green (byte-identity proxy).

## Phase 3: OnboardingController + SaveStep4Request [Req: Index exposes featured, Completion handoff, Join+idea coexist, Existing behavior preserved]

- [x] 3.1 RED: add to `tests/Feature/OnboardingTest.php` — `GET /onboarding` has `featuredIdeas` == `featuredForOnboarding()`, `totalSteps` 5; step-4 + valid published slug → redirect `/projects/create?idea=<slug>`, `onboarding_completed_at` set, `JoinRequest` rows created; step-4 + unpublished/unknown slug → 422, not completed; step-4 no slug → `/dashboard`; `/onboarding/skip` → `/dashboard`. Existing assertions untouched.
- [x] 3.2 GREEN: `SaveStep4Request` — add `idea_slug` rule `nullable|string|Rule::exists('project_ideas','slug')->where('is_published', true)`, `use Rule`, Spanish `idea_slug.exists` message, attribute.
- [x] 3.3 GREEN: `OnboardingController` — promoted constructor adds `ProjectIdeaService`; `index()` adds `featuredIdeas` prop; `saveStep4()` redirect branch per design (redirect only here; `skip()`/`complete()` untouched).
- [x] 3.4 Run `php artisan test --filter=OnboardingTest`; `pint --dirty`.

## Phase 4: Frontend types + validation [Req: Completion handoff] (parallelizable with Phases 1-3)

- [x] 4.1 `resources/js/types/onboarding.ts` — `SaveStep4Data` gains `idea_slug?: string`.
- [x] 4.2 `resources/js/hooks/use-onboarding-validation.ts` — `step4Schema` gains `idea_slug: z.string().optional()`.

## Phase 5: Teaser component [Req: Step 5 teaser] (depends on Phase 4)

- [x] 5.1 Confirm `@base-ui/react/radio-group` + `/radio` sub-path exports usable; else `npx shadcn@latest add radio-group` (design risk #1) and keep the props contract.
- [x] 5.2 RED: create `resources/js/components/onboarding/onboarding-idea-teaser.test.tsx` — renders one card per idea (title, `line-clamp-2` summary, difficulty badge when present, ≤3 tech chips + `+N`); select → `onSelect(slug)`; re-select active → `onSelect(null)`; `ideas={[]}` → renders nothing; "ver todas las ideas" is `<a href="/projects/create">`.
- [x] 5.3 GREEN: create `resources/js/components/onboarding/onboarding-idea-teaser.tsx` per design JSX — `RadioGroup`, `export type FeaturedIdea = ProjectIdea`, `null` when empty, click-to-deselect via `Radio.Root onClick`, Tailwind v4 tokens (no `dark:`).
- [x] 5.4 Run `npm test -- onboarding-idea-teaser`.

## Phase 6: onboarding/index.tsx wiring [Req: Step 5 teaser, Completion handoff, Join+idea coexist]

- [x] 6.1 Step-5-only diff in `resources/js/pages/onboarding/index.tsx` — read `featuredIdeas` (`?? []`), `selectedIdeaSlug` state, `techNamesById` memo from `allTechs`, render `<OnboardingIdeaTeaser>` below join-recs, add `idea_slug: selectedIdeaSlug ?? undefined` to step-4 `router.post` body, plain `<a href="/projects/create">` for "ver todas las ideas".

## Phase 7: Frontend test alignment [Req: Existing behavior preserved]

- [x] 7.1 `resources/js/pages/onboarding/index.test.tsx` — mock props gain `featuredIdeas` + confirm `allTechs` present.
- [x] 7.2 Add ONE focused step-5 test (design risk #4: pick the lower-friction option — new `describe`/file if advancing the mock to step 5 is impractical; state the choice in the test header) asserting the `idea_slug` post-body after selecting an idea.

## Phase 8: Final acceptance gates

- [x] 8.1 `php artisan test` green.
- [x] 8.2 `npm test` green.
- [x] 8.3 `npm run build` green.
- [x] 8.4 `npx tsc --noEmit` clean; `./vendor/bin/pint --dirty` clean.

## Doubts & Assumptions (for PR body)

- `featuredForOnboarding()` = one published idea per category (5 max with current seeder).
- `Rule::exists` is published-scoped, not bare `exists`.
- Teaser section (incl. "ver todas las ideas") hidden entirely when `featuredIdeas` empty.
- Redirect fires only from `saveStep4()`; `skip()` always → `/dashboard`.
- Both service methods return `array` (serialized), not `Collection`.
- `@base-ui/react` radio-group export unverified until apply; shadcn wrapper is the documented fallback.
- `ProjectController@create` prop byte-identity proven only by `ProjectIdeaInspirationTest` staying green with zero edits.
- `project-idea-inspiration` capability still unarchived.

## Key Learnings

1. Every backend behavior task is ordered RED test before implementation per the project's `tdd: true` config.
2. Phase 2 has no dedicated test; `ProjectIdeaInspirationTest` staying green unchanged is the byte-identity proxy.
3. Frontend types (Phase 4) are the only work parallelizable with the backend phases; the teaser depends on them.
4. The Threat Matrix is `N/A`, so no threat-specific RED tests were added.
5. Forecast ~595 lines exceeds the 400-line reviewer guard but fits the accepted 800-line single-PR budget.
