# Proposal: Phase Image Field

## Intent

Phases (milestones) currently only support text. Users need visual context for milestones, such as screenshots, diagrams, or mockups. This change adds a single optional image to each phase, following the same upload, display, and cleanup patterns already established for project images and profile avatars.

## Scope

### In Scope
- Single optional image upload on phase create/update
- Validation: max 2MB, jpg/jpeg/png/webp
- Thumbnail display in phase list; click-to-expand via `ImageGalleryDialog`
- Auto-delete image from storage when phase is deleted
- Backend: migration, model, service, controller, requests, transformer
- Frontend: TypeScript interface, `ProjectPhaseDrawer`, `ProjectPhaseForm`, `ProjectPhaseItem`, `MilestoneCard`
- Tests: feature, unit, request validation

### Out of Scope
- Multiple images per phase
- Image editing, cropping, or compression
- CDN or external storage

## Capabilities

### New Capabilities
- `phase-image-upload`: Upload, store, display, and clean up a single optional image attached to a project phase.

### Modified Capabilities
- None. This is an additive field; existing phase visibility and permission specs remain unchanged.

## Approach

1. **Migration**: Add `image_path` (nullable string) to `phases` table.
2. **Model**: Add `image_path` to `$fillable`; append `image_url` accessor.
3. **Service**: Add `updateImage()` (store to `phases` directory on public disk, delete old file) and `deleteImage()` (path-safety cleanup), mirroring `ProfileService::updateAvatar()` and `ProjectService::deleteImages()`.
4. **Controller**: Wire image upload into `store` and `update`; call `deleteImage()` inside `destroy`.
5. **Form Requests**: Add `image` rules to `StorePhaseRequest` and `UpdatePhaseRequest`.
6. **Transformer**: Include `image_url` in `ApiResourceTransformer::phase()` whitelist.
7. **Frontend**: Update `Phase` interface; add file input to `ProjectPhaseForm`; render thumbnail in `ProjectPhaseItem`/`MilestoneCard`; open `ImageGalleryDialog` on click.
8. **Tests**: Cover upload, validation errors, URL presence in response, and deletion cleanup.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `database/migrations/` | New | Add `image_path` to phases table |
| `app/Models/Phase.php` | Modified | Fillable + accessor |
| `app/Services/PhaseService.php` | Modified | Upload and cleanup methods |
| `app/Http/Controllers/PhaseController.php` | Modified | Handle image in store/update/destroy |
| `app/Http/Requests/StorePhaseRequest.php` | Modified | Add image validation |
| `app/Http/Requests/UpdatePhaseRequest.php` | Modified | Add image validation |
| `app/Transformers/ApiResourceTransformer.php` | Modified | Add `image_url` to phase whitelist |
| `resources/js/types/index.ts` | Modified | `Phase` interface |
| `resources/js/Components/ProjectPhase*.tsx` | Modified | Form input, thumbnail, dialog trigger |
| `resources/js/Components/MilestoneCard.tsx` | Modified | Thumbnail + dialog trigger |
| `tests/Feature/PhaseTest.php` | Modified | Image upload/deletion tests |
| `tests/Unit/Services/PhaseServiceTest.php` | Modified | Image method tests |
| `tests/Unit/Requests/StorePhaseRequestTest.php` | Modified | Image validation tests |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Storage bloat from abandoned images | Low | Auto-delete on phase destroy; max 2MB limit |
| Transformer whitelist omits new field | Low | Add to whitelist + assertion in feature test |
| UI layout shift with varying image sizes | Low | Fixed thumbnail size; dialog handles full image |

## Rollback Plan

1. Revert migration to drop `image_path` column.
2. Remove `image` handling from controller, service, requests, and transformer.
3. Revert frontend component changes.
4. Run `php artisan test` to confirm no regressions.
5. Manually clean up orphaned images from `storage/app/public/phases/` if needed.

## Dependencies

- `ImageGalleryDialog` component (already implemented)

## Success Criteria

- [ ] Phase can be created with an optional image; thumbnail renders on the project page
- [ ] Phase can be updated with a new image; old image is deleted from storage
- [ ] Clicking the thumbnail opens `ImageGalleryDialog` with the full image
- [ ] Deleting a phase deletes its image from storage
- [ ] Validation rejects files >2MB or non-image formats
- [ ] All existing phase tests pass; new image tests pass with coverage ≥80%
