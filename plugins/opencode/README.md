# WordPress.com for OpenCode

This OpenCode output packages the shared WordPress skills from the `build-with-wordpress` source repo for WordPress.com work.

It is intentionally OpenCode-native:

- `opencode.json` points OpenCode at the WordPress.com instructions and MCP servers
- `.opencode/skills/` contains the shared WordPress skills used by the other outputs
- `.opencode/agents/wordpress-com.md` gives OpenCode a focused WordPress.com agent
- `.opencode/commands/wordpress.md` provides a quick command for WordPress.com build tasks
- `.opencode/plugins/README.md` documents why no local OpenCode plugin JavaScript is shipped yet

## Setup

1. Install OpenCode using the official OpenCode setup instructions.
2. Install WordPress Studio and make sure the `studio` CLI is available on your `PATH`.
3. Open this directory as the project root, or copy `opencode.json`, `AGENTS.md`, and `.opencode/` into your project.
4. Start OpenCode from the configured project root.
5. Confirm the MCP servers are available with `opencode mcp list`.

## MCP setup

The OpenCode config uses the existing WordPress.com / Jetpack MCP flow through WordPress Studio:

```json
{
  "mcp": {
    "wordpress-studio": {
      "type": "local",
      "command": ["studio", "mcp"],
      "enabled": true
    }
  }
}
```

Use the normal Studio and WordPress.com connection flow to connect local sites, Jetpack-enabled sites, and WordPress.com-backed tooling. This output does not introduce a new backend service or OpenCode-specific WordPress.com MCP server.

The generated config also starts the bundled `wordpress-telemetry` MCP server so workflow events stay aligned with the other agent surfaces.

## What is OpenCode-specific

- OpenCode config lives in `opencode.json` and uses OpenCode's `mcp` shape.
- OpenCode rules live in `AGENTS.md` and are included through the `instructions` config key.
- OpenCode discovers skills from `.opencode/skills/<name>/SKILL.md`.
- OpenCode discovers commands from `.opencode/commands/*.md`.
- OpenCode discovers local plugins from `.opencode/plugins/*.js` or `.opencode/plugins/*.ts`; this output only documents that directory because no OpenCode-only plugin hook is needed for the current WordPress.com integration.

## What is shared

- The WordPress.com site-building workflows are the same shared skills used by Codex, Claude Code, and Cursor.
- The Studio MCP server remains the shared substrate for local site management, screenshots, block validation, `wp_cli`, and WordPress.com / Jetpack-connected workflows.
- The telemetry MCP server is the same bundled server generated for the other outputs, with the surface set to `opencode`.

## Included skills

- `auditing`
- `block-creator`
- `design-previews-creator`
- `plugin-creator`
- `site-creator`
- `studio`
- `theme-creator`
- `wordpress-creator`
