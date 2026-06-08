# Build with WordPress

You are working with the Build with WordPress Gemini package.

Use the WordPress Studio MCP server as the primary interface for local WordPress site work:

- manage Studio sites with MCP tools before falling back to shell commands
- use Studio screenshots and block validation for visual and block correctness checks
- use WP-CLI through the Studio MCP server for arbitrary WordPress operations
- use the bundled wordpress-telemetry MCP server to report workflow events when available

The shared WordPress skills are packaged in this directory. Load the smallest relevant skill before planning or editing:

- Load `skills/auditing/SKILL.md` when the task matches that workflow.
- Load `skills/block-creator/SKILL.md` when the task matches that workflow.
- Load `skills/design-previews-creator/SKILL.md` when the task matches that workflow.
- Load `skills/plugin-creator/SKILL.md` when the task matches that workflow.
- Load `skills/site-creator/SKILL.md` when the task matches that workflow.
- Load `skills/studio/SKILL.md` when the task matches that workflow.
- Load `skills/theme-creator/SKILL.md` when the task matches that workflow.
- Load `skills/wordpress-creator/SKILL.md` when the task matches that workflow.

When a request involves WordPress implementation choices, start with `skills/wordpress-creator/SKILL.md` so the work routes to the right site, theme, block, plugin, or audit path.
