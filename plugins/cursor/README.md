# WordPress Studio Plugin

This Cursor plugin packages shared WordPress skills from the `build-with-wordpress` source repo as WordPress Studio.

It is a Cursor-native plugin built from the same shared skills as the Codex and Claude Code plugins. It is not a VS Code extension, it is not installed from a `.vsix`, and it should not be packaged with VS Code Marketplace tooling.

- The generated `plugins/cursor/` folder uses Cursor's single-plugin layout
- Cursor discovers plugin skills from `skills/`
- Cursor discovers persistent guidance from `rules/`
- Cursor discovers MCP servers from root `mcp.json`
- WordPress request routing stays shared across surfaces
- Studio-backed site, theme, block, plugin, and audit workflows stay shared

## Local Cursor install and test flow

Build the generated package first:

```bash
pnpm build
```

Install it into Cursor's local native plugin directory:

```bash
mkdir -p ~/.cursor/plugins/local
rm -rf ~/.cursor/plugins/local/wordpress-studio
cp -R plugins/cursor ~/.cursor/plugins/local/wordpress-studio
```

For faster iteration from a source checkout, use a symlink instead of copying:

```bash
mkdir -p ~/.cursor/plugins/local
rm -rf ~/.cursor/plugins/local/wordpress-studio
ln -s "$PWD/plugins/cursor" ~/.cursor/plugins/local/wordpress-studio
```

Reload Cursor after installing or updating the local plugin. The local plugin root should contain these files:

- `.cursor-plugin/plugin.json`
- `README.md`
- `mcp.json`
- `rules/wordpress-studio.mdc`
- `skills/<skill>/SKILL.md` for each bundled skill

## MCP visibility checks

In Cursor's MCP or tools settings, confirm both plugin-provided servers are visible and enabled:

- `wordpress-studio`, which launches `studio mcp`
- `wordpress-telemetry`, which launches the bundled telemetry bootstrap from `mcp.json`

If the servers are missing, inspect `~/.cursor/plugins/local/wordpress-studio/mcp.json`, confirm `studio --version` works in a normal shell, then reload Cursor.

## Rules and skills visibility checks

Confirm Cursor loads the plugin guidance before doing Marketplace or standalone-repo work:

- The always-on rule from `rules/wordpress-studio.mdc` is available in Cursor's rules view or applies to WordPress requests.
- The bundled skills are visible from the local plugin, including `wordpress-creator`, `site-creator`, `theme-creator`, `block-creator`, `plugin-creator`, `design-previews-creator`, `auditing`, and `studio`.
- A WordPress site, theme, block, plugin, or audit request routes through the shared WordPress creator guidance and prefers Studio MCP tools before shell fallbacks.

## Standalone export and listing

Build with WordPress is the source of truth for this generated package. The standalone Cursor plugin repository is https://github.com/Automattic/wordpress-cursor-plugin and should be updated through the repository export script, not by manually editing exported files.

From the source repository, verify the generated output first:

```bash
pnpm build
pnpm verify
pnpm export:cursor -- --dry-run
```

When maintainers are ready to update the standalone repository, run `pnpm export:cursor` from a clean source worktree. The exporter creates a subtree split of `plugins/cursor/` and pushes it to `sync/from-build-with-wordpress` in the standalone repository. Do not manually edit generated Cursor output in the standalone repository; fix the generator or shared skills here, rebuild, verify, and export.

## Marketplace checklist

Before submitting or updating the Cursor listing:

- Confirm the exported standalone branch contains the expected `.cursor-plugin/plugin.json`, `README.md`, `mcp.json`, `rules/wordpress-studio.mdc`, and full `skills/` tree.
- Review the listing-facing manifest fields for name, display name, version, description, author, homepage, repository, license, keywords, rules, skills, and MCP server paths.
- Install the standalone branch locally at `~/.cursor/plugins/local/wordpress-studio` and repeat the MCP, rules, and skills visibility checks above.
- Open or update the standalone repository pull request from `sync/from-build-with-wordpress` into `main` and wait for review.
- Submit to Cursor Marketplace only after the standalone repository PR is accepted and the local native-plugin test flow passes.

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
