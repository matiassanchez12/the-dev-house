# Apply Progress: Profile Privacy Settings UI

## Summary

- Implemented the Scope A frontend privacy/contact card on `/profile/edit`
- Wired the UI to the existing `POST /profile/privacy` backend endpoint
- Added frontend type support and focused Vitest coverage

## TDD Cycle Evidence

| Scope | Red | Green | Refactor |
|---|---|---|---|
| Page wiring | Added `resources/js/pages/profile/edit.test.tsx` to prove the privacy card render order and prop forwarding before finalizing the page insertion | Verified `edit.test.tsx` passes after wiring `phone` and `privacySetting` into `edit.tsx` | Kept insertion logic minimal and localized to the page layout |
| Privacy form behavior | Added `resources/js/pages/profile/partials/update-privacy-form.test.tsx` to cover initial values, toggle updates, blank-phone normalization, and later the missing-phone editable case | Verified focused Vitest suite passes after implementing `update-privacy-form.tsx` and submit normalization | Simplified tests by mocking Base UI Checkbox to avoid jsdom pointer-event noise and preserve behavior-first assertions |

## Files Changed

- `resources/js/types/index.ts`
- `resources/js/pages/profile/edit.tsx`
- `resources/js/pages/profile/edit.test.tsx`
- `resources/js/pages/profile/partials/update-privacy-form.tsx`
- `resources/js/pages/profile/partials/update-privacy-form.test.tsx`

## Verification Notes

- Focused Scope A Vitest tests pass
- `npm run build` passes
- Full `npm test` still has unrelated repo-wide failures outside Scope A
