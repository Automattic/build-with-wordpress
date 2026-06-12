# WordPress.com for Windsurf Cascade

This Windsurf/Cascade output packages the shared WordPress agent substrate from the `build-with-wordpress` source repo for WordPress.com work.

## What is Windsurf-specific

- Cascade rules live in `.devin/rules/*.md`, which the official docs list as the preferred workspace rule location.
- `mcp_config.json` is shaped for Cascade's MCP configuration file at `~/.codeium/windsurf/mcp_config.json`.
- The rules tell Cascade when to use WordPress.com MCP tools and how to route WordPress implementation work.

## What is shared

- The WordPress.com MCP path uses the existing `wordpress-studio` MCP server; this output does not add a new backend service.
- Jetpack-connected site access stays part of the existing WordPress.com / Jetpack MCP flow.
- The bundled `wordpress-telemetry` MCP server is the same repo-local telemetry server used by the other outputs.
- Shared WordPress skills are copied into `skills/` so routing, Studio-backed workflows, auditing, theme, block, and plugin guidance stay aligned across agent surfaces.

## Setup

1. Install Devin Desktop / Windsurf and complete onboarding.
2. Optionally install the `windsurf` command in `PATH` during onboarding.
3. Build this repo with `pnpm build`.
4. Copy the servers from `plugins/windsurf/mcp_config.json` into `~/.codeium/windsurf/mcp_config.json`.
5. In Cascade MCP settings, confirm both servers are enabled:
   - `wordpress-studio`
   - `wordpress-telemetry`
6. Open this output folder or copy `.devin/rules/` into the workspace where Cascade should be WordPress.com-aware.
7. Ask Cascade for a WordPress.com site task and confirm it uses MCP tools before shell fallbacks.

## Included Cascade rules

- `.devin/rules/wordpress-com.md`: always-on WordPress.com routing and product guidance.
- `.devin/rules/wordpress-com-mcp.md`: model-decision MCP setup and troubleshooting guidance.

## Official references

- Rules and memories: https://docs.windsurf.com/windsurf/cascade/memories
- MCP configuration: https://docs.windsurf.com/windsurf/cascade/mcp
- AGENTS.md discovery: https://docs.devin.ai/desktop/cascade/agents-md
- Installation and onboarding: https://docs.windsurf.com/windsurf/getting-started

## Included shared skills

- `auditing`
- `block-creator`
- `design-previews-creator`
- `plugin-creator`
- `site-creator`
- `studio`
- `theme-creator`
- `wordpress-creator`
