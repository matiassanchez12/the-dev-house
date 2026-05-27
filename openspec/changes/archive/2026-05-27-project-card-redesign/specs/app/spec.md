# Delta for App — Project Card Redesign & Show Page Decomposition

## ADDED Requirements

### Requirement: Shared Project Utilities

The system SHALL export from `components/projects/project-utils.ts`:
- `statusConfig` — record mapping `open`|`completed`|`closed` to `{ label, icon, className }`
- `getInitials(name: string): string` — up to 2 uppercase initials

All consumers SHALL import from this module, not define inline duplicates.

#### Scenario: closed status has visible styling
- GIVEN `statusConfig.closed` is accessed
- THEN it returns `{ label: 'Cerrado', icon: CircleX, className: 'bg-muted text-foreground' }`

#### Scenario: getInitials extracts initials
- GIVEN `"Juan Pablo Pérez"` → `"JP"`; `"Madonna"` → `"M"`

### Requirement: ProjectStatusBadge Component

The system SHALL provide `components/projects/project-status-badge.tsx` accepting a `status` prop, rendering a `Badge` with icon + label + className from `statusConfig`. Falls back to `closed` config for unknown status.

#### Scenario: renders correct status
- GIVEN `status="open"` → green badge with `CircleDot` icon and `"Abierto"`

### Requirement: Show Page Section Components

The system SHALL provide 11 components under `components/projects/show/`:

| Component | File | Responsibility |
|-----------|------|---------------|
| ProjectHero | `project-hero.tsx` | Banner image or gradient fallback + title + status |
| ProjectDescription | `project-description.tsx` | Description card |
| ProjectVision | `project-vision.tsx` | Vision card (conditional on truthy `vision`) |
| ProjectGallery | `project-gallery.tsx` | Image grid from `images.slice(1)` (conditional if >1) |
| ProjectParticipants | `project-participants.tsx` | Participants as badges (conditional if >0) |
| ProjectCreatorCard | `project-creator-card.tsx` | Creator avatar + name + profile link |
| ProjectTechsCard | `project-techs-card.tsx` | Tech badges list |
| ProjectLinksCard | `project-links-card.tsx` | Repository + demo external links |
| ProjectJoinForm | `project-join-form.tsx` | Join form (auth) or auth CTA (unauth) |
| ProjectDeleteDialog | `project-delete-dialog.tsx` | Delete confirmation Dialog |

Each component SHALL accept flat props with only needed data. No component SHALL receive the full `project` object unless it consumes >3 fields.

#### Scenario: hero shows image or fallback
- GIVEN images exist → 16:9 banner with gradient overlay + title + status
- GIVEN no images → gradient background card with title + status

#### Scenario: delete dialog triggers deletion
- GIVEN dialog open, user clicks Delete → `onDelete` invoked, dialog closes

### Requirement: ProjectCard Image Thumbnail

The system SHALL display `project.images[0]` as a 16:9 top banner in `default` and `featured` variants. Gradient placeholder when no image. `compact` variant SHALL NOT show an image.

#### Scenario: card shows thumbnail
- GIVEN images exist, `variant="default"` → 16:9 banner at card top
- GIVEN no images, `variant="featured"` → gradient placeholder
- GIVEN `variant="compact"` → no image area

### Requirement: ProjectCard Meta Row

The system SHALL render a footer meta row with: status badge, participants count (if >0), and relative date (e.g., "hace 3 días"). Replaces current footer showing only status badge.

#### Scenario: meta row shows all elements
- GIVEN 5 participants, created 3 days ago → status badge + "5 participantes" + relative date
- GIVEN `participants_count === 0` → participants count hidden

## MODIFIED Requirements

### Requirement: UI Component Requirements

The system SHALL provide UI components following shadcn/ui patterns. ProjectCard SHALL support `default`, `featured`, and `compact` variants. The `featured` variant SHALL have enhanced visual prominence with gradient border accent and larger shadow. The `closed` status SHALL have visible styling (`bg-muted text-foreground`).
(Previously: featured variant had minimal differentiation; closed status had empty className)

#### Scenario: featured variant has gradient border
- GIVEN `variant="featured"` → `ring-2 ring-primary/20` AND `shadow-xl`

#### Scenario: closed status is visible
- GIVEN `status === 'closed'` → badge has `bg-muted text-foreground` classes

#### Scenario: show.tsx is decomposed
- GIVEN refactored show page → `show.tsx` under 100 lines, composes all 11 section components
