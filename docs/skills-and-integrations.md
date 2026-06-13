# Skills and integrations

Build with WordPress keeps portable WordPress agent behavior in `skills/` and packages that behavior into every generated output. Integrations are intentionally thin: generated files point agents at WordPress Studio MCP and the plugin-local telemetry MCP server rather than introducing a new WordPress runtime.

## Shared skill set

The current canonical skill directories are:

| Skill | Role |
| --- | --- |
| `wordpress-creator` | Top-level router for WordPress implementation and audit requests. It chooses the smallest fitting path: site, theme, block, plugin, or audit. |
| `studio` | Canonical Studio workflow: prefer MCP, fall back to the Studio CLI, resolve site paths, run block validation, use screenshots, and emit telemetry only at meaningful milestones. |
| `site-creator` | Site, homepage, landing page, and full-site build workflow. |
| `design-previews-creator` | Three-direction design preview workflow before building a site theme. |
| `theme-creator` | Theme templates, layout, styling, presentation, and visual redesign workflow. |
| `block-creator` | Custom Gutenberg block workflow when core or installed blocks are not enough. |
| `plugin-creator` | Reusable functionality, admin/settings UI, REST endpoints, scheduled tasks, integrations, or backend behavior that should survive theme changes. |
| `auditing` | Performance, accessibility, frontend QA, and optimization review workflow. |

Each skill uses the Agent Skills-style `SKILL.md` format with frontmatter. The `wordpress-agent-skills` context repository documents the same source-of-truth pattern: skills live under `skills/`, packaged copies are generated for tool-specific layouts, and install/build scripts replace target skill directories instead of relying on symlinks.

## Skill routing principles

`skills/wordpress-creator/SKILL.md` is the first skill for broad WordPress requests. It routes to specialist skills with these boundaries:

- use `site-creator` for a new site, homepage, landing page, or full site brief
- use `theme-creator` for templates, layout, styling, presentation, or visual redesign
- use `block-creator` for editor-insertable content blocks that cannot be achieved with core or already-installed custom blocks
- use `plugin-creator` for reusable backend or integration behavior that should survive theme changes and cannot be solved by an existing plugin
- use `auditing` for performance review, accessibility review, frontend QA, or optimization guidance

Specialist skills should reference `studio` for environment setup, MCP usage, block validation, screenshots, and iteration loops instead of duplicating that guidance.

## WordPress Studio integration

Build with WordPress expects WordPress Studio to own local WordPress site operations. Generated MCP configs launch:

```json
{
  "command": "studio",
  "args": ["mcp"]
}
```

The `studio` context repository shows the `studio mcp` command has two modes:

- in an interactive TTY, it prints installation instructions and example MCP server configuration
- in stdio mode, it starts the MCP server used by agents

Generated skills instruct agents to use Studio MCP for:

- site lifecycle and previews
- screenshots and design inspection
- block validation and repair (`validate_html_blocks`, `validate_and_fix_blocks`)
- performance/audit tools
- `wp_cli` as the general-purpose WordPress escape hatch

The skills also require fallback to the Studio CLI only when MCP is unavailable, failing, or explicitly required. Direct file edits remain appropriate for theme and plugin files.

## Telemetry MCP integration

The telemetry MCP server is local to this repository and is bundled from `scripts/wordpress-telemetry-mcp.mjs`. It registers one tool:

`record_workflow_event`

Input schema:

| Field | Type | Contract |
| --- | --- | --- |
| `workflow` | string | Non-empty workflow slug. It is sanitized to lowercase alphanumeric/hyphen tokens. |
| `stage` | enum | `started` or `completed`. |

Runtime behavior:

- server name: `wordpress-telemetry`
- server version: `0.1.0`
- telemetry group: `agent-build-plugin`
- `--surface <surface>` identifies the generated output surface
- events send a non-pageview pixel request to `https://pixel.wp.com/g.gif` with `x_agent-build-plugin=<surface>-<workflow>-<stage>`
- network errors and aborts are swallowed so telemetry never blocks the calling workflow
- `WP_SITE_CREATOR_NO_TELEMETRY=1` skips the pixel request and returns a skipped message
- shutdown handles `SIGINT` and `SIGTERM` by closing the MCP server

Skills should only call `record_workflow_event` for meaningful milestones, such as specialist workflow start and completion.

## Distribution and marketplace work

Open issues track distribution tasks for several generated outputs:

- #58: submit OpenClaw output to ClawHub
- #59: submit Hermes output through a Skills Hub or Hermes plugin path
- #60: submit the WordPress Studio MCP listing to the Windsurf/Cascade marketplace
- #61: list the Gemini output in the Gemini CLI extension gallery
- #62: publish shared Build with WordPress skills to Agent Skills directories

These issues are distribution work, not a change to the source-of-truth model. Until a task changes source behavior, the repository contract remains: edit `skills/` or generator scripts, run `pnpm build`, commit updated `plugins/`, and verify with `pnpm verify`.
