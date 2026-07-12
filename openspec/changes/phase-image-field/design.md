# Design: Phase Image Field

## Technical Approach

Extend the existing `Phase` entity with a single optional `image_path` column. Follow the `ProfileService::updateAvatar()` pattern for upload/replace/delete lifecycle. Expose `image` as a `{ path, url }` object via `ApiResourceTransformer::phase()`. Wire frontend with file input + preview in forms, and thumbnail + `ImageGalleryDialog` in display components.

## Architecture Decisions

### Decision: Column name

**Choice**: `image_path`
**Alternatives**: `image`
**Rationale**: Explicit about what's stored (a path, not a URL or binary). Matches how `users.avatar` works in this codebase. Avoids confusion with the transformer output key `image` which will be a `{ path, url }` object.

### Decision: Service method pattern

**Choice**: Integrate image handling into existing `create()`/`update()`/`delete()` methods
**Alternatives**: Separate `uploadImage()`/`deleteImage()` methods
**Rationale**: Simpler controller code — service handles the full lifecycle internally. Matches how `ProfileService` works. The controller just passes the validated data including the file.

### Decision: Transformer output shape

**Choice**: `{ path, url }` object (like `ProjectImage`)
**Alternatives**: Flat URL string
**Rationale**: Consistent with how project images are exposed. Frontend already has `ProjectImage` type that works with this shape. Enables path-based operations if needed.

### Decision: Frontend image input

**Choice**: Reusable `PhaseImageInput` component used in both `ProjectPhaseDrawer` and `ProjectPhaseForm`
**Alternatives**: Inline file input in each form
**Rationale**: DRY — both forms need identical file input + preview + remove logic. Single component reduces duplication and ensures consistent UX.

## Data Flow

```
[Form] → file object → Controller → PhaseService::create()/update()
                                         │
                                         ├─ store file to phases/ on public disk
                                         ├─ save path to phase.image_path
                                         └─ return Phase model

[Delete] → Controller → PhaseService::delete()
                           │
                           ├─ delete file from storage (if exists)
                           └─ delete phase record

[Display] → Phase model → ApiResourceTransformer::phase()
                              │
                              ├─ image_path present → { path, url }
                              └─ image_path null → null
                                │
                                └─→ Frontend: Phase.image → thumbnail + ImageGalleryDialog
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `database/migrations/xxxx_add_image_path_to_phases_table.php` | Create | Nullable `image_path` string column |
| `app/Models/Phase.php` | Modify | Add `image_path` to `$fillable` |
| `app/Services/PhaseService.php` | Modify | Handle file upload in create/update, cleanup in delete |
| `app/Http/Controllers/PhaseController.php` | Modify | Pass `$request->file('image')` to service |
| `app/Http/Requests/Phase/StorePhaseRequest.php` | Modify | Add `image` validation rule |
| `app/Http/Requests/Phase/UpdatePhaseRequest.php` | Modify | Add `image` validation rule |
| `app/Helpers/ApiResourceTransformer.php` | Modify | Add `image` to whitelist, transform with `StorageUrlHelper` |
| `resources/js/types/index.ts` | Modify | Add `image?: PhaseImage \| null` to `Phase` interface |
| `resources/js/components/projects/show/phase-image-input.tsx` | Create | Reusable file input with preview |
| `resources/js/components/projects/show/project-phase-drawer.tsx` | Modify | Include `PhaseImageInput` |
| `resources/js/components/projects/show/project-phase-form.tsx` | Modify | Include `PhaseImageInput` |
| `resources/js/components/projects/show/project-phase-item.tsx` | Modify | Render thumbnail + lightbox |
| `resources/js/components/public/milestone-card.tsx` | Modify | Render thumbnail + lightbox |
| `database/factories/PhaseFactory.php` | Modify | Add `image_path` to factory state |

## Interfaces / Contracts

```typescript
// TypeScript
export interface PhaseImage {
    path: string
    url: string
}

export interface Phase {
    // ... existing fields
    image?: PhaseImage | null
}
```

```php
// PHP — PhaseService
public function create(Project $project, array $data, ?UploadedFile $image = null): Phase;
public function update(Phase $phase, array $data, ?UploadedFile $image = null): Phase;
public function delete(Phase $phase): void; // handles image cleanup
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Feature | Image upload on create | `Storage::fake('public')`, POST with `UploadedFile::fake()->image()` |
| Feature | Image replace on update | Upload twice, assert old file deleted |
| Feature | Image cleanup on delete | Delete phase, assert file removed from storage |
| Feature | Validation rejects >2MB | POST with oversized file, assert 422 |
| Feature | Validation rejects gif | POST with `.gif`, assert 422 |
| Feature | API response includes image | Assert `image.path` and `image.url` in response |
| Unit | PhaseService stores file | Mock storage, verify `store()` called with `phases/` |
| Unit | PhaseService deletes file | Mock storage, verify `delete()` called on cleanup |
| Unit | Transformer includes image | Pass phase with `image_path`, verify output shape |
| Unit | Transformer null for no image | Pass phase without image, verify `null` |

## Migration / Rollout

No migration required beyond adding the nullable column. Existing phases will have `image_path=null` — fully backward compatible. No feature flags needed.

## Open Questions

- [ ] None — all decisions resolved.
