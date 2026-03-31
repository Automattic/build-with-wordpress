# Build with WordPress Plugin

This Codex plugin packages shared WordPress skills from the `build-with-wordpress` source repo.

It is intentionally Studio-MCP-first:

- local site workflows use the WordPress Studio MCP server
- screenshots and block validation come from Studio MCP tools
- `wp_cli` is the flexible escape hatch for arbitrary WordPress operations
- `wordpress-creator` routes requests to the right WordPress implementation path
- custom WordPress plugins can be scaffolded inside a selected Studio site and reviewed there
- custom Gutenberg blocks can be scaffolded inside a selected Studio site and reviewed there

## Included skills

Shared:
- `wordpress-creator`
- `studio`
- `plugin-creator`
- `theme-creator`
- `site-creator`
- `block-creator`
