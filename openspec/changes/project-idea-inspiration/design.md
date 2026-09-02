# Design: Project Idea Inspiration

## Technical Approach

Content-as-data. Ideas are seeded rows in two new standalone tables (`project_ideas`, `project_idea_tech`). `ProjectController@create` gains one per-route prop `projectIdeas` shaped by `ApiResourceTransformer`. The whole prefill interaction is client-side: a collapsed-by-default shadcn `Collapsible` above `<ProjectForm>` calls `setData` on the existing `useForm` instance. `<ProjectForm>`, `StoreProjectRequest`, `ProjectService::create` and the post-create redirect are untouched.

Satisfies `specs/project-idea-inspiration/spec.md` requirements 1–6.

## Architecture Decisions

### Decision: Payload built by `ApiResourceTransformer::projectIdeas()`

| Option | Tradeoff |
|---|---|
| Inline `->map()` in `create()` | Fewer files, but puts camelCase key renaming in the controller; every other Inertia payload in this controller goes through the transformer |
| **`ApiResourceTransformer::projectIdeas(Collection): array`** ✅ | Keeps `create()` thin (3 lines), matches `index/show/edit`, isolates the column→payload key rename |

**Rationale**: the payload keys differ from column names (`prefill_title` → `prefillTitle`, pivot → `techIds`). That is presentation shaping, which this app already centralizes in `ApiResourceTransformer`.

### Decision: Category ordering resolved in PHP, not SQL

| Option | Tradeoff |
|---|---|
| `orderByRaw("FIELD(category, ...)")` | Not portable — tests run on `sqlite` (`phpunit.xml` forces `DB_CONNECTION=sqlite`) |
| **`orderBy('sort_order')` then `Collection::sortBy` on enum index** ✅ | Portable, ~15 rows, enum declaration order stays the single source of truth |

Sort key: `sprintf('%02d-%06d', $categoryIndex, $sort_order)` where `$categoryIndex = array_flip(ProjectIdeaCategory::values())[$idea->category->value]`. String padding avoids array-comparison ambiguity.

### Decision: Display labels live on the frontend

Enums stay data-only (no `label()`, mirroring `ProjectStatus`). Labels + category order live in `resources/js/lib/project-idea-catalog.ts`, mirroring `lib/tech-catalog.ts` (`TECH_CATEGORY_ORDER` / `TECH_CATEGORY_LABELS`). **Rationale**: existing precedent; the server never ships display copy for `techs` either.

### Decision: CTA button, not a clickable card

The card is a `Card` (`role="group"`) whose only interactive element is a `Button` in `CardFooter` with `aria-label="Usar la idea: {title}"`. **Rejected**: whole card as `<button>` — it would swallow the heading/badge semantics and forbid any future nested link.

### Decision: `history.replaceState` for `?idea=` sync

No in-repo precedent for client-only URL updates; `router.get(..., {only: []})` still hits the server. `window.history.replaceState` is zero-network and causes no prop churn, which the locked "no full reload" requirement demands.

### Decision: Post-prefill focus via `document.getElementById('title')`

`ui/field.tsx` clones its child with the `id`, so the title input has DOM id `title`. **Rejected**: threading a ref through `ProjectForm` → `ProjectDetailsSection` → `Input`, which would widen the presentational contract this change is scoped to leave alone.

## Data Flow

```
GET /projects/create ──▶ ProjectController@create
                            │  ProjectIdea::published()->with('techs:id')->orderBy('sort_order')->get()
                            │  ApiResourceTransformer::projectIdeas($ideas)
                            ▼
                     Inertia prop `projectIdeas`
                            │
              create.tsx ───┼──▶ useForm(initial)  ──▶ <ProjectForm> (unchanged)
                            │          ▲
                            └──▶ <ProjectIdeaInspiration onSelect> ──┘ setData x4
```

### Sequence: prefill

```
Deep link (?idea=slug)                    Card click
──────────────────────                    ──────────
mount                                     user clicks "Usar esta idea"
 └─ effect runs once (seededRef)           └─ handleSelectIdea(idea)
    ├─ find idea by slug ──▶ not found?        ├─ setData title|description|vision|techs
    │                        return silently   │   (overwrite, explicit action)
    ├─ per field: pristine? ──▶ no: skip       ├─ history.replaceState(?idea=slug)
    │                          yes: setData    ├─ getElementById('title').focus()
    └─ seededRef.current = true                └─ aria-live status announces the idea
```

**Pristine definition** (compared against the `useForm` initial values, not `isDirty`):

| Field | Pristine when |
|---|---|
| `title` | `data.title === ''` |
| `description` | `data.description === ''` |
| `vision` | `data.vision === ''` |
| `techs` | `data.techs.length === 0` |

Card click ignores pristineness (spec: explicit user action overwrites). Deep link is pristine-only and guarded by `useRef(false)` so it never re-runs.

## File Changes

| File | Action | Description |
|---|---|---|
| `database/migrations/*_create_project_ideas_table.php` | Create | See schema below |
| `database/migrations/*_create_project_idea_tech_table.php` | Create | Mirrors `project_tech` minus `level` |
| `app/Enums/ProjectIdeaCategory.php` | Create | 5 cases, `static values()` |
| `app/Enums/ProjectIdeaDifficulty.php` | Create | 3 cases, `static values()` |
| `app/Models/ProjectIdea.php` | Create | `$fillable`, `$casts`, `techs()`, `scopePublished` |
| `database/factories/ProjectIdeaFactory.php` | Create | Unique slug/title, random enum values |
| `database/seeders/ProjectIdeaSeeder.php` | Create | 15 ideas, `upsert` by slug + `syncWithoutDetaching` |
| `database/seeders/DatabaseSeeder.php` | Modify | Add after `TechSeeder`, before `UserSeeder` |
| `app/Helpers/ApiResourceTransformer.php` | Modify | Add `projectIdeas()` |
| `app/Http/Controllers/ProjectController.php` | Modify | `create()` only — **#178 touched `store()` only; trivial different-method merge** |
| `resources/js/types/index.ts` | Modify | `ProjectIdea` interface + 2 unions |
| `resources/js/lib/project-idea-catalog.ts` | Create | Order, labels, `groupIdeasByCategory()` |
| `resources/js/components/ui/collapsible.tsx` | Create | `npx shadcn@latest add collapsible` (**task dependency — must run before the components**) |
| `resources/js/components/projects/project-idea-inspiration.tsx` | Create | Collapsible wrapper + tech-name index map |
| `resources/js/components/projects/project-idea-category-group.tsx` | Create | Heading + card grid |
| `resources/js/components/projects/project-idea-card.tsx` | Create | Card + badges + CTA |
| `resources/js/pages/projects/create.tsx` | Modify | Prop, effect, handler, aria-live region |
| `tests/Feature/ProjectIdeaInspirationTest.php` | Create | Prop shape, filtering, ordering, casting, seeder |
| `resources/js/pages/projects/create.test.tsx` | Create | Collapsed default, prefill, pristine guard |

## Interfaces / Contracts

### `project_ideas`

```php
$table->id();
$table->string('slug')->unique();
$table->string('title');
$table->string('summary', 500);
$table->string('category', 50);
$table->string('difficulty', 30)->nullable();
$table->string('prefill_title');
$table->text('prefill_description');
$table->text('prefill_vision')->nullable();
$table->boolean('is_published')->default(true);
$table->unsignedInteger('sort_order')->default(0);
$table->timestamps();
$table->index(['is_published', 'category', 'sort_order'], 'project_ideas_published_ordered_index');
```

### `project_idea_tech`

```php
$table->id();
$table->foreignId('project_idea_id')->constrained('project_ideas')->onDelete('cascade');
$table->foreignId('tech_id')->constrained('techs')->onDelete('cascade');
$table->unique(['project_idea_id', 'tech_id']);
$table->timestamps();
```

Rollback order: drop `project_idea_tech` first, then `project_ideas`.

### Enums (`ProjectStatus` shape: no `declare(strict_types=1)`, no `label()`)

```php
enum ProjectIdeaCategory: string
{
    case HerramientasDev = 'herramientas-dev';
    case Clones = 'clones';
    case AlternativasOss = 'alternativas-oss';
    case BotsAutomatizacion = 'bots-automatizacion';
    case Aprendizaje = 'aprendizaje';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

enum ProjectIdeaDifficulty: string
{
    case Principiante = 'principiante';
    case Intermedio = 'intermedio';
    case Avanzado = 'avanzado';
    // static values() identical
}
```

Declaration order **is** the render order — do not reorder cases.

### `ProjectIdea` model

```php
protected $fillable = ['slug', 'title', 'summary', 'category', 'difficulty',
    'prefill_title', 'prefill_description', 'prefill_vision', 'is_published', 'sort_order'];

protected $casts = [
    'category' => ProjectIdeaCategory::class,
    'difficulty' => ProjectIdeaDifficulty::class,
    'is_published' => 'boolean',
    'sort_order' => 'integer',
];

public function techs(): BelongsToMany
{
    return $this->belongsToMany(Tech::class, 'project_idea_tech')->withTimestamps();
}

public function scopePublished(Builder $query): Builder
{
    return $query->where('is_published', true);
}
```

### Payload (one entry of `projectIdeas`)

```ts
type ProjectIdea = {
  slug: string
  title: string
  summary: string
  category: ProjectIdeaCategory   // 'herramientas-dev' | 'clones' | 'alternativas-oss' | 'bots-automatizacion' | 'aprendizaje'
  difficulty: ProjectIdeaDifficulty | null  // 'principiante' | 'intermedio' | 'avanzado'
  prefillTitle: string
  prefillDescription: string
  prefillVision: string           // '' when null
  techIds: number[]
}
```

### Component props

```ts
ProjectIdeaInspiration({ ideas: ProjectIdea[]; techs: Tech[]; onSelect(idea): void })
ProjectIdeaCategoryGroup({ label: string; ideas: ProjectIdea[]; techNamesById: Map<number,string>; onSelect(idea): void })
ProjectIdeaCard({ idea: ProjectIdea; techNames: string[]; onSelect(idea): void })
```

All three are presentational. `Map` is built once in the section (index-map, not per-card `find`). Container state stays in `create.tsx`. Renders `null` when `ideas` is empty.

### Seed set (15 ideas, 3 per category, `sort_order` 1..3 within category)

| slug | title (ES) | category | difficulty | tech slugs |
|---|---|---|---|---|
| `cli-scaffold-proyectos` | CLI para scaffolding de proyectos | herramientas-dev | avanzado | go, typescript, git |
| `dashboard-metricas-repos` | Dashboard de métricas de repositorios | herramientas-dev | intermedio | react, nodejs, rest-api |
| `gestor-snippets-equipo` | Gestor de snippets para equipos | herramientas-dev | principiante | typescript, react, postgresql |
| `bot-discord-comunidad` | Bot de Discord para comunidades dev | bots-automatizacion | principiante | nodejs, javascript, redis |
| `bot-recordatorios-telegram` | Bot de recordatorios en Telegram | bots-automatizacion | principiante | python, fastapi, postgresql |
| `pipeline-reportes-automaticos` | Pipeline de reportes automáticos | bots-automatizacion | avanzado | python, docker, aws |
| `alternativa-linktree` | Alternativa open source a Linktree | alternativas-oss | principiante | nextjs, tailwind, supabase |
| `alternativa-notas-colaborativas` | Alternativa liviana para notas colaborativas | alternativas-oss | avanzado | react, laravel, mysql |
| `acortador-urls-self-hosted` | Acortador de URLs self-hosted | alternativas-oss | intermedio | go, redis, docker |
| `clon-trello-kanban` | Clon de Trello para gestión kanban | clones | intermedio | react, laravel, postgresql |
| `clon-spotify-reproductor` | Clon de Spotify enfocado en el reproductor | clones | avanzado | nextjs, typescript, tailwind |
| `clon-twitter-hilos` | Clon de Twitter centrado en hilos | clones | intermedio | laravel, vuejs, mysql |
| `interprete-lenguaje-juguete` | Intérprete de un lenguaje de juguete | aprendizaje | avanzado | typescript, git |
| `motor-busqueda-mini` | Mini motor de búsqueda full-text | aprendizaje | intermedio | python, postgresql |
| `clon-redis-en-memoria` | Clon didáctico de Redis en memoria | aprendizaje | avanzado | go, redis |

All tech slugs above exist in `TechSeeder`. Copy rules for `sdd-apply`: `summary` = 1 Spanish sentence (≤200 chars); `prefill_title` = the title; `prefill_description` = 2 Spanish sentences of scope; `prefill_vision` = 1 Spanish sentence of outcome. Identifiers and comments stay English.

Seeder shape (follows `TechSeeder`):

```php
ProjectIdea::query()->upsert($rows, ['slug'], ['title','summary','category','difficulty',
    'prefill_title','prefill_description','prefill_vision','is_published','sort_order','updated_at']);

$techIds = Tech::whereIn('slug', $allSlugs)->pluck('id', 'slug');   // one query
foreach ($ideas as $idea) {
    ProjectIdea::where('slug', $idea['slug'])->first()
        ?->techs()->syncWithoutDetaching($techIds->only($idea['techs'])->values()->all());
}
```

`->only()` silently drops slugs absent from `techs` (spec requirement 2).

## Testing Strategy (strict TDD — RED first, `php artisan test`)

| Layer | What to test | Approach |
|---|---|---|
| Feature | `create` returns `projectIdeas`, published only | `assertInertia(fn ($p) => $p->has('projectIdeas', 2))` with 2 published + 1 unpublished factory rows |
| Feature | Ordering is category enum order then `sort_order` | Factory rows in shuffled insert order; assert `where('projectIdeas.0.slug', ...)` sequence |
| Feature | `techIds` resolved; empty array when unlinked | Attach 2 techs to one idea, none to another |
| Feature | Enum casting | `$idea->category instanceof ProjectIdeaCategory`; nullable `difficulty` stays `null` |
| Feature | Seeder idempotency + unknown slug skip | Run `ProjectIdeaSeeder` twice, assert `project_ideas` count stable and pivot rows unchanged |
| Feature | Non-regression | Existing `ProjectTest` create/store tests must stay green untouched |
| Frontend | Block renders collapsed; form submittable without expanding | `create.test.tsx`, assert idea titles absent until trigger click |
| Frontend | Expand reveals grouped ideas, empty groups omitted | Ideas for 2 of 5 categories → 2 headings |
| Frontend | Card click sets the 4 fields, leaves the other 3 | Spy `setData`; assert exact keys called and `repository_url`/`demo_url`/`images` never called |
| Frontend | Card click overwrites an edited `title` | Non-pristine initial data → still overwritten |
| Frontend | `?idea=` prefills pristine fields on mount, once | Stub `window.location.search`; assert `setData` calls and no re-run on rerender |
| Frontend | `?idea=` skips non-pristine fields | Pre-edited `description` untouched |
| Frontend | Unknown slug ignored, no error | Zero `setData` calls, no error text |

`create.test.tsx` follows `show.test.tsx`: mock `@/components/seo`, `@/layouts/app-layout`, `@inertiajs/react` (stub `useForm` returning controllable `data`/`setData` spy), and set `globalThis.route`.

## Threat Matrix

N/A — no routing changes beyond an added Inertia prop on an existing authed route, no shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. `?idea=` is a slug lookup against an in-memory list; unknown values are dropped, never interpolated.

## Migration / Rollout

No data migration. Two new standalone tables; no existing table, column, or row is altered. Rollback confirmed at file level against the proposal:

1. `ProjectController@create` → `return Inertia::render('projects/create');` (page tolerates a missing prop via `projectIdeas = []` default).
2. Revert `resources/js/pages/projects/create.tsx`; delete the 3 `project-idea-*` components, `lib/project-idea-catalog.ts`, `ui/collapsible.tsx`.
3. Remove `ProjectIdeaSeeder::class` from `DatabaseSeeder::run()`.
4. `php artisan migrate:rollback` (pivot dropped first by migration order).
5. Delete `ProjectIdea.php`, `ProjectIdeaFactory.php`, both enums, `ProjectIdeaSeeder.php`, the `ProjectIdea` block in `types/index.ts`, `projectIdeas()` in `ApiResourceTransformer`, and both test files.

Steps 1–3 disable the feature with no schema change.

## Size Forecast (for `sdd-tasks`)

Estimated **~1,100–1,250 changed lines**, over the 800-line budget. Largest blocks: `ProjectIdeaSeeder` (~180 with Spanish copy), `create.test.tsx` (~220), the 3 components (~180), `ProjectIdeaInspirationTest` (~150). Suggested split if `sdd-tasks` chains: **slice 1 backend** (migrations, enums, model, factory, seeder, transformer, controller, feature test ≈ 550) / **slice 2 frontend** (collapsible, catalog lib, components, `create.tsx`, vitest ≈ 600). Slice 1 is independently shippable — the prop is simply unused.

## Open Questions

- [x] **RESOLVED (orchestrator)**: the five locked `ProjectIdeaCategory` values are `herramientas-dev`, `clones`, `alternativas-oss`, `bots-automatizacion`, `aprendizaje`, in that render order (from the user's AskUserQuestion selection). An earlier draft used `apps-web` / `impacto-social`; those were corrected here — enum cases, TS union, and 6 seeder rows now use `clones` and `aprendizaje`.
- [ ] **ASSUMPTION**: `summary` capped at 500 chars and `prefill_description` kept ≤1000 chars so a prefilled description always passes `StoreProjectRequest`'s `max:1000`.
