# Tasks: Project Idea Illustrations and Card Layout Consistency

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~665 (add + del): backend prod ~115, frontend prod ~135, backend tests ~265, frontend tests ~130, README ~20 |
| 400-line budget risk | High |
| Chained PRs recommended | No |
| Suggested split | Single PR `feat/project-idea-illustrations` → `development` |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: High

Backend and frontend are coupled through the `illustrationUrl` payload field; a split would ship an
unrenderable intermediate state. Accepted under the session's explicit 800-line `single-pr` budget
(665 < 800). Contingency only if apply re-forecasts above 800: split on the backend/frontend seam.

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Column + model + factory + seeder asset copy | PR 1 | `php artisan test --filter=ProjectIdeaInspirationTest` | `php artisan migrate --pretend` then `php artisan db:seed --class=ProjectIdeaSeeder` | migration + `ProjectIdea`/factory/seeder diff + `migrate:rollback` |
| 2 | Payload `illustrationUrl` + request rule + service cover | PR 1 | `php artisan test --filter='ApiResourceTransformerTest\|StoreProjectRequestTest\|ProjectServiceTest'` | `POST /projects` feature test | transformer + request + service diff |
| 3 | Types + catalog maps + card redesign + create wiring | PR 1 | `npm test -- project-idea` | `npm run build` + `npx tsc --noEmit` | `resources/js` diff only |

## Phase 1: Backend Foundation — column, model, factory (Req: Idea catalog data and exposure)

- [x] 1.1 RED: in `tests/Feature/ProjectIdeaInspirationTest.php` add a test asserting `project_ideas.illustration_path` exists, is nullable, is mass-assignable on `ProjectIdea`, and that `migrate:rollback` drops it.
- [x] 1.2 Create `database/migrations/<ts>_add_illustration_path_to_project_ideas_table.php`: `$table->string('illustration_path')->nullable()->after('prefill_vision');` + `down()` `dropColumn('illustration_path')`. No index.
- [x] 1.3 Add `'illustration_path'` to `$fillable` in `app/Models/ProjectIdea.php`. No cast.
- [x] 1.4 Add `'illustration_path' => null` to `database/factories/ProjectIdeaFactory.php` definition. Run 1.1 → GREEN.

## Phase 2: Seeder asset pipeline (Req: Idempotent seeding covering all categories)

- [x] 2.1 Create `database/seeders/assets/project-ideas/README.md`: asset spec — `<slug>.webp`, 1200×675 (16:9), WebP, ≤300 KB; list the 15 slugs; state "0 committed → gradient + icon fallback is a valid terminal state"; re-seed command `php artisan db:seed --class=ProjectIdeaSeeder`. Keeps the dir tracked.
- [x] 2.2 RED: in `ProjectIdeaInspirationTest` add `setUp()` `Storage::fake('public')` + `config(['filesystems.media_disk' => 'public'])`; add a test that with a fake asset written to `database_path('seeders/assets/project-ideas/<slug>.webp')` the seeder puts `project-ideas/<slug>.webp` on the disk and sets that idea's `illustration_path` to it, while a slug with no source keeps `illustration_path` null.
- [x] 2.3 RED: add a test that re-running the seeder after adding a previously-absent fake asset flips that idea's `illustration_path` from `null` to `project-ideas/<slug>.webp` while `project_ideas` row count and `project_idea_tech` pivot count stay stable.
- [x] 2.4 RED: update the existing `test_seeder_is_idempotent_and_covers_every_category` to run under the faked disk (2.2 `setUp`) and keep asserting stable row + pivot counts.
- [x] 2.5 Add `syncIllustrations(array $slugs, Collection $existing): array` to `database/seeders/ProjectIdeaSeeder.php` per design: `$disk = config('filesystems.media_disk','public')`; per slug read `database_path("seeders/assets/project-ideas/{$slug}.webp")`; missing source → `$existing[$slug] ?? null`; present → `Storage::disk($disk)->put("project-ideas/{$slug}.webp", (string) file_get_contents($source))` and resolve to that path.
- [x] 2.6 In `ProjectIdeaSeeder::run()` before the `array_map`: `$existing = ProjectIdea::query()->pluck('illustration_path','slug')`; `$illustrations = $this->syncIllustrations(array_column($ideas,'slug'), $existing)`; inside the row map set `'illustration_path' => $illustrations[$idea['slug']] ?? null`; add `illustration_path` to the upsert update-columns list. Run 2.2–2.4 → GREEN.

## Phase 3: Payload exposure (Req: Idea catalog data and exposure)

- [x] 3.1 RED: in `tests/Unit/Helpers/ApiResourceTransformerTest.php` add cases — `projectIdeas()` emits a non-null `illustrationUrl` URL string when `illustration_path` is set, and `illustrationUrl === null` when it is null.
- [x] 3.2 In `app/Helpers/ApiResourceTransformer.php` `projectIdeas()` add `'illustrationUrl' => $idea->illustration_path ? StorageUrlHelper::url($idea->illustration_path, self::mediaDisk()) : null`. Run 3.1 → GREEN.

## Phase 4: Request validation (Req: Project creation non-regression)

- [x] 4.1 RED: in `tests/Unit/Requests/Project/StoreProjectRequestTest.php` add rules-only cases — `idea_slug` null passes, an existing slug passes, an unknown non-empty slug fails with an `exists` error.
- [x] 4.2 RED: in `tests/Feature/ProjectTest.php` add one HTTP test that `POST /projects` with `idea_slug: ''` passes validation (empty string normalized to null by `ConvertEmptyStringsToNull`).
- [x] 4.3 In `app/Http/Requests/Project/StoreProjectRequest.php` add `'idea_slug' => ['nullable','string','exists:project_ideas,slug']` and message `'idea_slug.exists' => 'La idea seleccionada no es válida.'`. No other rule changes. Run 4.1–4.2 → GREEN.

## Phase 5: Idea-derived default cover (Req: Idea-derived default project cover)

- [x] 5.1 RED: in `tests/Unit/Services/ProjectServiceTest.php` (faked media disk) add the four cases — (a) `idea_slug` for an idea with `illustration_path`, no upload → `images[0]` is a copy under `projects/` satisfying `isSafeImagePath`; (b) same idea + one upload → `images` is only the upload, no copy; (c) idea with null `illustration_path`, no upload → `images === []`; (d) no `idea_slug`, no upload → `images === []`, path matches pre-change behavior.
- [x] 5.2 Add `resolveIdeaCoverPath(string $ideaSlug): ?string` to `app/Services/ProjectService.php` per design: load idea by slug; null idea or null `illustration_path` → null; `Storage::disk($disk)->exists($source)` guard → null; `$target = 'projects/'.Str::uuid().'.'.(pathinfo($source, PATHINFO_EXTENSION) ?: 'webp')`; `try { Storage::disk($disk)->copy($source, $target); } catch (\Exception) { return null; }`; return `$target`.
- [x] 5.3 In `ProjectService::create()` after `uploadImages`, before persist: if `empty($imagePaths) && ! empty($data['idea_slug'])` then `$coverPath = $this->resolveIdeaCoverPath($data['idea_slug']); if ($coverPath !== null) { $imagePaths = [$coverPath]; }`. Run 5.1 → GREEN.

## Phase 6: Frontend types and catalog (Req: Inspiration prefill and catalog non-regression)

- [x] 6.1 In `resources/js/types/index.ts` add `illustrationUrl: string | null` to the `ProjectIdea` type.
- [x] 6.2 In `resources/js/components/projects/project-form-contract.ts` add `idea_slug?: string` beside the existing optional extras. Do NOT add it to `createProjectFormData()`.
- [x] 6.3 RED: in `resources/js/lib/project-idea-catalog.test.ts` add assertions that `PROJECT_IDEA_CATEGORY_GRADIENTS` and `PROJECT_IDEA_CATEGORY_ICONS` each have exactly one entry per `PROJECT_IDEA_CATEGORY_ORDER` key.
- [x] 6.4 In `resources/js/lib/project-idea-catalog.ts` add `PROJECT_IDEA_CATEGORY_GRADIENTS: Record<ProjectIdeaCategory, string>` (the 5 `from-<hue>-400/20 to-<hue>-600/20` strings from the design table, no `dark:`) and `PROJECT_IDEA_CATEGORY_ICONS: Record<ProjectIdeaCategory, LucideIcon>` (`Wrench`, `Copy`, `Package`, `Bot`, `GraduationCap` imported as components). Run 6.3 → GREEN.

## Phase 7: Card redesign (Req: Inspiration block rendering on creation page)

- [x] 7.1 RED: in `resources/js/components/projects/project-idea-inspiration.test.tsx` extend `buildIdea()` with `illustrationUrl: null` and add cases — renders `<img>` with non-empty Spanish `alt` when `illustrationUrl` is set; renders gradient `<div>` + `aria-hidden` category icon when null; summary element has `line-clamp-2` and a `title` attribute; a 4+ tech idea shows a `+N` badge.
- [x] 7.2 Rewrite `resources/js/components/projects/project-idea-card.tsx` per the design JSX skeleton: `<Card className="h-full pt-0">`; leading `<div className="relative aspect-video w-full overflow-hidden">` holding `<img loading="lazy" className="size-full object-cover">` or the gradient `<div>` + `<FallbackIcon aria-hidden className="size-10 text-foreground/60">`; `CardDescription` `line-clamp-2` + `title={idea.summary}`; `CardContent` `flex flex-1 flex-col gap-3`; one-line tech `<ul>` with `MAX_VISIBLE_TECHS = 3`, `visibleTechs`, `overflowCount` and a `+{overflowCount}` `Badge`; footer pinned bottom. Ternaries only, no `&&`. Run 7.1 → GREEN.

## Phase 8: Create page wiring (Req: Prefill from card click; Deep-link prefill)

- [x] 8.1 RED: update `resources/js/pages/projects/create.test.tsx` prefill-key-set assertion to `new Set(['title','description','vision','techs','idea_slug'])`.
- [x] 8.2 In `resources/js/pages/projects/create.tsx`: add `idea_slug: ''` to `useForm`; in `applyIdea` add `setData('idea_slug', idea.slug)` alongside the four existing fields; in the `?idea=` deep-link effect add `if (current.idea_slug === '') setData('idea_slug', idea.slug)` under the existing pristine guard. Run 8.1 → GREEN.

## Phase 9: Regression test alignment (Req: Regression test alignment)

- [x] 9.1 `tests/Feature/ProjectIdeaInspirationTest.php` — payload assertions include `illustrationUrl`; the "only published ideas" / ordering scenarios still pass with the new field present. (Idempotency + fake disk already handled in Phase 2.)
- [x] 9.2 `resources/js/components/projects/project-idea-inspiration.test.tsx` — confirm every `buildIdea()` call carries `illustrationUrl` and existing grouping/collapse scenarios still pass.
- [x] 9.3 `tests/Unit/Services/ProjectServiceTest.php` — existing "no images" create scenarios still assert `images === []` and unchanged redirect (case d from 5.1 covers this; verify no other case regressed).
- [x] 9.4 `tests/Unit/Helpers/ApiResourceTransformerTest.php` — existing `projectIdeas()` shape assertions updated to include `illustrationUrl`.
- [x] 9.5 `resources/js/pages/projects/create.test.tsx` — existing deep-link and card-click scenarios still pass with `idea_slug` in the form state.

## Phase 10: Final acceptance

- [x] 10.1 `php artisan test` fully green. (552 passed, 2191 assertions)
- [x] 10.2 `npm test` fully green. (45 files, 161 passed)
- [x] 10.3 `npm run build` succeeds. (built in 6.41s)
- [x] 10.4 `npx tsc --noEmit` clean for the touched scope. (exit 0)
- [x] 10.5 `./vendor/bin/pint --dirty` clean. (passed)

## Doubts & assumptions (for the PR body)

- `idea_slug` persists after manual edits — a no-upload project still takes its cover from the idea. Intentional (proposal assumption 3), not a defect.
- A source asset removed after a seed run leaves a stale `illustration_path` pointing at orphaned media. Accepted and documented.
- Repo grows ~4.5 MB if all 15 webp assets are later committed (15 × ≤300 KB).
- `ProjectService` gains its first `ProjectIdea` dependency.
- The `project-idea-inspiration` capability spec is still unarchived; this change modifies it in place.

## Key Learnings

1. The `Card` primitive's `has-[>img:first-child]:pt-0` selector cannot match a `<div>` media wrapper, so the idea card sets `pt-0` explicitly.
2. Seeder upsert idempotency depends on the deterministic `project-ideas/<slug>.webp` destination, never a per-run UUID.
3. `nullable` short-circuits on `null` only, so the empty-string `idea_slug` case needs a middleware-level HTTP test, not the rules-only unit helper.
4. Copying the idea illustration into the `projects/` namespace makes existing `deleteImages` / `isSafeImagePath` cleanup work with no change.
5. Backend and frontend cannot be chained here because they are coupled through the additive `illustrationUrl` payload field.
