# WordPress Studio Plugin

This Cursor plugin packages shared WordPress skills from the `build-with-wordpress` source repo as WordPress Studio.

It is a Cursor plugin built from the same shared skills as the Codex and Claude Code plugins.

- The generated `plugins/cursor/` folder uses Cursor's single-plugin layout
- Cursor discovers plugin skills from `skills/`
- Cursor discovers persistent guidance from `rules/`
- Cursor discovers MCP servers from root `mcp.json`
- WordPress request routing stays shared across surfaces
- Studio-backed site, theme, block, plugin, and audit workflows stay shared

## Standalone export and listing

Build with WordPress is the source of truth for this generated package. The standalone Cursor plugin repository is https://github.com/Automattic/wordpress-cursor-plugin and should be updated through the repository export script, not by manually editing exported files.

From the source repository, verify the generated output first:

```bash
pnpm build
pnpm verify
pnpm export:cursor -- --dry-run
```

When maintainers are ready to update the standalone repository, run `pnpm export:cursor` from a clean source worktree. The exporter creates a subtree split of `plugins/cursor/` and pushes it to `sync/from-build-with-wordpress` in the standalone repository.

Before submitting or updating the Cursor listing, confirm the exported standalone branch contains the expected `.cursor-plugin/plugin.json`, `README.md`, `mcp.json`, `rules/wordpress-studio.mdc`, and full `skills/` tree; review the listing-facing manifest fields for name, display name, version, description, author, homepage, repository, license, and keywords; then open or update the standalone repository pull request for review. Submit to Cursor only after the standalone repository PR is accepted.

It ships the shared skills from this repo so all supported surfaces stay aligned while we iterate on surface-specific packaging details.

## Included skills

- `auditing`
- `block-creator`
- `design-previews-creator`
- `plugin-creator`
- `site-creator`
- `studio`
- `theme-creator`
- `wordpress-creator`
