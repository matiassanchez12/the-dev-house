# Tasks: Image Gallery Dialog

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 200-300 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Create ImageGalleryDialog component + types | PR 1 | Foundation, standalone |
| 2 | Integrate gallery into existing components | PR 1 | Wiring + thumbnail sizing |

## Phase 1: Foundation / Types

- [x] 1.1 Add `ImageGalleryDialogProps` interface to `resources/js/types/index.ts` with `images: string[]`, `open: boolean`, `initialIndex: number`, `onOpenChange: (open: boolean) => void`
- [x] 1.2 Create `resources/js/components/ui/image-gallery-dialog.tsx` with controlled Dialog, `useEffect` to reset `currentIndex` when `open` becomes `true`, and internal `currentIndex` state

## Phase 2: Core Implementation — Gallery Component

- [x] 2.1 Implement main image display: `<img>` centered in DialogContent with `max-h-[80vh]`, `object-contain`, responsive sizing
- [x] 2.2 Implement prev/next navigation with modulo arithmetic: `handlePrev: (i - 1 + len) % len`, `handleNext: (i + 1) % len` — render buttons only when `images.length > 1`
- [x] 2.3 Add ChevronLeft/ChevronRight icons as absolute-positioned nav buttons with `aria-label` ("Imagen anterior", "Imagen siguiente")
- [x] 2.4 Add index indicator showing `"${currentIndex + 1} / ${images.length}"` with `aria-live="polite"` at bottom center
- [x] 2.5 Add custom close button (X) positioned top-right with absolute positioning, using DialogPrimitive.Close
- [x] 2.6 Add keyboard support: ArrowLeft → prev, ArrowRight → next via useEffect with keydown listener (Escape handled by DialogPrimitive)

## Phase 3: Integration — Update Existing Components

- [x] 3.1 Update `resources/js/components/projects/show/project-gallery.tsx`: change thumbnail `h-32` to `h-48 sm:h-64`, add `useState` for gallery open state, wrap each thumbnail in clickable div that sets `imageUrls`, `initialIndex`, and `galleryOpen(true)`, render `ImageGalleryDialog` at component root
- [x] 3.2 Update `resources/js/components/projects/show/project-hero.tsx`: change hero image `h-64 sm:h-80` to `h-96 sm:h-[450px]`, add `useState` for gallery open state, make hero image clickable to open dialog with `initialIndex: 0`, render `ImageGalleryDialog` at component root
- [x] 3.3 Update `resources/js/components/projects/image-uploader.tsx`: add `useState` for gallery open state, wrap existing images thumbnail div with click handler to open gallery (collect all URLs from `existingImages` + new file previews), wrap new file previews similarly, ensure `object-cover` + `aspect-square` on all preview `<img>` elements (already present on existing images)

## Phase 4: Testing

- [ ] 4.1 Write unit test: render ImageGalleryDialog with 5 images, click next, assert image src changes to next URL
- [ ] 4.2 Write unit test: click next on last image, assert wraps to first image (index 0)
- [ ] 4.3 Write unit test: click prev on first image, assert wraps to last image
- [ ] 4.4 Write unit test: render with 1 image, assert no prev/next buttons present
- [ ] 4.5 Write unit test: assert index indicator displays correct format "N / M" and updates on navigation
- [ ] 4.6 Write unit test: open at index 2, close, re-open at index 0, assert `currentIndex` resets correctly
- [ ] 4.7 Write integration test: click thumbnail in ProjectGallery, assert dialog opens with matching image src
- [ ] 4.8 Write integration test: open dialog, press Escape, assert dialog closes
- [ ] 4.9 Write integration test: open dialog, click overlay area, assert dialog closes
