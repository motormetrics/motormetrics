# MotorMetrics MCP

MCP (Model Context Protocol) server for managing MotorMetrics blog posts. Provides CRUD tools callable from Claude Code and other MCP-compatible clients via stdio transport.

## Tools

| Tool            | Description                                       |
| --------------- | ------------------------------------------------- |
| `list_posts`    | List blog posts with optional status filter/limit |
| `get_post`      | Get a single blog post by UUID                    |
| `create_post`   | Create a new blog post                            |
| `update_post`   | Update an existing blog post                      |
| `delete_post`   | Delete a blog post permanently                    |

## Setup

### Environment Variables

| Variable                    | Description                        | Required |
| --------------------------- | ---------------------------------- | -------- |
| `MOTORMETRICS_API_TOKEN`  | Bearer token for REST API auth     | Yes      |

### Claude Code

Add to your Claude Code MCP settings (`~/.claude/mcp.json`):

```json
{
  "mcpServers": {
    "motormetrics": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@motormetrics/mcp"],
      "env": {
        "MOTORMETRICS_API_TOKEN": "<your-token>"
      }
    }
  }
}
```

### Local Development

```sh
pnpm install
pnpm --filter @motormetrics/mcp build
```

The dev script watches for changes:

```sh
pnpm --filter @motormetrics/mcp dev
```

## License

MIT
