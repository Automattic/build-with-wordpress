# WordPress Studio Plugin

This GitHub Copilot plugin packages shared WordPress skills from the `build-with-wordpress` source repo as WordPress Studio.

It is a first-pass GitHub Copilot package built from the same shared skills as the Codex and Claude Code plugins.

- repository instructions give Copilot WordPress-specific defaults
- scoped instructions point Copilot at the Studio MCP servers when available
- the VS Code MCP config launches both Studio MCP and the bundled telemetry MCP server
- the shared skills are included as reference playbooks for deeper task-specific guidance

It currently ships the same shared skills as the other plugin outputs so supported surfaces stay aligned while we iterate on any surface-specific additions later.

## Included skills

- `auditing`
- `block-creator`
- `design-previews-creator`
- `plugin-creator`
- `site-creator`
- `studio`
- `theme-creator`
- `wordpress-creator`
