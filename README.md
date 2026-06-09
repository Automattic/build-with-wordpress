# Build with WordPress

Shared source for WordPress-focused agent skills and plugin packaging.

<<<<<<< HEAD
This repo currently packages shared skills for Codex, Claude Code, and Roo Code as separate plugin outputs:
=======
This repo currently packages shared skills for Codex, Claude Code, and Cursor as separate plugin outputs:
>>>>>>> origin/trunk

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
- adds Roo Code workspace rules and project MCP config without introducing a Roo-specific backend service

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

<<<<<<< HEAD
### Test in Roo Code

1. Install the Roo Code VS Code extension.
2. Open `./plugins/roo-code` as the VS Code workspace root, or copy that folder's contents into a target workspace root.
3. Confirm the generated workspace rules exist at `plugins/roo-code/.roo/rules/wordpress-com.md` and `plugins/roo-code/.roo/rules-code/wordpress-com-code.md`.
4. Confirm the generated project MCP config exists at `plugins/roo-code/.roo/mcp.json`.
5. In Roo Code, enable MCP servers and confirm `wordpress-studio` and `wordpress-telemetry` are available.
=======
### Test in Cursor

1. Open Cursor and install the plugin from the generated `./plugins/cursor` directory.
2. Confirm the generated Cursor manifest exists at `plugins/cursor/.cursor-plugin/plugin.json`.
3. Confirm the generated MCP config exists at `plugins/cursor/mcp.json`.
4. Confirm the generated rule exists at `plugins/cursor/rules/wordpress-studio.mdc`.
5. Confirm the bundled telemetry server exists at `plugins/cursor/scripts/wordpress-telemetry-mcp.mjs`.
>>>>>>> origin/trunk
6. Try the same representative tasks:
   - creating a new site
   - building or editing a theme
   - creating a custom block
   - creating a custom plugin
   - running an audit request
<<<<<<< HEAD
=======
7. For workflow telemetry coverage, make sure the generated `wordpress-telemetry` MCP server starts alongside `wordpress-studio`.
>>>>>>> origin/trunk

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
<<<<<<< HEAD
- Roo Code workspace output in `plugins/roo-code/`
=======
- Cursor packaging output in `plugins/cursor/`
>>>>>>> origin/trunk
- Bundled telemetry artifact in `dist/`
- `pnpm` scripts for build and verification

## Skill layout

- `skills/`
  Shared skills intended to stay portable across agent surfaces.

The build packages the shared skills into:

- `plugins/codex/plugins/wordpress-studio/skills/`
- `plugins/claude-code/skills/`
<<<<<<< HEAD
- `plugins/roo-code/skills/`
=======
- `plugins/cursor/skills/`
>>>>>>> origin/trunk

It also generates plugin-specific MCP configs for each surface:

- Codex: `plugins/codex/plugins/wordpress-studio/.mcp.json`
- Claude Code: `plugins/claude-code/.mcp.json`
<<<<<<< HEAD
- Roo Code: `plugins/roo-code/.roo/mcp.json`
=======
- Cursor: `plugins/cursor/mcp.json`
>>>>>>> origin/trunk

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

<<<<<<< HEAD
The Roo Code workspace output is generated to:

```text
plugins/roo-code/
=======
The Cursor plugin is generated to:

```text
plugins/cursor/
>>>>>>> origin/trunk
```

That folder currently contains:

<<<<<<< HEAD
- `.roo/mcp.json`
- `.roo/rules/wordpress-com.md`
- `.roo/rules-code/wordpress-com-code.md`
- `AGENTS.md`
=======
- `.cursor-plugin/plugin.json`
- `mcp.json`
- `rules/wordpress-studio.mdc`
>>>>>>> origin/trunk
- `scripts/wordpress-telemetry-mcp.mjs`
- `skills/`
- `README.md`

<<<<<<< HEAD
The generated Roo Code project MCP config launches both `studio mcp` and the bundled `wordpress-telemetry` MCP server. The `.roo/rules/` files are Roo-specific; the WordPress.com MCP and skill behavior is shared with the other outputs.
=======
The generated Cursor MCP config launches both `studio mcp` and the bundled `wordpress-telemetry` MCP server.
>>>>>>> origin/trunk
