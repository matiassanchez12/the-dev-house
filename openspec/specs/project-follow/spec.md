# Project Follow Specification

## Purpose

Define authenticated follow and unfollow behavior for public projects on the project show page, including follower count visibility for all viewers, a guest authentication CTA modal, and a persistence seam for future read-state work without introducing read-state behavior in this slice.

## Requirements

### Requirement: authenticated users can follow and unfollow public projects

The system MUST allow authenticated users to follow and unfollow public projects from the project show page. Persisted follow state in this slice MUST remain authenticated-only. Repeated follow or unfollow submissions MUST be idempotent.

#### Scenario: user follows a public project

- GIVEN an authenticated user is viewing a public project they do not follow
- WHEN they submit the follow action
- THEN the system MUST create a follow relationship for that user and project
- AND the project show page MUST reflect the followed state for that viewer

#### Scenario: user unfollows a public project

- GIVEN an authenticated user is viewing a public project they already follow
- WHEN they submit the unfollow action
- THEN the system MUST remove the follow relationship
- AND the project show page MUST reflect the unfollowed state for that viewer

#### Scenario: repeated follow or unfollow stays idempotent

- GIVEN an authenticated user repeats the same follow or unfollow action for a public project
- WHEN the action is processed again
- THEN the persisted follow relationship MUST remain correct
- AND the system MUST NOT create duplicate follow records

### Requirement: project creators cannot follow their own projects

The system MUST reject follow attempts made by the project creator. The rejection MUST be explicit and MUST NOT create or preserve a follow relationship for the creator.

#### Scenario: creator attempts to follow own project

- GIVEN the authenticated user is the creator of a public project
- WHEN they submit the follow action
- THEN the system MUST reject the action with an explicit error
- AND no follow relationship MUST be created or preserved

#### Scenario: creator does not see follow UI on the show page

- GIVEN the authenticated user is the creator of a public project
- WHEN the project show page is rendered
- THEN the UI MUST omit the follow section entirely

### Requirement: follower count and viewer follow state are exposed in the main project content on the show page

The system MUST expose the current follower count for a project in the main project content on the show page to authenticated and guest viewers. For authenticated viewers, the system MUST also expose whether the current viewer follows that project. The follower count MUST reflect successful follow and unfollow mutations.

#### Scenario: show page displays current follower count

- GIVEN a public project has existing followers
- WHEN the project show page is rendered
- THEN the page MUST display the current persisted follower count

#### Scenario: follow section is placed near the project hero content

- GIVEN a guest or authenticated non-creator viewer opens a public project show page
- WHEN the page is rendered
- THEN the follower count and follow affordance MUST appear in or near `ProjectHero` in the main content area

#### Scenario: guest viewer sees follower count

- GIVEN a guest viewer opens a public project show page
- WHEN the page is rendered
- THEN the page MUST display the current persisted follower count

#### Scenario: authenticated viewer sees their follow state

- GIVEN an authenticated user is viewing a public project
- WHEN the project show page is rendered
- THEN the payload for that page MUST indicate whether that viewer follows the project

#### Scenario: follower count stays accurate after mutation

- GIVEN a user follows or unfollows a public project
- WHEN the project show page is rendered again
- THEN the displayed follower count MUST match the persisted total

### Requirement: guest follow affordance opens an authentication CTA modal instead of persisting a follow

The system MUST let guest viewers interact with the follow affordance on the public project show page, but that interaction MUST open a login/register CTA modal instead of creating any follow relationship. This modal UX belongs to this slice. Guest follow persistence, guest follow draft state, and guest `localStorage` behavior MUST NOT be added in this slice.

#### Scenario: guest clicks follow affordance

- GIVEN a guest viewer is on a public project show page
- WHEN they activate the follow affordance
- THEN the UI MUST open a modal CTA prompting login or registration
- AND the system MUST NOT create any persisted follow relationship

#### Scenario: guest CTA uses accessible shadcn dialog composition

- GIVEN a guest viewer opens the follow CTA modal
- WHEN the modal is rendered
- THEN the UI MUST use shadcn-priority dialog/modal composition terminology and structure
- AND the modal MUST include an accessible title and description for assistive technology

#### Scenario: guest closes the CTA modal

- GIVEN a guest viewer has opened the follow CTA modal
- WHEN they dismiss the modal without authenticating
- THEN the project MUST remain unfollowed
- AND the follower count MUST remain unchanged

### Requirement: follow persistence includes a future read-state seam

The system MUST persist project follows with a nullable `seen_at` value reserved for later read-state work. Current follow, unfollow, and follower-count behavior MUST NOT depend on that value.

#### Scenario: new follow stores the read-state seam

- GIVEN an authenticated user follows a public project
- WHEN the follow record is persisted
- THEN the follow relationship MUST include a nullable `seen_at` value

#### Scenario: current behavior does not depend on seen state

- GIVEN a stored follow relationship has any nullable `seen_at` value
- WHEN follow, unfollow, or project show behavior is evaluated in this slice
- THEN the result MUST remain driven by the follow relationship itself
