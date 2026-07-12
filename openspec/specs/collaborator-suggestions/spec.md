# collaborator-suggestions Specification

## Purpose

Define the optional post-creation collaborator suggestion step that helps a creator find relevant users for a new project.

## Requirements

### Requirement: redirect to collaborator suggestions after successful project creation

The system MUST redirect the creator to a project collaborator suggestion page after a project is created successfully. Project creation MUST still succeed when the creator selects no invitations or skips the page.

#### Scenario: creator reaches the suggestion page

- GIVEN a project is created successfully
- WHEN the create request completes
- THEN the creator MUST be redirected to the project's collaborator suggestion page

#### Scenario: creator skips invitations

- GIVEN the suggestion page is shown
- WHEN the creator chooses to skip without selecting anyone
- THEN the project creation outcome MUST remain successful
- AND no invitations MUST be created

### Requirement: suggestions are based on simple tech overlap only

The system MUST suggest users who share at least one tech with the project. Matching MUST be limited to direct overlap and MUST NOT use scoring, ranking, or advanced matching rules reserved for later work.

#### Scenario: overlapping tech creates a suggestion

- GIVEN a project includes Laravel and React
- WHEN users are searched for suggestions
- THEN users who share Laravel or React MUST be eligible for suggestion

#### Scenario: no overlap yields no suggestion

- GIVEN no users share a tech with the project
- WHEN suggestions are loaded
- THEN the system MUST show an empty state instead of inventing matches

### Requirement: suggestions exclude ineligible users

The system MUST exclude the project creator, current participants, and users already invited to that project from suggestions.

#### Scenario: excluded users never appear

- GIVEN the creator, a participant, and an already-invited user all match project techs
- WHEN suggestions are loaded
- THEN none of those users MUST appear in the suggestion list

### Requirement: selecting suggestions sends project invitations

The system MUST allow the creator to select one or more suggested users and send invitations tied to the project.

#### Scenario: creator invites selected users

- GIVEN the suggestion page shows multiple eligible users
- WHEN the creator selects two users and submits
- THEN invitations MUST be created for those users only
- AND the project MUST remain in its created state
