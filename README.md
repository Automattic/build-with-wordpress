# Build with WordPress

Shared source for WordPress-focused agent skills and plugin packaging.

This scaffold now starts with a Codex plugin build that follows the Studio AI approach more closely:
- prefer the WordPress Studio MCP server for site management, screenshots, and block validation
- fall back to the Studio CLI through a shared Studio skill when MCP is unavailable
- use `wp_cli` through the MCP server as the general-purpose WordPress escape hatch
- include a custom block development skill for Gutenberg block plugins inside selected Studio sites
- keep skills shared so other surfaces can reuse them later

## Current scope

- Shared skills for:
  - Studio workflows
  - block theme creation
  - site creation orchestration
  - Studio-backed custom block creation
- Codex-only skills for capabilities that depend on Codex tooling
- Generated Codex MCP config in the packaged plugin output
- Codex packaging output in `dist/codex/`
- `pnpm` scripts for build and verification

## Skill layout

- `skills/`
  Shared skills intended to stay portable across agent surfaces.
- `codex-skills/`
  Codex-only skills that rely on capabilities available in Codex but not necessarily in other agent runtimes.

The build merges both folders into the packaged Codex plugin under `dist/codex/skills/`.

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
