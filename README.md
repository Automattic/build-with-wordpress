# Build with WordPress

Shared source for WordPress-focused agent skills and plugin packaging.

This repo currently packages shared skills and setup files for Codex, Claude Code, and Continue as separate outputs:

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
- includes Continue-native setup files for WordPress.com rules, prompts, and MCP configuration

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

### Test in Continue

1. Review the generated Continue output in `./plugins/continue`.
2. Confirm the generated setup files exist:
   - `plugins/continue/README.md`
   - `plugins/continue/config.yaml`
   - `plugins/continue/.continue/rules/wordpress-com.md`
   - `plugins/continue/.continue/prompts/create-wordpress-com-site.md`
   - `plugins/continue/.continue/prompts/audit-wordpress-com-project.md`
   - `plugins/continue/.continue/mcpServers/wordpress-com.yaml`
3. In Continue, copy the `.continue/` examples into a project or merge the `config.yaml` MCP snippet into `~/.continue/config.yaml`.
4. Use Continue Agent mode for WordPress.com MCP tool access.

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
- Continue setup output in `plugins/continue/`
- Bundled telemetry artifact in `dist/`
- `pnpm` scripts for build and verification

## Skill layout

- `skills/`
  Shared skills intended to stay portable across agent surfaces.

The build packages the shared skills into:

- `plugins/codex/plugins/wordpress-studio/skills/`
- `plugins/claude-code/skills/`

It also generates plugin-specific MCP configs for each surface:

- Codex: `plugins/codex/plugins/wordpress-studio/.mcp.json`
- Claude Code: `plugins/claude-code/.mcp.json`
- Continue: `plugins/continue/.continue/mcpServers/wordpress-com.yaml`

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

The Continue setup output is generated to:

```text
plugins/continue/
```

That folder currently contains:

- `README.md`
- `config.yaml`
- `.continue/rules/wordpress-com.md`
- `.continue/prompts/create-wordpress-com-site.md`
- `.continue/prompts/audit-wordpress-com-project.md`
- `.continue/mcpServers/wordpress-com.yaml`

The generated Continue MCP guidance uses the same existing `studio mcp` entrypoint as the shared WordPress.com MCP substrate. Continue-specific files cover rules, prompts, and MCP block placement; they do not define a separate backend service.
