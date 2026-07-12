# Delta for project-invitation

## MODIFIED Requirements

### Requirement: duplicate active invitations are blocked

The system MUST NOT create more than one active invitation for the same project and recipient. Any invitation with status `pending`, `accepted`, or `rejected` MUST block a new invite for that project and recipient.
(Previously: Only pending invitations were explicitly blocked from re-invitation.)

#### Scenario: pending invitation still blocks a duplicate

- GIVEN a pending invitation exists for a project and user
- WHEN the owner tries to invite that same user again
- THEN the system MUST NOT create a second active invitation

#### Scenario: responded invitation also blocks a duplicate

- GIVEN an accepted or rejected invitation exists for a project and user
- WHEN the owner tries to invite that same user again
- THEN the system MUST NOT create a new invitation
