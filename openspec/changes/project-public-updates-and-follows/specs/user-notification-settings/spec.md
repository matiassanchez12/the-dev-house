# Delta for user-notification-settings

## ADDED Requirements

### Requirement: followed-project emails can be managed separately

The system MUST store a `follow_project_emails` preference in the user notification settings record. The preference MUST default to true and MUST be editable through the notification settings update flow.

#### Scenario: user disables followed-project emails

- GIVEN a signed-in user opens notification settings
- WHEN they disable followed-project emails and save
- THEN the system MUST persist `follow_project_emails = false`
- AND the collaboration emails preference MUST remain unchanged

#### Scenario: new notification settings default to enabled

- GIVEN a user has no notification settings row yet
- WHEN the system creates the record
- THEN `follow_project_emails` MUST default to true

### Requirement: update flow accepts the new preference without affecting privacy settings

The notification settings update endpoint MUST accept `follow_project_emails` and MUST keep notification preferences separate from privacy settings.

#### Scenario: notification settings update includes the new field

- GIVEN a signed-in user submits notification settings
- WHEN the payload includes `follow_project_emails`
- THEN the system MUST update that field on the notification settings record
- AND the privacy settings record MUST NOT be changed

#### Scenario: privacy form does not surface the new toggle

- GIVEN a user views privacy settings
- WHEN they inspect email-related controls
- THEN the system MUST NOT show followed-project email controls there
