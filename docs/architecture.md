# Build with WordPress architecture

Build with WordPress is the canonical source for WordPress-focused coding-agent skills, MCP setup, and generated packages. It keeps one shared WordPress workflow in `skills/` and adapts that workflow into the native conventions of each supported agent under `plugins/`.

## Repository inventory

| Area | Responsibility | Source evidence |
| --- | --- | --- |
| `skills/` | Portable agent skills for WordPress.com and WordPress Studio work. Each skill is a `SKILL.md` file with frontmatter `name` and `description`, ownership rules, workflow steps, and guardrails. | `skills/*/SKILL.md` |
| `scripts/build-plugins.mjs` | Main generator. It reads shared skills, builds surface-specific manifests, MCP configs, instructions, commands, hooks, README files, and copied skill directories. | `scripts/build-plugins.mjs` |
| `scripts/wordpress-telemetry-mcp.mjs` | Source for the bundled `wordpress-telemetry` MCP server used by generated outputs to record workflow milestones. | `scripts/wordpress-telemetry-mcp.mjs` |
| `scripts/build-telemetry-mcp.mjs` | Bundles the telemetry MCP source with `esbuild` into `dist/wordpress-telemetry-mcp.mjs` before plugin generation. | `package.json`, `scripts/build-telemetry-mcp.mjs` |
| `scripts/verify-plugins.mjs` | Verification contract for generated plugin files. Run after generation and before pull requests. | `package.json`, `scripts/verify-plugins.mjs` |
| `scripts/export-cursor-plugin.mjs` | Exports `plugins/cursor/` into the standalone Cursor plugin repository branch. | `README.md`, `scripts/export-cursor-plugin.mjs` |
| `plugins/` | Generated agent-facing packages. These files are outputs, but are committed and verified so users can consume them directly. | `plugins/*` |
| `.github/workflows/` | Automation for docs and skill maintenance lanes. | `.github/workflows/developer-docs-agent.yml`, `.github/workflows/skills-agent.yml` |

## Product boundaries

Build with WordPress owns the agent-facing layer around WordPress Studio:

- shared instructions and task-routing skills;
- generated packaging for coding-agent surfaces;
- MCP configuration snippets that launch `studio mcp` where a surface supports MCP;
- a plugin-local `wordpress-telemetry` MCP server for workflow event reporting;
- verification and export scripts that keep generated artifacts aligned.

WordPress Studio owns the local WordPress runtime, the `studio` CLI, and the `studio mcp` server. Generated agent outputs should use the existing Studio MCP server for site management, screenshots, block validation, audits, and `wp_cli` access rather than inventing a surface-specific WordPress backend.

## Runtime and generation flow

```text
skills/*/SKILL.md
        │
        ├── copied or adapted into plugins/<surface>/...
        │
        ├── listed in surface README/instruction files
        │
        └── routed by wordpress-creator, site/theme/block/plugin/audit skills

scripts/wordpress-telemetry-mcp.mjs
        │
        └── pnpm build:telemetry-mcp → dist/wordpress-telemetry-mcp.mjs

scripts/build-plugins.mjs
        │
        ├── reads shared skills and telemetry dist
        ├── emits native manifests, MCP configs, commands, rules, and README files
        └── writes committed outputs under plugins/*

pnpm verify
        │
        └── checks generated outputs after pnpm build
```

The build command in `package.json` runs telemetry bundling first and plugin generation second:

```bash
pnpm build
# node scripts/build-telemetry-mcp.mjs && node scripts/build-plugins.mjs
```

## Main generator structure

`scripts/build-plugins.mjs` is intentionally a single generator script with surface-specific helper functions. Important helper groups include:

- **Shared MCP config helpers:** `createMcpConfig`, `createVsCodeMcpConfig`, `createZedMcpConfig`, and `createOpenCodeMcpConfig` emit the correct shape for the target surface while preserving the same two logical servers: `wordpress-studio` and `wordpress-telemetry`.
- **Telemetry bootstrap:** `createTelemetryBootstrapArgs` compresses the telemetry server source and builds an inline Node bootstrap argument list for surfaces that need self-contained MCP command args.
- **Surface README and instruction builders:** functions such as `buildReadme`, `buildAmpReadme`, `buildContinueReadme`, `buildOpenCodeReadme`, `buildRooReadme`, `buildClineReadme`, and `buildAiderReadme` document each generated package.
- **Surface-specific native files:** helpers such as `buildAmpPlugin`, `buildFactoryCommand`, `buildFactoryDroid`, `buildFactoryHooksJson`, `buildOpenCodeAgent`, `buildOpenCodeCommand`, `buildKiloConfig`, and `buildCopilotInstructions` encode the supported native extension point for each agent.
- **Build orchestration:** `getSharedSkillNames`, `copySkillSet`, `buildPluginTarget`, `buildContinueOutput`, `buildConductorOutput`, and `main` coordinate shared inputs and target writes.

## Agent-facing contract

Every generated output should preserve these repository-wide behaviors unless the target surface cannot support them:

1. Start broad WordPress requests with `wordpress-creator` so the work routes to the smallest fitting implementation path.
2. Use `studio` for WordPress Studio site resolution, MCP preference, CLI fallback, site-path handling, `wp_cli`, screenshots, block validation, and review loops.
3. Use specialist skills for implementation: `site-creator`, `theme-creator`, `block-creator`, `plugin-creator`, `design-previews-creator`, and `auditing`.
4. Prefer Studio MCP tools over shell commands; use the `studio` CLI fallback only when MCP is unavailable or not the right tool.
5. Keep generated WordPress output editable in WordPress and validate serialized block markup with Studio validation tools when files or `wp_cli` content contain block markup.
6. Emit telemetry milestones through `record_workflow_event` only when a specialist workflow asks for meaningful `started` or `completed` events.

## Permissions, storage, and failure boundaries

This repository does not store WordPress site data or credentials. Generated packages point agents at local/user-configured tools:

- `studio mcp` is launched as a local MCP command by generated configs where the surface supports MCP.
- `wp_cli` access happens through the Studio MCP server according to the `studio` skill.
- Telemetry is exposed as a local MCP server bundled from this repository.
- Some surfaces intentionally do not include MCP files when their official integration model does not provide a repository-local MCP contract. Examples documented in generated README files include Pi, Qodo, and Conductor.

Common failure modes and expected handling:

| Failure | Expected handling | Source evidence |
| --- | --- | --- |
| Studio CLI is missing or disabled | Stop and tell the user Studio is missing or the CLI is not enabled. | `skills/studio/SKILL.md` |
| MCP tools are unavailable | Prefer plugin-local MCP config for normal use, then fall back to the smallest useful `studio` CLI command. | `skills/studio/SKILL.md`, generated MCP configs |
| Serialized block markup is invalid | Treat validation failures as required fixes and rerun validation until clean. | `skills/studio/SKILL.md`, `skills/theme-creator/SKILL.md`, `skills/site-creator/SKILL.md` |
| Surface lacks an official plugin/MCP mechanism | Ship native workspace files or setup guidance instead of inventing unsupported manifests. | generated README files for Aider, Pi, Qodo, Conductor, Cline, OpenCode |

## Design principles for maintainers

- Keep the shared workflow in `skills/` and avoid duplicating specialist guidance across surface-specific files.
- Use native agent extension points instead of forcing every surface into one universal plugin shape.
- Keep Studio as the WordPress runtime boundary; generated outputs should not create new WordPress backend services.
- Treat generated `plugins/` contents as committed artifacts with a build-and-verify contract.
- Prefer small, source-grounded changes: update the shared skill first when behavior should apply everywhere, and update a generator helper only when a surface needs different packaging.
