## Exploration: Project Join Request Visibility

### Current State
The project show page (`resources/js/pages/projects/show.tsx`) currently renders a `ProjectJoinForm` component unconditionally for non-creator users when the project status is "open". The form is rendered via:

```tsx
<ProjectJoinForm
    projectId={project.id}
    isOpen={project.status === 'open'}
    isCreator={isCreator}
    user={auth.user}
/>
```

The backend (`ProjectController@show`) loads the project with its creator, techs, and participants, but **does not include any information about the current viewer's join requests** for this project. The `ApiResourceTransformer::project()` method scrubs the project payload but does not append viewer-specific state.

---

### Affected Areas
- `app/Http/Controllers/ProjectController.php` — **Backend data contract**: Must expose viewer's join request state.
- `app/Helpers/ApiResourceTransformer.php` — **Payload transformation**: Must include viewer's join request if exists.
- `resources/js/pages/projects/show.tsx` — **Page logic**: Must conditionally render join request UI based on viewer state.
- `resources/js/components/projects/show/project-join-form.tsx` — **Component logic**: Must adapt to viewer's join request state (pending/approved/rejected).
- `tests/Feature/JoinRequestTest.php` — **Test coverage**: Must verify visibility rules and backend payload.
- `tests/Feature/ProjectTest.php` — **Test coverage**: Must verify project show endpoint includes viewer state.

---

### Approaches

#### 1. **Boolean Flag (`hasPendingJoinRequest`)**
   - **Description**: Backend exposes a simple boolean flag in the project payload indicating whether the current viewer has a pending join request.
   - **Pros**: Minimal payload size, simple frontend logic, easy to test.
   - **Cons**: Limited extensibility (cannot show approved/rejected state), frontend cannot show request details.
   - **Effort**: Low

#### 2. **Viewer Join Request Object (`viewerJoinRequest`)**
   - **Description**: Backend includes the full join request object (if exists) in the project payload, keyed as `viewerJoinRequest`.
   - **Pros**: Full visibility into request state (pending/approved/rejected), frontend can show request details, extensible for future UI enhancements.
   - **Cons**: Slightly larger payload, requires frontend logic to handle all states.
   - **Effort**: Medium

#### 3. **Transform via `ApiResourceTransformer`**
   - **Description**: Extend `ApiResourceTransformer::project()` to append the viewer's join request (if exists) to the project payload.
   - **Pros**: Consistent with existing transformation patterns, centralized logic, reusable across other endpoints.
   - **Cons**: Requires passing viewer context to transformer, slightly more complex than a boolean flag.
   - **Effort**: Medium

#### 4. **Hybrid (Boolean + Object)**
   - **Description**: Backend exposes both a boolean flag (`hasPendingJoinRequest`) and the full object (`viewerJoinRequest`).
   - **Pros**: Best of both worlds (simple checks + full details).
   - **Cons**: Redundant data, overkill for current requirements.
   - **Effort**: Medium

---

### Recommendation
**Approach 2 + 3: Viewer Join Request Object via `ApiResourceTransformer`**

- **Why**:
  - Aligns with the existing pattern of transforming Eloquent models to API payloads.
  - Provides full visibility into the viewer's join request state, enabling richer UI feedback.
  - Extensible for future requirements (e.g., showing approval/rejection dates).
  - Minimal frontend logic changes (replace `ProjectJoinForm` with a state-aware component).

- **Implementation**:
  1. Modify `ProjectController@show` to load the viewer's join request for the project.
  2. Extend `ApiResourceTransformer::project()` to append `viewerJoinRequest` to the payload.
  3. Update `ProjectJoinForm` to render different UI states based on `viewerJoinRequest.status`:
     - `null`: Show form (no request exists).
     - `pending`: Show "Request pending" card with cancel option.
     - `approved`: Show "You're a participant" card.
     - `rejected`: Show "Request rejected" card with re-apply option.

---

### Risks
- **Performance**: Additional query to fetch the viewer's join request. Mitigation: Use `with()` or `load()` to eager-load.
- **Race Conditions**: Viewer could submit a request between page load and form submission. Mitigation: Backend validation (already implemented in `JoinRequestService@validateCanCreate`).
- **Scope Creep**: Initial scope focuses on `pending` state, but approved/rejected states may require UI work. Mitigation: Start with `pending` and extend as needed.
- **Testing**: Requires new tests for payload structure and UI state. Mitigation: Strict TDD ensures coverage.

---

### Ready for Proposal
**Yes**. 
The exploration confirms the architecture is feasible and aligns with existing patterns. The orchestrator should:
1. Confirm the recommended approach with the user.
2. Proceed to the **proposal phase** for `project-join-request-visibility`, focusing on:
   - Backend payload transformation.
   - Frontend state-aware UI.
   - TDD test coverage for visibility rules.