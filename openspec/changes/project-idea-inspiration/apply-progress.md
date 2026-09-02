# Apply Progress: project-idea-inspiration

## Slice 1 — Backend (PR1) — DONE

**Branch**: `feat/project-idea-inspiration-backend` → base `development`
**PR1**: https://github.com/matiassanchez12/the-dev-house/pull/232
**Mode**: Strict TDD

### Tasks complete (Phases 1-5)

- [x] 1.1 `database/migrations/2026_09_02_000100_create_project_ideas_table.php`
- [x] 1.2 `database/migrations/2026_09_02_000200_create_project_idea_tech_table.php` (sorts after 1.1)
- [x] 1.3 `app/Enums/ProjectIdeaCategory.php` (herramientas-dev, clones, alternativas-oss, bots-automatizacion, aprendizaje)
- [x] 1.4 `app/Enums/ProjectIdeaDifficulty.php` (principiante, intermedio, avanzado)
- [x] 2.1 `app/Models/ProjectIdea.php` — $fillable, $casts, techs() BelongsToMany, scopePublished(Builder)
- [x] 2.2 `database/factories/ProjectIdeaFactory.php`
- [x] 3.1-3.5 `tests/Feature/ProjectIdeaInspirationTest.php` — 7 tests / 39 assertions (RED first, then GREEN)
- [x] 4.1 `ApiResourceTransformer::projectIdeas(Collection): array` — camelCase payload, techIds, PHP category-order sort
- [x] 4.2 `ProjectController@create` — per-route `projectIdeas` prop (store() untouched)
- [x] 4.3 `database/seeders/ProjectIdeaSeeder.php` — 15 ideas, upsert by slug, syncWithoutDetaching
- [x] 4.4 `database/seeders/DatabaseSeeder.php` — ProjectIdeaSeeder after TechSeeder, before UserSeeder
- [x] 4.5 `php artisan test` + `pint --dirty`
- [x] 5.1 Slice 1 acceptance — PR1 opened

### Test results

`php artisan test`: **534 passed, 1 failed** (2150 assertions).
Failure = `MilestonesReadStateTest > milestones index shows unread...` — PRE-EXISTING and unrelated
(verified failing on `development` with all branch edits reverted).
`ProjectTest`: 30 passed. `ProjectIdeaInspirationTest`: 7 passed. `pint --dirty`: passed.

### TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1.1-2.2 (scaffold) | ProjectIdeaInspirationTest.php | Feature | N/A (new) | ✅ via 3.x | ✅ | ➖ structural | ➖ |
| 3.1 / 4.2 published-only prop | ProjectIdeaInspirationTest.php | Feature | N/A (new) | ✅ `Property [projectIdeas] does not exist` | ✅ | ✅ published + unpublished rows | ➖ |
| 3.2 / 4.1 ordering | ProjectIdeaInspirationTest.php | Feature | N/A (new) | ✅ `Undefined array key projectIdeas` | ✅ | ✅ 4 shuffled rows, 3 categories | ➖ |
| 3.3 / 4.1 techIds | ProjectIdeaInspirationTest.php | Feature | N/A (new) | ✅ | ✅ | ✅ linked + unlinked idea | ➖ |
| 3.4 casting | ProjectIdeaInspirationTest.php | Feature | N/A (new) | ✅ (passed early — model structural) | ✅ | ➖ single | ➖ |
| 3.5 / 4.3 seeder idempotency | ProjectIdeaInspirationTest.php | Feature | N/A (new) | ✅ `Target class [ProjectIdeaSeeder] does not exist` | ✅ | ✅ double-run + per-category + unknown-slug | ➖ |

### Deviations from design

- None material. Seeder Spanish sentences authored from the design's per-idea briefs (design supplied slug/title/category/difficulty/tech list + copy rules, not full prose). Titles match the design table verbatim.
- `summary` kept ≤ 200 chars, `prefill_description` ≤ ~450 chars (design open question resolved conservatively toward the ≤ 200 / ≤ 1000 bounds).

### Deferred to Slice 2 (frontend, PR2 → this branch)

- Phases 6-10: `npx shadcn add collapsible`, `types/index.ts` additions, `lib/project-idea-catalog.ts`,
  `project-idea-card.tsx`, `project-idea-category-group.tsx`, `project-idea-inspiration.tsx`,
  wire `create.tsx` (prop consume, card-click handler, `?idea=` mount effect, aria-live),
  `create.test.tsx`, `npm run build`.

### Doubts & assumptions (running list)

1. Prefilled `title` may collide with `Rule::unique` on `projects.title`; mitigated by copy only — no new validation handling.
2. `window.history.replaceState` for `?idea=` sync has no in-repo precedent (slice 2).
3. Feature branches target `development`, not `master` (verified via PRs #227-229).
4. Change ships as 2 chained PRs despite `single-pr` strategy because the design size forecast (~1,150 lines) exceeds budget.
5. `summary` ≤ 200 chars and `prefill_description` ≤ ~450 chars so a prefilled description always passes `StoreProjectRequest` `max:1000`.
6. Migration timestamps `2026_09_02_0001/0002` chosen to sort after the latest existing migration; pivot after `project_ideas`.
7. `sdd-attempt acquire` continuation returned `invalid_continuation` while `sdd-attempt status` shows the attempt `running` on the parent's exact token/revision — treated as a non-blocking ledger quirk under auto-force; parent owns settle.
8. Seeder Spanish copy authored fresh from design briefs.
9. `ProjectIdeaFactory` uses `fake()->unique()->slug(4)` + `fake()->optional()` for difficulty/vision.
10. `php artisan migrate:fresh --seed` not run against the local dev DB (would destroy local data); the Feature test exercises the real HTTP + seeder path instead.

### `// REVIEW(project-idea-inspiration:...)` comments left

None.
