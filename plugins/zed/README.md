# WordPress.com for Zed

This output packages the shared Build with WordPress skills for Zed Agent.

Zed-specific files in this folder are intentionally small:

- `AGENTS.md` provides project instructions that Zed Agent loads as always-on guidance.
- `.agents/skills/` contains project-local Zed skills copied from the shared Build with WordPress skill source.
- `.zed/settings.json` configures Zed's `context_servers` entries for the existing WordPress Studio MCP server and bundled `wordpress-telemetry` server.
- `scripts/wordpress-telemetry-mcp.mjs` is the same bundled telemetry MCP server artifact generated for the other outputs, with the surface set to `zed`.

The shared WordPress.com substrate is not Zed-specific: the skills, the `studio mcp` server, and the bundled telemetry MCP server are the same flow used by the other agent outputs. Zed supplies native project instructions, project-local skills, and settings JSON around that workflow.

## Setup

1. Install Zed.
2. Install WordPress Studio and make sure the `studio` CLI is available on your PATH.
3. Open this folder, or copy `AGENTS.md`, `.agents/`, `.zed/`, and `scripts/` into the root of the workspace where Zed should assist with WordPress.com work.
4. Trust the worktree in Zed so project-local skills are available.
5. Open the Agent Panel and confirm the `wordpress-studio` and `wordpress-telemetry` MCP servers are active.

## MCP servers

`.zed/settings.json` launches:

- `wordpress-studio`: runs `studio mcp` for WordPress site management, screenshots, block validation, performance tooling, and WP-CLI access.
- `wordpress-telemetry`: runs the bundled telemetry server artifact from this package.

This does not invent a Zed-only backend. Zed connects to the existing WordPress.com / Jetpack MCP flow through the same local Studio MCP entry point used by the other outputs.

## Zed documentation used for this output

- Instructions: https://zed.dev/docs/ai/instructions
- Skills: https://zed.dev/docs/ai/skills
- Agent settings: https://zed.dev/docs/ai/agent-settings
- Agent profiles: https://zed.dev/docs/ai/agent-profiles
- MCP support: https://zed.dev/docs/ai/mcp
- Extension packaging: https://zed.dev/docs/extensions/developing-extensions
- MCP server extensions: https://zed.dev/docs/extensions/mcp-extensions
- Agent server extensions: https://zed.dev/docs/extensions/agent-servers

## Packaging decision

Zed has a native package surface for project instructions, project-local skills, and MCP configuration, so this repository generates those files directly. It does not generate a Zed extension because Zed's extension packaging is for languages, debuggers, themes, snippets, and MCP servers. The current WordPress.com integration only needs to configure existing MCP server commands and ship instruction/skill files.

## Included skills

- `auditing`
- `block-creator`
- `design-previews-creator`
- `plugin-creator`
- `site-creator`
- `studio`
- `theme-creator`
- `wordpress-creator`
