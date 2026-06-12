# WordPress.com for Continue

This output shows how to configure the Continue IDE assistant for WordPress.com work using Continue-native configuration files.

Continue does not install this repository as a plugin. Instead, copy the example files into your Continue workspace or user configuration:

- `.continue/rules/wordpress-com.md` contains WordPress.com instructions for Agent, Chat, and Edit modes
- `.continue/prompts/create-wordpress-com-site.md` adds a reusable slash-command prompt for new site work
- `.continue/prompts/audit-wordpress-com-project.md` adds a reusable slash-command prompt for review work
- `.continue/mcpServers/wordpress-com.yaml` shows the MCP server block Continue can load in Agent mode
- `config.yaml` shows the equivalent user-level `~/.continue/config.yaml` snippet

## Setup

1. Install Continue in VS Code or JetBrains.
2. Copy the example `.continue/` directory from this folder into the root of the project you want Continue to help with.
3. Open Continue's local config at `~/.continue/config.yaml` and merge in the relevant parts of `config.yaml` if you prefer user-level configuration.
4. Keep using the existing WordPress.com and Jetpack MCP flow. The example MCP block launches `studio mcp`, matching the shared WordPress.com MCP substrate used by the other outputs in this repository. If your environment exposes the WordPress.com or Jetpack MCP bridge through a different command, replace only the `command` and `args` values with that existing entrypoint.
5. Use Continue Agent mode when you need MCP tools; Continue exposes MCP tools to Agent mode.

## Continue-specific pieces

These files are specific to Continue:

- local rule files under `.continue/rules/`
- local prompt files under `.continue/prompts/` with `invokable: true`
- local MCP server blocks under `.continue/mcpServers/`
- optional user-level `~/.continue/config.yaml` snippets

## Shared WordPress.com substrate

The WordPress.com behavior remains shared across agent surfaces:

- WordPress.com and Jetpack access comes from the existing MCP flow, not a Continue-only backend
- site management, WordPress operations, and Jetpack-connected tools should use that MCP substrate when available
- implementation guidance stays aligned with the shared WordPress skills in this repository
- Continue contributes the IDE-specific packaging format around the same WordPress.com workflow

## Continue references

- Configuration: https://docs.continue.dev/customize/deep-dives/configuration
- Rules: https://docs.continue.dev/customize/deep-dives/rules
- Prompts: https://docs.continue.dev/customize/deep-dives/prompts
- MCP tools: https://docs.continue.dev/customize/deep-dives/mcp
