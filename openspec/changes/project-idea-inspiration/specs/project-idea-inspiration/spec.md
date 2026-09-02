# project-idea-inspiration Specification

## Purpose

Define a curated, content-driven catalog of project ideas and its one-click prefill interaction on the authenticated project creation page. The catalog never gates creation and adds no wizard or multi-step flow.

## Requirements

### Requirement: Idea catalog data and exposure

Each `project_ideas` row MUST have `slug`, `title`, `summary`, `category` (one of the five `ProjectIdeaCategory` values), `is_published`, and `sort_order`; `difficulty` (a `ProjectIdeaDifficulty` value) MAY be null; prefill fields (`title`, `description`, `vision` suggestions) MAY be provided. The system MUST expose only ideas where `is_published = true`. Exposed ideas MUST be ordered by `ProjectIdeaCategory` enum declaration order, then by `sort_order` ascending.

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

### Requirement: Suggested techs resolved to IDs

An idea MAY link 0..n existing `techs` through `project_idea_tech`. The creation-page payload for each idea MUST expose the resolved tech **IDs** of its linked techs. Seed-time linkage MUST skip slugs absent from `techs` silently; skipped slugs MUST NOT be surfaced in any payload or error.

#### Scenario: idea exposes linked tech IDs

- GIVEN a published idea linked to two existing techs
- WHEN the ideas payload is built
- THEN that idea MUST carry exactly those two tech IDs

#### Scenario: idea with no linked techs

- GIVEN a published idea with no `project_idea_tech` rows
- WHEN the ideas payload is built
- THEN that idea MUST carry an empty tech ID list

### Requirement: Inspiration block rendering on creation page

`/projects/create` MUST remain authenticated-only. The page MUST render a collapsible inspiration block directly above the project form, **collapsed by default**. Ideas MUST be grouped by category with empty groups omitted. Each idea card MUST show its title, summary, suggested techs, and a difficulty badge only when `difficulty` is present.

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

### Requirement: Prefill from card click

Selecting an idea card MUST overwrite the form `title`, `description`, `vision`, and `techs` fields with that idea's values, regardless of prior edits (explicit user action). It MUST NOT modify `repository_url`, `demo_url`, or `images`. It MUST update the URL to `?idea=<slug>` without a server round-trip.

#### Scenario: card click prefills four fields (#181)

- GIVEN the inspiration block is expanded and the user has edited `title`
- WHEN the user selects an idea card
- THEN `title`, `description`, `vision`, and `techs` MUST be set to the idea's values
- AND `repository_url`, `demo_url`, and `images` MUST be unchanged
- AND the URL MUST become `?idea=<slug>` with no navigation request

### Requirement: Deep-link prefill is pristine-only and single-shot

Visiting `/projects/create?idea=<slug>` MUST prefill the form once on mount, writing only into fields the user has not edited (pristine-only). An unknown or unpublished slug MUST be ignored silently: the form stays empty and no error is shown.

#### Scenario: deep link prefills pristine fields once

- GIVEN `/projects/create?idea=<slug>` for a published idea
- WHEN the page mounts
- THEN pristine `title`, `description`, `vision`, `techs` MUST be filled from the idea
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

Project creation MUST behave unchanged when the inspiration block is never opened. `StoreProjectRequest` rules, `ProjectService::create`, and the post-create redirect MUST NOT change. A prefilled `title` colliding with an existing project MUST surface the existing `title.unique` validation message with no new handling.

#### Scenario: creation unchanged without inspiration (#181)

- GIVEN an authenticated user who never expands the inspiration block
- WHEN they complete and submit the project form with valid data
- THEN the project MUST be created and the user redirected exactly as before

#### Scenario: prefilled title collision

- GIVEN a user prefilled `title` from an idea and a project with that title already exists
- WHEN they submit without editing the title
- THEN validation MUST fail with the existing `title.unique` message

### Requirement: Idempotent seeding covering all categories

`ProjectIdeaSeeder` MUST upsert ideas by `slug` so repeated runs produce no duplicates, MUST run after `TechSeeder`, and MUST seed at least one published idea in each of the five `ProjectIdeaCategory` values so no rendered group is empty.

#### Scenario: seeder is idempotent (#181)

- GIVEN the database has already been seeded
- WHEN `php artisan db:seed` runs again
- THEN no duplicate `project_ideas` rows MUST be created
- AND tech slugs absent from `techs` MUST be skipped silently

#### Scenario: every category is covered

- GIVEN a freshly seeded database
- WHEN published ideas are grouped by category
- THEN each of the five categories MUST contain at least one published idea
