# user-notification-settings Specification

## Purpose

Define a dedicated notification preferences domain separate from privacy settings, starting with a single collaboration emails category.

## Requirements

### Requirement: dedicated notification preferences are stored separately from privacy settings

The system MUST store notification preferences in a 1:1 notification settings record for each user. Privacy settings MUST remain focused on profile visibility and related privacy concerns.

#### Scenario: user opens notification settings

- GIVEN a signed-in user visits profile settings
- WHEN they view notification preferences
- THEN the system MUST show a notification settings section
- AND the collaboration emails preference MUST be editable there

#### Scenario: privacy settings no longer own the email toggle

- GIVEN a user views privacy settings
- WHEN they inspect email-related controls
- THEN the system MUST NOT present the collaboration emails toggle in the privacy form

### Requirement: collaboration emails can be enabled or disabled

The system MUST support a `collaboration_emails` preference with a default value of true. Optional collaboration emails MUST be sent only when this preference is enabled.

#### Scenario: user disables collaboration emails

- GIVEN a user saves collaboration emails as disabled
- WHEN an optional collaboration email would be sent
- THEN the system MUST suppress the mail channel for that user

#### Scenario: mandatory emails are unaffected

- GIVEN a user disables collaboration emails
- WHEN the system sends an auth or security email
- THEN the system MUST still send that email

### Requirement: existing email notification data is preserved during migration

The system MUST migrate existing `email_notifications_enabled` values into collaboration email preferences and MUST keep backward-compatible fallback behavior during the transition window.

#### Scenario: legacy false value is migrated

- GIVEN a user has `email_notifications_enabled = false` in privacy settings
- WHEN the notification settings migration runs
- THEN the user’s collaboration emails preference MUST be false

#### Scenario: missing legacy data defaults to enabled

- GIVEN a user has no legacy privacy settings row
- WHEN the migration creates notification settings
- THEN the collaboration emails preference MUST default to true
