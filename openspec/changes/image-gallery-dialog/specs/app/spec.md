# Image Gallery Dialog Specification

## Purpose

The system SHALL provide a full-screen image gallery dialog (lightbox) for viewing project images with carousel navigation, and SHALL ensure consistent `object-cover` thumbnails in the ImageUploader component.

## Requirements

### Requirement: Image Gallery Dialog

The system SHALL provide an `ImageGalleryDialog` component that displays a single image at large size within a shadcn Dialog. The dialog SHALL accept an array of image URLs and an initial index. The dialog SHALL be opened by clicking any thumbnail in the ImageUploader or ProjectGallery.

#### Scenario: dialog opens at correct image

- GIVEN a user clicks a thumbnail at index 2 in a set of 5 images
- WHEN the dialog opens
- THEN it displays the image at index 2 as the main view

#### Scenario: dialog renders with Dialog primitives

- GIVEN the dialog is open
- THEN it uses `Dialog`, `DialogOverlay`, and `DialogContent` from `ui/dialog.tsx`
- AND the overlay provides a dark backdrop behind the image

### Requirement: Carousel Navigation

The system SHALL provide previous/next navigation controls within the ImageGalleryDialog. Navigation SHALL wrap around (last → first, first → last). Controls SHALL be disabled visually only when a single image is present.

#### Scenario: next image navigation

- GIVEN the dialog shows image at index 1 of 5
- WHEN the user clicks the "next" button
- THEN the dialog displays image at index 2

#### Scenario: previous image navigation

- GIVEN the dialog shows image at index 3 of 5
- WHEN the user clicks the "previous" button
- THEN the dialog displays image at index 2

#### Scenario: navigation wraps around

- GIVEN the dialog shows the last image (index 4 of 5)
- WHEN the user clicks "next"
- THEN the dialog displays image at index 0

#### Scenario: single image disables navigation

- GIVEN only 1 image is passed to the dialog
- THEN prev/next controls are not rendered or are visually hidden

### Requirement: Index Indicator

The system SHALL display a position indicator showing the current image number and total count (e.g., "2 / 5"). The indicator SHALL be visible at all times while the dialog is open.

#### Scenario: indicator shows correct position

- GIVEN 5 images, currently viewing index 1
- THEN the indicator displays "2 / 5"

#### Scenario: indicator updates on navigation

- GIVEN the indicator shows "2 / 5"
- WHEN the user navigates to the next image
- THEN the indicator updates to "3 / 5"

### Requirement: Dialog Dismissal

The system SHALL allow closing the ImageGalleryDialog via: pressing ESC, clicking the overlay (outside the image), or clicking the close button (X). The dialog SHALL NOT close when clicking on the image itself or navigation controls.

#### Scenario: ESC closes dialog

- GIVEN the dialog is open
- WHEN the user presses the ESC key
- THEN the dialog closes

#### Scenario: click outside closes dialog

- GIVEN the dialog is open
- WHEN the user clicks on the overlay area (not the image or controls)
- THEN the dialog closes

#### Scenario: close button closes dialog

- GIVEN the dialog is open
- WHEN the user clicks the X close button
- THEN the dialog closes

### Requirement: Thumbnail Consistency in ImageUploader

The system SHALL apply `object-cover` to all thumbnail images in the ImageUploader component — both existing images and new file previews. Thumbnails SHALL maintain a consistent square aspect ratio.

#### Scenario: existing images use object-cover

- GIVEN the ImageUploader renders existing images in edit mode
- THEN each `<img>` has `object-cover` and `aspect-square` classes

#### Scenario: new file previews use object-cover

- GIVEN the ImageUploader renders new file previews
- THEN each preview `<img>` has `object-cover` and `aspect-square` classes
