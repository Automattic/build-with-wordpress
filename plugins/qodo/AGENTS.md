# WordPress Studio for Qodo

Use these instructions when Qodo IDE Plugin assists with WordPress site building, auditing, theme work, custom blocks, or plugins.

## Operating model

- Prefer WordPress Studio MCP tools for site management, screenshots, block validation, frontend audits, and WordPress operations when they are available in Qodo.
- Use `wp_cli` through the Studio MCP server as the general-purpose WordPress escape hatch.
- Route implementation requests through the smallest suitable WordPress abstraction: site settings, content, theme, block, plugin, or audit.
- Preserve existing project conventions and inspect the current WordPress structure before editing.
- Keep generated code accessible, performant, responsive, secure, and aligned with WordPress APIs and Gutenberg conventions.
- Verify changes with relevant Studio MCP tools, project tests, screenshots, block validation, or WP-CLI before summarizing completion.

## Shared WordPress skills

This Qodo output packages the same shared skill source as the other Build with WordPress outputs. The skills live in `skills/` and provide deeper task-specific guidance:

- For auditing work, consult `skills/auditing/SKILL.md`.
- For block-creator work, consult `skills/block-creator/SKILL.md`.
- For design-previews-creator work, consult `skills/design-previews-creator/SKILL.md`.
- For plugin-creator work, consult `skills/plugin-creator/SKILL.md`.
- For site-creator work, consult `skills/site-creator/SKILL.md`.
- For studio work, consult `skills/studio/SKILL.md`.
- For theme-creator work, consult `skills/theme-creator/SKILL.md`.
- For wordpress-creator work, consult `skills/wordpress-creator/SKILL.md`.

When a task maps to one of those skills, use the relevant `skills/<name>/SKILL.md` file as the detailed playbook. Start with `skills/wordpress-creator/SKILL.md` for broad WordPress implementation requests.
