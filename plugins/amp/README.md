# WordPress.com for Amp

This Amp output packages the shared WordPress skills from the `build-with-wordpress` source repo for WordPress.com work.

It is Amp-native according to the official Sourcegraph Amp Owner's Manual:

- `AGENTS.md` provides repository guidance.
- `.agents/skills/` contains the shared WordPress skills.
- `.amp/settings.json` configures the WordPress Studio and bundled telemetry MCP servers.
- `.amp/plugins/wordpress-studio.ts` adds an Amp command using the documented plugin API.

Official Amp docs used as source of truth:

- Owner's Manual: https://ampcode.com/manual
- AGENTS.md guidance: https://ampcode.com/manual#AGENTS.md
- Agent skills and MCP-in-skills: https://ampcode.com/manual#agent-skills
- MCP configuration: https://ampcode.com/manual#mcp
- Plugins and commands: https://ampcode.com/manual#plugins
- Plugin API reference: https://ampcode.com/manual/plugin-api

## Setup

1. Install Amp using the official Amp setup instructions.
2. Install WordPress Studio and make sure the `studio` CLI is available on your `PATH`.
3. Open this directory as the project root, or copy `AGENTS.md`, `.agents/`, and `.amp/` into your project.
4. Start Amp from the configured project root.
5. Approve the workspace MCP servers if Amp prompts for trust.
6. Confirm the MCP servers are available with `amp mcp doctor` or the Amp MCP UI.

## MCP setup

`.amp/settings.json` launches:

- `wordpress-studio`: runs `studio mcp` for WordPress site management, screenshots, block validation, performance tooling, and WP-CLI access.
- `wordpress-telemetry`: runs the bundled telemetry server artifact from this package.

This output does not introduce a new backend service. Amp connects to the existing WordPress.com / Jetpack MCP flow through the same local Studio MCP entry point used by the other outputs.

## Marketplace and extension conclusion

The official Amp manual documents project plugins in `.amp/plugins/*.ts`, user/system/global plugin locations, AGENTS.md files, skills, MCP configuration, and plugin-registered commands/tools. It does not document a marketplace-style plugin manifest for project packages. This output therefore ships plain repository files using Amp's documented project-local surfaces instead of inventing a marketplace manifest.

## Included skills

- `auditing`
- `block-creator`
- `design-previews-creator`
- `plugin-creator`
- `site-creator`
- `studio`
- `theme-creator`
- `wordpress-creator`
