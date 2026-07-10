# Design: TypeScript Projects Domain Typing Fixes

## Technical Approach

Apply a narrow, type-only cleanup for the projects domain. The implementation keeps runtime behavior unchanged and aligns local props, tests, and ambient globals with the contracts already used by the React/Inertia code. No shared type should be relaxed unless the current backend/page contract already requires it.

## Architecture Decisions

| Area | Choice | Alternatives considered | Rationale |
|------|--------|-------------------------|-----------|
| Status transitions | Type the transition map as `Record<ProjectStatus, ProjectStatus[]> & { all: ProjectStatus[] }`. | Remove `all`; widen to `Record<string, ...>`. | Keeps the existing UI list behavior while preserving strict status keys for real project statuses. |
| Select handlers | Wrap `setSelectedTech` and `setSelectedStatus` with `(value) => setX(value ?? '')`. | Change state to `string \| null`; cast handlers. | Base UI can emit `null`, while the page already treats empty string as “no filter”. Normalization at the boundary is explicit and safe. |
| Show page auth typing | Type `Props.auth.user` as `User \| null`. | Keep partial user and cast at call site. | `ProjectJoinForm` needs a full `User`; the page already passes `auth.user` directly, so the page prop should reflect that contract. |
| Join request preview | Replace `Pick<JoinRequest, 'id' \| 'status' \| 'message'>` with a local preview type where `message?: string`. | Make `JoinRequest.message` optional globally. | `Project.viewerJoinRequest` is a lightweight page payload; global `JoinRequest` represents the persisted model where message is required. |
| Test fixtures | Complete inline fixture objects with required fields or annotate page-specific fixture shapes. | Add fixture factories now. | Keeps the PR small and fixes only the failing domain tests. Factories are useful but out of scope. |
| Global route binding | Change `declare global { const route: ... }` to `var route: ...`. | Keep `const` and cast every test access. | `var` declares a global property visible through `globalThis.route`, matching Vitest setup patterns without repeated casts. |

## Data Flow

Runtime data flow is unchanged.

```text
Backend Inertia props ──→ projects page props ──→ projects components
        │                         │                      │
        └── existing data ────────┴── type alignment ────┘

Test fixture objects ──→ component/page props ──→ TypeScript checker
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `resources/js/components/projects/show/project-status-manager.tsx` | Modify | Add transition-map typing that includes the synthetic `all` key and removes the implicit-`any` cascade. |
| `resources/js/pages/projects/index.tsx` | Modify | Normalize nullable Select values before storing filter state. |
| `resources/js/pages/projects/show.tsx` | Modify | Use `User \| null` for `auth.user` so `ProjectJoinForm` receives the expected user contract. |
| `resources/js/components/projects/show/project-join-form.tsx` | Modify | Introduce a local `ViewerJoinRequest` prop type with optional `message`. |
| `resources/js/components/projects/show/project-join-form.test.tsx` | Modify | Add missing `message` to pending `viewerJoinRequest` fixtures if the local prop type still requires it during implementation; otherwise no runtime assertion changes. |
| `resources/js/pages/projects/collaborators.test.tsx` | Modify | Align suggestion/invitation user fixtures with the receiving prop type without broadening `User`. |
| `resources/js/components/projects/collaborator-suggestion-card.test.tsx` | Modify | Add required `created_at`/`updated_at` fields to `Tech` fixtures. |
| `resources/js/pages/projects/show.test.tsx` | Modify | Replace matcher-only narrowing with an explicit guard before accessing captured props. |
| `resources/js/types/global.d.ts` | Modify | Use `var route` so `globalThis.route` is typed in tests. |

## Interfaces / Contracts

```ts
type ViewerJoinRequest = {
    id: number;
    status: JoinRequest['status'];
    message?: string;
};
```

This is a page/component preview contract, not a replacement for the persisted `JoinRequest` interface.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Type check | Projects-domain TypeScript errors are removed | Run `npx tsc --noEmit`; non-project errors may remain out of scope. |
| Unit/component | Existing projects tests still assert the same UI behavior | Run affected Vitest files if the project script supports targeted runs. |
| Integration/E2E | Not required | No backend behavior or browser flow changes. |

## Migration / Rollout

No migration required. Ship as one small PR because the change is type-only and should remain under the 400-line review budget.

## Open Questions

- [ ] None.
