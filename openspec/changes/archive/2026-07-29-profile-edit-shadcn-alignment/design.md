# Design: Profile Edit — shadcn/ui Alignment (Scope 1)

## Technical Approach

Refactor the three scope-1 profile partials so each owns its visible shadcn/ui `Card` shell. `edit.tsx` remains responsible for page ordering and width constraints, but stops adding duplicate raw `bg-card` wrappers around those partials. Submission routes, `useForm` state, toast behavior, error handling, and field names remain unchanged.

The workspace also contains three collateral safety fixes that should be reviewed as part of the same candidate: `Input` now forwards refs to preserve focus behavior through the shared wrapper, landing hero/stats copy is restored so the existing Vitest expectations match the rendered UI again, and `PublicMilestoneController` plus `MilestonesTest` keep completed milestones ahead of pending ones with explicit null-safe ordering.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|----------|--------|-------------------------|-----------|
| Section chrome ownership | Scope-1 partials render `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter` internally. | Keep cards in `edit.tsx`; create a shared profile section wrapper. | Self-contained partials satisfy the spec and make later scopes incremental without introducing abstraction before repeated needs are proven. |
| Business logic | Keep all current Inertia `useForm`, `route(...)`, toast, focus/reset, and submit flows unchanged. | Rename handlers or centralize submit behavior. | This is a low-risk UI refactor; behavior changes would expand scope and test surface unnecessarily. |
| Dialog composition | Use existing `DialogHeader`, `DialogTitle`, `DialogDescription`, and `DialogFooter` inside `DialogContent`. | Keep raw `<h2>`/`<p>`; add only an `aria-label`. | shadcn rules require a dialog title, and the installed Base UI wrapper already exposes the right primitives. |
| Spacing | Replace scope-1 `space-y-*` and margin-driven section spacing with `flex flex-col gap-*`; leave existing `Field` internals unchanged. | Rewrite `Field` to match the newer FieldGroup API. | `Field` is a project-specific component used elsewhere; changing it would affect unrelated forms outside Scope 1. |
| Shared input contract | Forward refs from `Input` to the Base UI primitive instead of keeping the wrapper ref-less. | Use ad-hoc query selectors or remove focus-on-error behavior. | The password/delete forms already depend on focusing the input on error; `forwardRef` keeps the shared abstraction honest and reusable. |
| Landing regression handling | Restore the previously expected hero/stats text and layout instead of rewriting the landing tests around the accidental drift. | Update tests to accept missing stats/wordmark/trust badge. | The landing UI already intends to show those elements; restoring them is smaller and more truthful than weakening the tests. |

## Data Flow

No data-flow changes.

```text
edit.tsx ──props──> scope-1 partial Card
                         │
                         └── existing useForm submit ──> existing Laravel routes
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `resources/js/pages/profile/partials/update-profile-information-form.tsx` | Modify | Import card primitives, replace `<section>/<header>` shell with full `Card` composition, move actions into `CardFooter`, replace form `space-y-*` with flex/gap, keep submit behavior unchanged. |
| `resources/js/pages/profile/partials/update-password-form.tsx` | Modify | Same Card/gap refactor, preserving password reset/focus/error behavior. |
| `resources/js/pages/profile/partials/delete-user-form.tsx` | Modify | Use Card shell, remove `space-y-*`, compose dialog with `DialogHeader`, `DialogTitle`, `DialogDescription`, and `DialogFooter`; preserve delete/cancel flows. |
| `resources/js/pages/profile/edit.tsx` | Modify | Remove raw `bg-card p-4 shadow sm:rounded-lg sm:p-8` wrappers only around the three scope-1 partials; keep wrappers for deferred scopes. |
| `resources/js/components/ui/input.tsx` | Modify | Convert `Input` to `React.forwardRef(...)` so shared focus management reaches the primitive input element. |
| `resources/js/pages/profile/partials/update-profile-information-form.test.tsx` | Create | Verify rendering, form submission route, verification message, errors/success state, and card shell presence. |
| `resources/js/pages/profile/partials/update-password-form.test.tsx` | Create | Verify password fields, submit route/options, reset/focus behavior on errors, and success state. |
| `resources/js/pages/profile/partials/delete-user-form.test.tsx` | Create | Verify card render, dialog accessible name/title, cancel dismissal, and delete submit route/options. |
| `resources/js/pages/landing.tsx` | Modify | Restore `LandingStats` in the page composition so the public landing flow remains consistent with its tests. |
| `resources/js/components/landing/hero/hero-headline.tsx` | Modify | Restore visible trust-badge copy derived from `userCount`. |
| `resources/js/components/landing/hero/hero-wordmark.tsx` | Modify | Restore the visible product wordmark and strapline in the hero. |
| `app/Http/Controllers/PublicMilestoneController.php` | Modify | Keep completed milestones first even when databases sort `NULL` timestamps differently. |
| `tests/Feature/MilestonesTest.php` | Modify | Assert deterministic ordering for completed timestamps and pending milestones. |

## Interfaces / Contracts

No public API or backend contract changes. Existing component props stay the same, including `className`, so `edit.tsx` can continue passing width classes such as `max-w-xl`.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit/component | Scope-1 partial rendering and interactions | Add Vitest + Testing Library tests beside each partial, reusing the `useForm`/`route` mocking style from `update-privacy-form.test.tsx`. |
| Integration | Profile page wrapper ownership | Test `edit.tsx` with semantic partial mocks so the page-level assertion checks direct-vs-wrapped section ownership without depending on card internals. |
| Integration | Landing regression guardrails | Run the focused landing page and landing hero Vitest files to prove the restored stats/trust/wordmark content. |
| Feature | Public milestone ordering | Run the focused Laravel milestone feature test to prove null-safe completed-first ordering. |
| E2E | N/A | No new route or browser journey is introduced. |

Run focused Vitest/Laravel commands for the touched files, plus `npm run build`. Full-suite verification remains optional for this cleanup pass but is safe to run if time allows.

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary is changed. Existing form route names are only preserved.

## Migration / Rollout

No migration required. Rollout is a single reviewable slice: the profile refactor plus its documented collateral fixes. Rollback is reverting the modified TSX/PHP files and the added or updated tests.

## Open Questions

- None.
