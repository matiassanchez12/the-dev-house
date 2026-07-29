# public-update-notifications Specification

## Purpose

Define queued notifications for public project progress changes without slowing the phase publish request.

## Requirements

### Requirement: phase create and update dispatch public-update fan-out asynchronously

The system MUST dispatch follower notification fan-out after a phase create or update commits. The originating request MUST NOT wait for notification delivery to finish.

#### Scenario: phase creation stays fast

- GIVEN a public project has one or more followers
- WHEN a creator creates a phase
- THEN the phase request MUST complete before notification delivery finishes
- AND a queued fan-out job MUST be scheduled

#### Scenario: phase update also fans out

- GIVEN a public project has followers
- WHEN a creator updates an existing phase
- THEN the system MUST schedule the same public-update fan-out flow
- AND the request MUST remain non-blocking

### Requirement: followers receive in-app notifications and optional email

The system MUST create a public-update in-app notification for each follower on phase create or update. The system MUST send email only to followers who have enabled followed-project emails.

#### Scenario: email-enabled follower receives both channels

- GIVEN a follower has followed-project emails enabled
- WHEN a phase is created or updated
- THEN the follower MUST receive an in-app notification
- AND the follower MUST receive an email

#### Scenario: email-disabled follower still receives in-app notification

- GIVEN a follower has followed-project emails disabled
- WHEN a phase is created or updated
- THEN the follower MUST receive an in-app notification
- AND the system MUST NOT send the email

### Requirement: notification payload identifies the public project update

The system MUST include the project identity, phase identity, and update event type in each public-update notification. Active clients MUST be able to refresh from the notification without ambiguity.

#### Scenario: created and updated events are distinguishable

- GIVEN a public project phase is created
- WHEN the notification is generated
- THEN the payload MUST identify the event as created

#### Scenario: updated event targets the same project

- GIVEN a public project phase is updated
- WHEN the notification is generated
- THEN the payload MUST identify the event as updated
- AND the project reference MUST match the updated phase
