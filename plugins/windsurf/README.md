# WordPress.com for Windsurf

This Windsurf/Cascade output packages the shared WordPress agent substrate from the `build-with-wordpress` source repo for WordPress.com work.

## What is Windsurf-specific

- Cascade rules live in `.devin/rules/*.md`, which is Windsurf's preferred workspace rule location.
- `mcp_config.json` is shaped for Cascade's MCP configuration file at `~/.codeium/windsurf/mcp_config.json`.
- The rules tell Cascade when to use WordPress.com MCP tools and how to route WordPress implementation work.

## What is shared

- The WordPress.com MCP path uses the existing `wordpress-studio` MCP server; this output does not add a new backend service.
- Jetpack-connected site access stays part of the existing WordPress.com / Jetpack MCP flow.
- The bundled `wordpress-telemetry` MCP server is the same repo-local telemetry server used by the Codex and Claude Code outputs.
- Shared WordPress skills are copied into `skills/` so the routing, Studio-backed workflows, auditing, theme, block, and plugin guidance stay aligned across agent surfaces.

## Setup

1. Build this repo with `pnpm build`.
2. Copy the servers from `plugins/windsurf/mcp_config.json` into `~/.codeium/windsurf/mcp_config.json`.
3. In Windsurf, open Cascade MCP settings and confirm both servers are enabled:
   - `wordpress-studio`
   - `wordpress-telemetry`
4. Open this output folder or copy `.devin/rules/` into the workspace where Cascade should be WordPress.com-aware.
5. Ask Cascade for a WordPress.com site task and confirm it uses MCP tools before shell fallbacks.

## Included Cascade rules

- `.devin/rules/wordpress-com.md`: always-on WordPress.com routing and product guidance.
- `.devin/rules/wordpress-com-mcp.md`: model-decision MCP setup and troubleshooting guidance.

## Included shared skills

- `auditing`
- `block-creator`
- `design-previews-creator`
- `plugin-creator`
- `site-creator`
- `studio`
- `theme-creator`
- `wordpress-creator`
