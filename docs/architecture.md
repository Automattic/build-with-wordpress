# Architecture

Build with WordPress is the canonical source for WordPress-focused agent skills and the generated packages that adapt those skills to individual coding-agent surfaces. The repository is intentionally split into human-authored source inputs, generator scripts, committed generated outputs, and verification scripts.

## Repository map

| Path | Role | Source evidence |
| --- | --- | --- |
| `skills/` | Shared portable WordPress skill source. Each top-level directory is copied or adapted into generated packages. | `scripts/build-plugins.mjs` reads `skills/` through `sharedSkillsSourceDir` and `getSharedSkillNames()`. `scripts/verify-plugins.mjs` reads `sharedSkillsDir`. |
| `scripts/build-plugins.mjs` | Main generator for agent-specific package folders under `plugins/`. | `package.json` maps `pnpm build` to this script after telemetry bundling. |
| `scripts/wordpress-telemetry-mcp.mjs` | Source for the repository-local telemetry MCP server. | Bundled by `scripts/build-telemetry-mcp.mjs`. |
| `scripts/build-telemetry-mcp.mjs` | Builds `dist/wordpress-telemetry-mcp.mjs` with esbuild. | `package.json` exposes `build:telemetry-mcp`. |
| `scripts/verify-plugins.mjs` | Contract tests for committed generated outputs. | `package.json` exposes `pnpm verify`; GitHub workflows require it. |
| `scripts/export-cursor-plugin.mjs` | Publishes the generated Cursor package to the standalone Cursor plugin repository branch. | `README.md` documents `pnpm export:cursor`; script defaults target `Automattic/wordpress-cursor-plugin.git` and branch `sync/from-build-with-wordpress`. |
| `plugins/` | Committed generated artifacts for each supported agent surface. | `README.md` lists all generated output folders; verification scripts validate them. |
| `.github/workflows/developer-docs-agent.yml` | Maintains developer documentation through the docs-agent bootstrap/maintenance flow. | Workflow config sets `audience: technical`, writable docs paths, and verification commands. |
| `.github/workflows/skills-agent.yml` | Maintains live skills and generated skill package docs. | Workflow config sets `audience: skills` and writable `skills/**` plus generated skill copies. |

## Core concepts

### Shared skills

The canonical WordPress workflow lives in `skills/`. Current top-level skills are:

- `auditing`
- `block-creator`
- `design-previews-creator`
- `plugin-creator`
- `site-creator`
- `studio`
- `theme-creator`
- `wordpress-creator`

The build reads the directory names and uses them as the skill list for generated README files, agent instructions, and package manifests. The generator copies the shared skill set into surface-specific locations such as `skills/`, `.agents/skills/`, `.cline/skills/`, `.devin/skills/`, `.kilo/skills/`, or another native directory required by the target agent.

### WordPress Studio integration

Build with WordPress does not own the WordPress runtime. WordPress Studio owns local sites, the `studio` CLI, and the `studio mcp` server. This repository owns the agent-facing packaging around that runtime:

- instructions that teach agents to prefer Studio MCP for site management, screenshots, block validation, and audits;
- MCP configuration snippets that expose `wordpress-studio` where a surface supports repository-local MCP config;
- fallback guidance through the shared `studio` skill when MCP is unavailable;
- a `wp_cli` path through the Studio MCP server as the general-purpose WordPress escape hatch;
- a local `wordpress-telemetry` MCP server so workflow event telemetry can ship with the generated package rather than depending on Studio telemetry support.

The workflow configuration also lists the read-only `studio` context alias for source evidence about Studio tools, system prompts, and MCP commands.

### Generated plugin packages

Every supported surface has a generated folder in `plugins/`. The generator uses each surface's native extension point instead of a universal package shape. Examples include `AGENTS.md` files, MCP JSON files, marketplace manifests, editor settings, rules folders, command files, prompts, and skill directories.

Generated outputs are committed. A contributor should treat `plugins/**` as build products whose source of truth is `skills/`, `scripts/build-plugins.mjs`, and `scripts/wordpress-telemetry-mcp.mjs`.

### Verification contract

The repository has script-level verification rather than a separate test framework. `scripts/verify-plugins.mjs` checks generated package contracts, including:

- each generated package has the expected copied shared skills;
- MCP config files contain the expected `wordpress-studio` and telemetry server wiring where supported;
- surface-specific manifests and package files contain expected names and metadata;
- generated instructions and package readmes mention the expected skill names and setup paths;
- generated telemetry scripts are present where package layouts require an embedded copy.

Run `pnpm build` before `pnpm verify` so verification checks the current committed generated state.

## Runtime and data boundaries

Build with WordPress is a packaging repository. It does not persist WordPress site data and does not implement WordPress authentication or authorization logic itself. Site operations are delegated to Studio MCP, Studio CLI, and `wp_cli` via Studio. The repository-local telemetry MCP server is packaged as a local MCP command used by generated agent surfaces; maintainers should document any schema changes in the telemetry source and update generated output contracts accordingly.

## Lifecycle

1. A maintainer edits shared skill source in `skills/`, generator logic in `scripts/build-plugins.mjs`, or telemetry source in `scripts/wordpress-telemetry-mcp.mjs`.
2. `pnpm build` bundles telemetry and regenerates `plugins/`.
3. `pnpm verify` validates generated files against expected contracts.
4. Generated output diffs are reviewed together with source changes.
5. Cursor output is exported separately with `pnpm export:cursor` when the standalone Cursor plugin repository needs an update.

## Extension points for maintainers

Build with WordPress has no exported library API. Its supported extension points are repository conventions:

- add or revise a shared skill under `skills/<skill-name>/`;
- update the generator target list and builders in `scripts/build-plugins.mjs` when adding or changing an agent surface;
- add verification coverage in `scripts/verify-plugins.mjs` for every new generated contract;
- regenerate and commit `plugins/**` outputs;
- update developer docs when architecture, commands, or generated-output contracts change.
