# Tasks: Project Idea Inspiration

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1,150 (slice 1 ≈ 550, slice 2 ≈ 600) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 backend → PR2 frontend |
| Delivery strategy | single-pr (forecast exceeds budget → ships as 2 chained PRs) |
| Chain strategy | stacked-to-main (adapted: bases are `development` then PR1 branch) |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

- PR1 branch `feat/project-idea-inspiration-backend` → base `development`.
- PR2 branch `feat/project-idea-inspiration-frontend` → base `feat/project-idea-inspiration-backend`.
- Threat matrix: design marks it N/A (no shell/VCS/routing/process boundary; `?idea=` is an in-memory slug lookup). No threat RED tasks.

### Suggested Work Units

| Unit | Goal | PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|----|----------------------|-----------------|-------------------|
| 1 | Backend catalog: tables, enums, model, factory, seeder, `projectIdeas` prop | PR1 | `php artisan test --filter=ProjectIdeaInspirationTest` | `php artisan migrate:fresh --seed` then GET `/projects/create` shows prop in Inertia payload | Revert controller line + `DatabaseSeeder` entry; `migrate:rollback`; delete new backend files/tests |
| 2 | Frontend inspiration block + prefill on `create.tsx` | PR2 | `npm test -- create.test.tsx` | `npm run build` + manual `/projects/create` + `?idea=<slug>` | Revert `create.tsx`; delete `project-idea-*` components, `project-idea-catalog.ts`, `ui/collapsible.tsx` |

## Doubts & Assumptions (auto-force — carry into PR bodies)

1. Prefilled `title` may collide with `Rule::unique` on `projects.title`; mitigated by copy nudging personalization only — no new validation handling.
2. `window.history.replaceState` for `?idea=` sync has no in-repo precedent (new client-only URL pattern).
3. Feature branches target `development`, not `master` (verified: PRs #227–229 merged to `development`; `development`→`master` is the release step).
4. Change ships as 2 chained PRs despite `single-pr` strategy because the design size forecast (~1,150 lines) exceeds the 800-line budget.
5. `summary` ≤ 500 chars and `prefill_description` ≤ 1000 chars so a prefilled description always passes `StoreProjectRequest` `max:1000` (from design open question).

---

# Slice 1 — Backend (PR1 → `development`, ~550 lines)

## Phase 1: Schema & Enums

- [x] 1.1 Create `database/migrations/*_create_project_ideas_table.php` with the exact columns, defaults, and `project_ideas_published_ordered_index` from design; `down()` = `dropIfExists('project_ideas')`.
- [x] 1.2 Create `database/migrations/*_create_project_idea_tech_table.php` (timestamp AFTER 1.1) mirroring `project_tech` minus `level`: `project_idea_id`/`tech_id` FKs `onDelete('cascade')`, `unique(['project_idea_id','tech_id'])`, timestamps.
- [x] 1.3 Create `app/Enums/ProjectIdeaCategory.php` — string-backed, cases `HerramientasDev`,`Clones`,`AlternativasOss`,`BotsAutomatizacion`,`Aprendizaje` (kebab values in that order), `static values()`. `ProjectStatus` shape (no `strict_types`, no `label()`).
- [x] 1.4 Create `app/Enums/ProjectIdeaDifficulty.php` — cases `Principiante`,`Intermedio`,`Avanzado`, `static values()`.

## Phase 2: Model & Factory

- [x] 2.1 Create `app/Models/ProjectIdea.php` — `$fillable` (10 fields), `$casts` (category/difficulty enums, `is_published` boolean, `sort_order` integer), `techs(): BelongsToMany` via `project_idea_tech` `->withTimestamps()`, `scopePublished(Builder)`.
- [x] 2.2 Create `database/factories/ProjectIdeaFactory.php` — unique `slug`/`title`, random enum values, nullable `difficulty`, `is_published` default true, `sort_order` int.

## Phase 3: RED — Feature tests (write failing first)

- [x] 3.1 Create `tests/Feature/ProjectIdeaInspirationTest.php`: `create` returns `projectIdeas` with published-only (2 published + 1 unpublished factory rows → `assertInertia has('projectIdeas', 2)`).
- [x] 3.2 Add test: ordering is `ProjectIdeaCategory` enum order then `sort_order` asc (shuffled insert order → assert slug sequence).
- [x] 3.3 Add test: `techIds` resolves to exactly the linked tech IDs; empty array when an idea has no `project_idea_tech` rows.
- [x] 3.4 Add test: enum casting — `category instanceof ProjectIdeaCategory`, nullable `difficulty` stays `null`.
- [x] 3.5 Add test: `ProjectIdeaSeeder` run twice → `project_ideas` count stable, pivot rows unchanged, unknown tech slug skipped silently; each of the 5 categories has ≥1 published idea.

## Phase 4: GREEN — Implementation

- [x] 4.1 Add `ApiResourceTransformer::projectIdeas(Collection $ideas): array` — camelCase payload (`prefillTitle`/`prefillDescription`/`prefillVision`, `prefillVision` `''` when null, `techIds: number[]`); sort by `sprintf('%02d-%06d', $categoryIndex, $sortOrder)` with `array_flip(ProjectIdeaCategory::values())`.
- [x] 4.2 Modify `ProjectController@create` — add per-route `projectIdeas` prop: `ProjectIdea::published()->with('techs:id')->orderBy('sort_order')->get()` → `ApiResourceTransformer::projectIdeas(...)`. (#178 touched `store()` only — trivial different-method merge.)
- [x] 4.3 Create `database/seeders/ProjectIdeaSeeder.php` — 15 ideas from the design seed table (Spanish copy per design copy rules), `upsert($rows, ['slug'], [...])`, resolve tech IDs in one query, `->techs()->syncWithoutDetaching($techIds->only($idea['techs'])->values()->all())`.
- [x] 4.4 Modify `database/seeders/DatabaseSeeder.php` — register `ProjectIdeaSeeder::class` after `TechSeeder`, before `UserSeeder`.
- [x] 4.5 Run `php artisan test` (all green) and `vendor/bin/pint`; confirm existing `ProjectTest` create/store tests stay green untouched. NOTE: 534 passed, 1 pre-existing unrelated failure (`MilestonesReadStateTest`, verified failing on `development` before this change). All `ProjectTest` + `ProjectIdeaInspirationTest` green.

## Phase 5: Slice 1 acceptance

- [x] 5.1 `php artisan test` green (except 1 pre-existing unrelated failure); `projectIdeas` present in the Inertia payload but unused by the UI. Open PR1.

---

# Slice 2 — Frontend (PR2 → PR1 branch, ~600 lines)

## Phase 6: Dependency, types, catalog

- [x] 6.1 Run `npx shadcn@latest add collapsible` → creates `resources/js/components/ui/collapsible.tsx`.
- [x] 6.2 Modify `resources/js/types/index.ts` — add `ProjectIdea` interface (per design payload) + `ProjectIdeaCategory` and `ProjectIdeaDifficulty` string unions.
- [x] 6.3 Create `resources/js/lib/project-idea-catalog.ts` — category order array + Spanish `CATEGORY_LABELS` + `groupIdeasByCategory()`, mirroring `lib/tech-catalog.ts`.

## Phase 7: Presentational components

- [x] 7.1 Create `resources/js/components/projects/project-idea-card.tsx` — `Card role="group"` with title, summary, tech names, difficulty `Badge` only when `difficulty` present; single CTA `Button` in `CardFooter` `aria-label="Usar la idea: {title}"`. Props `{ idea, techNames, onSelect }`.
- [x] 7.2 Create `resources/js/components/projects/project-idea-category-group.tsx` — category heading + card grid. Props `{ label, ideas, techNamesById, onSelect }`.
- [x] 7.3 Create `resources/js/components/projects/project-idea-inspiration.tsx` — collapsed-by-default `Collapsible` above the form; builds `Map<number,string>` `techNamesById` once; omits empty groups; returns `null` when `ideas` is empty. Props `{ ideas, techs, onSelect }`.

## Phase 8: Wire `create.tsx`

- [x] 8.1 Consume `projectIdeas` prop (default `[]`); render `<ProjectIdeaInspiration>` directly above `<ProjectForm>`; `ProjectForm` contract unchanged.
- [x] 8.2 Add card-click handler — `setData` for `title`/`description`/`vision`/`techs` from the idea (overwrite regardless of edits); `window.history.replaceState` → `?idea=<slug>` (no navigation); focus `document.getElementById('title')`; announce via an `aria-live` status region. Must NOT touch `repository_url`/`demo_url`/`images`.
- [x] 8.3 Add on-mount `?idea=<slug>` effect — `useRef(false)` single-shot; pristine-only per field (`data.title===''`, `data.description===''`, `data.vision===''`, `data.techs.length===0`); unknown/unpublished slug → return silently, no error.

## Phase 9: Frontend tests (`resources/js/pages/projects/create.test.tsx`)

- [x] 9.1 Create the file following `show.test.tsx` mocks (`@/components/seo`, `@/layouts/app-layout`, `@inertiajs/react` `useForm` stub with `data`/`setData` spy, `globalThis.route`): block renders collapsed (idea titles absent until trigger click); form submittable without expanding.
- [x] 9.2 Add test: expand reveals grouped ideas; empty category groups omitted (ideas for 2 of 5 categories → 2 headings).
- [x] 9.3 Add test: card click calls `setData` for exactly `title`/`description`/`vision`/`techs` and never `repository_url`/`demo_url`/`images`; card click overwrites a non-pristine `title`.
- [x] 9.4 Add test: `?idea=<slug>` mount prefill fills only pristine fields, runs once (no re-run on rerender); pre-edited `description` left untouched.
- [x] 9.5 Add test: unknown slug → zero `setData` calls, no error text.

## Phase 10: Slice 2 acceptance

- [x] 10.1 `npm test` green; `npm run build` green. Open PR2 against `feat/project-idea-inspiration-backend`.
