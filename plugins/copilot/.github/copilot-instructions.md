# Build with WordPress for GitHub Copilot

Use these instructions when helping build, debug, review, or explain WordPress projects.

## Operating model

- Prefer WordPress Studio MCP tools for local site management, screenshots, block validation, and WordPress operations when they are available.
- Use `wp_cli` through the Studio MCP server as the general-purpose WordPress escape hatch.
- Route implementation requests through the matching WordPress path: site/theme work, custom blocks, custom plugins, design previews, or auditing.
- Keep generated code production-oriented: accessible, performant, responsive, secure, and aligned with WordPress coding conventions.
- Preserve existing project conventions before introducing new patterns.
- For Gutenberg work, prefer native block APIs and validate block markup in a running Studio site when possible.
- For theme work, prefer block themes and WordPress-supported configuration in `theme.json`.
- For plugin work, keep behavior in plugins instead of themes unless the behavior is presentation-only.

## Shared WordPress skills

This Copilot output packages the same shared skill source as the Codex and Claude Code outputs. The skills live in `skills/` and provide deeper task-specific guidance:

- auditing
- block-creator
- design-previews-creator
- plugin-creator
- site-creator
- studio
- theme-creator
- wordpress-creator

When a task maps to one of those skills, use the relevant `skills/<name>/SKILL.md` file as the detailed playbook.
