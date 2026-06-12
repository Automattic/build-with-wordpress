# WordPress.com for Cline

This output packages the shared Build with WordPress skills for Cline.

Cline-specific files in this folder are intentionally small:

- `.clinerules/wordpress-com.md` gives Cline workspace-wide WordPress.com guidance using Cline's primary workspace rules directory.
- `.cline/skills/` contains the shared WordPress skills using Cline's documented skill structure.
- `mcp.json` contains the MCP server entries to merge into Cline's MCP settings.
- `.cline/plugins/README.md` documents why this output does not ship a Cline SDK plugin yet.

The shared WordPress.com substrate is not Cline-specific: the skills, the `studio mcp` server, and the embedded telemetry MCP bootstrap are the same flow used by the other agent outputs. Cline supplies the workspace rules, skills, and MCP configuration layer only.

Cline's official plugin documentation says plugins currently apply to Cline SDK, CLI, and Kanban, and are not applicable to the VS Code and JetBrains extensions yet. This output therefore does not claim extension marketplace packaging; it packages the Cline-native workspace files that official docs support today.

## Setup

1. Install Cline using the official Cline installation instructions.
2. Open this folder, or copy `.clinerules/`, `.cline/skills/`, and `mcp.json` into the root of the workspace where Cline should assist with WordPress.com work.
3. Make sure WordPress Studio is installed and the `studio` CLI is available on your PATH.
4. Merge the server entries from `mcp.json` into Cline's MCP settings. Cline's docs describe CLI MCP settings at `~/.cline/mcp.json`; IDE extensions open their MCP settings JSON through the MCP Servers Configure tab.
5. Confirm the `wordpress-studio` and `wordpress-telemetry` MCP tools are available in Cline before starting site work.

## MCP servers

`mcp.json` launches:

- `wordpress-studio`: runs `studio mcp` for WordPress site management, screenshots, block validation, performance tooling, and WP-CLI access.
- `wordpress-telemetry`: runs an embedded bootstrap generated from the shared telemetry server artifact.

This does not invent a Cline-only backend. Cline connects to the existing WordPress.com / Jetpack MCP flow through the same local Studio MCP entry point used by the other outputs.

## Official Cline references

- Rules: https://docs.cline.bot/customization/cline-rules.md
- Skills: https://docs.cline.bot/customization/skills.md
- MCP: https://docs.cline.bot/mcp/mcp-overview.md
- MCP Marketplace: https://docs.cline.bot/mcp/mcp-marketplace.md
- Configuration locations: https://docs.cline.bot/getting-started/config.md
- Plugins: https://docs.cline.bot/customization/plugins.md
- Plugin installation: https://docs.cline.bot/sdk/plugin-install.md
- Installing Cline: https://docs.cline.bot/getting-started/installing-cline.md

## Included skills

- `auditing`
- `block-creator`
- `design-previews-creator`
- `plugin-creator`
- `site-creator`
- `studio`
- `theme-creator`
- `wordpress-creator`
