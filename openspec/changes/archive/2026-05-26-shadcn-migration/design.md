# Design: shadcn-migration

## Technical Approach

Replace `@headlessui/react` modal and dropdown components with shadcn/ui equivalents. The migration touches 4 files (1 deletion, 3 modifications) and introduces `@radix-ui/react-dropdown-menu` as a new dependency. Existing shadcn components `ui/dialog` and `ui/avatar` are already installed and will be used directly.

## Architecture Decisions

### Decision: Dropdown API Pattern

**Choice**: Use `DropdownMenu` from `@radix-ui/react-dropdown-menu` with a local wrapper that mirrors the existing `Dropdown.Trigger` / `Dropdown.Content` / `Dropdown.Link` compound component API.

**Alternatives considered**: Port to raw Radix primitives everywhere, which would require updating all call sites. Reject — too much churn.

**Rationale**: The `authenticated.tsx` layout uses `Dropdown.Trigger`, `Dropdown.Content`, `Dropdown.Link` in a compound component pattern. Wrapping Radix primitives in a compatible API minimizes call-site changes and preserves the existing mental model.

---

### Decision: Avatar Replacement Strategy

**Choice**: Replace the custom `<img>` preview in `update-profile-complete-form.tsx` with `Avatar` / `AvatarImage` / `AvatarFallback` from `ui/avatar`. Keep the file input + preview state logic intact.

**Alternatives considered**: Full form redesign. Reject — avatar upload logic is orthogonal to this migration.

**Rationale**: The existing avatar implementation is a plain `<img>` with a file input. Swapping for shadcn's `AvatarImage` with the same preview URL state is a minimal, safe change.

---

### Decision: `@headlessui/react` Uninstall Scope

**Choice**: Only remove `@headlessui/react` if no other usages remain after migrations. The 4 `Transition` usages in profile forms are explicitly out of scope per the proposal.

**Rationale**: Proposal states "Other headlessui usages (if any exist)" as out of scope. The `Transition` component in profile forms serves a simple opacity fade on the "saved" message — not worth migrating now. Keep the package until a future cleanup pass.

---

## Data Flow

```
authenticated.tsx
    │
    ├── Dropdown (compound) ──→ uses DropDownContext
    │       │
    │       ├── Trigger ──→ onClick toggles context.open
    │       │
    │       └── Content ──→ renders @radix-ui/react-dropdown-menu Root/Trigger/Portal/DropdownMenuItem
    │                       │── Link ──→ Inertia Link styled as dropdown item
    │
    └── ThemeToggle, NavLinks, etc.

delete-user-form.tsx
    │
    └── Modal (show={bool}, onClose) ──→ ui/dialog Dialog open={bool} onOpenChange

onboarding.tsx
    │
    └── inline div progress ──→ Progress value={currentStep/totalSteps * 100}

update-profile-complete-form.tsx
    │
    └── <img preview> ──→ Avatar + AvatarImage + AvatarFallback
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `resources/js/components/dropdown.tsx` | Delete | Replaced by `@radix-ui/react-dropdown-menu` via local wrapper |
| `resources/js/layouts/authenticated.tsx` | Modify | Replace `Dropdown` compound with new `ui-dropdown` wrapper |
| `resources/js/pages/profile/partials/delete-user-form.tsx` | Modify | Replace `Modal` with `ui/dialog` (`Dialog`, `DialogContent`) |
| `resources/js/pages/profile/partials/update-profile-complete-form.tsx` | Modify | Replace `<img>` avatar with `Avatar`, `AvatarImage`, `AvatarFallback` |
| `resources/js/layouts/onboarding.tsx` | Modify | Replace inline div progress bar with `Progress` component |
| `package.json` | Modify | Add `@radix-ui/react-dropdown-menu`; add `progress` via shadcn CLI |

## Interfaces / Contracts

### ui-dropdown (new local component)

```tsx
// resources/js/components/ui/dropdown.tsx (new)
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@radix-ui/react-dropdown-menu';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

// Wrapper exposing compound API: Dropdown.Trigger, Dropdown.Content, Dropdown.Link
export const Dropdown = ({ children }) => (
  <DropdownMenu>{children}</DropdownMenu>
);
Dropdown.Trigger = DropdownMenuTrigger;
Dropdown.Content = ({ align = 'right', children, ...props }) => (
  <DropdownMenuContent align={align} {...props}>{children}</DropdownMenuContent>
);
Dropdown.Link = ({ href, method, as, children, className, ...props }) => (
  <DropdownMenuItem asChild>
    <Link href={href} method={method} as={as} className={cn('...dropdown-item classes...', className)} {...props}>
      {children}
    </Link>
  </DropdownMenuItem>
);
Dropdown.Separator = DropdownMenuSeparator;
```

### ui/dialog usage (already exists)

```tsx
// In delete-user-form.tsx
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Replace <Modal show={bool} onClose={fn}>
// With <Dialog open={bool} onOpenChange={fn}><DialogContent>...</DialogContent></Dialog>
```

### Avatar usage

```tsx
// In update-profile-complete-form.tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Current: <img src={previewAvatar} ... />
// New: <Avatar><AvatarImage src={previewAvatar} /><AvatarFallback>{user.name[0]}</AvatarFallback></Avatar>
```

### Progress usage

```tsx
// In onboarding.tsx
import { Progress } from '@/components/ui/progress';

// Current: <div className="h-1.5 ..."><div className="h-full bg-primary rounded-full" style={{ width: `${percent}%` }} /></div>
// New: <Progress value={percent} className="h-1.5" />
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Integration | Modal opens/closes in delete-user-form | Existing tests + manual verification |
| Integration | Dropdown opens with click, keyboard navigates with arrows, closes with Escape | Manual test using `npm run dev` |
| Integration | Avatar shows preview after file select | Manual test |
| Integration | Onboarding progress bar renders correctly | Visual inspection |
| Build | Full build succeeds | `npm run build` |

No unit tests are needed — this is a pure UI refactor with no business logic changes.

## Migration / Rollout

**Phased approach** (no rollback needed — pure UI replacement):

1. Install `@radix-ui/react-dropdown-menu` and add `progress` via shadcn CLI
2. Create `ui-dropdown.tsx` wrapper component locally
3. Update `authenticated.tsx` to use `ui-dropdown`
4. Update `delete-user-form.tsx` to use `ui/dialog`
5. Update `update-profile-complete-form.tsx` to use `ui/avatar`
6. Update `onboarding.tsx` to use `Progress`
7. Remove `dropdown.tsx` and `modal.tsx`
8. Run `npm run build` to verify
9. Run `php artisan test` to verify
10. Remove `@headlessui/react` from `package.json` only if no usages remain

**Open Questions**

- [ ] Should `Transition` usages in profile forms be migrated to CSS transitions or kept as-is? (Proposal says out of scope, but they still reference `@headlessui/react`)
- [ ] Does the team want `Dropdown.Link` to support Inertia's `method` and `as` props for POST-based logout? (Radix `DropdownMenuItem` asChild should handle this)

## Rollback Plan

1. `git checkout` to revert modified component files
2. Restore `modal.tsx` and `dropdown.tsx` from git
3. Re-add `@headlessui/react` to `package.json` if removed
4. No database migration — pure UI refactor