# WordPress.com OpenClaw Instructions

Use this package as the WordPress.com and WordPress Studio layer for OpenClaw.

## Shared substrate

- Use the WordPress Studio MCP server for local site management, screenshots, block validation, performance tooling, and WP-CLI access.
- Use the bundled `wordpress-telemetry` MCP server when workflow telemetry is available.
- Treat ClawHub as the distribution surface for this package's skills and native package metadata.
- Refer to the product as WordPress.com in user-facing text.

## Skills

- Load `skills/auditing/SKILL.md` when the task matches that workflow.
- Load `skills/block-creator/SKILL.md` when the task matches that workflow.
- Load `skills/design-previews-creator/SKILL.md` when the task matches that workflow.
- Load `skills/plugin-creator/SKILL.md` when the task matches that workflow.
- Load `skills/site-creator/SKILL.md` when the task matches that workflow.
- Load `skills/studio/SKILL.md` when the task matches that workflow.
- Load `skills/theme-creator/SKILL.md` when the task matches that workflow.
- Load `skills/wordpress-creator/SKILL.md` when the task matches that workflow.

Start with `skills/wordpress-creator/SKILL.md` for broad WordPress implementation requests so OpenClaw routes the task to the right site, theme, block, plugin, or audit workflow.
