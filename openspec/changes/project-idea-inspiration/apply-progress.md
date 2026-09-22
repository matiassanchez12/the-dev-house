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

---

## Slice 2 — Frontend (PR2) — DONE

**Branch**: `feat/project-idea-inspiration-frontend` → base `feat/project-idea-inspiration-backend`
**PR2**: https://github.com/matiassanchez12/the-dev-house/pull/233
**Mode**: Strict TDD

### Tasks complete (Phases 6-10)

- [x] 6.1 `npx shadcn@latest add collapsible` → `resources/js/components/ui/collapsible.tsx` (base-ui)
- [x] 6.2 `resources/js/types/index.ts` — `ProjectIdea` interface + `ProjectIdeaCategory` / `ProjectIdeaDifficulty` unions
- [x] 6.3 `resources/js/lib/project-idea-catalog.ts` — `PROJECT_IDEA_CATEGORY_ORDER`, `PROJECT_IDEA_CATEGORY_LABELS`, `groupIdeasByCategory()` + `project-idea-catalog.test.ts` (4 tests)
- [x] 7.1 `resources/js/components/projects/project-idea-card.tsx` — `Card role="group"`, difficulty `Badge` only when present, CTA `Button aria-label="Usar la idea: {title}"`
- [x] 7.2 `resources/js/components/projects/project-idea-category-group.tsx` — heading + card grid, resolves tech names via `techNamesById`
- [x] 7.3 `resources/js/components/projects/project-idea-inspiration.tsx` — collapsed-by-default `Collapsible`, `techNamesById` `Map` built once, empty groups omitted, `null` when no groups + `project-idea-inspiration.test.tsx` (5 tests)
- [x] 8.1 `create.tsx` consumes `projectIdeas` prop (default `[]`), renders `<ProjectIdeaInspiration>` above `<ProjectForm>`; `ProjectForm` contract untouched
- [x] 8.2 card-click handler — `setData` x4 (title/description/vision/techs), `window.history.replaceState('', '', ?idea=slug)`, `getElementById('title').focus()`, `role="status" aria-live="polite"` announcement
- [x] 8.3 on-mount `?idea=` effect — `useRef(false)` single-shot, pristine-only per field, unknown slug returns silently
- [x] 9.1-9.5 `resources/js/pages/projects/create.test.tsx` (5 tests)
- [x] 10.1 `npm test` + `npm run build` green

### Test results

`npm test` (vitest): **156 passed, 4 failed** across 45 files.
The 4 failures are all in `resources/js/pages/profile/partials/update-profile-complete-form.test.tsx` —
PRE-EXISTING and unrelated (verified failing identically on the base branch `feat/project-idea-inspiration-backend`
with none of this slice's files present).
New files: `project-idea-catalog.test.ts` 4/4, `project-idea-inspiration.test.tsx` 5/5, `create.test.tsx` 5/5.
`npm run build` (`vite build`): **green**, built in ~6.5s (`create-*.js` 12.84 kB / gzip 5.25 kB).
`npx tsc --noEmit`: 0 errors. `prettier -w` run on all new files.

### TDD Cycle Evidence (Slice 2)

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 6.3 catalog lib | project-idea-catalog.test.ts | Unit | N/A (new) | ✅ imports missing exports | ✅ 4 pass | ✅ order + empty-group + no-ideas | ➖ |
| 7.1 card | project-idea-inspiration.test.tsx | Component | N/A (new) | ✅ imports missing `ProjectIdeaCard` | ✅ | ✅ difficulty present/null + CTA callback | ➖ |
| 7.3 inspiration | project-idea-inspiration.test.tsx | Component | N/A (new) | ✅ imports missing `ProjectIdeaInspiration` | ✅ | ✅ null render + grouped headings + tech-name resolve | ➖ |
| 8.1-8.3 wire create | create.test.tsx | Page/Integration | N/A (new file); page component pre-existed | ✅ props/behavior not implemented | ✅ 5 pass | ✅ collapsed + expand + card-click keys + deep-link pristine + unknown slug | ➖ |

### Files changed (Slice 2)

| File | Action | What |
|------|--------|------|
| `resources/js/components/ui/collapsible.tsx` | Created | shadcn `collapsible` (base-ui) |
| `resources/js/types/index.ts` | Modified | `ProjectIdea` + 2 string unions |
| `resources/js/lib/project-idea-catalog.ts` | Created | category order/labels + `groupIdeasByCategory()` |
| `resources/js/lib/project-idea-catalog.test.ts` | Created | 4 tests |
| `resources/js/components/projects/project-idea-card.tsx` | Created | idea card + CTA |
| `resources/js/components/projects/project-idea-category-group.tsx` | Created | category heading + grid |
| `resources/js/components/projects/project-idea-inspiration.tsx` | Created | collapsible wrapper + tech-name map |
| `resources/js/components/projects/project-idea-inspiration.test.tsx` | Created | 5 tests |
| `resources/js/pages/projects/create.tsx` | Modified | prop, inspiration block, card-click handler, `?idea=` effect, aria-live region |
| `resources/js/pages/projects/create.test.tsx` | Created | 5 tests |

### Deviations from design (Slice 2)

- None material. CTA `aria-label` uses `idea.title` (per design "Usar la idea: {title}"), not `prefillTitle`.
- Collapsible trigger is a `Button` passed via base-ui's `render={<Button/>}` prop (repo uses `@base-ui/react`, not Radix).
- `create.tsx` on-mount effect reads latest form data through a `dataRef` (kept current each render) so the `[]`-dep single-shot effect never captures stale values; `react-hooks/exhaustive-deps` disabled on that one line.

### Work Unit Evidence (Unit 2 — frontend inspiration block + prefill)

| Evidence | Value |
|---|---|
| Focused test command / result | `npx vitest run resources/js/lib/project-idea-catalog.test.ts resources/js/components/projects/project-idea-inspiration.test.tsx resources/js/pages/projects/create.test.tsx` → 3 files, 14/14 passed |
| Runtime harness / result | `npm run build` (`vite build`) → green, ~6.5s; `npx tsc --noEmit` → 0 errors |
| Rollback boundary | Revert `resources/js/pages/projects/create.tsx` and `resources/js/types/index.ts`; delete `project-idea-card.tsx`, `project-idea-category-group.tsx`, `project-idea-inspiration.tsx`, `lib/project-idea-catalog.ts`, `ui/collapsible.tsx`, and the 3 new test files. Backend (slice 1) untouched. |

### `// REVIEW(project-idea-inspiration:...)` comments left (Slice 2)

None.

### Deferred to Slice 2 (frontend, PR2 → this branch) — COMPLETED

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
11. Slice-1 runtime ledger: `gentle-ai sdd-attempt` is blocked at maintainer-decision on the slice-1 objective; the parent handles that out of band. Slice 2 did the git/test/PR work directly and did NOT touch the ledger.
12. Collapsible primitive resolves to `@base-ui/react/collapsible` (matches the repo's other `ui/*` base-ui components). Trigger is a `Button` passed via base-ui's `render={<Button/>}` prop, not Radix `asChild`.
13. Prettier: `.prettierrc.json` sets `semi: false`, but existing `resources/js/pages/projects/*.tsx` use semicolons and are not enforced. New files were run through `prettier -w`; `create.tsx` edits kept the file's existing semicolon/4-space style to minimize the diff.
14. Deep-link `?idea=` effect uses `[]` deps + a `useRef(false)` single-shot guard and reads latest form data via a `dataRef`; `react-hooks/exhaustive-deps` is disabled on that single line by design.
15. `create.test.tsx` uses a stateful `useForm` mock (real `useState`) with a module-scoped `setDataSpy`, and stubs `ProjectForm` to a minimal `<form>` exposing `id="title"` so the focus + submit paths are exercised without the full form tree.
16. CTA `aria-label` uses `idea.title` (design: "Usar la idea: {title}"), which differs from the card's prefilled `prefillTitle`.
17. PR2 opens against `feat/project-idea-inspiration-backend` (PR1 #232). Retarget PR2 to `development` after #232 merges.

### `// REVIEW(project-idea-inspiration:...)` comments left

None (slices 1 and 2).
