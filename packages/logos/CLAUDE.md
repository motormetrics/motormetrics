# CLAUDE.md

Guidance for Claude Code when working in `packages/logos`.

## Purpose

Utility package for car make logos. It talks to Vercel Blob directly and has no routes,
no caching, and no build step. Consumed from `src/index.ts` by `apps/web`.

The goal is as few Blob operations as possible. `logos/manifest.json` is the source of
truth for which logos exist; readers fetch it once and never call `list` or `head`.

## Layout

- `src/services/manifest.ts`: `readManifest`, `writeManifest`, `bootstrapManifest`, `manifestToLogos`
- `src/services/blob.ts`: `uploadLogo` with `allowOverwrite`
- `src/services/scraper.ts`: `downloadLogo`, fetches `<BASE_URL>/<make>-logo.png` and uploads it; does not check for an existing image
- `src/utils/normalise-make.ts`: make name to kebab-case key
- `src/utils/file-utils.ts`: extension and MIME helpers
- `src/config/index.ts`: `BASE_URL` for carlogos.org
- `src/types/index.ts`: `CarLogo`

## Conventions

- Import by package name from other workspaces: `@motormetrics/logos`. Relative imports inside.
- British English spelling (`normalise`, not `normalize`).
- Caching belongs to the consumer. The web app reads the manifest under `"use cache"` with the `logos` tag.
- The logos workflow in `apps/web` is the only writer of the manifest. Do not write it from elsewhere.
- `bootstrapManifest` is the only caller of `list`. It runs once, when no manifest exists.

## Environment

`BLOB_READ_WRITE_TOKEN` only. See `.env.example`.
