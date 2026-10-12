# WordPress.com MCP

The WordPress.com MCP server lets MCP-compatible AI agents work with WordPress.com sites: listing sites, creating and editing content, managing plugins, and more, using the permissions of the signed-in WordPress.com account.

- MCP server URL: `https://public-api.wordpress.com/wpcom/v2/mcp/v1`
- Documentation: https://developer.wordpress.com/docs/mcp/

Unlike the other folders in `plugins/`, this entry does not package the shared Build with WordPress skills. It is a hand-written reference for connecting an agent to the hosted WordPress.com MCP server, so it is not produced by `scripts/build-plugins.mjs`.

## Setup

Agents that support remote HTTP MCP servers can connect directly to `https://public-api.wordpress.com/wpcom/v2/mcp/v1` without any manual steps.

See the [WordPress.com MCP documentation](https://developer.wordpress.com/docs/mcp/) for supported tools, authentication, and client-specific instructions.

If your agent does not support remote HTTP MCP servers, or you want to use the WordPress.com MCP server with a local agent, follow these steps:

1. Copy the `wordpress-com-mcp` entry from `mcp.json` into your agent's MCP configuration file (for example `.cursor/mcp.json`, `.vscode/mcp.json`, or `.mcp.json`; note that some clients use a different top-level key than `mcpServers`, e.g. VS Code uses `servers`, so make sure to check their documentation).
2. Restart the agent and confirm the `wordpress-com` MCP server is connected.
3. Complete the WordPress.com sign-in when prompted.

## Files

- `mcp.json` is a ready-to-copy MCP client configuration for the WordPress.com MCP server.