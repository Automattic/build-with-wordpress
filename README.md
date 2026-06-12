# Build with WordPress

Canonical source for WordPress-focused agent skills, MCP setup, and generated packages across coding-agent surfaces.

Build with WordPress lets coding agents create, edit, inspect, and validate WordPress.com and WordPress Studio projects using the same shared guidance. The repository owns the portable skill source plus the generator that adapts those skills into each agent's native packaging, configuration, or workspace convention.

Generated outputs are available for:

- Aider
- Amp
- Claude Code
- Cline
- Codex
- Conductor
- Continue
- Cursor
- Devin CLI
- Factory Droid
- Gemini
- GitHub Copilot
- Junie
- Kilo Code
- OpenCode
- Pi
- Qodo
- Roo Code
- Windsurf/Cascade
- Zed

The shared WordPress workflow:

- prefers the WordPress Studio MCP server for site management, screenshots, and block validation
- falls back to the Studio CLI through a shared Studio skill when MCP is unavailable
- uses `wp_cli` through the MCP server as the general-purpose WordPress escape hatch
- routes requests to the right implementation path for site work, block themes, custom blocks, custom plugins, and audits
- can generate three design preview directions before building a site theme
- bundles a plugin-local telemetry MCP server so workflow events do not depend on Studio shipping telemetry support

## Commands

```bash
pnpm install
pnpm build
pnpm verify
```

Use `pnpm build:telemetry-mcp` when you only need to rebuild `dist/wordpress-telemetry-mcp.mjs`.

## What Gets Generated

Each build packages the shared `skills/` directory and the bundled telemetry MCP server into the surfaces that can consume them. Outputs use the native extension point for each agent instead of forcing one universal plugin shape.

| Surface | Output | Native files |
| --- | --- | --- |
| Aider | `plugins/aider/` | `.aider.conf.yml`, `CONVENTIONS.md`, `skills/` |
| Amp | `plugins/amp/` | `AGENTS.md`, `.agents/skills/`, `.amp/settings.json`, `.amp/plugins/wordpress-studio.ts` |
| Claude Code | `plugins/claude-code/` | `.claude-plugin/plugin.json`, `.mcp.json`, `skills/` |
| Cline | `plugins/cline/` | `.clinerules/`, `.cline/skills/`, `mcp.json` |
| Codex | `plugins/codex/` | Codex marketplace metadata, plugin manifest, `.mcp.json`, `skills/` |
| Conductor | `plugins/conductor/` | `.conductor/settings.toml` and Conductor-specific setup notes |
| Continue | `plugins/continue/` | `config.yaml`, `.continue/rules/`, prompts, MCP server YAML |
| Cursor | `plugins/cursor/` | Cursor plugin output exported to `Automattic/wordpress-cursor-plugin` |
| Devin CLI | `plugins/devin/` | `AGENTS.md`, `.devin/config.json`, `.devin/skills/` |
| Factory Droid | `plugins/factory/` | Factory marketplace, plugin, command, Droid, hooks, MCP config, skills |
| Gemini | `plugins/gemini/` | `GEMINI.md`, `.gemini/settings.json`, `skills/` |
| GitHub Copilot | `plugins/copilot/` | `.github/copilot-instructions.md`, scoped instructions, `.vscode/mcp.json` |
| Junie | `plugins/junie/` | `.junie/AGENTS.md`, `.junie/skills/`, `.junie/mcp/mcp.json` |
| Kilo Code | `plugins/kilo-code/` | `kilo.jsonc`, `AGENTS.md`, `.kilo/agents/`, `.kilo/rules/`, `.kilo/skills/` |
| OpenCode | `plugins/opencode/` | `AGENTS.md`, `.opencode/`, commands, agents, skills, MCP config |
| Pi | `plugins/pi/` | `package.json` with `pi-package` metadata and `skills/` |
| Qodo | `plugins/qodo/` | `AGENTS.md`, `skills/`, MCP setup documented for Qodo Agentic Tools |
| Roo Code | `plugins/roo-code/` | `.roo/mcp.json`, `.roo/rules/`, `.roo/rules-code/`, `skills/` |
| Windsurf/Cascade | `plugins/windsurf/` | `.devin/rules/`, `mcp_config.json`, `skills/` |
| Zed | `plugins/zed/` | `AGENTS.md`, `.agents/skills/`, `.zed/settings.json` |

Some outputs intentionally stop at workspace files or setup guidance because that is what the official agent surface supports today. For example, Pi does not expose built-in MCP configuration, Qodo documents MCP through Agentic Tools or enterprise allow-lists, and Conductor keeps MCP setup in app/provider settings rather than a repository-local MCP file.

## Testing

Run the full verification before opening a PR:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm verify
```

For manual smoke tests, open or copy the relevant folder from `plugins/` into that agent's expected project root, confirm `wordpress-studio` and `wordpress-telemetry` are available where the surface supports MCP, then try representative WordPress tasks:

- create a new site
- build or edit a theme
- create a custom block
- create a custom plugin
- run a performance, accessibility, or frontend audit

## Cursor Publishing

Cursor requires a standalone plugin repository. This repo remains the source of truth; the publishable Cursor repository lives at:

https://github.com/Automattic/wordpress-cursor-plugin

Update `skills/` and the Cursor generator here, then export `plugins/cursor/`:

```bash
pnpm build
pnpm verify
pnpm export:cursor
```

The export command runs `git subtree split --prefix=plugins/cursor` and pushes the result to `Automattic/wordpress-cursor-plugin` on `sync/from-build-with-wordpress`. Open or update a PR from that branch into the standalone repo's `main` branch, then submit the standalone repo to Cursor.

For a dry run:

```bash
pnpm export:cursor -- --dry-run
```
