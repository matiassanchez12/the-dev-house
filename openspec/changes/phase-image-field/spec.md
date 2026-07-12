# Delta for Phase Image Upload

## ADDED Requirements

### Requirement: Phase image upload

The system MUST allow uploading a single optional image when creating or updating a phase. The image MUST be stored on the public disk under the `phases/` directory. The system MUST accept jpg, jpeg, png, and webp formats with a maximum size of 2MB.

#### Scenario: creator uploads image on phase creation

- GIVEN the user is the project creator
- WHEN they submit a new phase with a valid image file
- THEN the phase MUST be created with the image stored in `phases/`
- AND the image URL MUST be included in the API response

#### Scenario: creator uploads image on phase update

- GIVEN the user is the project creator
- WHEN they update an existing phase with a new image
- THEN the old image MUST be deleted from storage
- AND the new image MUST replace it in `phases/`

#### Scenario: phase without image works normally

- GIVEN the user creates a phase without attaching an image
- WHEN the phase is created
- THEN the phase MUST be created with `image_path=null`
- AND the API response MUST include `image=null`

### Requirement: Phase image validation

The system MUST reject image files larger than 2MB and files that are not jpg, jpeg, png, or webp format.

#### Scenario: reject oversized image

- GIVEN the user attempts to upload a 3MB image
- WHEN the form is submitted
- THEN the system MUST return a validation error
- AND the phase MUST NOT be created

#### Scenario: reject invalid format

- GIVEN the user attempts to upload a .gif file
- WHEN the form is submitted
- THEN the system MUST return a validation error

### Requirement: Phase image cleanup on delete

The system MUST delete the image file from storage when a phase is deleted.

#### Scenario: deleting phase removes image

- GIVEN a phase has an associated image
- WHEN the phase is deleted
- THEN the image file MUST be deleted from the `phases/` directory
- AND no orphaned files MUST remain

#### Scenario: deleting phase without image is safe

- GIVEN a phase has no image
- WHEN the phase is deleted
- THEN the deletion MUST succeed without errors

### Requirement: Phase image display with lightbox

The system MUST display a thumbnail of the phase image when present. Clicking the thumbnail MUST open the `ImageGalleryDialog` with the full-size image.

#### Scenario: thumbnail renders in project phase list

- GIVEN a phase has an associated image
- WHEN the project show page is rendered
- THEN a thumbnail MUST be visible in the `ProjectPhaseItem` component

#### Scenario: thumbnail renders in public milestones page

- GIVEN a phase has an associated image
- WHEN the public milestones page is rendered
- THEN a thumbnail MUST be visible in the `MilestoneCard` component

#### Scenario: click opens lightbox

- GIVEN a phase image thumbnail is displayed
- WHEN the user clicks the thumbnail
- THEN the `ImageGalleryDialog` MUST open showing the full-size image

### Requirement: Phase image in API transformer

The system MUST include the image in the `ApiResourceTransformer::phase()` output as a `{ path, url }` object when present, or `null` when absent.

#### Scenario: transformer includes image URL

- GIVEN a phase with an image stored at `phases/abc123.jpg`
- WHEN the phase is transformed
- THEN the output MUST include `image: { path: "phases/abc123.jpg", url: "http://..." }`

#### Scenario: transformer returns null for no image

- GIVEN a phase without an image
- WHEN the phase is transformed
- THEN the output MUST include `image: null`
