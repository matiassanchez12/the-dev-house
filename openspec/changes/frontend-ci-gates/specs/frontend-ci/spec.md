# Frontend CI Workflow Specification

## Purpose

Protect frontend pull requests by making tests and build blocking checks, while exposing TypeScript typecheck results as clearly informational until the existing TS debt is resolved in a separate change.

## Requirements

### Requirement: Blocking Frontend Test Check

The frontend CI workflow MUST run the frontend test suite on each workflow execution and MUST fail the workflow when tests fail.

#### Scenario: tests pass

- GIVEN a pull request with valid frontend changes
- WHEN the workflow runs the frontend test job
- THEN the test job completes successfully
- AND the workflow remains eligible to pass

#### Scenario: tests fail

- GIVEN a pull request with a frontend regression
- WHEN the workflow runs the frontend test job
- THEN the test job fails
- AND the workflow fails

### Requirement: Blocking Frontend Build Check

The frontend CI workflow MUST run the frontend production build on each workflow execution and MUST fail the workflow when the build fails.

#### Scenario: build passes

- GIVEN a pull request with build-safe frontend changes
- WHEN the workflow runs the frontend build job
- THEN the build job completes successfully
- AND the workflow remains eligible to pass

#### Scenario: build fails

- GIVEN a pull request that breaks the frontend build
- WHEN the workflow runs the frontend build job
- THEN the build job fails
- AND the workflow fails

### Requirement: Informational Frontend Typecheck Result

The frontend CI workflow MUST run frontend typecheck while TS debt remains and MUST report the result clearly as informational without blocking merge eligibility.

#### Scenario: typecheck fails during TS debt period

- GIVEN tests and build pass but known TypeScript debt remains
- WHEN the workflow runs the frontend typecheck job
- THEN the typecheck result is reported clearly as informational
- AND the workflow does not fail because of typecheck alone

#### Scenario: typecheck passes

- GIVEN the frontend TypeScript issues have been resolved
- WHEN the workflow runs the frontend typecheck job
- THEN the job reports success
- AND the workflow continues to treat the check consistently
