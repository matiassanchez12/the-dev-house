# Proposal: Project Idea Illustrations and Card Layout Consistency

Follow-up to the merged `project-idea-inspiration` change (issue #181). Two improvements to the same component, shipped together.

## Intent

**A — Illustrations.** Idea cards on `/projects/create` are text-only. Ideas are hard to scan and nothing carries over into the created project, so new projects land on `/projects` with the generic gradient fallback. Each idea gets a stored illustration rendered behind a themed fade, and that image becomes the project's **default cover** when the creator uploads no image of their own.

**B — Card layout.** `summary` is `string(500)` and unclamped. One long summary inflates its whole grid row, leaving large blank gaps in sibling cards; optional difficulty badge and variable tech counts add more wobble. Cards must be uniform height regardless of text length, badge presence, tech count, or illustration availability.

## Scope

### In Scope
- Nullable `project_ideas.illustration_path` (string); factory default `null`.
- Seeder copies committed source assets to the media disk at a deterministic path and sets the column; missing source → `null`.
- `illustrationUrl` added to the `projectIdeas` Inertia payload and the TS `ProjectIdea` type.
- Fixed-aspect media block above `CardHeader`, with per-category gradient + lucide icon fallback.
- `idea_slug` on the creation form, validated in `StoreProjectRequest`, consumed in `ProjectService::create` as a cover fallback.
- Uniform card height: clamped summary, fixed media aspect, `flex-1` content, single-line tech row with `+N` overflow.
- **In-scope test updates for existing suites that break on landing** (see Acceptance Criteria).

### Out of Scope (non-goals)
- No `cover_path` column — `images[0]` remains the cover convention.
- No admin/CRUD UI for uploading or replacing idea illustrations (seeder-only in V1).
- No change to project image gallery behavior beyond the create-time cover fallback.
- No analytics or idea-usage tracking.
- No redesign of the `/projects` index cards.
- No clearing of `idea_slug` when the user edits fields away from the idea.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `project-idea-inspiration`: idea payload gains `illustrationUrl`; card gains a fixed-aspect media block with per-category fallback and deterministic height; prefill gains `idea_slug`; seeding gains idempotent illustration asset copy; project creation gains an idea-derived default cover.

## Approach

1. **Storage.** Source files committed at `database/seeders/assets/project-ideas/<slug>.webp` (1200×675 webp, ≤300KB). `ProjectIdeaSeeder` reads each present file with `file_get_contents(database_path(...))` and writes it via `Storage::disk(config('filesystems.media_disk','public'))->put('project-ideas/<slug>.webp', ...)`, then sets `illustration_path` to that deterministic path. Deterministic destination keeps the upsert idempotent (stable row/pivot counts) while newly-added source files flip `null` → path on the next run. `Storage::fake`-compatible.
2. **Exposure.** `ApiResourceTransformer::projectIdeas()` maps `illustration_path` through `StorageUrlHelper::url(..., mediaDisk())` into `illustrationUrl`.
3. **Card.** The image renders in a fixed `aspect-video` block **above** `CardHeader`; header/content keep `bg-card` so text never sits on photography. The fade only blends the image's bottom edge. Null illustration → per-category gradient + centered lucide icon from `resources/js/lib/project-idea-catalog.ts`. Theme awareness comes from token flip (`--card`/`--background`, oklch `.dark`) — no `dark:` color overrides, no Tailwind v3 config.
4. **Cover.** The form carries `idea_slug`. `StoreProjectRequest` adds `idea_slug => nullable|string|exists:project_ideas,slug`. In `ProjectService::create`, immediately after `uploadImages` and before persisting: if the uploaded-images array is empty **and** `idea_slug` resolves to an idea with a non-null `illustration_path`, copy that media-disk file to a fresh per-project path `projects/<uuid>.webp` (must pass `isSafeImagePath`) and set it as `images[0]`. Uploaded images always win.
5. **Layout.** `summary` → `line-clamp-2` + `title={idea.summary}` (full text still reaches the form via `prefillDescription`). `CardContent` gets `flex-1` so the footer bottom-aligns. Tech badge row clamps to one line with a `+N` overflow badge, mirroring `ProjectCardTechs`. Every card becomes `[fixed media][title][2-line summary][badge row][tech row][footer]`.
6. **Language.** Code identifiers and comments in English; user-facing copy in Spanish.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `database/migrations/<new>_add_illustration_path_to_project_ideas_table.php` | New | Nullable string column + `down()` drop |
| `app/Models/ProjectIdea.php` | Modified | `illustration_path` added to `$fillable` |
| `database/factories/ProjectIdeaFactory.php` | Modified | Default `illustration_path => null` |
| `database/seeders/assets/project-ideas/` | New | Committed `<slug>.webp` source assets |
| `database/seeders/ProjectIdeaSeeder.php` | Modified | Idempotent asset copy + column in upsert |
| `app/Helpers/ApiResourceTransformer.php` | Modified | `projectIdeas()` emits `illustrationUrl` |
| `app/Http/Requests/Project/StoreProjectRequest.php` | Modified | `idea_slug` rule + Spanish message |
| `app/Services/ProjectService.php` | Modified | Idea-derived cover fallback in `create()` |
| `resources/js/types/index.ts` | Modified | `ProjectIdea.illustrationUrl: string \| null` |
| `resources/js/lib/project-idea-catalog.ts` | Modified | Per-category gradient + lucide icon maps |
| `resources/js/components/projects/project-idea-card.tsx` | Modified | Media block, clamped summary, `flex-1`, tech overflow |
| `resources/js/pages/projects/create.tsx` | Modified | `idea_slug` in `useForm`, `applyIdea`, deep-link effect |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Seeder file writes leak into `storage/app/public` during tests | Med | Add `Storage::fake('public')` + `media_disk` config to the seeder idempotency test |
| Non-deterministic destination breaks upsert idempotency | Low | Destination is fixed at `project-ideas/<slug>.webp` |
| Committed images inflate repo size | Med | 1200×675 webp, ≤300KB each; cap enforced in review; missing files degrade to gradient |
| Text contrast over arbitrary photography | Low | Image sits in its own block above the header; text never overlays it |
| Copied cover path rejected by `isSafeImagePath` | Low | Destination is under `projects/`; the `project-ideas/` source path is never persisted as an image |

## Rollback Plan

1. **Migration**: `php artisan migrate:rollback` (or revert the single migration) drops `illustration_path`. No other table or column is touched; existing rows are unaffected.
2. **Seeder**: reverting `ProjectIdeaSeeder` restores the previous upsert column list. Copied media-disk files under `project-ideas/` become orphaned but harmless; delete the prefix if desired. Committed source assets are removed with the branch.
3. **`store()` behavior**: reverting `ProjectService::create` and `StoreProjectRequest` restores the previous behavior (empty `images` when nothing is uploaded). Already-created projects keep their copied cover under `projects/<uuid>.webp`, which is an ordinary project image — no data repair needed.
4. **Frontend**: reverting `project-idea-card.tsx`, `project-idea-catalog.ts`, `types/index.ts`, and `create.tsx` restores the previous card. `illustrationUrl` and `idea_slug` are additive and optional, so a partial revert never breaks the payload contract.
5. Full rollback is a single `git revert` of the feature branch merge plus one migration rollback.

## Dependencies

- Merged `project-idea-inspiration` (#181) on `development`.
- `lucide-react` and existing shadcn `Card`/`Badge`/`Button` (already installed).
- Laravel default `ConvertEmptyStringsToNull` middleware.

## Acceptance Criteria

- [ ] Migration adds nullable `project_ideas.illustration_path` and rolls back cleanly.
- [ ] Seeder copies every present `<slug>.webp` to `project-ideas/<slug>.webp` on the media disk, sets the column, leaves `null` when the source is missing, and remains idempotent (stable row and pivot counts across repeated runs).
- [ ] `projectIdeas` payload includes `illustrationUrl` (URL when set, `null` otherwise).
- [ ] Card renders the image in a fixed `aspect-video` block above `CardHeader`; the per-category gradient + icon fallback renders in the same block when `illustrationUrl` is `null`.
- [ ] Theming works in light and dark with no `dark:` color overrides and no `tailwind.config.js`.
- [ ] Image has meaningful `alt` text; fallback icon is `aria-hidden`; summary keeps `title=` for full text.
- [ ] All cards in a grid row have identical height regardless of summary length, difficulty badge, tech count, or illustration presence.
- [ ] Creating a project from an idea with no uploaded image sets `images[0]` to a copy under `projects/`; uploading an image always wins; an idea without an illustration yields `images = []`.
- [ ] `idea_slug` is validated as `nullable|string|exists:project_ideas,slug` and empty string is accepted.
- [ ] **Existing tests updated in-scope** (these break on landing): `create.test.tsx` prefill key-set assertion gains `idea_slug`; `ProjectIdeaInspirationTest` and `project-idea-inspiration.test.tsx` factories/payload gain `illustrationUrl`; `ProjectServiceTest` gains the four cover-fallback cases; `ApiResourceTransformerTest` gains `illustrationUrl` coverage.
- [ ] `php artisan test` and `npm test` pass; `npm run build` succeeds.

## Assumptions

Recorded under `auto-force` execution mode — no blocking questions were raised.

1. The 15 seeded idea slugs are the illustration filename stems; the asset directory ships with whatever subset is ready, and missing files degrade gracefully to gradient + icon.
2. Media-disk destination is the deterministic `project-ideas/<slug>.webp`, kept separate from user uploads under `projects/`.
3. **`idea_slug` intentionally persists** after the user edits fields away from the idea. A project created with no upload still derives its cover from that idea. This is accepted, not a defect: the cover stays on-topic and is editable later. Clearing `idea_slug` on manual edits was considered and rejected.
4. Laravel's default `ConvertEmptyStringsToNull` middleware is active, so `idea_slug: ''` from `forceFormData` becomes `null` before validation and `nullable` short-circuits `exists`.
5. Repo-size budget: 15 images × ≤300KB ≈ 4.5MB worst case. The 1200×675 webp cap is enforced during review; shipping a subset first is acceptable.
6. `summary` clamps to two lines; the tech row clamps to one line with a `+N` overflow badge for full height determinism.
7. Lucide icons are imported as components into typed `Record<ProjectIdeaCategory, LucideIcon>` maps (shadcn "pass icons as objects" rule); gradients follow the existing low-opacity `from-*-400/20 to-*-600/20` style.
8. Single PR (`single-pr`, 800-line review budget). Backend and frontend are coupled through the payload field, so chaining would produce an unshippable intermediate state.
