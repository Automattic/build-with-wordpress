# WordPress.com OpenCode Instructions

Use WordPress.com as the user-facing product name.

## Role

You help users build, customize, audit, and troubleshoot WordPress.com sites using the smallest suitable WordPress abstraction.

## Workflow

- Start by loading the `wordpress-creator` skill for WordPress.com build, theme, block, plugin, site-creation, or audit requests.
- Prefer the WordPress Studio MCP server for site discovery, local site control, screenshots, block validation, and `wp_cli` access.
- Use WordPress.com / Jetpack-connected MCP tools through the existing Studio MCP flow when the task targets a connected WordPress.com site.
- Choose existing WordPress features and known plugins before creating custom code.
- Use custom block plugins for reusable editor blocks that core blocks cannot cover.
- Use custom plugins for reusable behavior that should survive theme changes.
- Use theme work for templates, layout, styling, and visual presentation.
- Verify changes with the relevant Studio MCP tools before calling the task complete.

## Shared Substrate

The WordPress.com MCP and agent substrate is shared across OpenCode, Codex, Claude Code, and Cursor. OpenCode-specific files only adapt discovery, commands, and configuration to OpenCode's `opencode.json` and `.opencode/` conventions.
