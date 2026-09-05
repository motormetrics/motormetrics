# CLAUDE.md

Guidance for Claude Code when working in `packages/logos`.

## Purpose

Utility package for car make logos. It talks to Vercel Blob directly and has no routes,
no caching, and no build step. Consumed from `src/index.ts` by `apps/web`.

## Layout

- `src/services/blob.ts`: `uploadLogo`, `listLogos`, `getLogo`, `deleteLogo` over `@vercel/blob`
- `src/services/scraper.ts`: `downloadLogo`, fetches `<BASE_URL>/<make>-logo.png` and uploads it
- `src/utils/normalise-make.ts`: make name to kebab-case key, the only tested module
- `src/utils/file-utils.ts`: extension and MIME helpers
- `src/config/index.ts`: `BASE_URL` for carlogos.org
- `src/types/index.ts`: `CarLogo`

## Conventions

- Import by package name from other workspaces: `@motormetrics/logos`. Relative imports inside.
- British English spelling (`normalise`, not `normalize`).
- Caching belongs to the consumer. The web app's Redis layer lives in `apps/web/src/queries/logos`.
- `getLogo` lists the whole prefix and scans for a match. Fine at current volume.

## Environment

`BLOB_READ_WRITE_TOKEN` only. See `.env.example`.
