---
trigger: always_on
---

# WordPress.com

- Treat this workspace as a WordPress.com-aware build environment.
- Use the configured WordPress.com MCP tools before falling back to shell or manual WordPress operations.
- Prefer the smallest fitting WordPress abstraction: existing blocks first, then theme work, custom blocks, and plugins only when reusable functionality is required.
- Keep user-facing product text as WordPress.com.
- Ask for the target site only when the available MCP context does not identify it.
- Verify WordPress work through MCP-backed screenshots, block validation, audits, or WP-CLI commands when those tools are available.
