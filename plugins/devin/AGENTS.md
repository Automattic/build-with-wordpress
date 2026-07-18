# WordPress.com Devin Instructions

Use this output as a Devin CLI project configuration for WordPress.com work.

## Workflow

- Start with the `wordpress-creator` skill for WordPress.com build, theme, block, plugin, site-creation, or audit requests.
- Prefer the WordPress Studio MCP server for site discovery, local site control, screenshots, block validation, frontend audits, and `wp_cli` access.
- Use the bundled `wordpress-telemetry` MCP server for workflow telemetry when available.
- Choose the smallest fitting WordPress abstraction: site settings, content, theme, block, plugin, or audit.
- Keep WordPress.com as the user-facing product name.

## Devin-Specific Setup

- Devin CLI loads project rules from `AGENTS.md`.
- Devin CLI loads project skills from `.devin/skills/<name>/SKILL.md`.
- Devin CLI loads shared project MCP servers from `.devin/config.json`.
- This output uses Devin-native project configuration around the shared WordPress.com MCP and skill substrate; it does not introduce a Devin-specific backend service.
