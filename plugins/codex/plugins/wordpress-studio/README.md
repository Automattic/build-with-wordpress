# WordPress Studio Plugin

This Codex plugin packages shared WordPress skills from the `build-with-wordpress` source repo as WordPress Studio.

It is intentionally Studio-MCP-first:

- local site workflows use the WordPress Studio MCP server
- screenshots and block validation come from Studio MCP tools
- `wp_cli` is the flexible escape hatch for arbitrary WordPress operations
- `wordpress-creator` routes requests to the right WordPress implementation path
- custom WordPress plugins can be scaffolded inside a selected Studio site and reviewed there
- custom Gutenberg blocks can be scaffolded inside a selected Studio site and reviewed there

It currently ships the same shared skills as the Codex plugin so both surfaces stay aligned while we iterate on any Claude-specific additions later.

## Included skills

- `block-creator`
- `design-previews-creator`
- `plugin-creator`
- `site-creator`
- `studio`
- `theme-creator`
- `wordpress-creator`
