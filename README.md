# Build with WordPress

Shared source for WordPress-focused agent skills and plugin packaging.

This scaffold now starts with a Codex plugin build that follows the Studio AI approach more closely:
- prefer the WordPress Studio MCP server for site management, screenshots, and block validation
- use `wp_cli` through the MCP server as the general-purpose WordPress escape hatch
- include a custom block development skill for Gutenberg block plugins inside selected Studio sites
- keep skills shared so other surfaces can reuse them later

## Current scope

- Shared skills for:
  - site specification
  - Studio MCP setup and verification
  - Studio MCP usage
  - block theme building
  - site building orchestration
  - Studio-backed custom block development
- Generated Codex MCP config in the packaged plugin output
- Codex packaging output in `dist/codex/`
- `pnpm` scripts for build and verification

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
