# WordPress.com workspace rules

Use this workspace as a WordPress.com-aware Roo Code environment.

## Shared substrate

- Use the existing WordPress Studio MCP server for local WordPress site management, screenshots, block validation, performance tooling, and WP-CLI access.
- Use the bundled `wordpress-telemetry` MCP server for workflow telemetry emitted by this package.
- Treat these MCP servers as the shared WordPress.com agent substrate used by the other package outputs; Roo Code only supplies the VS Code workspace rule and MCP configuration surface.

## Roo-specific behavior

- Load these instructions from `.roo/rules/`, Roo Code's preferred workspace rules directory.
- Use Roo's MCP support to connect to `.roo/mcp.json` instead of creating a new backend service.
- Ask the user to enable MCP servers in Roo Code if `wordpress-studio` or `wordpress-telemetry` tools are unavailable.

## WordPress.com work

- Refer to the product as WordPress.com in user-facing text.
- Route WordPress implementation requests through the shared skills in `skills/`.
- Prefer Studio MCP tools before shelling out to the `studio` CLI.
- Use `wp_cli` through the WordPress Studio MCP server as the general-purpose WordPress escape hatch.
- Choose the smallest fitting WordPress abstraction: site, theme, block, plugin, or audit.
