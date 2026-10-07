# WordPress.com MCP

The WordPress.com MCP server lets MCP-compatible AI agents work with WordPress.com sites: listing sites, creating and editing content, managing plugins, and more, using the permissions of the signed-in WordPress.com account.

- MCP server URL: `https://public-api.wordpress.com/wpcom/v2/mcp/v1`
- Documentation: https://developer.wordpress.com/docs/mcp/
- npm package: [`@automattic/mcp-wordpress-remote`](https://www.npmjs.com/package/@automattic/mcp-wordpress-remote)
- GitHub repository: https://github.com/Automattic/mcp-wordpress-remote

Unlike the other folders in `plugins/`, this entry does not package the shared Build with WordPress skills. It is a hand-written reference for connecting an agent to the hosted WordPress.com MCP server, so it is not produced by `scripts/build-plugins.mjs`.

## Files

- `mcp.json` is a ready-to-copy MCP client configuration that runs `@automattic/mcp-wordpress-remote` against the WordPress.com MCP server URL.

## Setup

1. Install Node.js so `npx` is available.
2. Copy the `wordpress-com` entry from `mcp.json` into your agent's MCP configuration file (for example `.cursor/mcp.json`, `.vscode/mcp.json`, or `.mcp.json`; some clients use a different top-level key than `mcpServers`).
3. Restart the agent and confirm the `wordpress-com` MCP server is connected.
4. Complete the WordPress.com sign-in when prompted.

Clients that support remote HTTP MCP servers can instead connect directly to `https://public-api.wordpress.com/wpcom/v2/mcp/v1` without the npm package.

See the [WordPress.com MCP documentation](https://developer.wordpress.com/docs/mcp/) for supported tools, authentication, and client-specific instructions.
