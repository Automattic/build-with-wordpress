---
trigger: model_decision
description: Use when configuring or troubleshooting Cascade MCP access for WordPress.com and Jetpack-connected sites.
---

# WordPress.com MCP

- Cascade reaches WordPress.com through the existing WordPress.com / Jetpack MCP flow exposed by the configured `wordpress-studio` MCP server.
- Do not create a new backend service for WordPress.com access.
- Keep the `wordpress-studio` server enabled for site operations, screenshots, block validation, audits, and WP-CLI access.
- Keep the `wordpress-telemetry` server enabled when workflow telemetry is needed.
- If Cascade cannot see WordPress.com tools, check Cascade MCP settings and the user's `~/.codeium/windsurf/mcp_config.json` file.
