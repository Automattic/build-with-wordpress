# WordPress.com for Roo Code

This output packages the shared Build with WordPress skills for the Roo Code VS Code extension.

Roo-specific files in this folder are intentionally small:

- `.roo/rules/wordpress-com.md` gives Roo workspace-wide WordPress.com guidance using Roo's preferred directory-based rules surface.
- `.roo/rules-code/wordpress-com-code.md` adds Code mode guidance for implementation tasks.
- `.roo/mcp.json` connects Roo to the existing WordPress Studio MCP server and bundled `wordpress-telemetry` server.
- `AGENTS.md` mirrors the same high-level routing for Roo installations that load agent rules.

The shared WordPress.com substrate is not Roo-specific: the skills in `skills/`, the `studio mcp` server, and the bundled telemetry MCP server are the same flow used by the other agent outputs. Roo Code supplies the VS Code workspace rules and MCP configuration layer only.

## Setup

1. Install the Roo Code VS Code extension.
2. Open this folder, or copy its contents into the root of the workspace where Roo should assist with WordPress.com work.
3. Make sure WordPress Studio is installed and the `studio` CLI is available on your PATH.
4. In Roo Code, enable MCP servers.
5. Roo automatically detects project-level MCP config from `.roo/mcp.json`. If needed, open Roo Code's MCP settings and use `Edit Project MCP` to inspect or recreate the same config.

## MCP servers

`.roo/mcp.json` launches:

- `wordpress-studio`: runs `studio mcp` for WordPress site management, screenshots, block validation, performance tooling, and WP-CLI access.
- `wordpress-telemetry`: runs the bundled telemetry server artifact from this package.

This does not invent a Roo-only backend. Roo connects to the existing WordPress.com / Jetpack MCP flow through the same local Studio MCP entry point used by the other outputs.

## Included skills

- `auditing`
- `block-creator`
- `design-previews-creator`
- `plugin-creator`
- `site-creator`
- `studio`
- `theme-creator`
- `wordpress-creator`
