# Proposal: Project Idea Inspiration

Issue: [#181](https://github.com/matiassanchez12/the-dev-house/issues/181) — "Add project ideas and inspiration section to motivate creation."

## Intent

`/projects/create` opens on an empty form. Users who want to build something but have no concrete idea abandon the page — the blank-page problem suppresses first-project creation. V1 ships a curated, content-driven idea catalog inside the creation page that can prefill the form with one click. It is not a wizard and never gates creation.

## Scope

### In Scope
- `project_ideas` table + `project_idea_tech` pivot (linked to existing `techs`), `ProjectIdea` model + factory.
- `ProjectIdeaCategory` (required) and `ProjectIdeaDifficulty` (nullable) string-backed enums, `ProjectStatus` shape.
- `ProjectIdeaSeeder` with ~15 curated Spanish ideas; idempotent `upsert` by `slug`, runs after `TechSeeder`.
- Per-route `projectIdeas` prop on `ProjectController@create` (published only, ordered by category enum order then `sort_order`, each carrying suggested tech IDs).
- Collapsible inspiration block on `/projects/create` above `<ProjectForm>`, **collapsed by default**, grouped by category (empty groups skipped).
- Prefill: card click sets `title`, `description`, `vision`, `techs` via `useForm` `setData` and syncs `?idea=<slug>` with `history.replaceState`; `/projects/create?idea=<slug>` prefills once on mount, only into pristine fields.
- `is_published` + `sort_order` columns so a future admin panel is purely additive.

### Out of Scope
- Admin CRUD for ideas (deferred; columns ship now).
- Analytics / pick tracking.
- Guest-facing idea entry points (owned by #149 / #150) — `/projects/create` is auth-only.
- Any wizard, multi-step flow, or required idea selection.
- Changes to `ProjectController@store`, `StoreProjectRequest`, or `ProjectService::create`.
- Prefilling `repository_url`, `demo_url`, `images`.

## Capabilities

### New Capabilities
- `project-idea-inspiration`: curated idea catalog, its publication/ordering rules, and the prefill interaction on the creation page.

### Modified Capabilities
- None. The project creation contract (validation, persistence, redirect) is untouched.

## Approach

Content-as-data. Ideas are seeded rows, not code. `create()` returns one extra per-route prop (not shared props, keeping the query off every page); the client groups and renders it. Prefill is entirely client-side — no server round-trip, no prop churn — so an unused inspiration block costs the form nothing.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `database/migrations/` | New | `project_ideas`, `project_idea_tech` |
| `app/Enums/ProjectIdea{Category,Difficulty}.php` | New | String-backed, PascalCase cases, kebab values, `values()` |
| `app/Models/ProjectIdea.php` | New | `$casts` enums, `techs()`, `scopePublished` |
| `database/factories/ProjectIdeaFactory.php` | New | Unique slug/title, random enum values |
| `database/seeders/ProjectIdeaSeeder.php` | New | ~15 Spanish ideas, `syncWithoutDetaching` techs |
| `database/seeders/DatabaseSeeder.php` | Modified | Register after `TechSeeder` |
| `app/Http/Controllers/ProjectController.php` | Modified | `create()` gains `projectIdeas` prop |
| `resources/js/pages/projects/create.tsx` | Modified | Render block, read `?idea=`, wire prefill |
| `resources/js/components/projects/project-idea-*.tsx` | New | Inspiration block + idea card |
| `resources/js/components/ui/collapsible.tsx` | New | `npx shadcn@latest add collapsible` |
| `resources/js/types/index.ts` | Modified | `ProjectIdea` type + unions |
| `tests/Feature/ProjectIdeaInspirationTest.php` | New | `create` prop shape, published/order filtering |
| `resources/js/pages/projects/create.test.tsx` | New | Collapsed default, prefill, pristine-only |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Prefilled `title` collides with `Rule::unique` on `projects.title` | Med | Keep validation as-is; `prefill_title` is an editable suggestion, UI nudges personalization |
| On-mount prefill clobbers user edits after a manual reload | Med | Seed once, only into still-pristine fields |
| Seeded tech slug missing from `techs` | Low | Seeder skips unknown slugs silently |
| Extra query on `create` route | Low | ~15 rows, per-route prop, not shared |

## Rollback Plan

1. Revert `ProjectController@create` to `Inertia::render('projects/create')` (drops the prop; the page tolerates a missing/empty list).
2. Revert `create.tsx` and delete the inspiration components + `collapsible.tsx`.
3. Remove `ProjectIdeaSeeder` from `DatabaseSeeder::run()`.
4. `php artisan migrate:rollback` the two migrations (drop `project_idea_tech` first, then `project_ideas`). Both tables are new and standalone — no `projects`, `techs`, or user data is touched, so rollback is non-destructive.
5. Delete the model, factory, enums, seeder, and new tests.

Steps 1–3 are sufficient to disable the feature without any schema change.

## Dependencies

- Existing `techs` table and `TechSeeder` (must run first).
- shadcn `collapsible` (not yet installed).

## Success Criteria

- [ ] (#181) An authenticated user reaching `/projects/create` has at least one visible source of project ideas before/during creation.
- [ ] (#181) Ideas are grouped meaningfully by category, with difficulty shown as a badge; empty categories are not rendered.
- [ ] (#181) Each idea offers a clear CTA that carries the user into creation by prefilling `title`, `description`, `vision`, and `techs`.
- [ ] (#181) Project creation still works exactly as before for a user who never opens or uses the inspiration block.
- [ ] The block is collapsed by default and requires no interaction to submit the form.
- [ ] `/projects/create?idea=<slug>` prefills once and never overwrites fields the user already edited.
- [ ] Only `is_published` ideas are returned, ordered by category enum order then `sort_order`.
- [ ] `php artisan db:seed` is idempotent and skips tech slugs that do not exist.

## Assumptions (auto-force mode, no question round)

1. Seed idea copy is Spanish (matching the app UI); all code identifiers and comments are English.
2. "Grouped meaningfully" (#181) is satisfied by the five locked categories; no search or filtering in V1.
3. Difficulty may be null for an idea; the badge is simply omitted.
