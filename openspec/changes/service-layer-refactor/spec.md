# Delta: service-layer-refactor

## ADDED Requirements

### Requirement: ProjectService MUST provide slug generation, image management, and project CRUD operations

The system MUST provide a `ProjectService` class in `app/Services/ProjectService.php` that encapsulates all project-related business logic including slug generation, image upload/delete, and project creation/update with tech associations.

#### Scenario: generateUniqueSlug creates URL-safe slug from title

- GIVEN a project title "My Awesome Project"
- WHEN `generateUniqueSlug("My Awesome Project")` is called
- THEN it MUST return "my-awesome-project"
- AND if "my-awesome-project" already exists in DB, append `-2` to make "my-awesome-project-2"

#### Scenario: generateUniqueSlug accepts excludeId to skip own slug

- GIVEN project with title "Existing" and id=5 with slug "existing"
- WHEN `generateUniqueSlug("Existing", excludeId: 5)` is called
- THEN it MUST return "existing" (no increment, skips self)

#### Scenario: create attaches techs and sets creator

- GIVEN authenticated user with valid `StoreProjectRequest` data (title, description, vision, techs[], repository_url, demo_url, images[])
- WHEN `create(user, data)` is called
- THEN it MUST create Project with slug from title
- AND attach provided techs via `project->techs()->attach($techIds)`
- AND set `creator_id` to user.id

#### Scenario: update handles tech sync, slug refresh, and image removal

- GIVEN existing project and `UpdateProjectRequest` data (title, description, vision, techs[], repository_url, demo_url, images[], remove_images[])
- WHEN `update(project, data)` is called
- THEN if title changed, it MUST regenerate slug via `generateUniqueSlug(newTitle, project.id)`
- AND sync techs: detach missing, attach new (`project->techs()->sync($techIds)`)
- AND process `remove_images[]` by calling `deleteImages($paths)`

#### Scenario: uploadImages stores files and returns paths

- GIVEN array of uploaded file objects
- WHEN `uploadImages($files)` is called
- THEN it MUST store each file in `storage/app/projects/`
- AND return array of stored paths

#### Scenario: deleteImages removes files from storage

- GIVEN array of file paths relative to storage
- WHEN `deleteImages($paths)` is called
- THEN it MUST delete each file from disk
- AND throw no exception if file does not exist

---

### Requirement: JoinRequestService MUST validate, create, and manage join request lifecycle

The system MUST provide a `JoinRequestService` class in `app/Services/JoinRequestService.php` that handles duplicate prevention, self-join guard, and the full request lifecycle (approve/reject/cancel).

#### Scenario: validateCanCreate throws on duplicate request

- GIVEN project with existing pending join request from user
- WHEN `validateCanCreate(project, user)` is called
- THEN it MUST throw `DuplicateJoinRequestException`

#### Scenario: validateCanCreate throws on self-join attempt

- GIVEN project owned by user
- WHEN `validateCanCreate(project, user)` is called
- THEN it MUST throw `SelfJoinException`

#### Scenario: create produces pending JoinRequest

- GIVEN valid project and user passing validation
- WHEN `create(project, user, message)` is called
- THEN it MUST create JoinRequest with status=pending
- AND link project and user

#### Scenario: approve attaches user as participant and updates status

- GIVEN pending join request
- WHEN `approve(joinRequest)` is called
- THEN it MUST set status to "approved"
- AND attach applicant to project via `project->participants()->attach(user.id)`

#### Scenario: reject sets status to rejected

- GIVEN pending join request
- WHEN `reject(joinRequest)` is called
- THEN it MUST set status to "rejected"
- AND modify no project relationships

#### Scenario: cancel deletes the join request

- GIVEN pending join request owned by applicant
- WHEN `cancel(joinRequest)` is called
- THEN it MUST delete the JoinRequest record

---

### Requirement: DashboardService MUST consolidate five dashboard queries into one method

The system MUST provide a `DashboardService` class in `app/Services/DashboardService.php` that returns all dashboard data in a single call to avoid N+1 queries.

#### Scenario: getDashboardData returns all stats and projects

- GIVEN authenticated user
- WHEN `getDashboardData(user)` is called
- THEN it MUST return array with keys: `stats` (total created, participating, pending requests), `createdProjects` (Collection), `participatingProjects` (Collection), `pendingRequests` (received, pending), `sentRequests` (user's own pending)

---

### Requirement: ProfileService MUST handle avatar, tech sync, and account deletion

The system MUST provide a `ProfileService` class in `app/Services/ProfileService.php` that encapsulates avatar upload/delete, tech proficiency mapping, and user deletion.

#### Scenario: updateAvatar stores file and returns path

- GIVEN authenticated user and uploaded avatar file
- WHEN `updateAvatar(user, file)` is called
- THEN it MUST delete existing avatar if present
- AND store new file in `storage/app/avatars/`
- AND update user.avatar_path
- AND return the stored path

#### Scenario: deleteAvatar removes file and clears path

- GIVEN authenticated user with avatar_path set
- WHEN `deleteAvatar(user)` is called
- THEN it MUST delete file from storage
- AND set user.avatar_path to null

#### Scenario: syncTechs maps pivot data (proficiency) with tech sync

- GIVEN authenticated user and array of techs with pivot data `[{id, proficiency}]`
- WHEN `syncTechs(user, techs)` is called
- THEN it MUST sync via `user->techs()->sync($techsWithPivot)` where pivot includes proficiency

#### Scenario: deleteAccount removes user and avatar

- GIVEN authenticated user
- WHEN `deleteAccount(user)` is called
- THEN it MUST delete avatar file if exists
- AND delete user record
- AND cascade-delete related JoinRequests (applicant)

---

### Requirement: ProjectPolicy MUST enforce owner-only authorization

The system MUST provide a `ProjectPolicy` class in `app/Policies/ProjectPolicy.php` that uses Laravel's native policy authorization.

#### Scenario: update allows only project owner

- GIVEN project with `user_id` matching current user
- WHEN policy `update(project, user)` is called via Gates/Controllers
- THEN it MUST return true
- AND return false for any other user

#### Scenario: delete allows only project owner

- GIVEN project with `user_id` matching current user
- WHEN policy `delete(project, user)` is called
- THEN it MUST return true

#### Scenario: manage is alias for update

- GIVEN project with `user_id` matching current user
- WHEN policy `manage(project, user)` is called
- THEN it MUST return same result as `update(project, user)`

---

### Requirement: JoinRequestPolicy MUST enforce role-based authorization

The system MUST provide a `JoinRequestPolicy` class in `app/Policies/JoinRequestPolicy.php` that uses Laravel's native policy authorization.

#### Scenario: approve/reject allow only project owner

- GIVEN join request for project where current user is owner
- WHEN policy `approve(joinRequest, user)` is called
- THEN it MUST return true
- AND `reject(joinRequest, user)` MUST return true

#### Scenario: cancel allows only applicant

- GIVEN join request where current user is the applicant
- WHEN policy `cancel(joinRequest, user)` is called
- THEN it MUST return true
- AND return false for any other user

---

### Requirement: FormRequests MUST validate input for project and profile operations

The system MUST provide FormRequest classes in `app/Http/Requests/` for all validation logic currently embedded in controllers.

#### Scenario: StoreProjectRequest validates title unique, description max, techs array non-empty

- GIVEN request with title, description, vision, techs[], repository_url, demo_url, images[]
- WHEN FormRequest validation runs
- THEN title MUST be required, unique, max 255
- AND description MUST be required, max 1000
- AND techs MUST be array with at least 1 element
- AND images array MUST have max 5 files, each max 2MB

#### Scenario: UpdateProjectRequest accepts remove_images array

- GIVEN request with same fields plus `remove_images[]`
- WHEN FormRequest validation runs
- THEN all StoreProjectRequest rules apply
- AND remove_images MUST be array of existing image paths

#### Scenario: StoreJoinRequestRequest validates message only

- GIVEN request with message
- WHEN FormRequest validation runs
- THEN message MUST be required, min 10 chars, max 500

#### Scenario: UpdateCompleteProfileRequest validates bio, avatar, techs with pivot

- GIVEN request with bio, avatar file, techs[{id, proficiency}]
- WHEN FormRequest validation runs
- THEN bio MUST be optional, max 1000
- AND avatar MUST be optional image file, max 2MB, jpg/png/webp
- AND techs MUST be array where each item has id (exists in techs table) and proficiency (beginner|intermediate|advanced)

## MODIFIED Requirements

None — this is a pure refactor preserving all existing behavior.

## REMOVED Requirements

None — no behavior is removed, only relocated.