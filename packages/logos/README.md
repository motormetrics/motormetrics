# @motormetrics/logos

Car make logo storage and retrieval for the MotorMetrics monorepo.

## What it does

- Stores logo images in Vercel Blob under the `logos/` prefix, public, with a 1-year cache header
- Downloads a missing logo on demand from carlogos.org
- Normalises make names into consistent kebab-case storage keys

The web app wraps these functions with its own Redis cache in `apps/web/src/queries/logos`.
Pages call that query directly; there is no HTTP API in front of this package.

## Usage

```typescript
import {
  type CarLogo,
  deleteLogo,
  downloadLogo,
  getLogo,
  listLogos,
  normaliseMake,
} from "@motormetrics/logos";

const logos = await listLogos();
const logo = await getLogo("Mercedes-Benz");
const result = await downloadLogo("BYD");
normaliseMake("Mercedes-Benz"); // "mercedes-benz"
```

## Exports

| Function        | Purpose                                                               |
| --------------- | --------------------------------------------------------------------- |
| `listLogos`     | List every stored logo                                                |
| `getLogo`       | Find one logo by make, or `null`                                      |
| `uploadLogo`    | Store an image buffer for a make                                      |
| `deleteLogo`    | Remove a make's logo                                                  |
| `downloadLogo`  | Fetch from carlogos.org and store, returning `{ success, logo?, error? }` |
| `normaliseMake` | Strip `logo` affixes and slugify                                      |

```typescript
interface CarLogo {
  make: string;
  url: string;
  filename: string;
}
```

## Environment

- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token

## Commands

```bash
pnpm test
pnpm typecheck
```

## License

MIT
