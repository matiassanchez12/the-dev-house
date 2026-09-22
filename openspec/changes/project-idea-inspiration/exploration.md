# Exploration: project-idea-inspiration (GitHub #181)

Goal: break the blank-page problem on `/projects/create` with a lightweight, content-driven list of project ideas that can prefill the form. V1 only, not a wizard, does not gate creation. All design decisions are LOCKED; this doc verifies fit + surfaces risks.

## Current State

### Backend — project creation flow
- Routes (`routes/web.php`): `GET /projects/create` -> `ProjectController@create` (`projects.create`); `POST /projects` -> `ProjectController@store` (`projects.store`). Both inside `auth` middleware group -> block only seen by authenticated users (locked decision 7).
- `ProjectController@create` is exactly `return Inertia::render('projects/create');` — NO props. `techs` reach the page only via shared props.
- `ProjectController@store` -> `ProjectService::create(Auth::user(), $request->validated())` then `redirect()->route('projects.collaborators', $project)` + flash success. That post-create redirect (change project-creation-contextual-invitations / #178) is a plain redirect, unaffected by this change.
- `StoreProjectRequest` rules: `title` => required,string,max:255,`Rule::unique(Project::class,'title')`; `description` => required,string,max:1000; `vision` => nullable,string; `techs` => required,array,min:1; `techs.*` => `exists:techs,id`; `repository_url`/`demo_url` => nullable,url; `images` => nullable,array,max:5; `images.*` => image,max:2048. Spanish messages incl. `title.unique` => "Ya existe un proyecto con este título."
- `ProjectService::create()`: unique slug from title, upload images, `$user->createdProjects()->create([...])`, then `$project->techs()->attach($data['techs'])`. No hooks/events.

### Backend — techs
- `Tech` model: table `techs`, fillable category,icon,name,slug. `techs.slug` unique+indexed. `category` added by later migration.
- Project<->Tech pivot table = **`project_tech`** (singular): id + timestamps + nullable `level` + `unique(project_id,tech_id)`. Precedent -> new pivot `project_idea_tech` is consistent.
- `HandleInertiaRequests::share()` (~line 55): `'techs' => Tech::orderBy('name')->get()` shared on EVERY request as full serialized models (id,name,slug,category,icon,timestamps). Frontend `Tech` type matches. Shared list is the entire table (no filter) -> every tech an idea references is present client-side.

### Backend — enums convention (locked decision 3)
- `app/Enums/` has exactly ONE file: `ProjectStatus.php`. String-backed (`enum ProjectStatus: string`), PascalCase case names, lowercase/snake values. Helpers: `transitions()`, `canTransitionTo()`, `static values()` = `array_column(self::cases(),'value')`, `acceptsJoinRequests()`. No `label()`, no `declare(strict_types=1)` in that file (app is mixed on strict_types; new code SHOULD use it).
- Enum casting uses the **`protected $casts` array** property (Project.php: `'status' => ProjectStatus::class`), NOT the `casts()` method. `ProjectService::updateStatus()` defensively `ProjectStatus::tryFrom($string)`.
- NO frontend enum mirror; TS `Project` type inlines string union `'open'|'in_progress'|'closed'|'completed'`.
- Recommendation: `App\Enums\ProjectIdeaCategory: string` + `App\Enums\ProjectIdeaDifficulty: string` following `ProjectStatus` shape (string-backed, PascalCase cases, `static values()`, optional `label()` for Spanish badge). Cast via `$casts` array; nullable cast works OOTB. Mirror difficulty union inline in TS.
- **PHP enum case names cannot contain hyphens.** Locked kebab identifiers (`herramientas-dev`, `bots-automatizacion`, `alternativas-oss`) are the string VALUES; case NAMES must be PascalCase: `case HerramientasDev = 'herramientas-dev';` etc. Same for difficulty (`case Principiante = 'principiante';`).

### Backend — migrations / seeders / factories / tests
- Migrations: anonymous class, `Schema::create`, `$table->id()`, `->constrained()->onDelete('cascade')`, `->unique([...])`, `->index()`, `$table->timestamps()`.
- Seeders: `DatabaseSeeder` calls `TechSeeder` then `UserSeeder` (`WithoutModelEvents`). `TechSeeder` builds a PHP array and does **`Tech::query()->upsert($rows, ['slug'], [updatable cols])`** with `created_at/updated_at => now()`. Precedent -> `ProjectIdeaSeeder` should `upsert` by `slug` (idempotent), then attach techs. Must register in `DatabaseSeeder::run()` AFTER `TechSeeder` (techs must exist first).
- Seeder tech linkage: `Tech::whereIn('slug',$slugs)->pluck('id','slug')`, skip slugs not found (locked decision 2), silently ignore.
- Factories: `database/factories/*Factory.php`, `fake()` helper, `->unique()` for unique cols. Need `ProjectIdeaFactory` (unique slug/title, random enum via `fake()->randomElement(ProjectIdeaCategory::values())`).
- Tests: `tests/Feature/*Test.php` extend `Tests\TestCase`, `use RefreshDatabase`. `ProjectTest::setUp()` creates user + `Tech::factory()->count(3)->create()`. Assertions: `$response->assertInertia(fn($page)=>$page->component(...)->has(...)->where(...))`. Existing create coverage: view-form-when-auth, cannot-view-without-auth, can_create_project, validation tests. New tests should assert `project_ideas` prop shape on `projects/create`.

### Frontend — create page and form
- `resources/js/pages/projects/create.tsx`: `Create({auth,techs})`, `useForm({title:'',description:'',vision:'',techs:[] as number[],repository_url:'',demo_url:'',images:[] as File[]})`, `form.post('/projects',{forceFormData:true,onSuccess,onError})`. Renders one `<Card>` around `<ProjectForm mode="create" techs={techs} form={form} onSubmit={handleSubmit} cancelUrl={route('projects.index')} submitLabel="Crear Proyecto"/>`.
- `project-form.tsx`: pure presentational; takes `form` (useForm return), destructures `{data,setData,processing,errors}`. Sections: `ProjectDetailsSection` (title/description/vision), `ProjectTechSelector` (checkbox grid via `groupTechsByCategory`), `ProjectLinksSection`, `ProjectMediaSection`, `ProjectFormActions`.
- `project-form-contract.ts`: `ProjectFormData` type, `createProjectFormData()` factory, `toggleTechSelection(techIds,techId,checked)`. `techs` is `number[]`.
- `ProjectTechSelector` on this page is NOT collapsible (plain bordered scroll area). "Avoid default open" preference came from `profile-tech-selector.tsx` (commit 94dec1e6) removing auto-expansion -> confirms: disclosure surfaces start collapsed.
- `edit.tsx` already shows the prefill pattern: `useForm` seeded from `project` props, `techs: project.techs.map(t=>t.id)`. Inspiration prefill maps the same way.

### Frontend — query-param / client-side nav patterns
- `@inertiajs/react ^2.0.0`. Ziggy `route()` global (stubbed on `globalThis.route` in tests).
- `router.get(url, params, {preserveState:true, preserveScroll:true})` is the established `?param=` pattern (`projects/index.tsx` ~L65-92, `users/index.tsx`). `router.reload({only:[...]})` in `notification-bell.tsx`. NO `window.history.replaceState` / `URLSearchParams` anywhere in `resources/js` today.
- Repo's only `?param=` precedent does a server round-trip. For the locked "no full reload" card click: (a) `window.history.replaceState` = zero network, no prop churn (RECOMMEND), or (b) `router.get(route('projects.create'),{idea:slug},{preserveState:true,preserveScroll:true,replace:true,only:[]})`.

### Frontend — shadcn primitives
- `components.json`: style `base-lyra`, `rsc:false` (no "use client"), baseColor `taupe`, icons `lucide`, Tailwind v3 (`tailwind.config.js`), `rtl:true`.
- Installed `ui/`: card, badge, separator, checkbox, button, field, input, textarea, tabs, select, popover, dialog, sheet, skeleton, empty, avatar, carousel, pagination, form-error, dropdown, label, calendar, progress.
- **`Collapsible` NOT installed. `Accordion` NOT installed.** Need `npx shadcn@latest add collapsible` (small Radix component). `Card` + `Badge` present, already used on create page.
- Idea cards: compose `Card` (Header/Title/Description/Content/Footer) + `Badge` (category/difficulty) + `Button` variant=outline size=sm. Badge not custom spans, semantic tokens, `gap-*`.

### Frontend — test layout
- `resources/js/test/setup.ts`: jsdom, mocks IntersectionObserver/ResizeObserver/matchMedia. Vitest + Testing Library.
- `resources/js/pages/projects/*.test.tsx` mock `@/components/seo`, `@/layouts/app-layout`, `@inertiajs/react` (stub Link, router, useForm), set `globalThis.route`. New: `resources/js/pages/projects/create.test.tsx` (absent today) + inspiration component test.

## Affected Areas
- `database/migrations/` — `create_project_ideas_table` + `create_project_idea_tech_table`.
- `database/seeders/ProjectIdeaSeeder.php` (new) + register in `DatabaseSeeder.php` after `TechSeeder`.
- `database/factories/ProjectIdeaFactory.php` (new).
- `app/Enums/ProjectIdeaCategory.php`, `app/Enums/ProjectIdeaDifficulty.php` (new).
- `app/Models/ProjectIdea.php` (new): `$casts` enums, `techs()` belongsToMany via `project_idea_tech`, `scopePublished`, ordering scope.
- `app/Http/Controllers/ProjectController.php` — `create()` passes `project_ideas` grouped/ordered by category then `sort_order`, each with suggested tech IDs.
- (optional) `app/Helpers/ApiResourceTransformer.php` — `projectIdeas()`; likely unnecessary (scalars + tech_ids), inline `->map()` matches how `techs` are shared raw.
- `resources/js/pages/projects/create.tsx` — accept `project_ideas`, render collapsible block above `<ProjectForm>`, read `?idea=` on mount, wire `setData` + URL sync on click.
- `resources/js/components/projects/project-idea-inspiration.tsx` + `project-idea-card.tsx` (new); maybe `prefillFromIdea(idea): Partial<ProjectFormData>` helper.
- `resources/js/components/ui/collapsible.tsx` — via shadcn CLI.
- `resources/js/types/index.ts` — `ProjectIdea` interface + category/difficulty unions.
- Tests: `tests/Feature/ProjectIdeaInspirationTest.php` (new); unit test for seeder tech-skip; `resources/js/pages/projects/create.test.tsx` + `project-idea-*.test.tsx` (new).

## Sub-decisions left for design
| Sub-decision | Recommendation |
|---|---|
| Ideas payload shape | inline `->map()` in `create()` (matches raw `techs` sharing) |
| Category grouping/order | controller returns flat list ordered by category enum order then `sort_order`; client groups for display like `groupTechsByCategory` (skip empty categories) |
| Client `?idea=` sync | `window.history.replaceState` (zero network, no prop churn) |
| Badge labels | client label map like `TECH_CATEGORY_LABELS`; server stays data-only |

## Risks / Integration Concerns
1. **Prefilled `title` vs `Rule::unique` on `projects.title`.** Two users picking the same idea -> 2nd `store` fails with "Ya existe un proyecto con este título." Mitigation: frame `prefill_title` as an editable suggestion + copy nudge to personalize. Do NOT weaken `StoreProjectRequest`.
2. **`?idea=` surviving validation-error redisplay.** `form.post('/projects')` on validation failure returns errors to same `/projects/create` URL WITHOUT remounting -> client state + `?idea=` persist. Safe. Hazard = manual full reload: on-mount prefill effect re-runs. Design must make on-mount prefill (a) run once and (b) only populate still-pristine/empty fields, never clobber user edits (edit.tsx "seed once" pattern).
3. **Techs prefill = tech IDs.** Shared `techs` is full table -> low risk. Controller must emit tech IDs (not slugs) per idea from `project_idea_tech` so client `setData('techs', ids)` drives the checkboxes. Deleted tech -> join omits it, acceptable.
4. **Seeder ordering / idempotency.** `ProjectIdeaSeeder` after `TechSeeder`; `upsert` ideas by `slug`, `syncWithoutDetaching` pivot. Feature tests use `ProjectIdeaFactory`, not the seeder.
5. **#178 interaction.** `project-creation-contextual-invitations` only changed `store()`'s redirect + added models/tables; did not touch `create()` or create-page props. This change adds a prop to `create()` only. No overlap, no ordering dependency; shared file `ProjectController.php` is a trivial different-method merge.
6. **`project_ideas` as per-route prop in `create()`**, NOT shared — keeps the extra query off every page. ~15 rows + eager-load techs = one extra query on one route.
7. **No admin CRUD in V1 (locked).** Ship `is_published` (default true) + `sort_order` (default 0) columns now so a later admin panel is additive only. V1 reads `where('is_published', true)`.
8. **`rtl:true`** in components.json — new components rely on logical props / `gap-*`, no hardcoded left/right.
9. **TS gate is informational** (`tsc-staged`, continue-on-error) but `npm run build` is a hard verify gate. Add `ProjectIdea` type properly.
10. **Empty category sections.** Client grouping must skip categories with zero ideas (like `groupTechsByCategory` emitting only non-empty groups). Ensure seed content covers the categories actually rendered.

## Locked decisions that fight the codebase (minimal adjustments, do NOT stop)
- PHP enum case names cannot be kebab-case -> use PascalCase case names with kebab string values.
- No in-repo precedent for client-only URL update -> use `window.history.replaceState` for card-click `?idea=` sync.
- Prefill `title` vs unique constraint -> frame as editable suggestion + UX nudge; keep validation as-is.
- Everything else (table + pivot + seeder + `$casts` enums + per-route prop + collapsed-by-default disclosure + Card/Badge composition) matches existing conventions with no friction.

## Ready for Proposal
Yes. Locked design fits cleanly. Proceed to `sdd-propose`.

## Artifact note
Materialized from Engram topic `sdd/project-idea-inspiration/explore` (the `Write` tool was disabled during the explore phase).
