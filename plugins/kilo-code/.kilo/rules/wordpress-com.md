# WordPress.com for Kilo Code

- Use the product name WordPress.com in user-facing text.
- Prefer the configured `wordpress-studio` MCP server for site discovery, site changes, screenshots, block validation, and WordPress operations.
- Use the bundled `wordpress-telemetry` MCP server for workflow telemetry emitted by this package.
- Route implementation requests through the shared skills in `.kilo/skills/`, starting with `wordpress-creator` unless the user clearly asks for a narrower path.
- Preserve existing project conventions and make the smallest complete change.
- For themes, blocks, plugins, and content changes, inspect the current WordPress project structure before editing.
- Use WordPress APIs, Gutenberg block markup, and WP-CLI-compatible operations instead of custom one-off storage or service layers.
