# Delta for project-phases-visibility

## ADDED Requirements

### Requirement: project show payload exposes public follow state for authenticated viewers

The system MUST include `is_following` and `unread_public_updates_count` in the project show payload for authenticated viewers. Guest payloads MUST NOT depend on follow state.

#### Scenario: authenticated follower sees unread count

- GIVEN an authenticated viewer follows a public project and has unseen public updates
- WHEN the project show page is rendered
- THEN the payload MUST expose `is_following = true`
- AND the payload MUST expose the unread public updates count

#### Scenario: guest payload stays follow-agnostic

- GIVEN the viewer is a guest
- WHEN the project show page is rendered
- THEN the payload MUST NOT require follow-specific state
- AND the phases section MUST still render according to the existing visibility rules

### Requirement: phases section can surface unread public updates

The system MUST render an unread indicator for authenticated viewers when `unread_public_updates_count` is greater than zero.

#### Scenario: unread indicator appears for followers

- GIVEN an authenticated follower has one or more unread public updates
- WHEN the project show page is rendered
- THEN the phases section MUST show an unread indicator

#### Scenario: unread indicator is hidden when count is zero

- GIVEN an authenticated viewer has no unread public updates
- WHEN the project show page is rendered
- THEN the unread indicator MUST be hidden
