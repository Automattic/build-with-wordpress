# WordPress.com Plugin

This Codex plugin packages shared WordPress skills from the `build-with-wordpress` source repo as WordPress.com.

It is intentionally Studio-MCP-first:

- local site workflows use the WordPress Studio MCP server
- screenshots and block validation come from Studio MCP tools
- frontend audits can use Studio MCP performance tooling
- `wp_cli` is the flexible escape hatch for arbitrary WordPress operations
- `wordpress-creator` routes requests to the right WordPress implementation path
- custom WordPress plugins can be scaffolded inside a selected Studio site and reviewed there
- custom Gutenberg blocks can be scaffolded inside a selected Studio site and reviewed there

<<<<<<< HEAD
It currently ships the same shared skills as the other plugin outputs so supported surfaces stay aligned while we iterate on any surface-specific additions later.
=======
It ships the shared skills from this repo so all supported surfaces stay aligned while we iterate on surface-specific packaging details.
>>>>>>> origin/trunk

## Included skills

- `auditing`
- `block-creator`
- `design-previews-creator`
- `plugin-creator`
- `site-creator`
- `studio`
- `theme-creator`
- `wordpress-creator`
