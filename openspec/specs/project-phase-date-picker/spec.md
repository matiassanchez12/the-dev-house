# project-phase-date-picker Specification

## Purpose

Define the date input behavior for project phases so the UI matches shadcn/ui patterns while preserving Laravel submission semantics.

## Requirements

### Requirement: shadcn-compatible phase date picker

The system MUST use a shadcn-compatible date picker for project phase `completed_at` fields in both create and edit flows. The control MUST support choosing a date without requiring direct typing.

#### Scenario: create flow uses date picker

- GIVEN a user is creating a phase
- WHEN they open the `completed_at` control
- THEN they MUST interact with a date picker UI
- AND the selected date MUST populate the field

#### Scenario: edit flow uses date picker

- GIVEN a user is editing an existing phase
- WHEN they open the `completed_at` control
- THEN the current value MUST be represented in the picker

### Requirement: Laravel-compatible date submission

The system MUST submit the selected `completed_at` value to Laravel as `YYYY-MM-DD`. The submitted value MUST remain compatible with existing Laravel date validation and persistence.

#### Scenario: selected date serializes correctly

- GIVEN a user selects June 6, 2026
- WHEN the phase form is submitted
- THEN the request payload MUST contain `completed_at=2026-06-06`

#### Scenario: empty date stays empty

- GIVEN the user clears the date selection
- WHEN the form is submitted
- THEN the request payload MUST send an empty `completed_at` value
