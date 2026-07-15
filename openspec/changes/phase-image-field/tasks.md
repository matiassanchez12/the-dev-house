# Tasks: Phase Image Field

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~350 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | N/A |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: N/A
400-line budget risk: Low

## Phase 1: Backend Foundation (TDD — RED)

- [ ] 1.1 Create migration: `php artisan make:migration add_image_path_to_phases_table` — nullable `image_path` string after `description`
- [ ] 1.2 Add `'image_path'` to `Phase::$fillable` in `app/Models/Phase.php`
- [ ] 1.3 Add `image_path` to `PhaseFactory` state: `fn () => ['image_path' => null]`
- [ ] 1.4 RED: Write `tests/Feature/Projects/PhaseImageTest.php` with failing tests for:
  - upload on create, upload on update (replace), cleanup on delete, validation reject >2MB, validation reject gif, no-image create works
- [ ] 1.5 RED: Write `tests/Unit/Services/PhaseServiceImageTest.php` with failing tests for: store file, replace file (old deleted), delete cleanup, no-image delete safe

## Phase 2: Backend Implementation (TDD — GREEN)

- [ ] 2.1 Add image rules to `StorePhaseRequest`: `'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048'`
- [ ] 2.2 Add image rules to `UpdatePhaseRequest`: same rules
- [ ] 2.3 Update `PhaseService::create()` — accept `?UploadedFile $image`, store to `phases/` on public disk, save path
- [ ] 2.4 Update `PhaseService::update()` — accept `?UploadedFile $image`, delete old + store new if provided
- [ ] 2.5 Update `PhaseService::delete()` — delete file from storage if `image_path` exists
- [ ] 2.6 Update `PhaseController::store()` — pass `$request->file('image')` to service
- [ ] 2.7 Update `PhaseController::update()` — pass `$request->file('image')` to service
- [ ] 2.8 Add `'image'` to `ApiResourceTransformer::phase()` whitelist, transform with `StorageUrlHelper::url()` to `{ path, url }`
- [ ] 2.9 Run `php artisan test --filter PhaseImage` — all tests GREEN

## Phase 3: Frontend Types + Forms

- [ ] 3.1 Add `PhaseImage` interface and `image?: PhaseImage | null` to `Phase` in `resources/js/types/index.ts`
- [ ] 3.2 Create `resources/js/components/projects/show/phase-image-input.tsx` — file input with preview, remove button, max 2MB client validation
- [ ] 3.3 Integrate `PhaseImageInput` into `ProjectPhaseDrawer` — add to form data, show existing image on edit
- [ ] 3.4 Integrate `PhaseImageInput` into `ProjectPhaseForm` — same pattern

## Phase 4: Frontend Display

- [ ] 4.1 Update `ProjectPhaseItem` — render thumbnail if `phase.image` exists, click opens `ImageGalleryDialog`
- [ ] 4.2 Update `MilestoneCard` — same thumbnail + lightbox pattern
- [ ] 4.3 Run `npx tsc --noEmit` — no type errors

## Phase 5: Verification

- [ ] 5.1 Run `php artisan test` — all existing + new tests pass
- [ ] 5.2 Run `npx vitest run` — frontend tests pass
- [ ] 5.3 Run `./vendor/bin/pint` — no style issues
- [ ] 5.4 Manual verification: create phase with image, update with new image, delete phase, verify storage cleanup
