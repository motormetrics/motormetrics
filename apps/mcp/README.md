# MotorMetrics MCP

A Model Context Protocol server for MotorMetrics blog and maintenance management. It exposes tools over stdio for MCP-compatible clients and calls the web application's REST routes.

## Tools

| Tool | Description |
| --- | --- |
| `list_posts` | List posts with an optional draft/published filter and limit |
| `get_post` | Get a post by UUID |
| `create_post` | Create a post; status defaults to draft |
| `update_post` | Update a post by UUID |
| `delete_post` | Permanently delete a post |
| `get_maintenance_status` | Read the current maintenance status |
| `update_maintenance_status` | Enable or disable maintenance mode with an optional message |

Create and update tools require `title` and `content`; optional fields include excerpt, tags, highlights, month, data type and status. The update tool also requires an `id` and currently defaults status to `draft` when omitted. `list_posts` accepts a limit up to 100, with a default of 50.

## Client Setup

Set `MOTORMETRICS_API_TOKEN` to the bearer token accepted by the target web deployment. The client resolves the Vercel related project named `web`, falling back to `https://motormetrics.app`. It does not currently expose a local API URL override.

Add this server entry to your MCP client's configuration:

```json
{
  "mcpServers": {
    "motormetrics": {
      "command": "pnpm",
      "args": ["dlx", "@motormetrics/mcp"],
      "env": {
        "MOTORMETRICS_API_TOKEN": "<your-token>"
      }
    }
  }
}
```

The client must be able to find `pnpm` on its PATH. Configuration file locations depend on the client.

## Local Development

Use the Node.js and pnpm versions in the [root manifest](../../package.json). From the repository root:

```bash
pnpm install
pnpm --filter @motormetrics/mcp build
pnpm --filter @motormetrics/mcp dev
```

`build` compiles to `dist/`; `dev` watches TypeScript source changes. To use the local build in a client, set `command` to `node`, `args` to the absolute path of `apps/mcp/dist/index.js`, and pass the API token in `env`. The local build uses the same web target resolution as the published package.

Implementation lives in [src/index.ts](src/index.ts) (tools and transport) and [src/client.ts](src/client.ts) (authenticated REST requests).

## License

[MIT](../../LICENSE)
