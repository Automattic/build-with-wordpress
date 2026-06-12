# Skills and integrations

The shared skills in `skills/` are the repository's portable WordPress workflow contract. The generator packages them into each agent surface while preserving the same routing, Studio MCP preference, WordPress implementation guardrails, and telemetry milestones.

## Skill file contract

Each skill is a directory containing `SKILL.md`. The file starts with frontmatter:

```yaml
---
name: wordpress-creator
description: Route WordPress build and audit requests to the right implementation path for a Studio-backed site.
---
```

The body uses a consistent structure:

- purpose statement;
- ownership boundaries;
- workflow steps;
- guardrails, principles, or important notes;
- handoffs to other skills where another skill owns the details.

Generated packages may copy the skill directories unchanged or place them under a surface-native skill path such as `.agents/skills/`, `.cline/skills/`, `.opencode/skills/`, `.devin/skills/`, or `.junie/skills/`.

## Skill inventory

| Skill | Purpose | Key responsibilities | Evidence |
| --- | --- | --- | --- |
| `wordpress-creator` | Top-level router for WordPress build and audit requests when the right implementation path is not clear. | Pick the smallest fitting abstraction and hand off to a specialist skill. | `skills/wordpress-creator/SKILL.md` |
| `studio` | Canonical WordPress Studio operations skill. | Prefer MCP, fall back to Studio CLI, resolve site paths, use `wp_cli`, run block validation, and control workflow telemetry guidance. | `skills/studio/SKILL.md` |
| `site-creator` | Create a WordPress site from a prompt, brief, or rough idea. | Build the brief, decide whether to create/use a site, configure WordPress, and validate visible changes. | `skills/site-creator/SKILL.md` |
| `design-previews-creator` | Generate three parallel design preview options before theme implementation. | Plan distinct directions, generate previews in parallel, present options, and hand off selected direction. | `skills/design-previews-creator/SKILL.md` |
| `theme-creator` | Create a modern WordPress block theme or substantial visual overhaul. | Own block theme files, design approach, layout rules, activation, and block validation. | `skills/theme-creator/SKILL.md` |
| `block-creator` | Create, edit, build, and review a custom Gutenberg block plugin. | Decide static/dynamic blocks, scaffold plugin files, maintain block metadata, activate/insert/test block, and recover from build errors. | `skills/block-creator/SKILL.md` |
| `plugin-creator` | Create or update reusable WordPress plugin functionality. | Own hooks, REST endpoints, scheduled tasks, settings/admin UI, integrations, activation, and verification. | `skills/plugin-creator/SKILL.md` |
| `auditing` | Audit a Studio-backed WordPress site. | Scope performance, accessibility, and visible frontend quality checks; report and retest findings. | `skills/auditing/SKILL.md` |

## Routing model

Use `wordpress-creator` first when a request says “build a WordPress thing” but does not yet identify the correct implementation path. It routes to:

- `site-creator` for new site creation from a prompt or brief;
- `design-previews-creator` when visual options are needed before implementation;
- `theme-creator` for block themes and substantial visual changes;
- `block-creator` for custom Gutenberg blocks;
- `plugin-creator` for reusable backend behavior, admin/settings UI, hooks, REST endpoints, scheduled tasks, integrations, or server-side logic;
- `auditing` for performance, accessibility, and frontend QA.

Specialist skills should not duplicate Studio operations. They reference `studio` for site selection, MCP preference, `wp_cli`, block validation, screenshots, review, and CLI fallback behavior.

## WordPress Studio integration

The `studio` skill is the integration boundary with WordPress Studio. It defines this behavior:

1. Verify Studio availability with `studio site list`.
2. Prefer MCP tools through the generated plugin-local MCP config.
3. Use lightweight MCP calls such as `site_list` or `site_info` to confirm connectivity when needed.
4. Treat the selected Studio site path as the root for generated WordPress artifacts.
5. Ensure the site is running before using `wp_cli`, block validation, or audit tools.
6. Use `wp_cli` through Studio MCP for arbitrary WordPress operations instead of dropping directly to shell commands.
7. Fall back to the smallest useful `studio` CLI command when MCP is unavailable or not the right tool.
8. Quote and escape user-provided shell arguments when using CLI fallback.
9. Run `validate_html_blocks` and `validate_and_fix_blocks` after writes that contain serialized block markup.

The read-only `studio` context confirms that Studio owns the CLI/MCP surface; this repository packages agent instructions and MCP snippets that call into that existing runtime.

## Skill packaging integration

The read-only `wordpress-agent-skills` context documents a portable skill packaging model. Build with WordPress follows that model by keeping canonical workflow source in `skills/*/SKILL.md` and letting `scripts/build-plugins.mjs` place those skills into each agent's expected directory and manifest format.

When adding a new skill:

1. Add `skills/<name>/SKILL.md` with frontmatter `name` and `description`.
2. Define ownership boundaries and handoffs so other skills do not duplicate it.
3. Update `wordpress-creator` routing if the skill becomes a top-level implementation path.
4. Run `pnpm build` so every generated output receives the new skill where appropriate.
5. Run `pnpm verify` and inspect generated diffs.

## Agent surface integration patterns

Build with WordPress supports several integration patterns:

| Pattern | Examples | How to maintain it |
| --- | --- | --- |
| Native skill directories | Amp, Cline, Devin, Junie, OpenCode, Kilo Code, Pi, Qodo, Zed | Copy shared `skills/` into the surface-native path and list them in README/instructions. |
| Repository instruction files | `AGENTS.md`, `GEMINI.md`, Copilot instructions, Cline/Roo rules, Aider conventions | Keep cross-surface behavior short and route to shared skills. |
| MCP config files | Claude Code `.mcp.json`, VS Code `.vscode/mcp.json`, Roo `.roo/mcp.json`, Amp settings, Zed settings | Preserve `wordpress-studio` and `wordpress-telemetry` logical servers with surface-native syntax. |
| Commands, prompts, agents, hooks | Amp plugin command, OpenCode commands/agents, Continue prompts/rules, Factory commands/Droids/hooks | Use native extension points for convenience while keeping durable WordPress workflow in shared skills. |
| Compatibility documentation only | Pi, Qodo, Conductor, Aider/Cline/OpenCode plugin-readme notes | Document the supported path when the surface lacks an official repository-local plugin or MCP mechanism. |

## Public tool and event names

These names are part of the agent-facing contract and appear in skills or generated configs:

- MCP servers: `wordpress-studio`, `wordpress-telemetry`.
- Studio MCP tools referenced by skills: `site_list`, `site_info`, `wp_cli`, `validate_html_blocks`, `validate_and_fix_blocks`.
- Telemetry tool: `record_workflow_event`.
- Telemetry workflows: `theme-build`, `block-build`, `plugin-build`.
- Telemetry stages used by skills: `started`, `completed`.

## Examples

### Route a broad WordPress request

```text
User: Build a landing page for a bakery.
Agent: Load wordpress-creator. If the task is a new site, hand off to site-creator; if the site exists and needs a visual overhaul, hand off to theme-creator. Use studio for site selection and validation.
```

### Implement reusable behavior

```text
User: Add a weekly digest email with an admin settings page.
Agent: Load wordpress-creator, route to plugin-creator because the work needs reusable server-side behavior, scheduled tasks, and settings UI. Use studio for activation and wp_cli verification.
```

### Validate block markup

```text
Agent writes a block theme template or uses wp_cli to update page content containing serialized blocks.
Agent must run Studio block validation through validate_html_blocks when core/html may be present, then validate_and_fix_blocks, and repair invalid markup before finishing.
```
