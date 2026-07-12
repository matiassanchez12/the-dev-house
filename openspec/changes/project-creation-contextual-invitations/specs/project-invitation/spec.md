# project-invitation Specification

## Purpose

Define outbound project invitations so a creator can invite specific users to collaborate after project creation.

## Requirements

### Requirement: project-scoped invitation lifecycle

The system MUST allow a project owner to create and cancel invitations for a specific project and recipient. An invitation MUST belong to exactly one project and one recipient user.

#### Scenario: owner sends an invitation
- GIVEN a project owner is viewing the collaborator page
- WHEN they invite a suggested user
- THEN the system MUST create a pending invitation for that project and recipient
- AND the recipient MUST be notified

#### Scenario: non-owner cannot manage invitations
- GIVEN a non-owner user attempts to invite or cancel for a project
- WHEN the action is submitted
- THEN the system MUST deny the action

### Requirement: duplicate active invitations are blocked

The system MUST NOT create more than one active invitation for the same project and recipient. A recipient already invited to a project MUST be excluded from new invitation attempts for that project.

#### Scenario: duplicate invitation is rejected
- GIVEN a pending invitation already exists for a project and user
- WHEN the owner tries to invite that same user again
- THEN the system MUST NOT create a second active invitation

### Requirement: canceling an invitation removes the pending record

The system MUST allow the project owner to cancel a pending invitation. Canceling an invitation MUST remove or inactivate the invitation without changing project membership.

#### Scenario: owner cancels a pending invitation
- GIVEN a pending invitation exists
- WHEN the owner cancels it
- THEN the invitation MUST no longer be pending
- AND the recipient MUST not become a project participant as a result of cancellation
