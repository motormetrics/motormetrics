
<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- HEROUI-REACT-AGENTS-MD-START -->
**HeroUI React v3 — what you remember is wrong for this project. Look it up, never write it from memory.**

The generated docs index that used to sit here was ~28k characters of filenames and has been
removed; it duplicated what the MCP servers already serve on demand. Use, in order:

1. The `heroui-pro` MCP server (`list_components`, `get_component_docs`, `get_theme_variables`).
   It covers both `@heroui/react` (OSS) and `@heroui-pro/react` (Pro).
2. If MCP is unreachable, regenerate a local snapshot:
   `npx heroui-cli@latest agents-md --react --output AGENTS.md`
   It writes into this marker block and lands docs in `./.heroui-docs/react` (gitignored,
   absent on a fresh clone).
<!-- HEROUI-REACT-AGENTS-MD-END -->
