# Build with WordPress

Shared source for WordPress-focused agent skills and plugin packaging.

This repo currently packages shared skills for Codex, Claude Code, and GitHub Copilot as separate plugin outputs:

- prefers the WordPress Studio MCP server for site management, screenshots, and block validation
- falls back to the Studio CLI through a shared Studio skill when MCP is unavailable
- uses `wp_cli` through the MCP server as the general-purpose WordPress escape hatch
- includes a top-level WordPress routing skill for choosing the right implementation path
- includes a custom block development skill for custom Gutenberg block plugins
- includes a custom plugin development skill for extending functionality outside what themes and blocks can offer
- includes an auditing skill for performance, accessibility, and frontend quality review
- can optionally generate three design preview directions before building a site theme
- bundles a plugin-local telemetry MCP server so workflow events do not depend on Studio shipping telemetry support
- keeps skills shared so other surfaces can reuse them later

## Testing

- Make sure you have WordPress Studio installed and the `studio` CLI is available
- Clone this repo
- Run:

```bash
pnpm install
pnpm build
pnpm verify
```

### Test in Codex

1. Open a new project in the Codex app using `./plugins/codex` as the project root.
2. Under Plugins, install `WordPress Studio`.
3. Confirm the generated MCP config exists at `plugins/codex/plugins/wordpress-studio/.mcp.json`.
4. Confirm the bundled telemetry server exists at `plugins/codex/plugins/wordpress-studio/scripts/wordpress-telemetry-mcp.mjs`.
5. Try representative tasks such as:
   - creating a new site
   - building or editing a theme
   - creating a custom block
   - creating a custom plugin
   - running an audit request
6. For workflow telemetry coverage, make sure the generated `wordpress-telemetry` MCP server starts alongside `wordpress-studio`.

### Test in Claude Code

1. From the repo root, launch Claude with:

```bash
claude --plugin-dir ./plugins/claude-code
```

2. Install or enable the `WordPress Studio` plugin in Claude Code.
3. Confirm the generated MCP config exists at `plugins/claude-code/.mcp.json`.
4. Confirm the bundled telemetry server exists at `plugins/claude-code/scripts/wordpress-telemetry-mcp.mjs`.
5. Try the same representative tasks:
   - creating a new site
   - building or editing a theme
   - creating a custom block
   - creating a custom plugin
   - running an audit request
6. For workflow telemetry coverage, make sure the generated `wordpress-telemetry` MCP server starts alongside `wordpress-studio`.

### Test in GitHub Copilot

1. Copy or open `./plugins/copilot` as the project root in VS Code.
2. Confirm the generated repository instructions exist at `plugins/copilot/.github/copilot-instructions.md`.
3. Confirm the scoped WordPress instructions exist at `plugins/copilot/.github/instructions/wordpress-studio.instructions.md`.
4. Confirm the generated VS Code MCP config exists at `plugins/copilot/.vscode/mcp.json`.
5. Start Copilot Chat in agent mode and try representative WordPress.com tasks:
   - creating a new site
   - building or editing a theme
   - creating a custom block
   - creating a custom plugin
   - running an audit request
6. For workflow telemetry coverage, make sure the generated `wordpress-telemetry` MCP server starts alongside `wordpress-studio`.

## Current scope

- Shared skills for:
  - WordPress request routing
  - Studio workflows
  - Performance, accessibility, and frontend auditing
  - Block theme creation
  - Site creation orchestration
  - Design preview generation and selection
  - Custom block creation
  - Plugin creation
- Generated MCP configs in the packaged plugin outputs
- A bundled standalone telemetry MCP server built from repo-local Node dependencies
- Codex packaging output in `plugins/codex/`
- Claude Code packaging output in `plugins/claude-code/`
- GitHub Copilot packaging output in `plugins/copilot/`
- Bundled telemetry artifact in `dist/`
- `pnpm` scripts for build and verification

## Skill layout

- `skills/`
  Shared skills intended to stay portable across agent surfaces.

The build packages the shared skills into:

- `plugins/codex/plugins/wordpress-studio/skills/`
- `plugins/claude-code/skills/`
- `plugins/copilot/skills/`

It also generates plugin-specific MCP configs for each surface:

- Codex: `plugins/codex/plugins/wordpress-studio/.mcp.json`
- Claude Code: `plugins/claude-code/.mcp.json`
- GitHub Copilot: `plugins/copilot/.vscode/mcp.json`

The telemetry server source lives in `scripts/wordpress-telemetry-mcp.mjs` and is bundled to:

- `dist/wordpress-telemetry-mcp.mjs`

## Commands

```bash
pnpm install
pnpm build:telemetry-mcp
pnpm build
pnpm verify
```

## Output

The Codex plugin repo is generated to:

```text
plugins/codex/
```

That folder contains:

- `.agents/plugins/marketplace.json`
- `plugins/wordpress-studio/.codex-plugin/plugin.json`
- `plugins/wordpress-studio/.mcp.json`
- `plugins/wordpress-studio/scripts/wordpress-telemetry-mcp.mjs`
- `plugins/wordpress-studio/skills/`
- `plugins/wordpress-studio/README.md`

The generated Codex MCP config launches both `studio mcp` and the bundled `wordpress-telemetry` MCP server.

The Claude Code plugin is generated to:

```text
plugins/claude-code/
```

That folder currently contains:

- `.claude-plugin/plugin.json`
- `.mcp.json`
- `scripts/wordpress-telemetry-mcp.mjs`
- `skills/`
- `README.md`

The generated Claude Code MCP config launches both `studio mcp` and the bundled `wordpress-telemetry` MCP server.

The GitHub Copilot plugin is generated to:

```text
plugins/copilot/
```

That folder currently contains:

- `.github/copilot-instructions.md`
- `.github/instructions/wordpress-studio.instructions.md`
- `.vscode/mcp.json`
- `scripts/wordpress-telemetry-mcp.mjs`
- `skills/`
- `README.md`

The generated Copilot MCP config launches both `studio mcp` and the bundled `wordpress-telemetry` MCP server through VS Code's MCP configuration.
