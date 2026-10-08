# MotorMetrics

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

MotorMetrics tracks Singapore's car market through registration statistics, Certificate of Entitlement (COE) bidding results, renewal premiums and fleet data.

## Features

- **Car market dashboards**: Registrations by make, fuel type and vehicle type, annual trends, deregistrations and vehicle population.
- **COE analytics**: Bidding results, premium trends and Prevailing Quota Premium (PQP) renewal prices.
- **EV charging**: Charging locations on an interactive map, with live availability ingestion.
- **Ownership tools**: Additional Registration Fee (ARF) and Preferential Additional Registration Fee (PARF) calculators, alongside educational guides.
- **Monthly market updates**: AI-generated posts combining registrations, COE, PQP and deregistrations once all datasets have a complete month.
- **Content administration**: An integrated `/admin` interface with Google OAuth, blog editing, announcements and workflow controls.
- **Developer access**: REST routes in the web application, a blog-management MCP server and a Fumadocs documentation site.

## Getting Started

### Prerequisites

Use the Node.js and pnpm versions pinned through `devEngines` in [package.json](package.json). Use pnpm for all workspace commands.

You will also need a development PostgreSQL database and Upstash Redis credentials for data-backed pages.

### Installation

```bash
git clone https://github.com/motormetrics/motormetrics.git
cd motormetrics
pnpm install
cp apps/web/.env.example apps/web/.env.local
```

Fill in `apps/web/.env.local` before starting the web application. The [environment template](apps/web/.env.example) lists the web integrations; configure credentials for the features you intend to use.

Database commands run in `packages/database`, so they do not read the web application's `.env.local`. Export `DATABASE_URL` in your shell, pointing at your **development** database, before applying the schema:

```bash
export DATABASE_URL='postgresql://user:password@host:5432/database'
pnpm db:push
pnpm dev:web
```

The web development script uses Portless with the hostname `motormetrics.localhost`; use the URL printed when it starts. Set `NEXT_PUBLIC_SITE_URL` and your OAuth configuration to match it.

Development databases use `db:push`. Staging and production use committed migrations; see [packages/database/AGENTS.md](packages/database/AGENTS.md) before making schema changes.

## Development Commands

Run these from the repository root:

```bash
# Development and builds
pnpm dev                          # All workspace development processes
pnpm dev:web                      # Web application
pnpm build                        # All applications
pnpm build:web                    # Web application

# Testing
pnpm test                         # Workspace tests
pnpm test:watch                   # Watch mode
pnpm test:web                     # Web unit and browser component tests
pnpm test:integration:web         # Web workflow integration tests

# Code quality
pnpm lint                         # Biome checks
pnpm format                       # Format workspace code
pnpm typecheck                    # Workspace type checks
pnpm lint:web                     # Web Biome checks
pnpm typecheck:web                # Web type checks

# Database and authentication
pnpm db:push                      # Apply schema to development database
pnpm db:generate                  # Generate migrations for review
pnpm db:check                     # Check migration consistency
pnpm db:migrate                   # Apply migrations to a migration-managed database
pnpm auth:generate                # Generate authentication schema
```

See the [web README](apps/web/README.md#testing) for browser installation and E2E testing.

## Project Structure

```text
motormetrics/
├── apps/
│   ├── docs/                 # Fumadocs documentation site
│   ├── mcp/                  # @motormetrics/mcp blog-management server
│   └── web/                  # Dashboards, admin, REST routes and workflows
├── packages/
│   ├── ai/                 # Blog generation, hero images and embeddings
│   ├── database/           # Drizzle schema and migrations
│   ├── logos/              # Car logos backed by Vercel Blob
│   ├── types/              # Shared TypeScript types
│   └── utils/              # Shared utilities and Redis configuration
└── docs/
    ├── architecture/       # Architecture documentation
    ├── diagrams/           # Mermaid diagram sources
    └── product/            # Product proposals
```

## Technology

- **Web**: Next.js 16 with Cache Components, React 19, TypeScript, HeroUI v3, HeroUI Pro and Tailwind CSS v4.
- **Data**: Neon PostgreSQL, Drizzle ORM, Upstash Redis and Vercel Blob.
- **Workflows**: Vercel Workflow DevKit, Vercel Cron and Upstash QStash for hourly live charging ingestion.
- **AI**: Vercel AI SDK with Google Gemini through AI Gateway.
- **Authentication and analytics**: Better Auth with Google OAuth, PostHog and Vercel Analytics.
- **Tooling**: pnpm workspaces, Turborepo, Biome, Vitest Browser Mode and Playwright.

Shared dependency versions live in [pnpm-workspace.yaml](pnpm-workspace.yaml) and are referenced with `catalog:`. Toolchain pins and root scripts live in [package.json](package.json); package-specific dependencies live in each package's manifest.

## API and Workflows

REST handlers and data workflows run within the web application. See [API routes](apps/web/src/app/api/v1/), [workflow implementations](apps/web/src/workflows/) and [cron configuration](apps/web/vercel.ts) for the current endpoints and schedules. Hourly live charging ingestion is scheduled separately through QStash.

The [MCP server README](apps/mcp/README.md) describes the blog and maintenance tools and client setup. [Architecture documentation](docs/architecture/) provides system diagrams.

## Deployment

Pushes to `main` deploy production on Vercel at [motormetrics.app](https://motormetrics.app). Pull requests receive preview deployments.

The web application's `vercel-build` applies pending database migrations before building. **Preview deployments apply migrations to the shared staging Neon branch**, so an unmerged PR's migration persists there. Development uses `db:push` and receives no migrations.

## Documentation

- [Root AGENTS.md](AGENTS.md): Repository conventions and workflows.
- [Web application guidance](apps/web/AGENTS.md): Routing, UI, caching, testing and environment configuration.
- [AI package](packages/ai/README.md): Blog generation and embeddings.
- [Database guidance](packages/database/AGENTS.md): Schema changes and migration workflow.
- [Logos package](packages/logos/README.md): Logo storage and management.
- [Documentation site](apps/docs/README.md): Fumadocs application.
- [Architecture](docs/architecture/): System, database, infrastructure and workflows.
- [Product proposals](docs/product/): Opportunity assessments and design proposals.

## License

[MIT](LICENSE)
