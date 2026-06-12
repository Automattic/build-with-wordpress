# WordPress.com for Devin CLI

This Devin output packages the shared Build with WordPress skills for Devin CLI using Devin-native project configuration.

## Official Devin surfaces used

- Project rules: `AGENTS.md`
- Project config: `.devin/config.json`
- Project skills: `.devin/skills/<name>/SKILL.md`
- MCP servers: `mcpServers` in Devin config

Official references:

- Extensibility overview: https://docs.devin.ai/cli/extensibility/index.md
- Rules and AGENTS.md: https://docs.devin.ai/cli/extensibility/rules.md
- Skills overview: https://docs.devin.ai/cli/extensibility/skills/overview.md
- Skill format: https://docs.devin.ai/cli/extensibility/skills/creating-skills.md
- MCP configuration: https://docs.devin.ai/cli/extensibility/mcp/configuration.md
- Configuration files: https://docs.devin.ai/cli/extensibility/configuration.md

## Setup

1. Install Devin CLI using the official Devin CLI instructions.
2. Install WordPress Studio and make sure the `studio` CLI is available on your `PATH`.
3. Open this directory as the project root, or copy `AGENTS.md` and `.devin/` into the root of the project where Devin should assist with WordPress.com work.
4. Start Devin CLI from the configured project root.
5. Confirm the configured MCP servers are available in Devin CLI.

## MCP servers

`.devin/config.json` launches:

- `wordpress-studio`: runs `studio mcp` for WordPress site management, screenshots, block validation, performance tooling, and WP-CLI access.
- `wordpress-telemetry`: runs an embedded bootstrap generated from the shared telemetry server artifact.

This does not invent a Devin-only backend. Devin connects to the existing WordPress.com / Jetpack MCP flow through the same local Studio MCP entry point used by the other outputs.

## Included skills

- `auditing`
- `block-creator`
- `design-previews-creator`
- `plugin-creator`
- `site-creator`
- `studio`
- `theme-creator`
- `wordpress-creator`
