# Apply Progress: project-idea-illustrations

**Mode**: Strict TDD (backend `php artisan test`, frontend `npm test` + `npm run build`)
**Delivery**: single PR `feat/project-idea-illustrations` -> `development` (size:exception accepted, ~665 forecast within 800 budget)
**Status**: 36/36 tasks complete. Ready for `sdd-verify`.

## Completed Tasks

All phases 1-10 complete and marked `[x]` in `tasks.md`.

| Phase | Scope | Result |
|-------|-------|--------|
| 1 | `illustration_path` migration + model fillable + factory default | GREEN |
| 2 | Seeder asset README + `syncIllustrations()` pre-pass + faked-disk retrofit | GREEN |
| 3 | `ApiResourceTransformer::projectIdeas()` emits `illustrationUrl` | GREEN |
| 4 | `StoreProjectRequest` `idea_slug` rule + Spanish message + empty-string HTTP test | GREEN |
| 5 | `ProjectService::resolveIdeaCoverPath()` + `create()` call site | GREEN |
| 6 | FE `ProjectIdea.illustrationUrl` type, `idea_slug?` contract, category gradient/icon maps | GREEN |
| 7 | `ProjectIdeaCard` media block + clamped summary + `+N` tech overflow + `h-full pt-0` | GREEN |
| 8 | `create.tsx` `idea_slug` in `useForm` / `applyIdea` / deep-link effect | GREEN |
| 9 | Regression alignment across 5 suites | GREEN |
| 10 | Final acceptance gates | GREEN |

## Files Changed

| File | Action |
|------|--------|
| `database/migrations/2026_09_02_000300_add_illustration_path_to_project_ideas_table.php` | Created |
| `database/seeders/assets/project-ideas/README.md` | Created |
| `app/Models/ProjectIdea.php` | `illustration_path` in `$fillable` |
| `database/factories/ProjectIdeaFactory.php` | `'illustration_path' => null` |
| `database/seeders/ProjectIdeaSeeder.php` | `syncIllustrations()` pre-pass + upsert column |
| `app/Helpers/ApiResourceTransformer.php` | `illustrationUrl` in `projectIdeas()` |
| `app/Http/Requests/Project/StoreProjectRequest.php` | `idea_slug` rule + message |
| `app/Services/ProjectService.php` | `resolveIdeaCoverPath()` + `create()` call site |
| `resources/js/types/index.ts` | `ProjectIdea.illustrationUrl: string \| null` |
| `resources/js/components/projects/project-form-contract.ts` | `idea_slug?: string` |
| `resources/js/lib/project-idea-catalog.ts` | `PROJECT_IDEA_CATEGORY_GRADIENTS` + `_ICONS` |
| `resources/js/components/projects/project-idea-card.tsx` | Media block redesign |
| `resources/js/pages/projects/create.tsx` | `idea_slug` form wiring |
| Tests | `ProjectIdeaInspirationTest`, `ApiResourceTransformerTest`, `StoreProjectRequestTest`, `ProjectServiceTest`, `ProjectTest`, `project-idea-inspiration.test.tsx`, `project-idea-catalog.test.ts`, `create.test.tsx` |

## Test Results (final)

- `php artisan test`: **552 passed (2191 assertions)**, duration ~10.8s
- `npm test`: **45 files, 161 passed**
- `npm run build`: **built in 6.41s**
- `npx tsc --noEmit`: **exit 0 (clean)**
- `./vendor/bin/pint --dirty`: **passed**

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1.1-1.4 | `tests/Feature/ProjectIdeaInspirationTest.php` | Feature | 7/7 pre-existing | Written (column/fillable/rollback) | Passed | 3 cases (nullable, factory default, rollback) | Clean |
| 2.2-2.6 | `tests/Feature/ProjectIdeaInspirationTest.php` | Feature | prior | Written (copy, reseed flip, removed-source) | Passed | 3 cases | Clean |
| 3.1-3.2 | `tests/Unit/Helpers/ApiResourceTransformerTest.php` + feature payload test | Unit + Feature | 1/1 | Written (feature payload RED first) | Passed | 2 cases (set / null) | Clean |
| 4.1-4.3 | `StoreProjectRequestTest` + `ProjectTest` | Unit + Feature (HTTP) | 17/17 + prior | Written | Passed | 3 rules-only + 1 middleware HTTP | Clean |
| 5.1-5.3 | `tests/Unit/Services/ProjectServiceTest.php` | Unit | pre-existing green | Written | Passed | 4 cases (a/b/c/d) | Clean |
| 6.3-6.4 | `resources/js/lib/project-idea-catalog.test.ts` | Unit | 4/4 | Written | Passed | map-completeness loop over 5 keys | Clean |
| 7.1-7.2 | `resources/js/components/projects/project-idea-inspiration.test.tsx` | Component | 5/5 | Written | Passed | 4 cases (img alt, gradient+icon, clamp+title, +N) | Clean |
| 8.1-8.2 | `resources/js/pages/projects/create.test.tsx` | Page | 5/5 | Written (key-set RED) | Passed | card-click + deep-link idea_slug | Clean |

Notes on ordering slips (auto-force):
- Transformer (3.2) production edit landed just before the dedicated unit test (3.1),
  but the **feature-level** payload assertion was written first and observed RED.
- Card CSS-class assertion for `line-clamp-2` is intentional despite the general
  "no CSS class" guidance: the two-line clamp is only observable via the class in
  jsdom and the spec + task explicitly require it. `// REVIEW` comment left in the test.

## Doubts & assumptions

- `idea_slug` persists after manual edits — a no-upload project still takes its cover from the idea. Intentional (proposal assumption 3), not a defect.
- A source asset removed after a seed run leaves a stale `illustration_path` pointing at orphaned media. Accepted and documented; covered by `test_removing_a_source_asset_never_nulls_a_live_illustration_path`.
- Repo grows ~4.5 MB if all 15 webp assets are later committed (15 x <=300 KB).
- `ProjectService` gains its first `ProjectIdea` dependency.
- The `project-idea-inspiration` capability spec is still unarchived; this change modifies it in place.
- `ProjectIdeaInspirationTest` `setUp()` now fakes the `public` disk for the whole class (required by task 2.4). A `tearDown()` strips any `*.webp` a test wrote into `database/seeders/assets/project-ideas/` (repo ships zero).
- Transient full-suite failure seen once in `Tests\Unit\Notifications\ProjectInvitationReceivedTest` ("Jennyfer O'Conner" not found in HTML — faker generated an apostrophe name that the email template HTML-escapes). Not reproducible on isolated or repeated full runs, present on the clean tree logic too; pre-existing latent flakiness in that assertion, unrelated to this change.
- `tests/Unit/Helpers/ApiResourceTransformerTest.php` had no pre-existing `projectIdeas()` assertions, so task 9.4 "update existing" became "add" there; the feature test `ProjectIdeaInspirationTest` carries the payload-shape regression assertion.
- Pint `--dirty` also reformatted pre-existing style debt in `ProjectTest.php` and `StoreProjectRequestTest.php` (files I touched); those cosmetic hunks ride along in this PR.

## `// REVIEW` comments left

- `resources/js/components/projects/project-idea-inspiration.test.tsx` (in `clamps the summary to two lines...` test) — explains the intentional `line-clamp-2` class assertion.
