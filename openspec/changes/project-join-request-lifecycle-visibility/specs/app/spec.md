# Delta for App: Project Join Request Lifecycle Visibility

## ADDED Requirements

### Requirement: Project Detail Join-Request State Precedence

The system MUST enforce the following precedence rules for join-request visibility on `projects/show`:

1. **Membership supersedes all**: If the authenticated viewer is a participant, the join-request section MUST NOT render.
2. **Approved state supersedes pending**: If the viewer has an approved join request, the join-request section MUST NOT render.
3. **Rejected state shows message**: If the viewer has a rejected join request, the system MUST render an informational message explaining the project has started and provide a link to `/projects`.
4. **Pending state shows form**: If the viewer has a pending join request, the system MUST render the current join-request form.
5. **No request shows CTA**: If the viewer has no join request and is not a participant, the system MUST render the join-request CTA.

#### Scenario: Participant sees no join-request section
- GIVEN authenticated viewer is a project participant
- WHEN visiting `projects/show`
- THEN join-request section is NOT rendered

#### Scenario: Approved applicant sees no join-request section
- GIVEN authenticated viewer has an approved join request
- WHEN visiting `projects/show`
- THEN join-request section is NOT rendered

#### Scenario: Rejected applicant sees informational message
- GIVEN authenticated viewer has a rejected join request
- WHEN visiting `projects/show`
- THEN join-request section renders an informational message:
  - Text: "The project creator has decided to start the project with the current team. You can [explore other projects](/projects)."
  - Link: `/projects`

#### Scenario: Pending applicant sees join-request form
- GIVEN authenticated viewer has a pending join request
- WHEN visiting `projects/show`
- THEN join-request section renders the current join-request form

#### Scenario: Eligible non-applicant sees join-request CTA
- GIVEN authenticated viewer has no join request and is not a participant
- WHEN visiting `projects/show`
- THEN join-request section renders the join-request CTA

## MODIFIED Requirements

### Requirement: Project Show Payload Contract

The `projects/show` endpoint MUST extend its payload to include `viewerJoinRequest` with the following structure:

```typescript
interface ViewerJoinRequest {
  id: number | null;
  status: 'pending' | 'approved' | 'rejected' | null;
  message: string | null;
}
```

(Previously: `viewerJoinRequest` only included pending requests)

#### Scenario: Payload includes approved/rejected states
- GIVEN authenticated viewer has an approved join request
- WHEN fetching `projects/show`
- THEN payload includes `viewerJoinRequest: { id: number, status: 'approved', message: string }`

#### Scenario: Payload includes null for non-applicants
- GIVEN authenticated viewer has no join request
- WHEN fetching `projects/show`
- THEN payload includes `viewerJoinRequest: null`

## UNCHANGED Requirements

### Requirement: Join Request Lifecycle

The system SHALL continue to use the existing lifecycle:
- `pending` → `approved` | `rejected`
- Approval MUST attach the user as a participant
- Rejection MUST NOT modify project relationships

### Requirement: Join Request Moderation

The system SHALL continue to enforce existing moderation rules:
- Only project owners can approve/reject requests
- Applicants can cancel pending requests
- No changes to notification or inbox behavior

### Requirement: Project Card Behavior

The system SHALL continue to render project cards without join-request state indicators. This delta applies ONLY to the project detail view.

### Requirement: Join Request Creation

The system SHALL continue to validate join request creation with:
- No duplicate pending requests
- No self-join attempts
- Message length (10-500 chars)