# WordPress.com for OpenClaw

This OpenClaw output packages the shared Build with WordPress skills for OpenClaw and ClawHub.

## Official OpenClaw surface

- OpenClaw: https://openclaw.ai
- OpenClaw repository: https://github.com/openclaw/openclaw
- ClawHub: https://clawhub.ai
- ClawHub repository: https://github.com/openclaw/clawhub

ClawHub describes itself as OpenClaw's public skill registry and also exposes a native package catalog for code plugins and bundle plugins. This output therefore includes both:

- `skills/` for ClawHub-compatible skill publishing
- `package.json` with `openclaw.compat.pluginApi` and `openclaw.build.openclawVersion` metadata for native OpenClaw package publishing

## Included skills

- `auditing`
- `block-creator`
- `design-previews-creator`
- `plugin-creator`
- `site-creator`
- `studio`
- `theme-creator`
- `wordpress-creator`

## MCP setup

The generated `mcp.json` launches the existing WordPress Studio MCP server plus the bundled `wordpress-telemetry` MCP server. This package does not introduce a new WordPress backend service.

Use the normal Studio and WordPress.com connection flow to connect local sites, Jetpack-enabled sites, and WordPress.com-backed tooling.
