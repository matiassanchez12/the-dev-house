# project-invitation-response Specification

## Purpose

Define how an invited user responds to a project invitation in V1. This covers in-app accept/reject behavior only.

## Requirements

### Requirement: invited users can respond to pending invitations

The system MUST show accept and reject actions only to the invited recipient while the invitation is pending. Non-recipients and non-pending invitations MUST NOT be able to respond.

#### Scenario: invited user sees response actions

- GIVEN an authenticated invited user has a pending invitation
- WHEN they open the project show page
- THEN the system MUST render accept and reject actions

#### Scenario: unauthorized response is denied

- GIVEN a different authenticated user or the project creator attempts to respond
- WHEN accept or reject is submitted
- THEN the system MUST deny the request

### Requirement: accepting an invitation joins the project and notifies the creator

The system MUST mark a pending invitation as accepted when the invited user accepts it. Acceptance MUST add the user as a project participant and MUST create a creator notification of type `ProjectInvitationAccepted`.

#### Scenario: accept invitation

- GIVEN a pending invitation for the viewer
- WHEN they accept it
- THEN the invitation MUST become accepted
- AND the user MUST be added to project participants
- AND the creator MUST receive an in-app notification

#### Scenario: duplicate accept is denied

- GIVEN the invitation has already been accepted
- WHEN the user submits accept again
- THEN the system MUST not create duplicate participant links
- AND the request MUST be denied

### Requirement: rejecting an invitation records the response without joining the project

The system MUST mark a pending invitation as rejected when the invited user rejects it. Rejection MUST NOT add the user as a participant. A rejected invitation MUST NOT block a later JoinRequest from that user.

#### Scenario: reject invitation

- GIVEN a pending invitation for the viewer
- WHEN they reject it
- THEN the invitation MUST become rejected
- AND the user MUST not be added as a participant

#### Scenario: rejected invitation does not block JoinRequest

- GIVEN a rejected invitation exists for the user and project
- WHEN the user submits a JoinRequest
- THEN the system MUST allow the JoinRequest flow to proceed

### Requirement: an invitation can have only one terminal response

The system MUST NOT allow more than one terminal response for the same invitation. Once an invitation is accepted or rejected, further response attempts MUST be denied.

#### Scenario: second response is denied

- GIVEN an invitation has already been accepted
- WHEN the user tries to reject it
- THEN the request MUST be denied
