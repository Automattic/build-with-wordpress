# WordPress.com Plugin

This Gemini plugin packages shared WordPress skills from the `build-with-wordpress` source repo as WordPress.com.

It is a Gemini CLI and Gemini Code Assist package built from the same shared skills as the Codex and Claude Code plugins.

- `GEMINI.md` provides project-level WordPress guidance for Gemini
- `.gemini/settings.json` configures the Studio and telemetry MCP servers for Gemini CLI
- WordPress request routing stays shared across surfaces
- Studio-backed site, theme, block, and plugin workflows stay shared
- frontend auditing stays shared across surfaces

It currently ships the same shared skills as the Codex plugin so these surfaces stay aligned while we iterate on any Gemini-specific additions later.

## Included skills

- `auditing`
- `block-creator`
- `design-previews-creator`
- `plugin-creator`
- `site-creator`
- `studio`
- `theme-creator`
- `wordpress-creator`
