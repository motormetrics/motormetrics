# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation Access

Automatically use Context7 for code generation and library documentation.

## GitHub Operations

Prefer using the GitHub MCP tools (`mcp__github__*`) over the `gh` CLI for all GitHub operations (issues, pull requests, checks, releases).

# MotorMetrics - Developer Reference Guide

## Project-Specific CLAUDE.md Files

This repository includes directory-specific CLAUDE.md files with detailed guidance for each component:

### Applications

- **[apps/web/CLAUDE.md](apps/web/CLAUDE.md)**: Web application development with Next.js 16, HeroUI, blog features,
  analytics, integrated admin interface at `/admin` path, and data updater workflows with social media integration
- **apps/mcp**: MCP server for blog post CRUD via Claude Code (stdio transport, `@modelcontextprotocol/sdk`)
- **apps/docs**: Documentation site built with Fumadocs and Next.js 16 for technical documentation and guides

### Packages

- **[packages/ai/CLAUDE.md](packages/ai/CLAUDE.md)**: AI-powered blog generation with Vercel AI SDK, Google Gemini, and
  Langfuse telemetry
- **[packages/database/CLAUDE.md](packages/database/CLAUDE.md)**: Database schema management with Drizzle ORM,
  migrations, and TypeScript integration
- **[packages/logos/CLAUDE.md](packages/logos/CLAUDE.md)**: Car logo management with Vercel Blob storage, Redis caching,
  and brand normalisation

Refer to these files for component-specific development guidance and best practices.

## Architecture Documentation

System architecture documentation with Mermaid diagrams is available in the `docs/` directory:

- **[docs/architecture/](docs/architecture/)**: Architecture documentation with Mermaid diagrams
    - **[system.md](docs/architecture/system.md)**: System architecture overview
    - **[workflows.md](docs/architecture/workflows.md)**: Data processing workflow sequence diagrams
    - **[database.md](docs/architecture/database.md)**: Database schema and entity relationships
    - **[infrastructure.md](docs/architecture/infrastructure.md)**: Vercel deployment topology
    - **[social.md](docs/architecture/social.md)**: Social media integration workflows

- **[docs/diagrams/](docs/diagrams/)**: Source Mermaid diagram files (`.mmd` format)

# MotorMetrics Platform - Overview

## Project Overview

MotorMetrics is a full-stack platform providing access to Singapore vehicle registration data,
Certificate of Entitlement (COE) bidding results, and vehicle deregistration statistics. The monorepo includes:

- **Web Application**: Next.js 16 frontend with Cache Components, component co-location, interactive charts, analytics,
  blog functionality, and integrated admin interface at `/admin` path. Also hosts the integrated data updater workflows.
- **Integrated Updater**: Workflow-based data update system with scheduled jobs that fetch and process data from LTA
  DataMall (Vercel WDK workflows). Consolidated into the web application for simplified deployment.
- **LLM Blog Generation**: Automated blog post creation using Vercel AI SDK with Google Gemini to analyse market data
  and generate insights. Runs within web application workflows.
- **Social Media Integration**: Automated posting to Discord, LinkedIn, Telegram, and Twitter when new data is available.
  Triggered by web application workflows.
- **MCP Server**: Blog post management tools (list, get, create, update, delete) callable from Claude Code via stdio
  transport. Communicates with the web application's REST API. Published to npm registry with automated releases.
- **Documentation Site**: Fumadocs-powered Next.js documentation application for technical guides and API reference.

## Commands

All commands use pnpm as the package manager.

| Category | Command | Description |
|----------|---------|-------------|
| **Build/Dev** | `pnpm build` | Build all packages |
| | `pnpm dev` | Start all development servers |
| | `pnpm start:web` | Start production web server |
| **Testing** | `pnpm test` | Run all tests (see `api-testing`, `e2e-testing`, `coverage-analysis` skills) |
| | `pnpm test:watch` | Run tests in watch mode |
| | `pnpm test:web -- <path>` | Run specific web tests (use Turborepo commands, not filter syntax) |
| **Linting** | `pnpm lint` | Lint all packages (see `biome-config` skill) |
| | `pnpm format` | Format all packages |
| **Database** | `pnpm db:migrate` | Run database migrations (see `schema-design` skill) |
| | `pnpm db:generate` | Generate new migrations |
| | `pnpm db:push` | Push schema changes directly |
| | `pnpm db:drop` | Drop database |
| | `pnpm db:migrate:check` | Check migration status |
| **Deployment** | Deployed via Vercel | Automatic deployments on push to main |
| **Release** | See `release-management` skill | Automated releases with semantic-release |
| **Auth** | `pnpm auth:generate` | Generate authentication schema |

*See component CLAUDE.md files for service-specific commands and workflows.*

## Code Structure

- **apps/docs**: Documentation site using Fumadocs
    - **content/**: MDX documentation files
    - **src/app**: Next.js App Router with docs layout
    - **src/lib**: Fumadocs content source adapter and shared layout configuration
- **apps/mcp**: MCP server for blog post CRUD
    - **src/index.ts**: McpServer with 5 tool definitions (list, get, create, update, delete posts)
    - **src/client.ts**: HTTP client with Bearer token auth and `@vercel/related-projects` URL resolution
- **apps/web**: Next.js frontend application with integrated workflows
    - **src/app**: Next.js App Router pages and layouts with blog functionality
    - **src/app/admin**: Integrated admin interface for content management
    - **src/app/api/workflows**: Vercel WDK workflow endpoints (cars, coe, deregistrations, vehicle-population, trigger)
    - **src/lib/workflows**: Workflow-based data update system and social media integration
    - **src/components**: React components with comprehensive tests
    - **src/actions**: Server actions for maintenance and background tasks
    - **src/utils**: Web-specific utility functions
    - **src/queries**: Data fetching queries with comprehensive tests
    - **src/config**: Database, Redis, animations, and platform configurations
- **packages/database**: Database schema and migrations using Drizzle ORM
    - **src/schema**: Schema definitions for cars, COE, deregistrations, vehicle population, and posts tables
    - **migrations**: Database migration files with version tracking
- **packages/ai**: AI-powered blog generation shared package
    - **src/generate-post.ts**: 2-step blog generation (analysis → structured output)
    - **src/config.ts**: System instructions and prompts for analysis and generation steps
    - **src/schemas.ts**: Zod schemas for structured output (postSchema, highlightSchema)
    - **src/tags.ts**: Tag constants and types (CARS_TAGS, COE_TAGS)
    - **src/hero-images.ts**: Hero image URLs and helpers
    - **src/queries.ts**: Database queries for data aggregation
    - **src/save-post.ts**: Post persistence with idempotency
    - **src/instrumentation.ts**: Langfuse telemetry setup
- **packages/logos**: Car logo management with Vercel Blob storage
    - **src/services/logo**: Core logo fetching, listing, and downloading functions
    - **src/infra/storage**: Vercel Blob service with Redis caching
    - **src/utils**: Brand name normalization utilities
- **packages/types**: Shared TypeScript type definitions
- **packages/utils**: Shared utility functions and Redis configuration

## Monorepo Build System

The project uses Turbo for efficient monorepo task orchestration:

- **Dependency-aware**: Tasks run in dependency order with automatic topological sorting
- **Caching**: Intelligent build output caching with file-based invalidation
- **Parallel execution**: Independent tasks run concurrently
- **Environment handling**: Loose mode with global `.env`, `tsconfig.json`, `NODE_ENV` dependencies
- **Development tasks**: `dev` and `test:watch` use persistent mode with cache disabled
- **TUI Interface**: Enhanced terminal interface for better development experience

## Dependency Management

The project uses **pnpm with catalog** for centralised dependency version management:

- Shared versions defined in `pnpm-workspace.yaml`
- Workspace packages reference with `"package": "catalog:"`
- Root-level CLI tools (Turbo, Biome) available to all workspace packages
- Ensures version consistency and simplifies upgrades

## Code Style

### TypeScript

- Strict type checking enabled (noImplicitAny, strictNullChecks)
- Avoid `any` type - prefer `unknown` with type guards
- Use workspace imports: `@motormetrics/database`, `@motormetrics/utils`, `@motormetrics/types`

### Biome

- Used for formatting, linting, and import organisation
- 2 spaces indentation, automatic import sorting
- Git-aware file processing with `.gitignore` support
- Workspace-specific configs extend root configuration

### Naming Conventions

- Functions/variables: `camelCase`
- Classes: `PascalCase`
- Constants: `UPPER_CASE`
- **Files**: Avoid redundant prefixes (✅ `cars/make.ts` not ❌ `cars/cars-make.ts`)
- **Variables**: Use descriptive names (✅ `record`, `result`, `item` not ❌ `p`, `d`, `r`, `i`)
- Import groups: 1) built-in, 2) external, 3) internal

### Commit Messages

Follow conventional commit format (enforced by commitlint):

- `feat: description` (minor bump) / `fix: description` (patch bump)
- `feat!: description` or `BREAKING CHANGE:` (major bump)
- `chore:`, `docs:`, `refactor:`, `test:` (no bump)
- **Keep SHORT**: 50 chars preferred, 72 max
- **Optional scopes**: `feat(api):`, `fix(web):`, `chore(database):`
- Available scopes: `api`, `web`, `mcp`, `database`, `types`, `ui`, `utils`, `infra`, `deps`, `release`

### Other

- Error handling: try/catch with specific error types
- Spelling: English (Singapore)

## Git Hooks

The project uses Husky v9+ with `lint-staged` and `commitlint`. See `conventional-commits` skill for commit message formatting and git workflows.

## Testing

- Framework: Vitest with V8 coverage
- Location: `__tests__` directories next to implementation
- File suffix: `.test.ts`
- Best practices: High coverage, mock external APIs, test happy and error paths
- Component tests: Focus on functionality over implementation

## Environment Variables

Core cross-cutting variables:

- `DATABASE_URL` - PostgreSQL connection string
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` - Redis configuration
- `MOTORMETRICS_API_TOKEN` - Bearer token for REST API authentication (used by MCP server and external clients)
- `CRON_SECRET` - Auto-provisioned by Vercel; used to authenticate cron job requests via `Authorization: Bearer <CRON_SECRET>`

*See component CLAUDE.md files for service-specific environment variables.*

## Deployment

- **Platform**: Vercel (Singapore region)
- **DNS**: Managed via Vercel with motormetrics.app domain
- **Automatic Deployments**: Push to main branch triggers production deployment
- **Preview Deployments**: Pull requests get automatic preview URLs

## Domain Convention

- **API**: `<service>.<environment>.motormetrics.app` (e.g., `api.motormetrics.app`)
- **Web**: `<environment>.motormetrics.app` with apex for production (e.g., `motormetrics.app`)
- **New services**: Use service subdomain pattern

See `domain-management` skill for DNS configuration and routing details.

## Data Models

PostgreSQL with Drizzle ORM using **camelCase** column naming:

- `cars`, `coe`, `pqp`, `deregistrations`, `vehicle_population`, `posts`

**Naming Strategy:**
- Table names: `snake_case` (e.g., `cars`, `coe`, `pqp`)
- Column names: `camelCase` (e.g., `vehicleClass`, `biddingNo`, `fuelType`)
- Core columns use `NOT NULL` constraints where appropriate
- Default values for numeric columns (e.g., `integer().default(0)`)

*See [packages/database/CLAUDE.md](packages/database/CLAUDE.md) for detailed schemas and migrations.*

## Shared Packages

- **`@motormetrics/ai`**: AI-powered blog generation with 2-step flow (analysis → structured output), Zod validation, hero images, tag constants, and Langfuse telemetry
- **`@motormetrics/database`**: Drizzle ORM schemas and migrations
- **`@motormetrics/types`**: Shared TypeScript interfaces
- **`@motormetrics/utils`**: Utility functions and centralised Redis client
- **`@motormetrics/logos`**: Car logo management with Vercel Blob storage, automatic scraping, Redis caching, and brand name normalization

*See component CLAUDE.md files for architecture details (workflows, blog generation, social media integration).*

## Release Process

Automated via semantic-release with unified "v" prefix versioning (v1.0.0, v1.1.0, v2.0.0). See `release-management` and `changelog` skills for release workflows.

## GitHub Actions

**Active**: `release.yml`, `run-migrations.yml`, `checks.yml`, `publish-mcp.yml`
**Reusable**: `test.yml` (called by other workflows)

- `release.yml` - Automated semantic releases for the monorepo
- `run-migrations.yml` - Database migration deployment
- `checks.yml` - CI checks (lint, typecheck, tests)
- `publish-mcp.yml` - Publish MCP server package to npm registry
- `test.yml` - Reusable test workflow called by other jobs

See `github-actions` skill for workflow management and automation.

## Contribution Guidelines

- Create feature branches from main
- Use conventional commit messages (see Code Style section)
- Ensure CI passes (tests, lint, typecheck)
- Use GitHub issue templates when available
- Maintain backward compatibility for public APIs

## Documentation Maintenance

### Documentation Structure

- **Root CLAUDE.md**: Monorepo-wide guidelines, structure, tooling, cross-cutting concerns
- **Component CLAUDE.md**: Component-specific implementation (`apps/*/CLAUDE.md`, `packages/*/CLAUDE.md`)
- **README.md**: Package setup, usage instructions, user-facing features
- **docs/architecture/**: System architecture documentation with Mermaid diagrams

**Rule of thumb:** Component-specific changes → component docs. Cross-cutting changes → root docs.

See `readme-updates` and `mermaid-diagrams` skills for documentation workflows.

<!-- BEGIN BEADS INTEGRATION v:1 profile:full hash:f65d5d33 -->
## Issue Tracking with bd (beads)

**IMPORTANT**: This project uses **bd (beads)** for ALL issue tracking. Do NOT use markdown TODOs, task lists, or other tracking methods.

### Why bd?

- Dependency-aware: Track blockers and relationships between issues
- Git-friendly: Dolt-powered version control with native sync
- Agent-optimized: JSON output, ready work detection, discovered-from links
- Prevents duplicate tracking systems and confusion

### Quick Start

**Check for ready work:**

```bash
bd ready --json
```

**Create new issues:**

```bash
bd create "Issue title" --description="Detailed context" -t bug|feature|task -p 0-4 --json
bd create "Issue title" --description="What this issue is about" -p 1 --deps discovered-from:bd-123 --json
```

**Claim and update:**

```bash
bd update <id> --claim --json
bd update bd-42 --priority 1 --json
```

**Complete work:**

```bash
bd close bd-42 --reason "Completed" --json
```

### Issue Types

- `bug` - Something broken
- `feature` - New functionality
- `task` - Work item (tests, docs, refactoring)
- `epic` - Large feature with subtasks
- `chore` - Maintenance (dependencies, tooling)

### Priorities

- `0` - Critical (security, data loss, broken builds)
- `1` - High (major features, important bugs)
- `2` - Medium (default, nice-to-have)
- `3` - Low (polish, optimization)
- `4` - Backlog (future ideas)

### Workflow for AI Agents

1. **Check ready work**: `bd ready` shows unblocked issues
2. **Claim your task atomically**: `bd update <id> --claim`
3. **Work on it**: Implement, test, document
4. **Discover new work?** Create linked issue:
   - `bd create "Found bug" --description="Details about what was found" -p 1 --deps discovered-from:<parent-id>`
5. **Complete**: `bd close <id> --reason "Done"`

### Quality
- Use `--acceptance` and `--design` fields when creating issues
- Use `--validate` to check description completeness

### Lifecycle
- `bd defer <id>` / `bd supersede <id>` for issue management
- `bd stale` / `bd orphans` / `bd lint` for hygiene
- `bd human <id>` to flag for human decisions
- `bd formula list` / `bd mol pour <name>` for structured workflows

### Auto-Sync

bd automatically syncs via Dolt:

- Each write auto-commits to Dolt history
- Use `bd dolt push`/`bd dolt pull` for remote sync
- No manual export/import needed!

### Important Rules

- ✅ Use bd for ALL task tracking
- ✅ Always use `--json` flag for programmatic use
- ✅ Link discovered work with `discovered-from` dependencies
- ✅ Check `bd ready` before asking "what should I work on?"
- ❌ Do NOT create markdown TODO lists
- ❌ Do NOT use external issue trackers
- ❌ Do NOT duplicate tracking systems

For more details, see README.md and docs/QUICKSTART.md.

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd dolt push
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

<!-- END BEADS INTEGRATION -->
