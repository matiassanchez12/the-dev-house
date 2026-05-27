# Delta for App

## ADDED Requirements

### Requirement: users-index-layout-wrapper

The users directory page (`resources/js/pages/users/index.tsx`) MUST be wrapped in the `PublicLayout` component. The page MUST render with consistent container rhythm matching other public discovery pages: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12`.

#### Scenario: users page renders inside PublicLayout

- GIVEN a user navigates to the `/users` route
- WHEN the page renders
- THEN the content MUST be wrapped in `PublicLayout`
- AND the container MUST have max-width of `7xl` with horizontal padding and vertical spacing of `py-12`
- AND the header, navigation, and footer from `PublicLayout` MUST be visible

#### Scenario: users page matches other public pages visually

- GIVEN the users index page and another public page (e.g., projects index) are rendered
- WHEN compared side by side
- THEN both pages MUST share the same container rhythm (max-width, padding, spacing)
- AND no visual inconsistency in page framing MUST be present

### Requirement: users-index-tech-filter

The tech filter on the users directory page MUST use the shadcn `Select` component instead of a raw HTML `<select>` element. The filter MUST display available technologies and allow single selection.

#### Scenario: tech filter uses shadcn Select

- GIVEN the users index page is rendered
- WHEN the user interacts with the tech filter
- THEN a shadcn `Select` component MUST be displayed
- AND the component MUST show all available technologies as options
- AND no raw `<select>` element MUST be present

#### Scenario: tech filter applies selection

- GIVEN the tech filter is open with options visible
- WHEN the user selects a technology
- THEN the page MUST filter users by the selected tech
- AND the Select component MUST display the selected value

### Requirement: users-index-search-input

The search input on the users directory page MUST display a Search icon absolutely positioned inside the input field. The icon MUST be visually integrated and not interfere with text input.

#### Scenario: search input shows Search icon

- GIVEN the users index page is rendered
- WHEN the search input is visible
- THEN a Search icon MUST appear inside the input on the left side
- AND the icon MUST be absolutely positioned within the input container
- AND typing in the input MUST NOT overlap with the icon

### Requirement: users-index-pagination

The pagination on the users directory page MUST use the shadcn `Pagination` component instead of raw button mapping with `dangerouslySetInnerHTML`. The pagination MUST preserve existing Inertia link behavior.

#### Scenario: pagination uses shadcn Pagination component

- GIVEN the users index page displays paginated results
- WHEN the pagination controls are rendered
- THEN a shadcn `Pagination` component MUST be used
- AND no `dangerouslySetInnerHTML` MUST be present in pagination rendering
- AND page links MUST preserve Inertia navigation behavior

#### Scenario: pagination navigates correctly

- GIVEN the user is on page 1 of results
- WHEN the user clicks the next page link
- THEN the page MUST navigate to page 2 via Inertia
- AND the pagination component MUST reflect the current active page

### Requirement: users-index-empty-state

The empty state on the users directory page MUST use the shadcn `Empty` component family when no users match the current filters or search query.

#### Scenario: empty state displays when no results

- GIVEN the users directory has no users matching the current filter/search
- WHEN the page renders
- THEN an `Empty` component MUST be displayed
- AND the component MUST convey that no users were found
- AND no raw empty state markup MUST be present

### Requirement: project-form-tech-selection

The tech selection in the project form MUST use shadcn `Checkbox` components arranged in a responsive grid with associated `Label` elements. Each technology MUST be a selectable checkbox with a visible label.

#### Scenario: tech selection renders as checkbox grid

- GIVEN the project form is rendered (create or edit)
- WHEN the tech selection section is visible
- THEN technologies MUST be displayed as shadcn `Checkbox` elements
- AND each checkbox MUST have an associated `Label`
- AND checkboxes MUST be arranged in a responsive grid (`grid-cols-2 sm:grid-cols-3`)
- AND no raw HTML checkbox inputs MUST be present

#### Scenario: tech selection validates minimum requirement

- GIVEN the project form has no techs selected
- WHEN the user attempts to submit the form
- THEN a validation error MUST indicate at least one tech is required

### Requirement: project-form-error-display

Form validation errors MUST use the `FormError` component from `resources/js/components/ui/form-error.tsx` instead of hardcoded `text-red-500` styled spans.

#### Scenario: form errors use FormError component

- GIVEN the project form is submitted with invalid data
- WHEN validation errors are returned
- THEN errors MUST be displayed using the `FormError` component
- AND no hardcoded `text-red-500` spans MUST be present for form errors

### Requirement: project-form-sections

The project form MUST use `Separator` components to visually group form sections: Basic Info, Tech Stack, and Media. Each section MUST have a clear visual boundary.

#### Scenario: form sections are separated

- GIVEN the project form is rendered
- WHEN the form is displayed
- THEN `Separator` components MUST appear between Basic Info, Tech Stack, and Media sections
- AND each section MUST be visually distinct

### Requirement: project-form-image-uploader

The project form MUST include an `ImageUploader` component (`resources/js/components/projects/image-uploader.tsx`) that provides a drag-drop zone for project images. The component MUST support file previews, size validation feedback, and a maximum of 5 files at 2MB each.

#### Scenario: drag-drop zone accepts files

- GIVEN the ImageUploader component is rendered
- WHEN the user drags image files onto the drop zone
- THEN the zone MUST provide visual feedback during drag
- AND dropped files MUST be added to the selection
- AND file previews MUST be displayed as thumbnails

#### Scenario: file size validation provides feedback

- GIVEN the ImageUploader has a 2MB per-file limit
- WHEN the user drops or selects a file exceeding 2MB
- THEN the component MUST display a size validation error for that file
- AND the oversized file MUST NOT be added to the selection

#### Scenario: maximum file count is enforced

- GIVEN the ImageUploader already has 5 files selected
- WHEN the user attempts to add more files
- THEN the component MUST prevent adding additional files
- AND feedback MUST indicate the maximum of 5 files has been reached

### Requirement: project-form-existing-images

Existing project images on the edit form MUST have remove buttons using shadcn `Button` with `variant="destructive"` and `size="icon"`.

#### Scenario: existing images have remove buttons

- GIVEN the project edit form is rendered with existing images
- WHEN the image previews are displayed
- THEN each image MUST have a remove button using `Button variant="destructive" size="icon"`
- AND clicking the remove button MUST mark the image for removal

### Requirement: project-form-character-counters

The project form MUST display character counters for the title field (max 255 characters) and description field (max 1000 characters). The counters MUST update in real-time as the user types.

#### Scenario: title character counter updates

- GIVEN the project form title field is focused
- WHEN the user types characters
- THEN a counter MUST display the current character count out of 255
- AND the counter MUST update on each keystroke

#### Scenario: description character counter updates

- GIVEN the project form description field is focused
- WHEN the user types characters
- THEN a counter MUST display the current character count out of 1000
- AND the counter MUST update on each keystroke

### Requirement: public-layout-developers-link

The `PublicLayout` navigation MUST include a "Developers" link pointing to the users directory (`/users`). The link MUST be visible in the main navigation bar alongside other public navigation items.

#### Scenario: Developers link appears in navigation

- GIVEN the PublicLayout is rendered on any public page
- WHEN the navigation bar is displayed
- THEN a "Developers" link MUST be present
- AND the link MUST navigate to `/users`
- AND the link MUST be styled consistently with other navigation items

#### Scenario: Developers link shows active state

- GIVEN the user is on the `/users` page
- WHEN the PublicLayout navigation is rendered
- THEN the "Developers" link MUST display an active/highlighted state
