# Delta for App: Project Join Request Visibility

## ADDED Requirements

### Requirement: Project Show Payload Includes Viewer Join Request

The project show endpoint MUST include a `viewerJoinRequest` field in the response payload for authenticated users. This field SHALL be `null` if:
- The viewer is the project creator
- The viewer is already a participant
- The viewer has no join request for this project

The field SHALL contain the join request object if the viewer has a pending request.

#### Scenario: authenticated viewer with pending request
- GIVEN authenticated user with pending join request
- WHEN fetching project show endpoint
- THEN response includes `viewerJoinRequest` with status `pending`

#### Scenario: authenticated viewer with no request
- GIVEN authenticated user with no join request
- WHEN fetching project show endpoint
- THEN response includes `viewerJoinRequest: null`

#### Scenario: project creator or participant
- GIVEN authenticated user is project creator or participant
- WHEN fetching project show endpoint
- THEN response includes `viewerJoinRequest: null`

## MODIFIED Requirements

### Requirement: Project Join Form Visibility

The project join form MUST only be visible when ALL of these conditions are met:
1. The viewer is authenticated
2. The viewer is NOT the project creator
3. The viewer is NOT already a participant
4. The project status is `open`
5. The viewer has NO pending join request (`viewerJoinRequest === null`)

(Previously: join form visibility only checked conditions 1-4)

#### Scenario: viewer with pending request sees no form
- GIVEN authenticated user with pending join request
- WHEN viewing open project
- THEN join form is NOT rendered

#### Scenario: eligible viewer sees join form
- GIVEN authenticated user with no join request
- WHEN viewing open project
- THEN join form is rendered

#### Scenario: guest sees auth CTA
- GIVEN unauthenticated user
- WHEN viewing open project
- THEN auth CTA is rendered (unchanged)

### Requirement: Pending Request State UI

When `viewerJoinRequest.status === 'pending'`, the system MUST render a pending-state surface in place of the join form. This surface MUST:
- Display the text "Tu solicitud está pendiente"
- Include a secondary button labeled "Cancelar solicitud" that invokes the existing cancel flow
- Use the same card styling as the join form

#### Scenario: pending request shows state UI
- GIVEN authenticated user with pending join request
- WHEN viewing project
- THEN pending state UI is rendered with cancel button

#### Scenario: cancel button triggers existing flow
- GIVEN pending state UI is visible
- WHEN user clicks "Cancelar solicitud"
- THEN existing cancel endpoint is called

## UNCHANGED Requirements

### Requirement: Guest Experience
- Guests MUST continue to see the authentication CTA instead of any join form or state UI

### Requirement: Creator/Participant Experience
- Project creators and participants MUST continue to see no join form or state UI

### Requirement: Closed Project Logic
- Closed projects MUST continue to hide all join-related UI for all viewers

### Requirement: Join Request Creation
- The join request creation flow and validation rules remain unchanged

### Requirement: Join Request Approval/Rejection
- The approval and rejection flows remain unchanged

## Implementation Notes
- Backend: Modify `ProjectController@show` to load viewer join request
- Backend: Update `ApiResourceTransformer` to include `viewerJoinRequest` in payload
- Frontend: Update `project-join-form.tsx` to render pending state UI when applicable
- Frontend: Update `show.tsx` to pass `viewerJoinRequest` to join form component