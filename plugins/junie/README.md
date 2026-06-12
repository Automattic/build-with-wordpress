# WordPress.com for Junie

This Junie output packages the shared WordPress skills from the `build-with-wordpress` source repo for WordPress.com work.

It is intentionally Junie-native:

- `.junie/AGENTS.md` provides project-level Junie guidelines.
- `.junie/skills/` contains the shared WordPress skills used by the other outputs.
- `.junie/mcp/mcp.json` connects Junie to the existing WordPress Studio MCP server and bundled `wordpress-telemetry` server.
- `scripts/wordpress-telemetry-mcp.mjs` contains the bundled telemetry MCP server artifact.

## Setup

1. Install Junie or use Junie from JetBrains AI Chat.
2. Install WordPress Studio and make sure the `studio` CLI is available on your `PATH`.
3. Open this folder as the project root, or copy `.junie/` and `scripts/` into your project.
4. Confirm Junie loads project guidelines from `.junie/AGENTS.md`.
5. Confirm the MCP servers are available in Junie MCP settings or with the Junie CLI `/mcp` command.

## MCP servers

`.junie/mcp/mcp.json` launches:

- `wordpress-studio`: runs `studio mcp` for WordPress site management, screenshots, block validation, performance tooling, and WP-CLI access.
- `wordpress-telemetry`: runs the bundled telemetry server artifact from this package.

This does not invent a Junie-only backend. Junie connects to the existing WordPress.com / Jetpack MCP flow through the same local Studio MCP entry point used by the other outputs.

## Official Junie references

- Getting started: https://www.jetbrains.com/help/junie/get-started-with-junie.html
- IDE plugin and AI Chat usage: https://www.jetbrains.com/help/junie/junie-ide-plugin.html
- Guidelines and memory: https://www.jetbrains.com/help/junie/guidelines-and-memory.html
- Agent skills: https://www.jetbrains.com/help/junie/agent-skills.html
- CLI MCP configuration: https://www.jetbrains.com/help/junie/junie-cli-mcp-configuration.html
- IDE MCP settings: https://www.jetbrains.com/help/junie/junie-plugin-mcp-settings.html

## What is Junie-specific

- Junie loads project guidelines from `.junie/AGENTS.md`, falling back to root `AGENTS.md` when needed.
- Junie loads project skills from `.junie/skills/<name>/SKILL.md`.
- Junie loads project MCP servers from `.junie/mcp/mcp.json`.

## What is shared

- The WordPress.com site-building workflows are the same shared skills used by Codex, Claude Code, Cursor, OpenCode, and other outputs.
- The Studio MCP server remains the shared substrate for local site management, screenshots, block validation, `wp_cli`, and WordPress.com / Jetpack-connected workflows.
- The telemetry MCP server is the same bundled server generated for the other outputs, with the surface set to `junie`.

## Included skills

- `auditing`
- `block-creator`
- `design-previews-creator`
- `plugin-creator`
- `site-creator`
- `studio`
- `theme-creator`
- `wordpress-creator`
