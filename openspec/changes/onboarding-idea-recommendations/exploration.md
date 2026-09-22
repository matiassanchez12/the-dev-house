# Exploration: onboarding-idea-recommendations

Surface the `project_ideas` catalog as a compact single-select teaser on onboarding step 5, alongside the existing "join existing projects" recommendations. Handoff to `/projects/create?idea=<slug>` happens server-side after `complete()`.

## Current State (verified on `development`)

### Onboarding flow

- Routes (`routes/web.php` L90-98), all inside `Route::middleware('auth')`:
  - `GET /onboarding` -> `OnboardingController@index` (name `onboarding.index`)
  - `POST /onboarding/step-1..step-4`, `step-social-links`, `skip`
  - `GET /onboarding/recommendations` -> `OnboardingController@recommendations` (JSON, name `onboarding.recommendations`) — "recommend existing projects to JOIN".
- `OnboardingController@index`: redirects to `dashboard` if `hasCompletedOnboarding()`; otherwise `inertia('onboarding/index', ['user' => {bio, avatar}, 'allTechs' => Tech::all(), 'userTechs' => ..., 'totalSteps' => 5])`. NO idea data today.
- `@recommendations`: `OnboardingService::getRecommendations(user, limit = 5)` — `Project::where('status','open')` filtered by `whereHas('techs', in userTechIds)` (or unfiltered first 5 if the user has no techs), `with(['techs','creator'])`. Returns hand-mapped JSON `{ projects: [{id,title,description,slug,techs:[{id,name}],creator}] }`.
- `@saveStep4(SaveStep4Request)`: sends join requests via `OnboardingService::sendJoinRequests`, then `return $this->complete()`.
- `private complete()`: `OnboardingService::complete(user)` (sets `onboarding_completed_at`), then ALWAYS `redirect()->route('dashboard')`. Shared by BOTH `saveStep4()` and `skip()`.
- `SaveStep4Request`: `FormRequest`, `authorize() => true`, rules only `join_requests: nullable|array`, `join_requests.*: integer`. Has `messages()` + `attributes()` in Spanish.
- `OnboardingService` — plain class, container-autowired (no explicit binding), stateless methods taking `User`. `OnboardingController` injects it via a private property in `__construct`.

### Onboarding frontend (`resources/js/pages/onboarding/index.tsx`, ~805 lines, one big component)

- `currentStep` state 1..5, `handleNext()` is a per-step `if/else` chain. Steps 2/3/4 short-circuit forward when optional data is empty (no POST).
- Step 5 (`currentStep === 5`, title "Elegí proyectos para explorar"): a `useEffect` does a raw `fetch('/onboarding/recommendations')` (loading/error/retry local state), renders a list of checkbox cards, `selectedProjects: number[]` multi-select via `toggleProject`.
- Step 5 `handleNext`: `router.post('/onboarding/step-4', { join_requests: selectedProjects }, { preserveScroll, onError, onFinish })` — NO `onSuccess` (server redirect drives navigation).
- Uses shadcn `Card/Checkbox/Badge/Button/Dialog/Field/FormError`. `usePage<OnboardingProps>().props` — does NOT currently read `techs` (global shared prop) or any idea prop.
- `resources/js/layouts/onboarding.tsx` — dumb progress/skip shell.
- `resources/js/types/onboarding.ts` — `SaveStep4Data { join_requests: number[] }`.
- `resources/js/hooks/use-onboarding-validation.ts` — zod `step4Schema = { join_requests: z.array(z.number()).nullable() }`.
- `resources/js/pages/onboarding/index.test.tsx` (vitest) — mocks `@inertiajs/react` as `{ router: { post }, usePage: () => ({ props: mockState.props }) }`. `mockState.props` has NO `techs` and NO `featuredIdeas`. Mocks layout/seo/card/badge/dialog/sonner. Tests operate on steps 1-2 only; none reach step 5. `Link` is NOT in the inertia mock.

### Idea catalog on `development`

- `project_ideas` table (migration `2026_09_02_000100`): `slug` unique, `title`, `summary(500)`, `category(50)`, `difficulty(30)` nullable, `prefill_title`, `prefill_description(text)`, `prefill_vision(text nullable)`, `is_published` default true, `sort_order` uint default 0, index `(is_published, category, sort_order)`. **NO `illustration_path` / cover column** — that is #236, unmerged. Confirmed.
- `App\Models\ProjectIdea`: casts `category` => `ProjectIdeaCategory`, `difficulty` => `ProjectIdeaDifficulty` (nullable), `is_published` => bool, `sort_order` => int. `techs()` BelongsToMany via `project_idea_tech`. `scopePublished` = `where('is_published', true)`.
- `ProjectIdeaCategory` enum (declaration order = render order): `herramientas-dev, clones, alternativas-oss, bots-automatizacion, aprendizaje` (5). `::values()` helper.
- `ProjectIdeaDifficulty` enum: `principiante, intermedio, avanzado`.
- `ProjectController@create` (L79-89): inline `ProjectIdea::published()->with('techs:id')->orderBy('sort_order')->get()` -> `ApiResourceTransformer::projectIdeas($ideas)` -> Inertia prop `projectIdeas`. `techs` reaches the page via global shared prop.
- `ApiResourceTransformer::projectIdeas(Collection): array` (L446-469): re-sorts by `sprintf('%02d-%06d', categoryEnumIndex, sort_order)`, emits `{ slug, title, summary, category, difficulty, prefillTitle, prefillDescription, prefillVision('' if null), techIds: int[] }`. Ordering is enum-order-then-`sort_order` regardless of the query's `orderBy`.
- `resources/js/lib/project-idea-catalog.ts`: `PROJECT_IDEA_CATEGORY_ORDER`, `PROJECT_IDEA_CATEGORY_LABELS` (Spanish), `groupIdeasByCategory()`. **NO `_GRADIENTS` / `_ICONS` maps on `development`** (those are likely #236). `GroupedProjectIdeas` type.
- `resources/js/components/projects/project-idea-inspiration.tsx`: `Collapsible` (shadcn base), `defaultOpen={false}`, returns `null` when no groups. Renders `ProjectIdeaCategoryGroup` per category.
- `project-idea-category-group.tsx`: `<section>` + grid of `<li>` -> `ProjectIdeaCard`.
- `project-idea-card.tsx`: full `Card` composition, `difficulty` `Badge`, tech-name `Badge`s, footer `Button` "Usar esta idea" -> `onSelect(idea)`. Interaction = fire-and-prefill, NOT selectable.
- `ProjectIdea` TS type (`types/index.ts` L60-70): `{ slug, title, summary, category, difficulty, prefillTitle, prefillDescription, prefillVision, techIds: number[] }`. `ProjectIdeaCategory` / `ProjectIdeaDifficulty` string unions.
- `create.tsx`: `applyIdea` sets title/description/vision/techs; on-mount effect reads `?idea=` and prefills only empty fields (#233). Uses global `route('projects.index')`.
- `ProjectIdeaSeeder`: 15 ideas, 3 per category, `sort_order` 1..3 per category. `ProjectIdeaFactory` exists.

### hasCompletedOnboarding / gates

- `User::hasCompletedOnboarding()` = `onboarding_completed_at !== null`. Set by `OnboardingService::complete()`.
- NO `EnsureOnboarded` / `onboarding` middleware anywhere. `RegisteredUserController` just redirects to `onboarding.index` after registration if incomplete. `/projects/create` is behind `auth` only — **no onboarding gate, no redirect-loop risk** for a post-completion redirect there.
- `route('projects.create')` via Ziggy accepts `['idea' => $slug]` as a query param cleanly (already used with `?idea=` deep-link in #233).

### Service conventions

Plain classes in `app/Services`, container-autowired (no bindings in `AppServiceProvider`). Constructor promotion used when a service needs deps (e.g. `ProjectInvitationService`, `ProjectController`). Stateless methods, model args.

### Tests

- `tests/Feature/OnboardingTest.php` (18 tests, `RefreshDatabase`) — asserts step-4 (no slug) `assertRedirect('/dashboard')`, skip -> `/dashboard`, `totalSteps === 5`, recommendations JSON count.
- `tests/Feature/ProjectIdeaInspirationTest.php` — asserts the `/projects/create` `projectIdeas` prop: only published, count, enum-order-then-`sort_order`, `techIds`, camelCase prefill keys, blank vision. This is the suite the refactor must keep green (no `ProjectControllerTest` touches `projectIdeas`).
- No `OnboardingControllerTest` / `OnboardingServiceTest` file exists (logic lives in `OnboardingTest`).

## Affected Areas

- `app/Services/ProjectIdeaService.php` — NEW. `publishedForDisplay()` (moves the inline `create()` query) + `featuredForOnboarding()`.
- `app/Http/Controllers/ProjectController.php` — `create()` consumes `ProjectIdeaService::publishedForDisplay()` (method-inject). Prop output unchanged.
- `app/Http/Controllers/OnboardingController.php` — `index()` adds `featuredIdeas` prop; `saveStep4()` branches redirect on `idea_slug`.
- `app/Http/Requests/Onboarding/SaveStep4Request.php` — add `idea_slug` rule + message/attribute.
- `resources/js/pages/onboarding/index.tsx` — step 5: `featuredIdeas` prop, `selectedIdeaSlug` single-select state, new teaser section, "ver todas las ideas" link, `idea_slug` in the step-4 POST body.
- `resources/js/components/onboarding/` — NEW presentational teaser component (avoids growing the 800-line page).
- `resources/js/types/index.ts` + `types/onboarding.ts` + `hooks/use-onboarding-validation.ts` — `featuredIdeas` / `idea_slug` types + zod.
- `resources/js/pages/onboarding/index.test.tsx` — mock props need `featuredIdeas` (+ `techs` if the teaser shows tech badges).
- NEW `tests/Unit/Services/ProjectIdeaServiceTest.php`; extend `tests/Feature/OnboardingTest.php`. `ProjectIdeaInspirationTest` must stay green unchanged.

## Approaches — `featuredForOnboarding()` implementation

1. **PHP group+pick over the reused published query (recommended)** — `publishedForDisplay()->groupBy(category->value)->map(sortBy([sort_order asc, id asc])->first())->sortBy(enumIndex)->values()`, then feed through `ApiResourceTransformer::projectIdeas()` (already enum-orders).
   - Pros: one query (<= 15 rows), zero new SQL, DB-portable (SQLite tests + MySQL), reuses the transformer so `featuredIdeas` payload shape == create-page `projectIdeas`, trivially empty-safe.
   - Cons: fetches all published then discards ~10 in PHP (negligible at this scale).
   - Effort: Low.
2. **Correlated subquery / window function** — `WHERE (category, sort_order) IN (SELECT category, MIN(sort_order) ...)`.
   - Pros: only ~5 rows leave the DB.
   - Cons: MIN tie-break needs extra id disambiguation; window functions add SQLite/MySQL portability friction; more code for no real gain at 15 rows.
   - Effort: Medium.
3. **New `is_featured` column** — explicitly rejected by the locked decisions. Not considered.

## Recommendation

Approach 1. Add `final class ProjectIdeaService` with:

- `publishedForDisplay(): Collection` = the exact current inline query (`published()->with('techs:id')->orderBy('sort_order')->get()`).
- `featuredForOnboarding(): Collection` = group by category, lowest `sort_order` (id asc tie-break), enum order.

Both controllers transform via `ApiResourceTransformer::projectIdeas()`. The `/projects/create` prop is byte-identical -> `ProjectIdeaInspirationTest` stays green with no edits.

Redirect handoff: keep `private complete()` param-less (dashboard) for `skip()`. In `saveStep4()`: send join requests, `OnboardingService::complete(user)`, then return `redirect()->route('projects.create', ['idea' => $slug])` when `idea_slug` is present, otherwise `redirect()->route('dashboard')`. Join-requests and idea-pick coexist. Existing `OnboardingTest` step-4 assertions (no slug) remain `/dashboard` -> green.

Frontend: extract `OnboardingIdeaTeaser` (presentational) under `resources/js/components/onboarding/`. Single-select via shadcn `RadioGroup` (rich cards) or `ToggleGroup` (5 options fits the 2-7 rule) — defer to sdd-design. "Ver todas las ideas" as a plain `<a href="/projects/create">` (avoid Ziggy `route()` in the component so the vitest env needs no `route` global). The section renders nothing when `featuredIdeas` is empty (mirror `ProjectIdeaInspiration`'s null return). Add `idea_slug: selectedIdeaSlug ?? null` to the step-4 POST body.

## Risks

- **`complete()` is shared with `skip()`** — do NOT move redirect logic into `complete()`; branch inside `saveStep4()` only. Otherwise `skip()` would wrongly gain idea handoff.
- **`exists:project_ideas,slug` does not check `is_published`** — an existing-but-unpublished slug passes validation; `/projects/create` then silently ignores it (#233 behavior). Optional tighten: `Rule::exists('project_ideas','slug')->where('is_published', true)`.
- **Frontend test mock** — `onboarding/index.test.tsx` `usePage` props lack `featuredIdeas` (+ `techs`). Destructure with default `featuredIdeas = []` and update the mock; step-5 code must be null-safe. Existing step 1-2 tests are unaffected because step 5 is gated on `currentStep === 5`.
- **`complete()` redirect target vs `OnboardingTest`** — mitigated: existing step-4 tests post no `idea_slug` and keep `/dashboard`. New tests cover the slug path.
- **Payload on every `index` render** — `onboarding.index` re-renders after each step (server redirect). `featuredIdeas` re-serializes ~5 ideas including prefill text (~3-5 KB). Acceptable.
- **`index.tsx` is already ~805 lines** — adding single-select state + section inline worsens it. Use the extracted teaser component.
- **`ProjectIdeaCard` interaction mismatch** — its footer button means "prefill and go"; onboarding needs a selectable/radio affordance. Build a compact card; do not reuse `ProjectIdeaCard` as-is.
- **`route()` in tests** — the onboarding page/tests never use Ziggy today; keep it that way (plain path string) to avoid a `route is not defined` failure in vitest.
- **Empty catalog / fresh DB** — if the seeder never ran, `featuredIdeas === []` and the whole section (including the "ver todas" link) must hide.
- **`ProjectController` constructor** — already has 3 promoted services; prefer method-injecting `ProjectIdeaService` into `create()` to keep the change local.
- **Review budget** — estimated ~500-600 changed lines (service + tests dominate). Within the 800-line single-PR budget; no chaining needed.

## Ready for Proposal

Yes. All locked decisions fit the `development` codebase. Only minor frictions (shared `complete()`, `exists` not checking published, test-mock props, avoid Ziggy in the component) — all resolvable without re-litigating decisions.
