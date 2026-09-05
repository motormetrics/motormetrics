@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation Access

Automatically use Context7 for code generation and library documentation.

## GitHub Operations

Prefer the GitHub MCP tools (`mcp__github__*`) over the `gh` CLI for issues, checks, and releases.

**Pull requests are the exception**: open and update PRs with the `create-pr` skill, not raw `gh` or MCP calls. It encodes the title and body conventions.

## Commands

All commands use pnpm as the package manager. Non-obvious invocations:

- `pnpm test:web -- <path>` - Run specific web tests (use Turborepo commands, not filter syntax)
- `pnpm db:migrate:check` - Check migration status
- `pnpm auth:generate` - Generate authentication schema

*Other scripts are in `package.json`. See component CLAUDE.md files for service-specific commands and workflows.*

## Dependency Management

Dependency versions are centralised via **pnpm catalog**: shared versions live in `pnpm-workspace.yaml`, and workspace
packages reference them with `"package": "catalog:"` rather than a literal version.

## Code Style

### TypeScript

- Avoid `any` type - prefer `unknown` with type guards
- Use workspace imports: `@motormetrics/database`, `@motormetrics/utils`, `@motormetrics/types`

### Naming Conventions

- **Files**: Avoid redundant prefixes (✅ `cars/make.ts` not ❌ `cars/cars-make.ts`)
- **Variables**: Use descriptive names (✅ `record`, `result`, `item` not ❌ `p`, `d`, `r`, `i`)

### Other

- Error handling: try/catch with specific error types
- Spelling: English (Singapore)

## Testing

- Location: `__tests__` directories next to implementation, file suffix `.test.ts`
- Component tests: Focus on functionality over implementation

## Environment Variables

Core cross-cutting variables:

- `DATABASE_URL` - PostgreSQL connection string
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` - Redis configuration
- `MOTORMETRICS_API_TOKEN` - Bearer token for REST API authentication (used by MCP server and external clients)
- `CRON_SECRET` - Auto-provisioned by Vercel; used to authenticate cron job requests via `Authorization: Bearer <CRON_SECRET>`

*See component CLAUDE.md files for service-specific environment variables.*

## Deployment

Vercel, Singapore region. Push to main deploys production; pull requests get preview URLs.

`vercel-build` runs `db:migrate` before `next build`, so **every deploy applies pending
migrations** — including previews, which target the shared `staging` Neon branch. An
unmerged PR's migration therefore lands on staging permanently. The `development`
branch is managed by `db:push` instead and receives no migrations.

## Domain Convention

- **API**: `<service>.<environment>.motormetrics.app` (e.g., `api.motormetrics.app`)
- **Web**: `<environment>.motormetrics.app` with apex for production (e.g., `motormetrics.app`)
- **New services**: Use service subdomain pattern

See `domain-management` skill for DNS configuration and routing details.

## Data Models

PostgreSQL with Drizzle ORM. **Naming strategy is deliberately mixed**: table names are `snake_case` while
column names are `camelCase`. This is intentional — do not "fix" it to match on either side.

*See [packages/database/CLAUDE.md](packages/database/CLAUDE.md) for detailed schemas and migrations.*

## Release Process

Automated via semantic-release with unified "v" prefix versioning (v1.0.0, v1.1.0, v2.0.0). See `release-management` and `changelog` skills for release workflows.

## Documentation Maintenance

- **Root CLAUDE.md**: Monorepo-wide guidelines, tooling, cross-cutting concerns
- **Component CLAUDE.md**: Component-specific implementation (`apps/*/CLAUDE.md`, `packages/*/CLAUDE.md`)
- **README.md**: Package setup, usage instructions, user-facing features
- **docs/architecture/**: System architecture documentation with Mermaid diagrams

**Rule of thumb:** Component-specific changes → component docs. Cross-cutting changes → root docs.

See `readme-updates` and `mermaid-diagrams` skills for documentation workflows.

## Issue Tracking

Work is tracked as **GitHub issues** — there is no separate tracker. Use the `github-issues` skill
when creating or updating an issue; see **GitHub Operations** above for tool preferences.
