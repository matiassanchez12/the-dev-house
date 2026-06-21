# Design: Form Accessibility Shadcn Foundation

## Technical Approach

Use the existing form foundation as the baseline and apply it only to the remaining Slice 3 surfaces: `onboarding/index.tsx` and `update-profile-complete-form.tsx`. No backend contract changes are required.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Scope boundary | Limit this OpenSpec change to onboarding and profile-complete | Reopen auth/profile slices | Those slices are already merged in the branch; planning should reflect the remaining work only. |
| Form primitives | Keep shadcn/ui controls and the existing `Field`/`FormError` pattern | Add a second form abstraction | A second abstraction would dilute the established pattern and add unnecessary churn. |
| Validation contract | Preserve current Inertia/Laravel validation behavior | Add backend validation changes | The change is presentation and accessibility focused only. |
| Composite controls | Use accessible accordion and slider semantics for profile-complete sections | Keep raw disclosure/range markup | The remaining slice should stay aligned with the shadcn/ui foundation. |

## Data Flow

```text
Laravel validation errors → Inertia props/useForm.errors → onboarding/profile-complete page
field id/name → Field helper → Label htmlFor + control id
errors[name] → FormError id + aria-live
control → aria-invalid + aria-describedby
```

## File Changes

| File | Action | Description |
|---|---|---|
| `resources/js/pages/onboarding/index.tsx` | Modify | Apply accessible shadcn/ui controls to the remaining onboarding slice |
| `resources/js/pages/profile/partials/update-profile-complete-form.tsx` | Modify | Apply accessible shadcn/ui controls to profile-complete |
| `resources/js/components/ui/field.tsx` | Reuse | Keep the shared field wiring contract |
| `resources/js/components/ui/form-error.tsx` | Reuse | Keep stable error ids and announcements |

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Component | Labels, `aria-invalid`, and `aria-describedby` wiring | RTL assertions on the remaining form pages |
| Component | Accordion and slider accessibility | RTL assertions on profile-complete composite controls |
| Feature | Submission still follows existing validation flow | Existing Laravel tests for the onboarding/profile-complete paths |

## Migration / Rollout

No data migration is needed. Deliver Slice 3 as a bounded UI-only update, then verify the earlier slices remain untouched.
