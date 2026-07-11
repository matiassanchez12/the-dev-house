# Backend CI Specification

## Purpose

This spec defines the backend-only GitHub Actions workflow that runs the Laravel test suite on pull requests. It protects the existing passing tests while making the current baseline debt visible.

## Requirements

### Requirement: Workflow Triggering

The backend CI workflow MUST run on `pull_request` events that target the repository's default branch. It MUST NOT depend on frontend build events.

#### Scenario: PR to default branch triggers CI
- GIVEN a pull request targets the default branch
- WHEN the pull request is opened or updated
- THEN the backend CI workflow runs automatically

#### Scenario: Non-target branches do not trigger this workflow
- GIVEN a pull request does not target the default branch
- WHEN the pull request is updated
- THEN this backend workflow does not start

### Requirement: PHP and Composer Setup

The workflow MUST prepare a pure PHP test environment using PHP 8.2, the SQLite extension, and Composer dependency installation with caching. It MUST create the application `.env` file and generate an application key before tests run.

#### Scenario: Environment is bootstrapped for Laravel tests
- GIVEN a fresh GitHub Actions runner
- WHEN the setup steps execute
- THEN PHP 8.2 and SQLite are available, dependencies are installed, and the app key exists

#### Scenario: Backend CI does not require Node tooling
- GIVEN the backend workflow is configured
- WHEN the setup is reviewed
- THEN no Node installation or frontend build step is required for this job

### Requirement: Laravel Test Execution

The workflow MUST run the Laravel test suite through `composer run test`. The job MUST report the test result to GitHub checks without altering the test command.

#### Scenario: Test suite executes in CI
- GIVEN dependencies are installed and the app key is generated
- WHEN the test step runs
- THEN the workflow executes the Laravel tests and reports pass or fail

#### Scenario: Test failures remain visible
- GIVEN a test fails
- WHEN the workflow completes
- THEN the CI check is marked failed and the failure is shown in the PR checks panel

### Requirement: Baseline Failure Visibility

The workflow file MUST include a clear comment stating that 23 test failures are pre-existing baseline debt and are out of scope for this change. The workflow MUST NOT suppress or hide those failures.

#### Scenario: Reviewers can see known baseline debt
- GIVEN a reviewer opens the workflow file
- WHEN they inspect the test step
- THEN they can read that the current baseline includes 23 pre-existing failures

#### Scenario: Baseline debt does not mask red CI
- GIVEN the current baseline failures still exist
- WHEN the workflow runs
- THEN the job still fails normally and does not use continue-on-error to conceal the result
