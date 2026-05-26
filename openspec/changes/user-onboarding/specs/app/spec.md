# Delta for App — user-onboarding change

## MODIFIED Requirements

### Requirement: DashboardService Requirements

`getDashboardData` MUST return all 5 keys: `stats`, `createdProjects`, `participatingProjects`, `pendingRequests`, `sentRequests` AND the boolean `isProfileComplete`.
(Previously: returned only the 5 keys without isProfileComplete)

#### Scenario: getDashboardData includes isProfileComplete

- GIVEN: a User with bio, avatar, and at least 1 tech with proficiency
- WHEN: `getDashboardData($user)` is called
- THEN: returns `['stats', 'createdProjects', 'participatingProjects', 'pendingRequests', 'sentRequests', 'isProfileComplete' => true]`

#### Scenario: getDashboardData shows incomplete for empty profile

- GIVEN: a User with no bio, no avatar, and no techs
- WHEN: `getDashboardData($user)` is called
- THEN: returns `['isProfileComplete' => false]`

## ADDED Requirements

### Requirement: profile-completion-timestamp

The system MUST add `profile_completed_at` (timestamp, nullable) to the `users` table via migration.

### Requirement: profile-completeness-check

The User model MUST expose `isProfileComplete` as a computed boolean property that returns `true` when ALL of the following are satisfied:
- `bio` is not empty
- `avatar` is not null
- User has at least 1 tech with a non-null `proficiency` value in the pivot

#### Scenario: Profile completeness check returns false for empty profile

- GIVEN: user with no bio, no avatar, no techs
- WHEN: `isProfileComplete` is called
- THEN: returns false

#### Scenario: Profile completeness check returns false for missing avatar

- GIVEN: user with bio, but no avatar
- WHEN: `isProfileComplete` is called
- THEN: returns false

#### Scenario: Profile completeness check returns false for no techs

- GIVEN: user with bio and avatar, but 0 techs
- WHEN: `isProfileComplete` is called
- THEN: returns false

#### Scenario: Profile completeness check returns false for techs without proficiency

- GIVEN: user with bio, avatar, and 1+ techs but none have proficiency set
- WHEN: `isProfileComplete` is called
- THEN: returns false

#### Scenario: Profile completeness check returns true for complete profile

- GIVEN: user with bio, avatar, and 1+ techs with proficiency
- WHEN: `isProfileComplete` is called
- THEN: returns true

### Requirement: onboarding-banner-component

The system MUST render an `OnboardingBanner` component on the dashboard when `isProfileComplete` is `false`.

The banner MUST:
- Display the message: "Completá tu perfil para conectar con colaboradores" with a link to `/profile/edit`
- Include a dismiss button (X icon)
- Use semantic CSS token classes: `bg-primary/10`, `text-foreground`, `border-primary/20`

#### Scenario: Banner shows for incomplete profile

- GIVEN: `isProfileComplete` is false
- WHEN: dashboard renders
- THEN: OnboardingBanner is visible

#### Scenario: Banner hidden for complete profile

- GIVEN: `isProfileComplete` is true
- WHEN: dashboard renders
- THEN: OnboardingBanner is not rendered

### Requirement: dismiss-banner-route

The system MUST provide a POST route `/dashboard/dismiss-banner` that:
- Sets session flag `banner_dismissed: true`
- Redirects back to `/dashboard`

This route MUST be POST (not GET) to prevent accidental activation.

#### Scenario: Banner hidden after dismissal

- GIVEN: user dismissed banner in current session (`banner_dismissed` session flag is true)
- WHEN: dashboard renders
- THEN: OnboardingBanner is not rendered

### Requirement: dashboard-shows-banner

The dashboard view MUST conditionally render OnboardingBanner when BOTH:
- `isProfileComplete` is false
- Session does NOT have `banner_dismissed` flag

### Requirement: sample-projects-seeder

`DatabaseSeeder` MUST seed 4 sample projects when the `projects` table is empty.

| # | Title | Description | Techs | Status |
|---|-------|-------------|-------|--------|
| 1 | DevCollab API Wrapper | Laravel package wrapping the DevCollab REST API with typed responses and retry logic | Laravel, React | open |
| 2 | Portfolio Template | Clean developer portfolio with dark mode, blog support, and project showcase | Vue, Tailwind | open |
| 3 | DevCollab Mobile App | Cross-platform mobile app for DevCollab using React Native and Firebase | React Native, Firebase | in_progress |
| 4 | Open Source Docs Site | Documentation site for DevCollab with MDX support and search | Next.js, MDX | completed |

Each project MUST have: title, description, techs (2–3), and a creator (first user or placeholder).

#### Scenario: Sample projects seeded when table is empty

- GIVEN: projects table is empty
- WHEN: `php artisan db:seed` runs
- THEN: 4 sample projects exist in database

#### Scenario: Sample projects NOT seeded when table has projects

- GIVEN: projects table has existing projects
- WHEN: `php artisan db:seed` runs
- THEN: no additional projects added (conditional seed)

### Requirement: sample-users-seeder

`DatabaseSeeder` MUST seed 2–3 sample users with profiles when the `users` table has fewer than 3 users.

Each user MUST have: name, email, avatar (placeholder URL), bio, and techs with proficiency.

These users serve as creators for sample projects.

#### Scenario: Sample users seeded when table has few users

- GIVEN: users table has fewer than 3 users
- WHEN: `php artisan db:seed` runs
- THEN: 2–3 sample users exist with profiles