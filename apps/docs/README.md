# MotorMetrics Documentation

The Fumadocs documentation application for MotorMetrics, built with Next.js and MDX. Current content covers car registrations, COE results, deregistrations and API rate limiting.

## Development

Use the Node.js and pnpm versions pinned in the [root manifest](../../package.json). From the repository root:

```bash
pnpm install
pnpm --filter @motormetrics/docs dev
```

Open the URL printed by Next.js. The default port is 3000, which may already be occupied by another application.

```bash
pnpm --filter @motormetrics/docs build
pnpm --filter @motormetrics/docs start
pnpm --filter @motormetrics/docs types:check
pnpm --filter @motormetrics/docs lint
pnpm --filter @motormetrics/docs format
```

`postinstall` generates the MDX collections. `types:check` regenerates those collections and Next.js route types before running TypeScript checks.

## Editing Content

Add or update MDX files in [content/docs](content/docs/) and adjust `meta.json` for navigation. [source.config.ts](source.config.ts) defines the content collection and frontmatter schema.

| Path | Purpose |
| --- | --- |
| `src/lib/source.ts` | Content loader, page images and processed text |
| `src/lib/layout.shared.tsx` | Shared layout options |
| `src/mdx-components.tsx` | MDX component mappings |
| `src/app/(home)/` | Landing page |
| `src/app/docs/` | Documentation layout and pages |
| `src/app/api/search/route.ts` | Search endpoint |
| `src/app/og/docs/[...slug]/route.tsx` | Documentation share images |

## Text Exports

The app provides `/llms.txt` as a page index, `/llms-full.txt` as combined processed documentation, and `/llms.mdx/docs/<slug>` for individual pages. [next.config.mjs](next.config.mjs) also rewrites `/docs/<slug>.mdx` to the individual text endpoint.

## Related Documentation

- [Root README](../../README.md): Repository setup and architecture.
- [Package manifest](package.json): Dependencies and scripts.
- [Fumadocs documentation](https://fumadocs.dev/docs): Framework reference.

## License

[MIT](../../LICENSE)
