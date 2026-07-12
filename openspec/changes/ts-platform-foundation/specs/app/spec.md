# Delta for App

## ADDED Requirements

### Requirement: Vite client typings are available to the frontend entrypoint

The system MUST provide TypeScript declarations for Vite-specific frontend features used by the application entrypoint, including CSS side-effect imports, `import.meta.env`, and `import.meta.glob`.

#### Scenario: app entrypoint type-checks

- GIVEN `resources/js/app.tsx` imports `../css/app.css`
- WHEN `npx tsc --noEmit` checks the frontend sources
- THEN no type errors are reported for the CSS import or `import.meta` usage
- AND unrelated domain-specific type errors remain out of scope

#### Scenario: other modules can read Vite env values

- GIVEN a frontend module reads `import.meta.env`
- WHEN TypeScript checks the module
- THEN `ImportMeta.env` is recognized
- AND the module is not blocked by missing Vite client types

### Requirement: TypeScript configuration remains TS 6 compatible without deprecated baseUrl

The system MUST keep `tsconfig.json` compatible with TypeScript 6 and MUST NOT rely on the deprecated `baseUrl` option.

#### Scenario: deprecation warning is removed

- GIVEN TypeScript 6 checks `tsconfig.json`
- WHEN `npx tsc --noEmit` runs
- THEN no TS5101 warning is emitted for `baseUrl`

#### Scenario: component alias resolution still works

- GIVEN a source file imports from `@components/*`
- WHEN TypeScript resolves the import
- THEN the alias resolves successfully to the frontend components directory
- AND the resolution does not depend on `baseUrl`
