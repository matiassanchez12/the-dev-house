# Delta for project-follow

## MODIFIED Requirements

### Requirement: follow persistence includes a future read-state seam

The system MUST persist project follows with a nullable `seen_at` value that supports public update read-state. New follow records MUST initialize `seen_at` to the current time so a fresh follow does not produce a false unread backlog. Current follow and unfollow behavior MUST remain driven by the follow relationship itself.
(Previously: `seen_at` was reserved for later read-state work, and follow behavior did not depend on it.)

#### Scenario: new follow stores current seen_at

- GIVEN an authenticated user follows a public project
- WHEN the follow record is persisted
- THEN the follow relationship MUST include `seen_at` set to the current time

#### Scenario: follow and unfollow stay relationship-driven

- GIVEN a stored follow relationship has any nullable `seen_at` value
- WHEN follow or unfollow behavior is evaluated
- THEN the result MUST remain driven by the follow relationship itself
