# Build with WordPress

Shared source for WordPress-focused agent skills and plugin packaging.

This repo currently packages shared skills for both Codex and Claude Code as separate plugin outputs:

- prefers the WordPress Studio MCP server for site management, screenshots, and block validation
- falls back to the Studio CLI through a shared Studio skill when MCP is unavailable
- uses `wp_cli` through the MCP server as the general-purpose WordPress escape hatch
- includes a top-level WordPress routing skill for choosing the right implementation path
- includes a custom block development skill for custom Gutenberg block plugins
- includes a custom plugin development skill for extending functionality outside what themes and blocks can offer
- includes an auditing skill for performance, accessibility, and frontend quality review
- can optionally generate three design preview directions before building a site theme
- injects plugin-specific MCP launch arguments so Studio can distinguish Codex and Claude plugin telemetry
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
4. Try representative tasks such as:
   - creating a new site
   - building or editing a theme
   - creating a custom block
   - creating a custom plugin
   - running an audit request
5. For workflow telemetry coverage, make sure Studio is launched through the generated Codex plugin so the MCP server starts with the Codex telemetry group.

### Test in Claude Code

1. From the repo root, launch Claude with:

```bash
claude --plugin-dir ./plugins/claude-code
```

2. Install or enable the `WordPress Studio` plugin in Claude Code.
3. Confirm the generated MCP config exists at `plugins/claude-code/.mcp.json`.
4. Try the same representative tasks:
   - creating a new site
   - building or editing a theme
   - creating a custom block
   - creating a custom plugin
   - running an audit request
5. For workflow telemetry coverage, make sure Studio is launched through this generated Claude plugin so the MCP server starts with the Claude telemetry group.

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
- Generated MCP config in the packaged plugin outputs
- Plugin-specific MCP launch arguments for Codex and Claude telemetry grouping
- Codex packaging output in `plugins/codex/`
- Claude Code packaging output in `plugins/claude-code/`
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

## Commands

```bash
pnpm install
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
- `plugins/wordpress-studio/skills/`
- `plugins/wordpress-studio/README.md`

The generated Codex MCP config launches Studio with the Codex plugin telemetry group.

The Claude Code plugin is generated to:

```text
plugins/claude-code/
```

That folder currently contains:

- `.claude-plugin/plugin.json`
- `.mcp.json`
- `skills/`
- `README.md`

The generated Claude Code MCP config launches Studio with the Claude plugin telemetry group.
