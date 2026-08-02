# project-public-update-read-state Specification

## Purpose

Define how public project updates become unread or seen for authenticated followers and guest viewers on `projects.show` and `milestones.index`.

## Requirements

### Requirement: unread state is derived from phase activity only

The system MUST treat a project as unread only when the latest phase `created_at` or `updated_at` is newer than the viewer's last seen time. It MUST NOT use notifications, email delivery, or future public update types.

#### Scenario: phase activity creates unread state

- GIVEN a viewer has previously seen a public project
- WHEN a phase is created or updated after that time
- THEN the project MUST be unread

#### Scenario: non-phase updates do not affect unread state

- GIVEN a project has no newer phase activity
- WHEN notification or email behavior changes elsewhere
- THEN unread state MUST remain unchanged

### Requirement: authenticated followers use database-backed seen state on valid surfaces

The system MUST store authenticated follower seen state in the project follow record and MUST mark followed projects as seen when rendering `projects.show` or `milestones.index`. On milestones, the system MUST mark only projects present on the rendered page.

#### Scenario: project show marks a followed project as seen

- GIVEN an authenticated follower opens a project show page
- WHEN the page renders
- THEN the project MUST be marked seen for that follower
- AND unread state MUST be false on that response

#### Scenario: milestones marks only visible followed projects

- GIVEN an authenticated follower opens milestones with multiple projects
- WHEN the page renders
- THEN only followed projects on that page MUST be marked seen
- AND projects not rendered on the page MUST remain unchanged

### Requirement: guests use versioned localStorage read state on the same valid surfaces

The system MUST persist guest follows and seen state in versioned localStorage so guest viewers can detect unread updates on `projects.show` and `milestones.index`. Guest storage failures MUST NOT block rendering.

#### Scenario: guest sees unread on a followed project

- GIVEN a guest has followed a project in localStorage
- WHEN the project gains newer phase activity and the page renders
- THEN the UI MUST show an unread indicator

#### Scenario: storage unavailable does not break the page

- GIVEN localStorage is unavailable or quota-limited
- WHEN a guest opens a valid surface
- THEN the page MUST still render
- AND the system MUST NOT create server-side follow state
