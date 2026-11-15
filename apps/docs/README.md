# MotorMetrics Documentation

The API reference for MotorMetrics, written in MDX and built by [Docs7](https://context7.com/docs/docs7/quickstart). Current content covers car registrations, COE results, deregistrations and API rate limiting.

There is no application in this folder. Docs7 builds the site from [content/docs](content/docs/) on the `main` branch.

## Editing Content

Add or update MDX files in [content/docs](content/docs/) and list new pages in [docs.json](content/docs/docs.json) under `navigation`. Pages are served from the site root, so link to them as `/rate-limiting`, not `/docs/rate-limiting`.

## Local Preview

```bash
cd apps/docs/content/docs
pnpm dlx @upstash/docs7 dev
```

## Related Documentation

- [Root README](../../README.md): Repository setup and architecture.

## License

[MIT](../../LICENSE)
