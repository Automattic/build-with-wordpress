# WordPress.com Roo Code Agent Rules

This output packages the shared Build with WordPress skills for Roo Code.

- Roo-specific files live in `.roo/`: workspace rules in `.roo/rules/` and MCP configuration in `.roo/mcp.json`.
- Shared WordPress.com behavior lives in `skills/` and the existing WordPress Studio MCP flow.
- Do not create a new WordPress backend service for Roo Code. Connect Roo to the existing `studio mcp` server and bundled `wordpress-telemetry` server.
- Use the exact product name WordPress.com in user-facing text.
