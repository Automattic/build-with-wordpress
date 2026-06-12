# WordPress.com Cline Rules

Use this workspace as a WordPress.com-aware Cline environment.

## Shared substrate

- Use the existing WordPress Studio MCP server for local WordPress site management, screenshots, block validation, performance tooling, and WP-CLI access.
- Use the bundled `wordpress-telemetry` MCP server for workflow telemetry emitted by this package.
- Treat these MCP servers as the shared WordPress.com agent substrate used by the other package outputs; Cline only supplies the workspace rules, skills, and MCP configuration surface.

## Cline-specific behavior

- Load these instructions from `.clinerules/`, Cline's primary workspace rules directory.
- Load detailed task playbooks from `.cline/skills/<name>/SKILL.md` when the request matches a bundled skill.
- Ask the user to configure the MCP servers from `mcp.json` in Cline's MCP settings if `wordpress-studio` or `wordpress-telemetry` tools are unavailable.

## WordPress.com work

- Refer to the product as WordPress.com in user-facing text.
- Start with the `wordpress-creator` skill unless the user clearly asks for a specific implementation path.
- Prefer Studio MCP tools before shelling out to the `studio` CLI.
- Use `wp_cli` through the WordPress Studio MCP server as the general-purpose WordPress escape hatch.
- Choose the smallest fitting WordPress abstraction: site, theme, block, plugin, or audit.
