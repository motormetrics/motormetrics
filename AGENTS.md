# Agent Instructions

Shared guidance for coding agents working in this repository (Codex, opencode, Cursor, and others).
`CLAUDE.md` imports this file and holds the detailed conventions — read it for anything not covered
here, and prefer it when the two appear to disagree.

## Essentials

- **Package manager is pnpm.** A `pnpm-lock.yaml` is present, so never use npm, npx, or yarn.
  Dependency versions are centralised in the pnpm catalog in `pnpm-workspace.yaml`; workspace
  packages reference them as `"package": "catalog:"` rather than a literal version.
- **Issue tracking is GitHub issues.** File new work there. Do not add markdown TODO lists or
  introduce another tracker.
- **Spelling is English (Singapore)** in code, comments, and documentation.
- **Workspace imports** use the `@motormetrics/*` scope, for example `@motormetrics/database`,
  `@motormetrics/utils`, and `@motormetrics/types`.

## Code style

- Avoid the `any` type. Prefer `unknown` with type guards.
- Name files without redundant prefixes: `cars/make.ts`, not `cars/cars-make.ts`.
- Use descriptive variable names: `record`, `result`, `item`, not `p`, `d`, `r`.
- Handle errors with try/catch against specific error types.

## Testing

Tests live in `__tests__` directories beside the implementation, with a `.test.ts` suffix. Component
tests should target functionality rather than implementation detail.

## Data model

PostgreSQL with Drizzle ORM. The naming strategy is deliberately mixed: table names are `snake_case`
while column names are `camelCase`. This is intentional, so do not "fix" it to match on either side.

## Deployment

Vercel, Singapore region. Pushing to `main` deploys production and pull requests get preview URLs.
`vercel-build` runs `db:migrate` before `next build`, so every deploy applies pending migrations,
including previews, which target the shared staging branch.
