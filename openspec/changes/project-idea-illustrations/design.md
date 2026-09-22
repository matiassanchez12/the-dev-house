# Design: Project Idea Illustrations and Card Layout Consistency

## Technical Approach

Additive, single vertical slice. One nullable column (`project_ideas.illustration_path`) holds a
deterministic media-disk path. The seeder is the only writer. The transformer exposes it as
`illustrationUrl`. The card gains a fixed-aspect media block so every card has identical structural
height. `ProjectService::create` reuses the stored file as `images[0]` when the creator uploads
nothing, so the existing `images[0]`-is-the-cover convention carries the illustration into
`/projects` with zero change to `get-project-card-model.ts`.

> Note: this document exceeds the usual 800-word design budget because the orchestrator explicitly
> requested exact code, exact JSX, and enumerated test cases as the deliverable.

## Architecture Decisions

### Decision: Deterministic seeder destination, resolved in a pre-pass

| Option | Tradeoff | Decision |
|---|---|---|
| UUID destination per run | Rewrites `illustration_path` every run → breaks `ProjectIdeaInspirationTest` idempotency | Rejected |
| Copy inside the `array_map` that builds `$rows` | I/O side effect inside a pure mapper; hard to read | Rejected |
| Second pass with per-row `UPDATE` after upsert | 15 extra write queries; two sources of truth for the column | Rejected |
| **Pre-pass resolves slug→path, `array_map` reads the map, single upsert** | One extra `SELECT`; keeps the upsert single and pure | **Chosen** |

**Rationale**: the destination `project-ideas/<slug>.webp` is byte-identical across runs, so repeated
seeding produces stable rows and stable pivot counts. Resolution merges over the existing value:

```php
// ProjectIdeaSeeder::run(), before array_map
$existing = ProjectIdea::query()->pluck('illustration_path', 'slug');
$illustrations = $this->syncIllustrations(array_column($ideas, 'slug'), $existing);
// ...then inside array_map: 'illustration_path' => $illustrations[$idea['slug']] ?? null,
// ...and 'illustration_path' added to the upsert update-columns list.

/**
 * Copy every present source asset to the media disk and resolve the stored path per slug.
 * A missing source preserves whatever the row already had (never nulls a live column).
 *
 * @param  array<int, string>  $slugs
 * @param  \Illuminate\Support\Collection<string, string|null>  $existing
 * @return array<string, string|null>
 */
private function syncIllustrations(array $slugs, Collection $existing): array
{
    $disk = config('filesystems.media_disk', 'public');
    $resolved = [];

    foreach ($slugs as $slug) {
        $source = database_path("seeders/assets/project-ideas/{$slug}.webp");

        if (! is_file($source)) {
            $resolved[$slug] = $existing[$slug] ?? null;
            continue;
        }

        Storage::disk($disk)->put("project-ideas/{$slug}.webp", (string) file_get_contents($source));
        $resolved[$slug] = "project-ideas/{$slug}.webp";
    }

    return $resolved;
}
```

Source is read with `file_get_contents(database_path(...))` (repo tree, real filesystem), written with
`Storage::disk(...)` (fakeable). Unconditional overwrite is cheaper than `exists()` + hash compare and
is idempotent in content. A newly-dropped asset flips `null` → path on the next run; a removed asset
keeps the last known path (stale, harmless, documented).

### Decision: No index on `illustration_path`

Never filtered, never joined, never sorted on. The only read is a per-row projection inside
`projectIdeas()` on an already-loaded row. An index would cost write time and buy nothing.

### Decision: Same-disk `copy()` for the default cover, degrading to no cover on failure

`Storage::disk($disk)->copy()` is supported by the Flysystem local adapter (the `public` disk and
`Storage::fake` both use it) and by S3. Guarded by `exists()` and wrapped in `try/catch` returning
`null`, mirroring `deleteImages`' swallow-exceptions precedent: a cover is a nicety and must never
fail project creation. Rejected `get()` + `put()` because it buffers the whole file in memory for no
portability gain.

### Decision: `idea_slug` empty-string handling stays at the middleware

`bootstrap/app.php` never calls `$middleware->remove(...)`, so Laravel 12's default global
`ConvertEmptyStringsToNull` is active and `idea_slug: ''` (from `forceFormData`) arrives as `null`,
where `nullable` short-circuits `exists`. Rejected adding `prepareForValidation()`: it duplicates
framework behaviour and the existing `StoreProjectRequestTest` helper calls `Validator::make($data,
$request->rules())`, which would bypass it anyway. Instead the `''` path gets **one** feature-level
HTTP test through the real middleware stack.

### Decision: `ProjectFormData.idea_slug` is optional, not defaulted

Add `idea_slug?: string` to `project-form-contract.ts` beside the existing optional extras
(`remove_images?`, `_method?`). Do **not** add it to `createProjectFormData()`. Rejected widening the
create page with a local type (duplicates the contract) and rejected a required field (would force
every `edit.tsx` and `project-form.test.tsx` fixture to carry it).

### Decision: Map names keep the file's `PROJECT_IDEA_CATEGORY_*` prefix

`PROJECT_IDEA_CATEGORY_GRADIENTS` / `PROJECT_IDEA_CATEGORY_ICONS`, not the shorter
`CATEGORY_GRADIENT` / `CATEGORY_ICON` — `project-idea-catalog.ts` already exports
`PROJECT_IDEA_CATEGORY_ORDER` and `PROJECT_IDEA_CATEGORY_LABELS`, and the file has no local alias
convention. Follow the existing pattern.

### Decision: Media block is a `<div>` sibling above `CardHeader`, and the Card needs explicit `pt-0`

`Card` styles a leading `<img>` via `has-[>img:first-child]:pt-0`, but the media block must be a
`<div>` (it renders either an `<img>` or a gradient fallback), so that selector will not match. The
card therefore carries `h-full pt-0` explicitly. Text never overlays photography, so contrast is
guaranteed by `bg-card`/`text-card-foreground` alone — no scrim required for legibility.

### Decision: Theming by token flip only

Gradients follow the existing `STATUS_GRADIENTS` shape (`from-<hue>-400/20 to-<hue>-600/20`) — 20%
palette tint composited over `--card`, which flips in `.dark`. Icon uses `text-foreground/60`. Zero
`dark:` classes, zero `tailwind.config.js` (the file does not exist; the repo is Tailwind v4 with
`@theme inline` + oklch `.dark` tokens).

| Category | Gradient | Icon (`lucide-react`) |
|---|---|---|
| `herramientas-dev` | `from-amber-400/20 to-amber-600/20` | `Wrench` |
| `clones` | `from-sky-400/20 to-sky-600/20` | `Copy` |
| `alternativas-oss` | `from-emerald-400/20 to-emerald-600/20` | `Package` |
| `bots-automatizacion` | `from-violet-400/20 to-violet-600/20` | `Bot` |
| `aprendizaje` | `from-rose-400/20 to-rose-600/20` | `GraduationCap` |

Typed `Record<ProjectIdeaCategory, LucideIcon>`; icons imported as components, never looked up by
string (shadcn icon rule).

### Decision: `+N` tech overflow computed inline in the card

`ProjectCardTechs` reads a `ProjectCardViewModel`, which `ProjectIdeaCard` does not have. Rejected
generalising the view model (drags project-card concerns into the idea card). Instead **mirror the
pattern locally**: `const MAX_VISIBLE_TECHS = 3`, `visibleTechs = techNames.slice(0, MAX_VISIBLE_TECHS)`,
`overflowCount = Math.max(techNames.length - MAX_VISIBLE_TECHS, 0)`, rendering the same
`<Badge variant="outline">+{overflowCount}</Badge>`. Derived during render, not in an effect.

## Data Flow — default cover copy

```
Seed time (once)
  database/seeders/assets/project-ideas/<slug>.webp
        │ file_get_contents
        ▼
  Storage[media_disk]::put('project-ideas/<slug>.webp')
        │
        ▼
  project_ideas.illustration_path = 'project-ideas/<slug>.webp'

Request time
  create.tsx ──idea_slug──► StoreProjectRequest ──► ProjectService::create
                                                          │
        project_ideas ◄── where('slug', …) ───────────────┤
                                                          ▼
        Storage[media_disk]::copy('project-ideas/x.webp' → 'projects/<uuid>.webp')
                                                          │
                                                          ▼
                              projects.images = ['projects/<uuid>.webp']
                                                          │
                    ApiResourceTransformer::project() ────┘
                                                          ▼
                              get-project-card-model.ts → card.imageUrl
```

### Sequence — `POST /projects` with an idea and no upload

```
User      create.tsx     ProjectController   StoreProjectRequest   ProjectService   ProjectIdea   Storage(media)
 │            │                  │                    │                  │              │             │
 │ click card │                  │                    │                  │              │             │
 ├───────────►│ setData(title, description, vision,   │                  │              │             │
 │            │         techs, idea_slug)             │                  │              │             │
 │ submit     │                  │                    │                  │              │             │
 ├───────────►│ post('/projects', forceFormData)      │                  │              │             │
 │            ├─────────────────►│                    │                  │              │             │
 │            │                  │ validate ─────────►│                  │              │             │
 │            │                  │   idea_slug: nullable|string|exists   │              │             │
 │            │                  │◄─── validated() ───┤                  │              │             │
 │            │                  ├── create(user, data) ────────────────►│              │             │
 │            │                  │                    │  images empty?   │              │             │
 │            │                  │                    │  yes ────────────┤              │             │
 │            │                  │                    │  where('slug')──►│              │             │
 │            │                  │                    │◄─ illustration_path ────────────┤             │
 │            │                  │                    │  exists('project-ideas/x.webp')─┼────────────►│
 │            │                  │                    │◄──────── true ──────────────────┼─────────────┤
 │            │                  │                    │  copy(src → 'projects/<uuid>.webp')──────────►│
 │            │                  │                    │  imagePaths = ['projects/<uuid>.webp']        │
 │            │                  │                    │  createdProjects()->create([...])             │
 │            │                  │◄──── Project ──────┤                  │              │             │
 │◄─── redirect projects.collaborators ───────────────┤                  │              │             │
```

Branches: uploaded images present → skip entirely (uploads always win). `idea_slug` null → skip.
Idea has `illustration_path === null` → skip. Source file missing or `copy()` throws → skip,
`images = []`.

## File Changes

| File | Action | Description |
|---|---|---|
| `database/migrations/<ts>_add_illustration_path_to_project_ideas_table.php` | Create | `$table->string('illustration_path')->nullable()->after('prefill_vision');` + `down()` `dropColumn`. No index (never queried). |
| `app/Models/ProjectIdea.php` | Modify | `illustration_path` into `$fillable`. No cast (plain nullable string). |
| `database/factories/ProjectIdeaFactory.php` | Modify | `'illustration_path' => null` — deterministic; tests opt in. |
| `database/seeders/assets/project-ideas/README.md` | Create | Asset spec (below). Keeps the directory tracked while 0 images ship. |
| `database/seeders/ProjectIdeaSeeder.php` | Modify | `$existing` pluck + `syncIllustrations()` pre-pass; column in row map and in upsert update-columns. |
| `app/Helpers/ApiResourceTransformer.php` | Modify | `projectIdeas()` emits `illustrationUrl`. |
| `app/Http/Requests/Project/StoreProjectRequest.php` | Modify | `idea_slug` rule + Spanish message. |
| `app/Services/ProjectService.php` | Modify | `resolveIdeaCoverPath()` + call site in `create()`. |
| `resources/js/types/index.ts` | Modify | `ProjectIdea.illustrationUrl: string \| null`. |
| `resources/js/lib/project-idea-catalog.ts` | Modify | Gradient + icon maps. |
| `resources/js/components/projects/project-idea-card.tsx` | Modify | Media block, clamped summary, `flex-1`, `+N` overflow. |
| `resources/js/components/projects/project-form-contract.ts` | Modify | `idea_slug?: string`. |
| `resources/js/pages/projects/create.tsx` | Modify | `idea_slug` in `useForm`, `applyIdea`, deep-link effect. |
| `resources/js/components/projects/project-idea-category-group.tsx` | **Unchanged** | Grid stays `grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3`. The imbalance is a card-internal height problem; grid `align-items: stretch` already equalises within a row. |

## Interfaces / Contracts

### `ApiResourceTransformer::projectIdeas()`

```php
'techIds' => $idea->techs->pluck('id')->map(fn ($id): int => (int) $id)->all(),
'illustrationUrl' => $idea->illustration_path
    ? StorageUrlHelper::url($idea->illustration_path, self::mediaDisk())
    : null,
```

`StorageUrlHelper::url()` already returns `null` for `null`; the ternary makes the contract explicit
and keeps the return type `?string` obvious at the call site.

### `StoreProjectRequest`

```php
'idea_slug' => ['nullable', 'string', 'exists:project_ideas,slug'],
// messages()
'idea_slug.exists' => 'La idea seleccionada no es válida.',
```

### `ProjectService`

```php
// create(), replacing the existing image block
$imagePaths = [];
if (! empty($data['images'])) {
    $imagePaths = $this->uploadImages($data['images']);
}

if (empty($imagePaths) && ! empty($data['idea_slug'])) {
    $coverPath = $this->resolveIdeaCoverPath($data['idea_slug']);

    if ($coverPath !== null) {
        $imagePaths = [$coverPath];
    }
}

$project = $user->createdProjects()->create([ /* unchanged */ ]);
```

```php
/**
 * Copy a project idea's stored illustration into the project image namespace.
 * Returns null when the idea, the column, or the source file is unavailable,
 * or when the copy fails — a missing cover must never fail project creation.
 */
private function resolveIdeaCoverPath(string $ideaSlug): ?string
{
    $idea = ProjectIdea::query()->where('slug', $ideaSlug)->first();

    if ($idea === null || $idea->illustration_path === null) {
        return null;
    }

    $disk = $this->mediaDisk();
    $source = $idea->illustration_path;

    if (! Storage::disk($disk)->exists($source)) {
        return null;
    }

    $extension = pathinfo($source, PATHINFO_EXTENSION) ?: 'webp';
    $target = 'projects/'.Str::uuid().'.'.$extension;

    try {
        Storage::disk($disk)->copy($source, $target);
    } catch (\Exception $e) {
        return null;
    }

    return $target;
}
```

`$target` starts with `projects/`, contains no `..` or `\0`, so it passes `isSafeImagePath()`.
The `project-ideas/` source path is never persisted into `projects.images`.

**Deletion cleanup already works, unchanged**: `ProjectService::delete()` calls
`deleteImages($project->images)`, which filters through `isSafeImagePath()` (requires the
`projects/` prefix) and then `Storage::disk($disk)->delete($path)`. A copied cover is an ordinary
`projects/<uuid>.<ext>` entry, so it is deleted on project delete and on `remove_images` exactly like
an uploaded image. No change needed.

### `project-idea-catalog.ts` additions

```ts
import { Bot, Copy, GraduationCap, Package, Wrench, type LucideIcon } from 'lucide-react'

export const PROJECT_IDEA_CATEGORY_GRADIENTS: Record<ProjectIdeaCategory, string> = {
    'herramientas-dev': 'from-amber-400/20 to-amber-600/20',
    clones: 'from-sky-400/20 to-sky-600/20',
    'alternativas-oss': 'from-emerald-400/20 to-emerald-600/20',
    'bots-automatizacion': 'from-violet-400/20 to-violet-600/20',
    aprendizaje: 'from-rose-400/20 to-rose-600/20',
}

export const PROJECT_IDEA_CATEGORY_ICONS: Record<ProjectIdeaCategory, LucideIcon> = {
    'herramientas-dev': Wrench,
    clones: Copy,
    'alternativas-oss': Package,
    'bots-automatizacion': Bot,
    aprendizaje: GraduationCap,
}
```

### `project-idea-card.tsx` skeleton

```tsx
const MAX_VISIBLE_TECHS = 3

export function ProjectIdeaCard({ idea, techNames, onSelect }: ProjectIdeaCardProps) {
    const FallbackIcon = PROJECT_IDEA_CATEGORY_ICONS[idea.category]
    const gradient = PROJECT_IDEA_CATEGORY_GRADIENTS[idea.category]
    const visibleTechs = techNames.slice(0, MAX_VISIBLE_TECHS)
    const overflowCount = Math.max(techNames.length - MAX_VISIBLE_TECHS, 0)

    return (
        <Card role="group" aria-label={idea.title} className="h-full pt-0">
            <div className="relative aspect-video w-full overflow-hidden">
                {idea.illustrationUrl ? (
                    <img
                        src={idea.illustrationUrl}
                        alt={`Ilustración de la idea: ${idea.title}`}
                        loading="lazy"
                        className="size-full object-cover"
                    />
                ) : (
                    <div
                        className={cn(
                            'flex size-full items-center justify-center bg-gradient-to-br',
                            gradient,
                        )}
                    >
                        <FallbackIcon aria-hidden="true" className="size-10 text-foreground/60" />
                    </div>
                )}
            </div>

            <CardHeader>
                <CardTitle>{idea.title}</CardTitle>
                <CardDescription className="line-clamp-2" title={idea.summary}>
                    {idea.summary}
                </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-3">
                {idea.difficulty ? (
                    <Badge variant="secondary" className="capitalize">
                        {idea.difficulty}
                    </Badge>
                ) : null}

                {visibleTechs.length > 0 ? (
                    <ul className="flex flex-nowrap items-center gap-2 overflow-hidden">
                        {visibleTechs.map((name) => (
                            <li key={name} className="min-w-0">
                                <Badge variant="outline" className="max-w-full truncate">
                                    {name}
                                </Badge>
                            </li>
                        ))}
                        {overflowCount > 0 ? (
                            <li className="shrink-0">
                                <Badge variant="outline">+{overflowCount}</Badge>
                            </li>
                        ) : null}
                    </ul>
                ) : null}
            </CardContent>

            <CardFooter>
                <Button
                    type="button"
                    size="sm"
                    aria-label={`Usar la idea: ${idea.title}`}
                    onClick={() => onSelect(idea)}
                >
                    Usar esta idea
                </Button>
            </CardFooter>
        </Card>
    )
}
```

A11y: `<img>` carries meaningful Spanish `alt`; the fallback icon is `aria-hidden` (the category is
already announced by the group heading and the card's `aria-label`); the clamped summary keeps
`title=` so the full sentence stays reachable. `rendering-conditional-render` — ternaries, not `&&`.

### `create.tsx` deltas

```ts
const form = useForm({ /* … */ images: [] as File[], idea_slug: '' })

const applyIdea = useCallback((idea: ProjectIdea) => {
    setData('title', idea.prefillTitle)
    setData('description', idea.prefillDescription)
    setData('vision', idea.prefillVision)
    setData('techs', idea.techIds)
    setData('idea_slug', idea.slug)
}, [setData])

// deep-link effect, pristine-guarded like the sibling fields
if (current.idea_slug === '') {
    setData('idea_slug', idea.slug)
}
```

## Asset Spec

`database/seeders/assets/project-ideas/<slug>.webp` — 1200×675 (16:9, matches the card's
`aspect-video`), WebP, ≤300 KB each. Filename stem is the exact seeded slug:

`cli-scaffold-proyectos`, `dashboard-metricas-repos`, `gestor-snippets-equipo`,
`clon-trello-kanban`, `clon-spotify-reproductor`, `clon-twitter-hilos`, `alternativa-linktree`,
`alternativa-notas-colaborativas`, `acortador-urls-self-hosted`, `bot-discord-comunidad`,
`bot-recordatorios-telegram`, `pipeline-reportes-automaticos`, `interprete-lenguaje-juguete`,
`motor-busqueda-mini`, `clon-redis-en-memoria`.

**The feature ships with 0 images committed.** Every card renders the gradient + icon fallback, which
is a valid terminal state, not a degraded one. Dropping files into the directory and re-running
`php artisan db:seed --class=ProjectIdeaSeeder` promotes them with no code change. Worst case at full
coverage: 15 × 300 KB ≈ 4.5 MB. A `README.md` in that directory documents the naming rule, the
dimensions/format/size cap, and the re-seed command (task in `sdd-tasks`).

## Testing Strategy (strict TDD — RED first)

| Layer | Target | Cases |
|---|---|---|
| Migration/Model | `tests/Feature/ProjectIdeaInspirationTest.php` | column exists + nullable, mass-assignable, rolls back |
| Seeder | same file | copy sets `illustration_path` under `Storage::fake('public')`; missing asset → `null`; **existing idempotency test still passes**; newly-added fake asset flips `null` → path on re-run |
| Transformer | `tests/Unit/Helpers/ApiResourceTransformerTest.php` | `projectIdeas()` emits `illustrationUrl` URL when set, `null` when not |
| Service | `tests/Unit/Services/ProjectServiceTest.php` | copies idea illustration to `projects/*` when no upload; upload wins; idea without illustration → `[]`; no `idea_slug` → `[]` |
| Request | `tests/Unit/Requests/Project/StoreProjectRequestTest.php` | `idea_slug` null passes, valid slug passes, unknown slug fails |
| Request (HTTP) | `tests/Feature/ProjectTest.php` | `POST /projects` with `idea_slug: ''` passes through `ConvertEmptyStringsToNull` |
| Component | `resources/js/components/projects/project-idea-inspiration.test.tsx` | `<img>` when `illustrationUrl` set; gradient + icon when `null`; summary has `line-clamp-2` + `title`; `+N` badge at 4+ techs |
| Page | `resources/js/pages/projects/create.test.tsx` | prefill key set is `{title, description, vision, techs, idea_slug}` |
| Catalog | `resources/js/lib/project-idea-catalog.test.ts` | both maps have exactly one entry per `PROJECT_IDEA_CATEGORY_ORDER` key |

**Seeder fake-disk gotcha**: the existing `test_seeder_is_idempotent_and_covers_every_category` does
**not** call `Storage::fake` today. Once the seeder writes files it must add
`Storage::fake('public')` + `config(['filesystems.media_disk' => 'public'])` in `setUp()` or the
suite writes into real `storage/app/public`. `syncIllustrations()` reads the source from the real
filesystem via `database_path()` and writes only through `Storage`, so faking the disk is sufficient.

**Empty-string gotcha**: `StoreProjectRequestTest::validateRequest()` calls
`Validator::make($data, $request->rules())` directly — no middleware. `nullable` skips only on
`null`, so passing `''` there would fail `exists`. Unit tests must assert `null`; the `''` case is
covered by the one feature-level HTTP test.

### Existing cases to update (will fail on landing)

1. `create.test.tsx:166` — `expect(new Set(keys)).toEqual(new Set(['title','description','vision','techs']))` → add `'idea_slug'`.
2. `ProjectIdeaInspirationTest` — payload shape assertions gain `illustrationUrl`; idempotency test gains `Storage::fake`.
3. `project-idea-inspiration.test.tsx` — `buildIdea()` factory gains `illustrationUrl: null`.
4. `project-idea-catalog.test.ts` — add map-completeness assertions.

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or
process-integration boundary. The only new I/O is same-disk Flysystem `put`/`copy` on
server-controlled paths (`project-ideas/<seeded-slug>.webp`, `projects/<uuid>.<ext>`). No user input
reaches a path: `idea_slug` is `exists`-validated and only selects a row, never a filename.

## Migration / Rollout

Additive nullable column, no backfill, no feature flag. `php artisan migrate` then
`php artisan db:seed --class=ProjectIdeaSeeder`. **File-level rollback confirmed**: revert the 13
touched files + `php artisan migrate:rollback`. Already-created projects keep their copied cover as
an ordinary `projects/<uuid>.webp` image — no data repair. Orphaned `project-ideas/*` media files are
harmless; delete the prefix if desired.

## Size Forecast

| Slice | Est. changed lines (add + del) |
|---|---|
| Backend production | ~115 |
| Frontend production | ~135 |
| Backend tests | ~265 |
| Frontend tests | ~130 |
| Asset README | ~20 |
| **Total** | **~665** |

Within the session's 800-line `single-pr` budget, but **well over the 400-line default reviewer
budget**. Committed binary assets are excluded from the line count (0 ship in this change).

- Decision needed before apply: No
- Chained PRs recommended: No
- 400-line budget risk: High (accepted under the session's explicit 800-line `single-pr` strategy)

**Contingency**: if `sdd-tasks` re-forecasts above 800, split on the backend/frontend seam —
PR #1 = migration, model, factory, seeder, transformer, request, service, README + backend tests
(independently shippable: the payload gains `illustrationUrl` and the current card simply ignores it);
PR #2 = types, catalog, card, contract, `create.tsx` + frontend tests. Each slice has a clean start,
a green `php artisan test` / `npm test` finish, and an independent revert.

## Open Questions

None. All `auto-force` assumptions are recorded in the proposal and honoured here.

## Key Learnings

1. The `Card` primitive's `has-[>img:first-child]:pt-0` selector does not match a `<div>` media wrapper, so the idea card must set `pt-0` explicitly.
2. Seeder upsert idempotency depends on a deterministic media-disk destination path, never a UUID.
3. `nullable` short-circuits on `null` only, so empty-string coverage belongs to a middleware-level HTTP test, not the rules-only unit helper.
4. Copying an idea illustration into the `projects/` namespace makes the existing `deleteImages` and `isSafeImagePath` cleanup work with no change.
5. The grid in `project-idea-category-group.tsx` already equalises row heights; the real fix is card-internal structural determinism.
