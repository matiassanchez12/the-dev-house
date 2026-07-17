# Archive Report: notification-preferences-by-category

**Archived at**: 2026-07-16
**Artifact store mode**: openspec
**Verification verdict**: PASS WITH WARNINGS

## Summary

Decoupled notification preferences from privacy settings by creating a dedicated `user_notification_settings` table with `collaboration_emails` boolean. Migrated existing `email_notifications_enabled` values from `user_privacy_settings` into the new table with backward-compatible fallback. Moved the collaboration email toggle from the privacy form to a new notification settings card on the profile page. Optional collaboration notifications now respect the new setting while mandatory auth/security emails remain unconditional.

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| user-notification-settings | Created | 3 requirements, 6 scenarios — new domain spec copied from delta |

## Archive Contents

- proposal.md ✅
- specs/ ✅
- design.md ✅
- tasks.md ✅ (14/14 tasks complete)
- apply-progress.md ✅
- verify-report.md ✅
- exploration.md ✅

## Source of Truth Updated

- `openspec/specs/user-notification-settings/spec.md` — new main spec created

## Task Completion Gate

All 14/14 implementation tasks verified as checked in the persisted tasks artifact. No stale checkboxes. No CRITICAL issues in verify report.

## Verification Notes

- Verify report: PASS WITH WARNINGS
- Warning: Changed-file coverage skipped (no PHP coverage driver or frontend coverage script available)
- All 496 backend tests pass, 78 frontend tests pass, type checking passes, production build passes
- 6/6 spec scenarios have compliant runtime evidence

## Archive Status

✅ **intentional-with-warnings** — archive proceeded despite coverage warning per standard policy (coverage tooling gap is not a CRITICAL verification issue)

## Cycle Complete

The SDD cycle for `notification-preferences-by-category` is complete: proposed, specced, designed, implemented, verified, and archived.
