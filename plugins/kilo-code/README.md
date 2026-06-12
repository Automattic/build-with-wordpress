# WordPress.com for Kilo Code

This Kilo Code output packages the shared WordPress skills from the `build-with-wordpress` source repo for WordPress.com work.

It is intentionally Kilo-native:

- `kilo.jsonc` configures project instructions and MCP servers using Kilo's current config shape.
- `.kilo/rules/wordpress-com.md` contains Kilo custom rules for the workspace.
- `.kilo/skills/` contains the shared Agent Skills used by the other outputs.
- `.kilo/agents/wordpress-com.md` defines a focused Kilo agent/mode for WordPress.com work.
- `.kilo/plugin/README.md` documents why no local Kilo plugin JavaScript is shipped yet.
- `AGENTS.md` provides portable project instructions that Kilo loads automatically.

## Setup

1. Install Kilo Code using the official installation docs.
2. Install WordPress Studio and make sure the `studio` CLI is available on your `PATH`.
3. Open this directory as the project root, or copy `kilo.jsonc`, `AGENTS.md`, and `.kilo/` into your project.
4. Start a new Kilo Code session from the configured project root so Kilo discovers the rules, skills, agent, and MCP servers.
5. Confirm the `wordpress-studio` and `wordpress-telemetry` MCP servers are available in Kilo's MCP settings.

## MCP setup

The Kilo config uses the existing WordPress.com / Jetpack MCP flow through WordPress Studio:

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

Use the normal Studio and WordPress.com connection flow to connect local sites, Jetpack-enabled sites, and WordPress.com-backed tooling. This output does not introduce a new backend service or Kilo-specific WordPress.com MCP server.

The generated config also starts the bundled `wordpress-telemetry` MCP server so workflow events stay aligned with the other agent surfaces.

## What is Kilo-specific

- Kilo project config lives in `kilo.jsonc` and uses Kilo's `mcp` shape.
- Kilo custom rules live in `.kilo/rules/*.md` and are referenced through the `instructions` config key.
- Kilo discovers skills from `.kilo/skills/<name>/SKILL.md`.
- Kilo discovers agents/modes from `.kilo/agents/*.md`.
- Kilo discovers local plugins from `.kilo/plugin/*.js` or `.kilo/plugin/*.ts`; this output only documents that directory because no Kilo-only plugin hook is needed for the current WordPress.com integration.
- Kilo also loads `AGENTS.md` automatically, which preserves compatibility with the shared agent instruction convention.

## Official Kilo references

- Installation and extension distribution: https://kilocode.ai/docs/getting-started/installing
- Custom rules: https://kilocode.ai/docs/customize/custom-rules
- Custom modes and agents: https://kilocode.ai/docs/customize/custom-modes
- Agent Skills: https://kilocode.ai/docs/customize/skills
- AGENTS.md support: https://kilocode.ai/docs/customize/agents-md
- MCP configuration: https://kilocode.ai/docs/automate/mcp/using-in-kilo-code
- Plugins and marketplace-style extension support: https://kilocode.ai/docs/automate/extending/plugins
- Kilo Marketplace repository: https://github.com/Kilo-Org/kilo-marketplace

## What is shared

- The WordPress.com site-building workflows are the same shared skills used by Codex, Claude Code, Cursor, Roo Code, and OpenCode.
- The Studio MCP server remains the shared substrate for local site management, screenshots, block validation, `wp_cli`, and WordPress.com / Jetpack-connected workflows.
- The telemetry MCP server is the same bundled server generated for the other outputs, with the surface set to `kilo-code`.

## Included skills

- `auditing`
- `block-creator`
- `design-previews-creator`
- `plugin-creator`
- `site-creator`
- `studio`
- `theme-creator`
- `wordpress-creator`
