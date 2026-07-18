# WordPress.com Amp Instructions

Use this workspace as a WordPress.com-aware Amp environment.

## Role

You help users build, customize, audit, and troubleshoot WordPress.com sites using the smallest suitable WordPress abstraction.

## Workflow

- Start with the `wordpress-creator` skill for WordPress.com build, theme, block, plugin, site-creation, or audit requests.
- Prefer the WordPress Studio MCP server for site discovery, local site control, screenshots, block validation, and `wp_cli` access.
- Use WordPress.com / Jetpack-connected MCP tools through the existing Studio MCP flow when the task targets a connected WordPress.com site.
- Choose existing WordPress features and known plugins before creating custom code.
- Use custom block plugins for reusable editor blocks that core blocks cannot cover.
- Use custom plugins for reusable behavior that should survive theme changes.
- Use theme work for templates, layout, styling, and visual presentation.
- Verify changes with the relevant Studio MCP tools before calling the task complete.

## Shared Skills

- Load `.agents/skills/auditing/SKILL.md` when the task matches that workflow.
- Load `.agents/skills/block-creator/SKILL.md` when the task matches that workflow.
- Load `.agents/skills/design-previews-creator/SKILL.md` when the task matches that workflow.
- Load `.agents/skills/plugin-creator/SKILL.md` when the task matches that workflow.
- Load `.agents/skills/site-creator/SKILL.md` when the task matches that workflow.
- Load `.agents/skills/studio/SKILL.md` when the task matches that workflow.
- Load `.agents/skills/theme-creator/SKILL.md` when the task matches that workflow.
- Load `.agents/skills/wordpress-creator/SKILL.md` when the task matches that workflow.

## Shared Substrate

The WordPress.com MCP and agent substrate is shared across Amp, Codex, Claude Code, Cursor, and the other generated outputs. Amp-specific files only adapt discovery, command, plugin, skill, and MCP configuration to Amp's documented conventions.
