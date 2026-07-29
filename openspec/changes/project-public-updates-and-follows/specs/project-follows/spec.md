# project-follows Specification

## Purpose

Define follow/unfollow behavior for public projects and how authenticated and guest viewers track public progress as seen.

## Requirements

### Requirement: public projects can be followed with self-follow prevention

The system MUST allow users to follow and unfollow public projects. Project creators MUST NOT be able to follow their own project.

#### Scenario: authenticated user follows a public project

- GIVEN a signed-in user views a public project they do not own
- WHEN they follow the project
- THEN the system MUST record the follow state for that user
- AND the project MUST be treated as followed for future public updates

#### Scenario: creator cannot follow own project

- GIVEN the project creator views their own public project
- WHEN they attempt to follow it
- THEN the system MUST reject the action
- AND no follow state MUST be created

### Requirement: authenticated followers track public progress as seen on either valid surface

The system MUST store authenticated read state per project and MUST update it when a follower views either the project show page or the milestones list. Public update read state MUST remain extensible for future public update types.

#### Scenario: project show marks updates as seen

- GIVEN an authenticated follower has unread public updates for a project
- WHEN they view the project show page
- THEN the system MUST update the follower’s seen timestamp for that project
- AND the unread count MUST drop to zero

#### Scenario: milestones list also marks updates as seen

- GIVEN an authenticated follower has unread public updates for a project
- WHEN they view the milestones list for that project
- THEN the system MUST update the follower’s seen timestamp for that project
- AND that view MUST count as seen

### Requirement: guests track follows and seen state in localStorage

The system MUST support guest follow and seen state in localStorage. Guest state MUST be device-local and MUST not require a database record.

#### Scenario: guest returns on the same device

- GIVEN a guest has previously followed a public project on the same device
- WHEN they revisit the project or milestones view
- THEN the system MUST restore the guest follow state
- AND the unread indicator MUST reflect the stored seen state

#### Scenario: guest on a different device has no state

- GIVEN a guest uses a different browser or device
- WHEN they visit the same public project
- THEN the system MUST NOT assume prior follow state
