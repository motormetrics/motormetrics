# MotorMetrics Web

The Next.js application for MotorMetrics hosts Singapore car market dashboards, ownership tools, EV charging maps, blog content, the admin interface, REST routes and data workflows.

## Local Development

Follow the [root setup instructions](../../README.md#getting-started) to install dependencies, configure the [environment template](.env.example) and apply the development database schema.

The development script runs `portless motormetrics next dev`. Open the URL it prints for `motormetrics.localhost`; set `NEXT_PUBLIC_SITE_URL` and your OAuth configuration to match. The `predev` and `prebuild` hooks copy MapLibre's worker assets into `public/maplibre` automatically.

See [AGENTS.md](AGENTS.md) for Blob, Flags, QStash and other integration settings.

## Commands

From the repository root:

```bash
pnpm dev:web
pnpm build:web
pnpm start:web
pnpm lint:web
pnpm typecheck:web
pnpm test:web
pnpm test:integration:web
```

Additional scripts can be run from `apps/web`:

```bash
pnpm format
pnpm test:watch
pnpm test:e2e
pnpm test:e2e:ui
pnpm analyse
```

Biome handles linting, formatting and import organisation.

## Testing

Vitest runs two projects: Node unit tests (`*.test.ts`) and browser component tests (`*.test.tsx`) in headless Chromium. Component tests use `vitest-browser-react`. Coverage is enabled in the [Vitest configuration](vitest.config.ts).

Install Chromium from the repository root before running browser tests:

```bash
pnpm turbo run @motormetrics/web#playwright:install
```

Workflow integration tests use [vitest.integration.config.ts](vitest.integration.config.ts). Playwright E2E tests live in `tests/`; their [configuration](playwright.config.ts) starts `pnpm dev` and expects `http://localhost:3000`. Ensure the server is reachable at that address when running them, since normal development uses Portless.

## Implementation

Pages and API routes live in `src/app`; route-specific components, actions and queries sit alongside their consuming route. Shared queries live in `src/queries`, workflows in `src/workflows`, and database schemas in `packages/database`. See [AGENTS.md](AGENTS.md) for implementation conventions and [package.json](package.json) for dependencies and scripts.

## Deployment

[vercel.ts](vercel.ts) defines the Singapore region and cron schedules. Hourly live charging ingestion is scheduled separately through QStash. See the [root deployment guidance](../../README.md#deployment) for production, previews and database migration behaviour.

## License

[MIT](../../LICENSE)
