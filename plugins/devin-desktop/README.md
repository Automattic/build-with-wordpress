# WordPress.com for Devin Desktop

This Devin Desktop output packages the shared WordPress agent substrate from the `build-with-wordpress` source repo for WordPress.com work.

## What is Devin Desktop-specific

- Devin rules live in `.devin/rules/*.md`.
- Devin skills live in `.devin/skills/<skill-name>/SKILL.md`.
- `mcp_config.json` is shaped for Cascade's MCP configuration file at `~/.codeium/windsurf/mcp_config.json`.
- The rules tell Cascade when to use WordPress.com MCP tools and how to route WordPress implementation work.
- Devin Desktop installation docs say you cannot install extensions through any marketplace, so this output uses native Devin rules, skills, and MCP configuration instead of a VSIX or marketplace package.

## Migration from Windsurf

Windsurf/Cascade is now part of the Devin Desktop lineage, so this generated package lives at `plugins/devin-desktop/`. Cascade's official MCP config path still uses `~/.codeium/windsurf/mcp_config.json`, so the setup instructions keep that destination path while the repository output uses the Devin Desktop name. Devin CLI also supports importing legacy Windsurf configuration, but this package emits Devin-native `.devin/` rules and skills.

## What is shared

- The WordPress.com MCP path uses the existing `wordpress-studio` MCP server; this output does not add a new backend service.
- Jetpack-connected site access stays part of the existing WordPress.com / Jetpack MCP flow.
- The bundled `wordpress-telemetry` MCP server is the same repo-local telemetry server used by the other outputs.
- Shared WordPress skills are copied into `.devin/skills/` so routing, Studio-backed workflows, auditing, theme, block, and plugin guidance stay aligned across agent surfaces through Devin's documented workspace skill path.

## Setup

1. Install Devin Desktop and complete onboarding.
2. Optionally install the `windsurf` command in `PATH` during onboarding.
3. Build this repo with `pnpm build`.
4. Copy the servers from `plugins/devin-desktop/mcp_config.json` into `~/.codeium/windsurf/mcp_config.json`.
5. In Cascade MCP settings, confirm both servers are enabled:
   - `wordpress-studio`
   - `wordpress-telemetry`
6. Open this output folder or copy `.devin/rules/` and `.devin/skills/` into the workspace where Devin should be WordPress.com-aware.
7. Ask Cascade for a WordPress.com site task and confirm it uses MCP tools before shell fallbacks.

## Included Devin rules

- `.devin/rules/wordpress-com.md`: always-on WordPress.com routing and product guidance.
- `.devin/rules/wordpress-com-mcp.md`: model-decision MCP setup and troubleshooting guidance.

## Included Devin skills

- `.devin/skills/auditing/SKILL.md`
- `.devin/skills/block-creator/SKILL.md`
- `.devin/skills/design-previews-creator/SKILL.md`
- `.devin/skills/plugin-creator/SKILL.md`
- `.devin/skills/site-creator/SKILL.md`
- `.devin/skills/studio/SKILL.md`
- `.devin/skills/theme-creator/SKILL.md`
- `.devin/skills/wordpress-creator/SKILL.md`

## Official references

- Devin rules: https://docs.devin.ai/cli/extensibility/rules.md
- Devin skills: https://docs.devin.ai/cli/extensibility/skills/overview.md
- Devin MCP configuration: https://docs.devin.ai/cli/extensibility/mcp/configuration.md
- Configuration import from legacy tools: https://docs.devin.ai/cli/reference/configuration/read-config-from.md
- AGENTS.md discovery: https://docs.devin.ai/desktop/cascade/agents-md
- Installation and onboarding: https://docs.windsurf.com/windsurf/getting-started
