# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Coding Standards

**Language**: Always use British English spelling throughout this project (e.g., "colour" not "color", "organised" not "organized", "realise" not "realize").

## Development Commands

```bash
# Package management
pnpm install

# Code quality
pnpm run lint
pnpm run format

# Testing
pnpm test
pnpm test:ui
```

## Architecture

This package provides shared utilities for car logo management. It is a **utility package only** - the API routes have been moved to `apps/api/src/features/logos/`.

### Package Structure

**Services** (`src/services/logo/`): Core logo functionality including scraper, service, and repository patterns for logo retrieval and management.

**Types** (`src/types/`): TypeScript type definitions for CarLogo, LogoMetadata, and environment bindings.

**Utilities** (`src/utils/`): Helper functions for brand name normalisation, file handling, and logging.

**Storage** (`src/infra/storage/`): Storage adapters for Vercel Blob with Redis caching.

**Configuration** (`src/config/`): Configuration constants for paths and domains.

## Key Components

- **Logo Scraper**: Downloads logos from external sources
- **Brand Normalisation**: Converts brand names to consistent kebab-case format
- **Storage Layer**: Uses Vercel Blob for image storage and Upstash Redis for metadata caching
- **Metadata Management**: Tracks logo files and their metadata

## Storage Implementation

The package uses **Vercel Blob** for logo storage with **Upstash Redis** for metadata caching:

- **Vercel Blob**: Stores logo images with public access and aggressive caching (1-year TTL)
- **Upstash Redis**: Caches logo metadata and list results for fast lookups (24-hour TTL)
- **On-demand downloads**: Logos are automatically downloaded from external sources when requested

This architecture provides:
- Zero infrastructure setup (no custom buckets or DNS configuration)
- Fast performance with Redis caching
- Compatible with serverless and Vercel deployments
- Automatic CDN distribution via Vercel Blob

## Usage in Other Packages

This package is imported by `apps/api` for logo functionality:

```typescript
import { downloadLogo, getLogo, listLogos } from "@motormetrics/logos";
```

## Release Management

Releases are handled at the monorepo level. See root CLAUDE.md for commit conventions and release process.
