# @motormetrics/logos

Car make logo storage and retrieval for the MotorMetrics monorepo.

## What it does

- Stores logo images in Vercel Blob under the `logos/` prefix, public, with a 1-year cache header
- Keeps a manifest at `logos/manifest.json` that is the source of truth for which logos exist
- Downloads a logo from carlogos.org and stores it
- Normalises make names into consistent kebab-case storage keys

## Usage

```typescript
import { manifestToLogos, readManifest } from "@motormetrics/logos/services/manifest";
import { normaliseMake } from "@motormetrics/logos/utils/normalise-make";

const manifest = await readManifest();
const logos = manifest ? manifestToLogos(manifest) : [];
normaliseMake("Mercedes-Benz"); // "mercedes-benz"
```

Consumers only read the manifest. The [web logos workflow](../../apps/web/src/workflows/logos/index.ts)
bootstraps and persists it when absent, downloads logos for newly seen makes,
then invalidates the web cache. `downloadLogo()` uploads an image but does not
update the manifest itself.

## Workflow Behaviour

Public subpaths are listed in [package.json](package.json), and manifest types are defined in [src/types/index.ts](src/types/index.ts).

`missing` entries are never retried by the workflow. `manual` entries are never overwritten.
Transient download failures are left out of the manifest and retried on a later run.
The image cache header is one year; the manifest cache header is 60 seconds.

## Environment

Blob access uses `BLOB_STORE_ID` and `VERCEL_OIDC_TOKEN` in Vercel-linked
environments. Standalone scripts can alternatively export `BLOB_READ_WRITE_TOKEN`,
as shown in [.env.example](.env.example). The package does not load environment
files itself. See the [Blob authentication reference](https://github.com/vercel/storage/blob/main/_autodocs/configuration.md).

## Commands

```bash
pnpm --filter @motormetrics/logos test
pnpm --filter @motormetrics/logos typecheck
```

Run these from the repository root after `pnpm install`, using the toolchain
versions in the [root manifest](../../package.json). This package has no build
step; consumers import TypeScript through the subpaths in [package.json](package.json).

## License

[MIT](../../LICENSE)
