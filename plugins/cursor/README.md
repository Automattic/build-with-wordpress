# WordPress Studio Plugin

This Cursor plugin packages shared WordPress skills from the `build-with-wordpress` source repo as WordPress Studio.

It is a Cursor plugin built from the same shared skills as the Codex and Claude Code plugins.

- The generated `plugins/cursor/` folder uses Cursor's single-plugin layout
- Cursor discovers plugin skills from `skills/`
- Cursor discovers persistent guidance from `rules/`
- Cursor discovers MCP servers from root `mcp.json`
- WordPress request routing stays shared across surfaces
- Studio-backed site, theme, block, plugin, and audit workflows stay shared

It ships the shared skills from this repo so all supported surfaces stay aligned while we iterate on surface-specific packaging details.

## Included skills

- `auditing`
- `block-creator`
- `design-previews-creator`
- `plugin-creator`
- `site-creator`
- `studio`
- `theme-creator`
- `wordpress-creator`
