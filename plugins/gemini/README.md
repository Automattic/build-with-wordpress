# WordPress.com Plugin

This Gemini plugin packages shared WordPress skills from the `build-with-wordpress` source repo as WordPress.com.

It is a Gemini CLI and Gemini Code Assist package built from the same shared skills as the Codex, Claude Code, and Cursor plugins.

- `GEMINI.md` provides project-level WordPress guidance for Gemini
- `.gemini/settings.json` configures the Studio and telemetry MCP servers for Gemini CLI
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
