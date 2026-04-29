# /logos

Shared utilities for car logo management in the MotorMetrics monorepo.

## Overview

This package provides core utilities for scraping, storing, and retrieving car brand logos. It is a **utility package only** - the API routes are implemented in `apps/api/src/features/logos/`.

## Features

- **Logo Scraper**: Automatically downloads car brand logos from external sources
- **Brand Normalisation**: Consistent kebab-case naming for storage keys
- **Vercel Blob Storage**: Cloud storage with public CDN access
- **Redis Caching**: Fast metadata lookups with 24-hour TTL
- **Type Safety**: Full TypeScript support with exported types

## Installation

This package is part of the monorepo workspace. It's automatically linked when you run:

```bash
pnpm install
```

## Usage

Import utilities in other workspace packages:

```typescript
import { downloadLogo, getLogo, listLogos } from "@motormetrics/logos";
import { normaliseBrandName } from "@motormetrics/logos";
import type { CarLogo, LogoMetadata } from "@motormetrics/logos";
```

### Example: Download a Logo

```typescript
import { downloadLogo } from "@motormetrics/logos";

// Download and store a logo (automatically uploads to Vercel Blob)
const result = await downloadLogo("Mercedes-Benz");

if (result.success) {
  console.log(`Logo URL: ${result.logo.url}`);
} else {
  console.error(`Error: ${result.error}`);
}
```

### Example: Retrieve a Logo

```typescript
import { getLogo } from "@motormetrics/logos";

// Get logo from storage (checks Redis cache, then Vercel Blob)
const logo = await getLogo("BMW");

if (logo) {
  console.log(`Brand: ${logo.brand}`);
  console.log(`URL: ${logo.url}`);
}
```

### Example: Normalise Brand Name

```typescript
import { normaliseBrandName } from "@motormetrics/logos";

const normalised = normaliseBrandName("Mercedes-Benz");
// Result: "mercedes-benz"
```

## Package Structure

```
packages/logos/
├── src/
│   ├── services/logo/     # Core logo functionality
│   │   ├── scraper.ts     # Logo download logic
│   │   ├── service.ts     # Logo service layer
│   │   └── repository.ts  # Data access layer
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   │   ├── normalisation.ts
│   │   ├── file-utils.ts
│   │   └── logger.ts
│   ├── infra/storage/     # Storage abstractions (R2, KV)
│   ├── config/            # Configuration constants
│   └── index.ts           # Public API exports
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Storage Implementation

The package uses **Vercel Blob** for logo storage with **Upstash Redis** for metadata caching:

- **Vercel Blob**: Stores logo images with public CDN access and 1-year cache headers
- **Upstash Redis**: Caches logo metadata for 24 hours to minimize Blob API calls
- **Compatible**: Works with SST/AWS Lambda and Vercel deployments

**Environment Variables Required:**
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob authentication token
- `UPSTASH_REDIS_REST_URL`: Redis REST API URL (from `@motormetrics/utils`)
- `UPSTASH_REDIS_REST_TOKEN`: Redis authentication token (from `@motormetrics/utils`)

## Development Commands

```bash
# Code quality
pnpm lint          # Check code style with Biome
pnpm format        # Auto-format code with Biome

# Testing
pnpm test          # Run tests
pnpm test:ui       # Run tests with UI
pnpm test:run      # Run tests once
```

## API Integration

The API routes are implemented in `apps/api/src/features/logos/` and mounted at `/logos`:

- `GET /logos` - List all cached logos
- `GET /logos/:brand` - Get specific brand logo (auto-download if missing)

## Types

### CarLogo

```typescript
interface CarLogo {
  brand: string;
  url: string;
  filename: string;
}
```

### LogoMetadata

```typescript
interface LogoMetadata {
  brand: string;
  filename: string;
  url: string;
  createdAt: string;
  fileSize?: number;
}
```

## Contributing

This package follows the monorepo conventions. See root `CLAUDE.md` for:
- Commit message format
- Code style guidelines
- Testing requirements
- Release process

## License

MIT
