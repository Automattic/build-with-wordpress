# Build with WordPress

Shared source for WordPress-focused agent skills and plugin packaging.

This repo currently just has a Codex plugin that:

- prefers the WordPress Studio MCP server for site management, screenshots, and block validation
- falls back to the Studio CLI through a shared Studio skill when MCP is unavailable
- uses `wp_cli` through the MCP server as the general-purpose WordPress escape hatch
- includes a top-level WordPress routing skill for choosing the right implementation path
- includes a custom block development skill for custom Gutenberg block plugins
- includes a custom plugin development skill for extending functionality outside what themes and blocks can offer
- keeps skills shared so other surfaces can reuse them later

## Testing

- Make sure you have WordPress Studio installed
- Clone this repo
- Open a new project in Codex app with the repo folder you just created and under Plugins you should see a `Build with WordPress` option. Install this plugin
- If you are using the Claude CLI run it in the repo folder and then under `/plugins` you should see the `Build with WordPress` option. Select it and install
- Try a range of WordPress tasks from creating a new site, building/editing a theme, creating a custom block, installing a plugin, creating a new plugin

## Current scope

- Shared skills for:
  - WordPress request routing
  - Studio workflows
  - Block theme creation
  - Site creation orchestration
  - Custom block creation
  - Plugin creation
- Generated Codex MCP config in the packaged plugin output
- Codex packaging output in `plugins/build-with-wordpress/`
- `pnpm` scripts for build and verification

## Skill layout

- `skills/`
  Shared skills intended to stay portable across agent surfaces.

The build packages the shared skills into the Codex plugin under `plugins/build-with-wordpress/skills/`.

## Commands

```bash
pnpm install
pnpm build
pnpm verify
```

## Output

The Codex plugin is generated to:

```text
plugins/build-with-wordpress/
```

That folder contains:

- `.codex-plugin/plugin.json`
- `.mcp.json`
- `skills/`
- `README.md`
