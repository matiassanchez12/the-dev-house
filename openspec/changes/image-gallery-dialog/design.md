# Design: Image Gallery Dialog

## Technical Approach

Create a reusable `ImageGalleryDialog` component using shadcn/ui Dialog primitives with carousel navigation (prev/next with wrap-around), a position indicator, and keyboard accessibility. Integrate it into `ImageUploader` and `ProjectGallery` by wrapping thumbnails with click handlers. Fix thumbnail consistency in `ImageUploader` by ensuring `object-cover` + `aspect-square` on all thumbnail `<img>` elements (existing images already have this; new previews need it added explicitly).

Maps to spec requirements: Image Gallery Dialog (§1), Carousel Navigation (§2), Index Indicator (§3), Dialog Dismissal (§4), Thumbnail Consistency (§5).

## Architecture Decisions

| Decision | Option A (chosen) | Option B (rejected) | Rationale |
|----------|-------------------|---------------------|-----------|
| State management | Controlled via `open` + `initialIndex` props | Internal `useState` for open/index | Controlled pattern lets parent own lifecycle, matches shadcn Dialog conventions |
| Navigation wrap | Modulo arithmetic `(idx + 1) % len` | Conditional boundary checks | Modulo is O(1), handles wrap in one expression, fewer branches |
| Single image nav | Hide prev/next buttons entirely | Disable buttons visually | Hiding removes interactive noise; disabled buttons still occupy tab-stop space |
| Dialog sizing | Full-viewport overlay with max-width image container | Fixed-size dialog | Full-viewport gives lightbox feel; image scales responsively |
| Thumbnail click handler | `onClick` on `<img>` wrapper | `DialogTrigger` per thumbnail | `DialogTrigger` doesn't support passing index; controlled open is simpler |

## Data Flow

```
  ImageUploader / ProjectGallery
         │
         │  user clicks thumbnail at index N
         ▼
  setImageUrls(allImages)       ← parent collects all URLs
  setInitialIndex(N)
  setGalleryOpen(true)
         │
         ▼
  ImageGalleryDialog
  ┌──────────────────────────┐
  │  open={galleryOpen}      │
  │  images={imageUrls}      │
  │  initialIndex={N}        │
  │  onOpenChange → close    │
  └──────────────────────────┘
         │
    internal currentIndex state
    prev/next via modulo arithmetic
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `resources/js/components/ui/image-gallery-dialog.tsx` | Create | Reusable gallery dialog with carousel, indicator, keyboard nav |
| `resources/js/components/projects/image-uploader.tsx` | Modify | Add gallery open state, wrap thumbnails with click handlers, ensure `object-cover` on previews |
| `resources/js/components/projects/show/project-gallery.tsx` | Modify | Add gallery open state, wrap thumbnails with click handlers |
| `resources/js/types/index.ts` | Modify | Add `ImageGalleryDialogProps` interface |

## Interfaces / Contracts

```typescript
interface ImageGalleryDialogProps {
  /** Array of image URLs to display */
  images: string[];
  /** Whether the dialog is open */
  open: boolean;
  /** Index of the image to show initially (resets on each open) */
  initialIndex: number;
  /** Called when open state changes (close) */
  onOpenChange: (open: boolean) => void;
}
```

Internal state (private to component):
- `currentIndex: number` — derived from `initialIndex` on open, updated by prev/next

## Component Structure

```
ImageGalleryDialog
├── Dialog (shadcn)
│   ├── DialogOverlay (dark backdrop, click-to-close)
│   └── DialogContent (custom: no default close button styling)
│       ├── Close button (X, top-right, absolute)
│       ├── Main image container (flex center)
│       │   └── <img src={images[currentIndex]} />
│       ├── Prev button (ChevronLeft, left side, absolute)
│       ├── Next button (ChevronRight, right side, absolute)
│       └── Index indicator (bottom center, "2 / 5")
```

Key implementation details:
- `useEffect` resets `currentIndex` to `initialIndex` when `open` becomes `true`
- `handlePrev`: `setCurrentIndex((i - 1 + len) % len)`
- `handleNext`: `setCurrentIndex((i + 1) % len)`
- Keyboard: ArrowLeft → prev, ArrowRight → next, Escape → close (handled by DialogPrimitive)
- ARIA: `aria-label` on nav buttons, `role="group"` on image container, `aria-live="polite"` on index indicator
- Navigation buttons render only when `images.length > 1`

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `currentIndex` updates correctly on prev/next | Render with 5 images, click buttons, assert displayed image src |
| Unit | Wrap-around behavior | Click next on last image, assert first image shown |
| Unit | Single image hides nav | Render with 1 image, assert no prev/next buttons |
| Unit | Index indicator format | Assert text matches `"N / M"` pattern |
| Unit | `initialIndex` resets on re-open | Open at index 2, close, open at index 0, assert correct |
| Integration | Thumbnail click opens dialog at correct index | Click thumbnail in ImageUploader, assert dialog open with matching src |
| Integration | ESC closes dialog | Open dialog, fire keydown Escape, assert closed |
| Integration | Overlay click closes dialog | Open dialog, click overlay area, assert closed |

## Migration / Rollout

No migration required. This is a new component with no data changes.

## Open Questions

- [ ] Should the gallery support zoom/pan gestures on mobile? (Out of scope for v1, note for future)
- [ ] Should image URLs be preloaded before display to avoid flash? (Can add `Image` preload in a follow-up if UX demands it)
