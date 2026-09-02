# Delta for project-idea-inspiration

## MODIFIED Requirements

### Requirement: Idea catalog data and exposure

Each `project_ideas` row MUST have `slug`, `title`, `summary`, `category` (one of the five `ProjectIdeaCategory` values), `is_published`, and `sort_order`; `difficulty` (a `ProjectIdeaDifficulty` value) MAY be null; `illustration_path` (string) MAY be null and its factory default MUST be `null`; prefill fields (`title`, `description`, `vision` suggestions) MAY be provided. The system MUST expose only ideas where `is_published = true`. Exposed ideas MUST be ordered by `ProjectIdeaCategory` enum declaration order, then by `sort_order` ascending. `ApiResourceTransformer::projectIdeas()` MUST emit `illustrationUrl` for every exposed idea: a resolved URL string when `illustration_path` is set, otherwise `null`.
(Previously: no `illustration_path` column and no `illustrationUrl` field; idea shape ended at prefill and tech fields.)

#### Scenario: only published ideas are exposed (#181)

- GIVEN published and unpublished `project_ideas` rows exist
- WHEN an authenticated user opens `/projects/create`
- THEN the creation page MUST receive only the published ideas
- AND unpublished ideas MUST NOT appear in the payload

#### Scenario: ordering is category then sort_order

- GIVEN published ideas across multiple categories with varied `sort_order`
- WHEN the ideas payload is built
- THEN ideas MUST be ordered by category enum order first
- AND within a category by ascending `sort_order`

#### Scenario: payload exposes illustrationUrl

- GIVEN one published idea with `illustration_path` set and another with it null
- WHEN the `projectIdeas` payload for `GET /projects/create` is built
- THEN the first idea MUST carry a non-null `illustrationUrl` URL string
- AND the second idea MUST carry `illustrationUrl` equal to `null`

### Requirement: Inspiration block rendering on creation page

`/projects/create` MUST remain authenticated-only. The page MUST render a collapsible inspiration block directly above the project form, **collapsed by default**. Ideas MUST be grouped by category with empty groups omitted. Each idea card MUST show its title, summary, suggested techs, and a difficulty badge only when `difficulty` is present.

Each idea card MUST render a fixed-aspect (`aspect-video`) media block positioned ABOVE the card title. WHEN `illustrationUrl` is present the media block MUST display that image with meaningful, non-empty `alt` text. WHEN `illustrationUrl` is `null` the media block MUST display a per-category gradient plus a per-category icon, and the icon MUST be `aria-hidden`. The title, summary, and badges MUST NOT render on top of the media block. Theming MUST work in light and dark using semantic tokens only, with no `dark:` color overrides and no `tailwind.config.js`.

Within a category grid every card MUST have uniform height regardless of summary length, difficulty-badge presence, tech count, or illustration presence: `summary` MUST be clamped to two lines with the full text available via the `title` attribute, the footer CTA MUST bottom-align, and the tech badge row MUST clamp to a single line with a `+N` overflow indicator.
(Previously: cards were text-only with no media block, and summary/tech rows were unclamped so one long idea inflated its whole grid row.)

#### Scenario: block is collapsed by default (#181)

- GIVEN an authenticated user opens `/projects/create`
- WHEN the page renders
- THEN the inspiration block MUST be present and collapsed
- AND the project form MUST be submittable without expanding it

#### Scenario: empty category groups omitted (#181)

- GIVEN published ideas exist for only three of the five categories
- WHEN the block is expanded
- THEN only those three category groups MUST render

#### Scenario: unauthenticated visitor

- GIVEN a guest requests `/projects/create`
- WHEN the request is handled
- THEN the system MUST redirect to login and render no ideas

#### Scenario: card shows illustration when present

- GIVEN a published idea with `illustrationUrl` set
- WHEN its card renders
- THEN a fixed-aspect media block MUST appear above the title showing the image with non-empty `alt`
- AND no title, summary, or badge text MUST overlay the media block

#### Scenario: card shows category fallback when illustration absent

- GIVEN a published idea with `illustrationUrl` equal to `null`
- WHEN its card renders
- THEN the media block MUST show the per-category gradient and an `aria-hidden` per-category icon

#### Scenario: cards keep uniform height

- GIVEN a category grid containing a long-summary idea, an idea with no difficulty, and an idea with many techs
- WHEN the group renders
- THEN all cards in a row MUST have equal height
- AND each `summary` MUST be clamped to two lines with a `title` attribute holding the full text
- AND the tech row MUST occupy at most one line, showing a `+N` indicator when techs overflow

### Requirement: Prefill from card click

Selecting an idea card MUST overwrite the form `title`, `description`, `vision`, and `techs` fields with that idea's values, regardless of prior edits (explicit user action), and MUST set the form `idea_slug` field to that idea's slug. It MUST NOT modify `repository_url`, `demo_url`, or `images`. It MUST update the URL to `?idea=<slug>` without a server round-trip.
(Previously: prefill set only the four fields; there was no `idea_slug` form field.)

#### Scenario: card click prefills four fields and idea_slug (#181)

- GIVEN the inspiration block is expanded and the user has edited `title`
- WHEN the user selects an idea card
- THEN `title`, `description`, `vision`, and `techs` MUST be set to the idea's values
- AND `idea_slug` MUST be set to the idea's slug
- AND `repository_url`, `demo_url`, and `images` MUST be unchanged
- AND the URL MUST become `?idea=<slug>` with no navigation request

### Requirement: Deep-link prefill is pristine-only and single-shot

Visiting `/projects/create?idea=<slug>` MUST prefill the form once on mount, writing only into fields the user has not edited (pristine-only), and MUST set `idea_slug` to the resolved slug. An unknown or unpublished slug MUST be ignored silently: the form stays empty, `idea_slug` stays empty, and no error is shown.
(Previously: deep-link prefill did not set an `idea_slug` field.)

#### Scenario: deep link prefills pristine fields once

- GIVEN `/projects/create?idea=<slug>` for a published idea
- WHEN the page mounts
- THEN pristine `title`, `description`, `vision`, `techs` MUST be filled from the idea
- AND `idea_slug` MUST be set to the slug
- AND the prefill MUST NOT re-run on later re-renders

#### Scenario: deep link does not clobber edits

- GIVEN a deep link and the user has already edited `description` before mount completes re-evaluation
- WHEN prefill runs
- THEN the edited `description` MUST be left as the user left it
- AND only still-pristine fields MUST be filled

#### Scenario: unknown or unpublished slug ignored

- GIVEN `/projects/create?idea=<slug>` where the slug is unknown or unpublished
- WHEN the page mounts
- THEN the form MUST stay empty
- AND no error message MUST be shown

### Requirement: Project creation non-regression

Project creation MUST behave unchanged when the inspiration block is never opened and no `idea_slug` is submitted. `StoreProjectRequest` MUST additionally accept `idea_slug` as `nullable|string|exists:project_ideas,slug`, where an empty-string submission is accepted and treated as absent (normalized to `null` before the `exists` check); no other `StoreProjectRequest` rule changes. `ProjectService::create` behavior MUST be unchanged for any request without `idea_slug` and for any request that uploads at least one image, including the post-create redirect. No `cover_path` column is added. A prefilled `title` colliding with an existing project MUST surface the existing `title.unique` validation message with no new handling.
(Previously: `StoreProjectRequest` rules and `ProjectService::create` were frozen with no permitted changes.)

#### Scenario: creation unchanged without inspiration (#181)

- GIVEN an authenticated user who never expands the inspiration block
- WHEN they complete and submit the project form with valid data
- THEN the project MUST be created and the user redirected exactly as before

#### Scenario: prefilled title collision

- GIVEN a user prefilled `title` from an idea and a project with that title already exists
- WHEN they submit without editing the title
- THEN validation MUST fail with the existing `title.unique` message

#### Scenario: idea_slug accepts empty string

- GIVEN a submission where `idea_slug` is an empty string
- WHEN validation runs
- THEN validation MUST pass and `idea_slug` MUST be treated as absent

#### Scenario: idea_slug rejects unknown slug

- GIVEN a submission where `idea_slug` is a non-empty value absent from `project_ideas`
- WHEN validation runs
- THEN validation MUST fail with an `exists` error for `idea_slug`

### Requirement: Idempotent seeding covering all categories

`ProjectIdeaSeeder` MUST upsert ideas by `slug` so repeated runs produce no duplicates, MUST run after `TechSeeder`, and MUST seed at least one published idea in each of the five `ProjectIdeaCategory` values so no rendered group is empty.

For each seeded idea, WHEN a source file `database/seeders/assets/project-ideas/<slug>.webp` is present, the seeder MUST copy it to the deterministic media-disk path `project-ideas/<slug>.webp` and set `illustration_path` to that path. WHEN no source file is present, `illustration_path` MUST remain `null`. Repeated seeder runs MUST keep the `project_ideas` row count and the `project_idea_tech` pivot count stable, AND MUST refresh a `null` `illustration_path` to the deterministic path if a source file was added since the previous run.
(Previously: the seeder had no illustration asset handling and no asset directory existed.)

#### Scenario: seeder is idempotent (#181)

- GIVEN the database has already been seeded
- WHEN `php artisan db:seed` runs again
- THEN no duplicate `project_ideas` rows MUST be created
- AND tech slugs absent from `techs` MUST be skipped silently
- AND the `project_idea_tech` pivot count MUST be unchanged

#### Scenario: every category is covered

- GIVEN a freshly seeded database
- WHEN published ideas are grouped by category
- THEN each of the five categories MUST contain at least one published idea

#### Scenario: seeder copies present illustration assets

- GIVEN a faked media disk and a source file present for one seeded slug
- WHEN `ProjectIdeaSeeder` runs
- THEN `project-ideas/<slug>.webp` MUST exist on the media disk
- AND that idea's `illustration_path` MUST equal `project-ideas/<slug>.webp`
- AND ideas with no source file MUST keep `illustration_path` equal to `null`

#### Scenario: re-seed stays idempotent yet picks up a newly added asset

- GIVEN a seeded database where one idea's `illustration_path` is `null` because its source file was absent
- WHEN that slug's source file is added and the seeder runs again
- THEN the `project_ideas` row count and pivot count MUST be unchanged
- AND that idea's `illustration_path` MUST now equal `project-ideas/<slug>.webp`

## ADDED Requirements

### Requirement: Idea-derived default project cover

WHEN a project is created with a valid `idea_slug` that resolves to an idea whose `illustration_path` is non-null AND the creator uploaded no images, THEN `ProjectService::create` MUST copy that illustration from the media disk into the project's own media storage at a path under `projects/` that satisfies `isSafeImagePath`, and MUST set that copy as the new project's `images[0]`. WHEN the creator uploaded one or more images, the idea illustration MUST be ignored and the uploaded images MUST be used unchanged. WHEN `idea_slug` is absent or resolves to an idea with a `null` `illustration_path`, the project's `images` MUST be exactly the creator's uploads (empty when nothing was uploaded). The raw `project-ideas/...` source path MUST NOT be persisted as a project image.

#### Scenario: idea cover used when nothing uploaded

- GIVEN a creator submits with `idea_slug` for an idea that has an illustration and uploads no images
- WHEN the project is created
- THEN `images[0]` MUST be a copy of the illustration stored under `projects/`
- AND that stored path MUST satisfy `isSafeImagePath`

#### Scenario: uploaded image wins over idea cover

- GIVEN a creator submits `idea_slug` for an idea with an illustration and uploads one image
- WHEN the project is created
- THEN `images` MUST contain only the uploaded image
- AND the idea illustration MUST NOT be copied

#### Scenario: idea without illustration yields creator uploads only

- GIVEN a creator submits `idea_slug` for an idea whose `illustration_path` is `null` and uploads nothing
- WHEN the project is created
- THEN `images` MUST be empty

#### Scenario: no idea_slug yields creator uploads only

- GIVEN a creator submits with no `idea_slug` and uploads nothing
- WHEN the project is created
- THEN `images` MUST be empty and the create path MUST match pre-change behavior

### Requirement: Inspiration prefill and catalog non-regression

The `project-idea-inspiration` prefill of `title`, `description`, `vision`, and `techs`; the `?idea=` deep link; published-only exposure with category-then-`sort_order` ordering; and seed-time tech-slug resolution with silent skip of unknown slugs MUST all remain behaviorally unchanged by this change. `illustrationUrl` and `idea_slug` MUST be additive and optional, so a payload consumer that ignores them keeps working and a partial frontend revert never breaks the payload contract.

#### Scenario: existing inspiration behavior preserved

- GIVEN the illustration and cover features are shipped
- WHEN a user prefills from a card or a deep link without touching images
- THEN `title`, `description`, `vision`, and `techs` prefill MUST behave exactly as before
- AND published-only exposure, ordering, and tech-slug resolution MUST be unchanged

### Requirement: Regression test alignment

Existing automated tests that assert the pre-change contract MUST be updated within this change to reflect the new scenarios, not merely supplemented with additional tests.

#### Scenario: frontend prefill key-set test updated

- GIVEN `resources/js/pages/projects/create.test.tsx` asserts the exact prefill key set
- WHEN this change lands
- THEN that assertion MUST include `idea_slug` alongside `title`, `description`, `vision`, and `techs`

#### Scenario: inspiration payload and factory tests updated

- GIVEN `tests/Feature/ProjectIdeaInspirationTest.php` and `resources/js/components/projects/project-idea-inspiration.test.tsx`
- WHEN this change lands
- THEN their idea factory and payload fixtures MUST include `illustrationUrl`
- AND `ProjectIdeaInspirationTest` MUST assert `illustrationUrl` in the payload and MUST keep the seeder idempotency assertions passing using a faked media disk

#### Scenario: service and transformer tests updated

- GIVEN `tests/Unit/Services/ProjectServiceTest.php` and `tests/Unit/Helpers/ApiResourceTransformerTest.php`
- WHEN this change lands
- THEN `ProjectServiceTest` MUST cover the four cover-fallback cases (idea cover used, upload wins, idea without illustration, no `idea_slug`)
- AND `ApiResourceTransformerTest` MUST cover `illustrationUrl` for both the set and `null` cases

#### Scenario: catalog map test updated

- GIVEN `resources/js/lib/project-idea-catalog.test.ts`
- WHEN this change lands
- THEN it MUST assert the per-category gradient map and the per-category icon map each cover every `ProjectIdeaCategory` value
