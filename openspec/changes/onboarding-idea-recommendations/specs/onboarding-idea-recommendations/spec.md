# Onboarding Idea Recommendations Specification

## Purpose

Surface a compact single-select teaser of the published project-idea catalog on onboarding step 5 so a builder finishes onboarding already inside `/projects/create` with an idea pre-selected. Follow-up to `project-idea-inspiration` (#181). Extracts the catalog query into a reusable service without changing `/projects/create` behavior.

## ADDED Requirements

### Requirement: Catalog query service preserves the create-page payload

`ProjectIdeaService::publishedForDisplay()` MUST return the same published ideas `/projects/create` renders today, with identical ordering and payload, serialized through `ApiResourceTransformer::projectIdeas()`: published ideas only, ordered by `ProjectIdeaCategory` enum order then `sort_order`, camelCase prefill keys, blank string for a null vision, `techIds` as an integer array. After the refactor the `projectIdeas` prop from `ProjectController@create` MUST be byte-identical to its pre-refactor output.

#### Scenario: create page prop unchanged after extraction (#181)

- GIVEN published and unpublished project ideas exist
- WHEN an authenticated user opens `/projects/create`
- THEN the `projectIdeas` prop MUST contain only published ideas in enum-order-then-`sort_order`
- AND the prop MUST match the pre-refactor output in shape, order, and values

### Requirement: Featured selection picks one published idea per category

`ProjectIdeaService::featuredForOnboarding()` MUST return at most one published idea per `ProjectIdeaCategory`: the published idea with the lowest `sort_order`, tie-broken by lowest `id`. Results MUST be ordered by `ProjectIdeaCategory` enum order, MUST exclude unpublished ideas, MUST be empty when no published ideas exist, and MUST use the same payload shape as `publishedForDisplay()`.

#### Scenario: one idea per category in enum order

- GIVEN each category has multiple published ideas with distinct `sort_order`
- WHEN `featuredForOnboarding()` is called
- THEN it MUST return exactly one idea per category, each the lowest `sort_order`
- AND the ideas MUST be in `ProjectIdeaCategory` enum order

#### Scenario: tie-break and unpublished exclusion

- GIVEN a category's two published ideas share the lowest `sort_order` and an unpublished idea has a lower `sort_order`
- WHEN `featuredForOnboarding()` is called
- THEN the returned idea for that category MUST be the published tie member with the lowest `id`
- AND no unpublished idea MUST appear in the result

#### Scenario: empty catalog

- GIVEN no published project ideas exist
- WHEN `featuredForOnboarding()` is called
- THEN it MUST return an empty collection

### Requirement: Onboarding index exposes featured ideas

`GET /onboarding` for an authenticated user who has not completed onboarding MUST include a `featuredIdeas` Inertia prop carrying `featuredForOnboarding()`'s output. A user who already completed onboarding MUST still redirect to `/dashboard`. `totalSteps` MUST remain 5 with no new step. `OnboardingService::getRecommendations` and `GET /onboarding/recommendations` MUST be unchanged.

#### Scenario: featured ideas present on the onboarding page (#181)

- GIVEN an authenticated user has not completed onboarding and published ideas exist
- WHEN they open `GET /onboarding`
- THEN the response MUST include a `featuredIdeas` prop equal to `featuredForOnboarding()` output
- AND `totalSteps` MUST equal 5

#### Scenario: completed user still redirects

- GIVEN an authenticated user has completed onboarding
- WHEN they open `GET /onboarding`
- THEN they MUST be redirected to `/dashboard`

### Requirement: Step 5 renders an optional single-select idea teaser

Onboarding step 5 MUST render the idea teaser below the existing join-recommendations when `featuredIdeas` is non-empty, and MUST render nothing for the teaser (including its "ver todas las ideas" link) when `featuredIdeas` is empty. Each idea entry MUST show its title, summary, a difficulty badge when difficulty is present, and its tech names. Idea selection MUST be single-select (at most one) and MUST be optional. A "ver todas las ideas" link MUST point to `/projects/create`.

#### Scenario: teaser shown with ideas (#181)

- GIVEN `featuredIdeas` is non-empty
- WHEN step 5 is rendered
- THEN the teaser MUST appear below the join-recommendations
- AND each entry MUST show title, summary, difficulty badge when present, and tech names
- AND a "ver todas las ideas" link MUST point to `/projects/create`

#### Scenario: teaser hidden when empty

- GIVEN `featuredIdeas` is empty
- WHEN step 5 is rendered
- THEN no teaser content and no "ver todas las ideas" link MUST be rendered

#### Scenario: single-select and optional

- GIVEN the teaser is shown
- WHEN a user selects an idea and then selects a different one
- THEN at most one idea MUST be selected
- AND the user MUST be able to advance with no idea selected

### Requirement: Completion hands off to the create page when an idea is chosen

`POST /onboarding/step-4` MUST accept an optional `idea_slug`. WHEN `idea_slug` is the slug of a published idea, THEN onboarding MUST complete (join requests still sent, `onboarding_completed_at` set) AND the response MUST redirect to `/projects/create?idea=<slug>`. WHEN `idea_slug` is absent or empty, THEN the response MUST redirect to `/dashboard` with unchanged completion behavior. WHEN `idea_slug` is present but not a published idea slug, THEN validation MUST fail — the response redirects back with a Spanish error on `idea_slug` (Inertia/browser form POSTs surface validation as a redirect-back session error bag, not a raw HTTP 422) — AND onboarding MUST NOT complete. `POST /onboarding/skip` MUST always redirect to `/dashboard`.

#### Scenario: valid idea slug redirects to create (#181)

- GIVEN an authenticated user on step 5 selects a published idea
- WHEN they submit `POST /onboarding/step-4` with that `idea_slug`
- THEN `onboarding_completed_at` MUST be set
- AND the response MUST redirect to `/projects/create?idea=<slug>`

#### Scenario: no slug redirects to dashboard

- GIVEN an authenticated user submits `POST /onboarding/step-4` with no `idea_slug`
- WHEN the request is processed
- THEN onboarding MUST complete AND the response MUST redirect to `/dashboard`

#### Scenario: unpublished or unknown slug is rejected

- GIVEN an `idea_slug` that is unpublished or does not exist
- WHEN `POST /onboarding/step-4` is submitted with it
- THEN the response MUST redirect back with a Spanish validation error on `idea_slug`
- AND `onboarding_completed_at` MUST remain null

#### Scenario: skip always goes to dashboard

- GIVEN an authenticated user
- WHEN they submit `POST /onboarding/skip`
- THEN the response MUST redirect to `/dashboard`

### Requirement: Join selection and idea selection coexist

A step-5 submission carrying both `join_requests` and a valid `idea_slug` MUST honor both: all join requests MUST be sent and the redirect MUST go to `/projects/create?idea=<slug>`. Choosing an idea MUST NOT cancel join requests, and choosing join projects MUST NOT block the idea handoff.

#### Scenario: both selections honored (#181)

- GIVEN a step-5 submission carries both `join_requests` and a valid `idea_slug`
- WHEN it is processed
- THEN all join requests MUST be sent
- AND the response MUST redirect to `/projects/create?idea=<slug>`

### Requirement: Existing onboarding behavior is preserved

The change MUST NOT break existing assertions: `tests/Feature/OnboardingTest.php` step-4-without-slug and skip redirects to `/dashboard` MUST still hold; `tests/Feature/ProjectIdeaInspirationTest.php` `/projects/create` prop assertions MUST still pass with no edits; the onboarding recommendations JSON endpoint MUST be unchanged.

#### Scenario: inspiration test still green unchanged

- GIVEN the catalog query has been extracted into `ProjectIdeaService`
- WHEN `tests/Feature/ProjectIdeaInspirationTest.php` runs without edits
- THEN all its `projectIdeas` prop assertions MUST pass

## Test Coverage

- `tests/Unit/Services/ProjectIdeaServiceTest.php` (NEW): `publishedForDisplay()` parity — published-only, enum-order-then-`sort_order`, payload shape; `featuredForOnboarding()` — one-per-category, lowest `sort_order`, `id` tie-break, enum order, unpublished exclusion, empty-catalog `[]`.
- `tests/Feature/OnboardingTest.php` (MODIFIED): index response includes `featuredIdeas`; step-4 with valid slug redirects to `/projects/create?idea=<slug>` with `onboarding_completed_at` set and join requests sent; step-4 with unpublished/unknown slug redirects back with an `idea_slug` session error and does not complete; step-4 with empty slug redirects to `/dashboard`; existing skip → `/dashboard` retained.
- `resources/js/pages/onboarding/index.test.tsx` (MODIFIED): mock props gain `featuredIdeas` (and `techs` if read); add a step-5 teaser render/select test when the existing file structure allows.
