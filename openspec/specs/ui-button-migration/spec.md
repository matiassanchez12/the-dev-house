# Spec: ui-button-migration

## Purpose

Replace three legacy Laravel Breeze button components (`PrimaryButton`, `SecondaryButton`, `DangerButton`) with the existing shadcn `Button` component using theme-aware variants. This eliminates hardcoded color values, ensures dark-mode compatibility, and reduces component duplication.

## Requirements

### REQ-1: PrimaryButton Replacement

The system SHALL replace all `PrimaryButton` component usages with `Button` using the `default` variant. The visual appearance SHALL remain consistent with the current primary button style (solid background, light text).

**Mapping**: `PrimaryButton` → `Button` (variant `default`)

#### Scenarios

- GIVEN a page currently imports `PrimaryButton` from `@/components/primary-button` WHEN the migration is applied THEN the import SHALL resolve to `Button` from `@/components/ui/button` AND the component SHALL render with `variant="default"` (implicit, no prop needed)
- GIVEN a `PrimaryButton` with `disabled={processing}` prop WHEN migrated THEN the `disabled` prop SHALL be preserved on the shadcn `Button` AND the button SHALL appear visually disabled
- GIVEN a `PrimaryButton` with `className="ms-4"` WHEN migrated THEN the `className` prop SHALL be passed through to the shadcn `Button` AND the margin styling SHALL be preserved

### REQ-2: SecondaryButton Replacement

The system SHALL replace all `SecondaryButton` component usages with `Button` using the `secondary` variant. The visual appearance SHALL match the current secondary button style (muted background, contrasting text).

**Mapping**: `SecondaryButton` → `Button` (variant `secondary`)

#### Scenarios

- GIVEN a page currently imports `SecondaryButton` from `@/components/secondary-button` WHEN the migration is applied THEN the import SHALL resolve to `Button` from `@/components/ui/button` AND the component SHALL render with `variant="secondary"`
- GIVEN a `SecondaryButton` with `onClick={closeModal}` WHEN migrated THEN the `onClick` handler SHALL be preserved AND the button SHALL trigger the same action

### REQ-3: DangerButton Replacement

The system SHALL replace all `DangerButton` component usages with `Button` using the `destructive` variant. This fixes the hardcoded `bg-red-600` style and makes the danger color theme-aware.

**Mapping**: `DangerButton` → `Button` (variant `destructive`)

#### Scenarios

- GIVEN a page currently imports `DangerButton` from `@/components/danger-button` WHEN the migration is applied THEN the import SHALL resolve to `Button` from `@/components/ui/button` AND the component SHALL render with `variant="destructive"`
- GIVEN a `DangerButton` with `className="ms-3"` WHEN migrated THEN the `className` prop SHALL be preserved AND the destructive styling SHALL combine with the custom class via `cn()`

### REQ-4: Legacy File Deletion

After all usages are migrated, the system SHALL delete the three legacy button component files. No file in the codebase SHALL import from these paths after deletion.

**Files to delete**:
- `resources/js/components/primary-button.tsx`
- `resources/js/components/secondary-button.tsx`
- `resources/js/components/danger-button.tsx`

#### Scenarios

- GIVEN all `PrimaryButton`, `SecondaryButton`, and `DangerButton` usages have been replaced WHEN the legacy files are deleted THEN `npm run build` SHALL complete without module resolution errors
- GIVEN a developer searches the codebase for `primary-button` WHEN the migration is complete THEN zero import references SHALL exist

### REQ-5: Build Integrity

After migration, the system SHALL compile without TypeScript errors and the application SHALL render all migrated buttons correctly.

#### Scenarios

- GIVEN all button migrations are complete WHEN `npm run build` is executed THEN the build SHALL succeed with zero errors AND zero warnings related to button components
- GIVEN the application is running in dark mode WHEN a migrated button is rendered THEN the button SHALL use theme-aware colors (not hardcoded values)
