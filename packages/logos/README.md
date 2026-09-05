# @motormetrics/logos

Car make logo storage and retrieval for the MotorMetrics monorepo.

## What it does

- Stores logo images in Vercel Blob under the `logos/` prefix, public, with a 1-year cache header
- Keeps a manifest at `logos/manifest.json` that is the source of truth for which logos exist
- Downloads a logo from carlogos.org and stores it
- Normalises make names into consistent kebab-case storage keys

Readers never list Blob. They read the manifest, one operation, and the web app caches that
under the `logos` tag in `apps/web/src/queries/logos`. The logos workflow is the only writer.

## Usage

```typescript
import {
  type CarLogo,
  type LogoManifest,
  bootstrapManifest,
  downloadLogo,
  manifestToLogos,
  normaliseMake,
  readManifest,
  writeManifest,
} from "@motormetrics/logos";

const manifest = (await readManifest()) ?? (await bootstrapManifest());
const logos = manifestToLogos(manifest);
const result = await downloadLogo("BYD");
normaliseMake("Mercedes-Benz"); // "mercedes-benz"
```

## Exports

| Function            | Blob ops | Purpose                                                        |
| ------------------- | -------- | -------------------------------------------------------------- |
| `readManifest`      | 1        | Fetch the manifest, or `null` if none has been written         |
| `writeManifest`     | 1        | Overwrite the manifest                                         |
| `bootstrapManifest` | 1 per 1000 blobs | Build a manifest from existing images, first run only  |
| `manifestToLogos`   | 0        | Entries with an image, as `CarLogo[]`                          |
| `downloadLogo`      | 1        | Fetch from carlogos.org and store, overwriting any existing    |
| `uploadLogo`        | 1        | Store an image buffer for a make                               |
| `normaliseMake`     | 0        | Strip `logo` affixes and slugify                               |

```typescript
interface CarLogo { make: string; url: string; filename: string }

type LogoStatus = "found" | "missing" | "manual";

interface LogoEntry {
  make: string;
  status: LogoStatus;
  url: string | null;
  pathname: string | null;
  sourceUrl: string | null;
  checkedAt: string;
  lastError: string | null;
}

interface LogoManifest { version: 1; updatedAt: string; logos: Record<string, LogoEntry> }
```

`missing` entries are never retried by the workflow. `manual` entries are never overwritten.

## Environment

- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token

## Commands

```bash
pnpm test
pnpm typecheck
```

## License

MIT
