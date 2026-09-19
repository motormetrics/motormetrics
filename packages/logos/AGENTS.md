# MotorMetrics Logos Package

## Purpose

Utility package for car make logos. It talks to Vercel Blob directly and has no routes,
no caching, and no build step. Consumed from `apps/web` through the subpath exports
listed in `package.json`; there is no barrel entry point.

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

- Import by subpath from other workspaces: `@motormetrics/logos/services/manifest`,
  `@motormetrics/logos/types`, and so on. Relative imports inside. New public modules
  need a matching entry in the `exports` map.
- British English spelling (`normalise`, not `normalize`).
- Caching belongs to the consumer. The web app reads the manifest under `"use cache"` with the `logos` tag.
- The logos workflow in `apps/web` is the only writer of the manifest. Do not write it from elsewhere.
- `bootstrapManifest` is the only caller of `list`. It runs once, when no manifest exists.

## Environment

`BLOB_READ_WRITE_TOKEN` only. See `.env.example`.
