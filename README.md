# Build with WordPress

Shared source for WordPress-focused agent skills and plugin packaging.

This repo currently just has a Codex plugin that:

- prefers the WordPress Studio MCP server for site management, screenshots, and block validation
- falls back to the Studio CLI through a shared Studio skill when MCP is unavailable
- uses `wp_cli` through the MCP server as the general-purpose WordPress escape hatch
- includes a top-level WordPress routing skill for choosing the right implementation path
- includes a custom plugin development skill for Studio-backed site functionality
- includes a custom block development skill for Gutenberg block plugins inside selected Studio sites
- keeps skills shared so other surfaces can reuse them later

## Current scope

- Shared skills for:
  - WordPress request routing
  - Studio workflows
  - block theme creation
  - site creation orchestration
  - plugin creation
  - Studio-backed custom block creation
- Generated Codex MCP config in the packaged plugin output
- Codex packaging output in `dist/codex/`
- `pnpm` scripts for build and verification

## Skill layout

- `skills/`
  Shared skills intended to stay portable across agent surfaces.

The build packages this folder into the Codex plugin under `dist/codex/skills/`.

## Commands

```bash
pnpm install
pnpm build
pnpm verify
```

## Output

The Codex plugin is generated to:

```text
dist/codex/
```

That folder contains:

- `.codex-plugin/plugin.json`
- `.mcp.json`
- `skills/`
- `README.md`
