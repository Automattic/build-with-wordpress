# Build and Verification

This repository is maintained by changing source skills and generator code, rebuilding generated artifacts, and verifying that each output still matches its expected contract.

## Prerequisites

- Node.js capable of running the repository's ESM scripts.
- `pnpm` using the version declared in `package.json` (`pnpm@10.8.1`).
- WordPress Studio installed for manual smoke testing of generated outputs that start `studio mcp`.

Install dependencies before running build or verification in a fresh checkout:

```bash
pnpm install --frozen-lockfile
```

PR #24 added dependency installation to the Docs Agent verification workflow because fresh runners need dependencies before `pnpm build` and `pnpm verify` can execute.

## Supported commands

| Command | Purpose | Source |
| --- | --- | --- |
| `pnpm build` | Builds the telemetry MCP bundle, then regenerates every `plugins/**` output. | `package.json` runs `node scripts/build-telemetry-mcp.mjs && node scripts/build-plugins.mjs`. |
| `pnpm build:telemetry-mcp` | Rebuilds only the telemetry MCP bundle. | `package.json` runs `node scripts/build-telemetry-mcp.mjs`. |
| `pnpm verify` | Checks generated output contracts across supported surfaces. | `package.json` runs `node scripts/verify-plugins.mjs`. |
| `pnpm export:cursor` | Splits and pushes the generated Cursor output to the standalone Cursor plugin repository sync branch. | `package.json` runs `node scripts/export-cursor-plugin.mjs`; README documents the workflow. |

## Normal contributor workflow

Use this path for skill changes, generator changes, or output support changes:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm verify
```

Then review the diff. Generator changes often update files under `plugins/**`; those generated files are part of the review surface and should be committed with the source change.

## What `pnpm build` does

`pnpm build` has two stages:

1. `scripts/build-telemetry-mcp.mjs` builds the telemetry MCP distribution file used by generated outputs.
2. `scripts/build-plugins.mjs` regenerates all supported agent outputs from the shared skills, telemetry bundle, and surface-specific builder functions.

The generator is responsible for:

- reading the shared skill set from `skills/`
- writing or refreshing surface-specific instructions, manifests, settings, rules, commands, prompts, and README files
- copying shared skills into each output's native skill location
- copying the telemetry MCP server into outputs that support local MCP
- preserving compatibility decisions for surfaces that do not support a given artifact type

## What `pnpm verify` checks

`verify-plugins.mjs` encodes the expected generated-output contract. It should be updated whenever a new output is added or a supported surface changes shape.

Representative checks include:

- all shared skill names are discovered from `skills/`
- generated outputs include every shared `SKILL.md` copy required by that surface
- JSON MCP config files include a supported server wrapper
- generated MCP configs include `wordpress-studio` and `wordpress-telemetry` where expected
- telemetry-capable outputs include `scripts/wordpress-telemetry-mcp.mjs`
- Codex marketplace metadata points to `./plugins/wordpress-studio`
- Codex, Claude Code, and Cursor manifests use the expected plugin name/display name and skills/MCP paths
- OpenCode uses the OpenCode schema and local command-array MCP syntax for `studio mcp`
- compatibility boundaries such as Pi's absence of MCP files and Qodo's manual MCP setup rationale remain true

When a verifier check fails, prefer fixing the source generator or the verification expectation instead of hand-editing generated files.

## Cursor export workflow

Cursor requires a standalone plugin repository. Build with WordPress remains the source of truth for the generated Cursor output at `plugins/cursor/`.

Use this sequence before exporting:

```bash
pnpm build
pnpm verify
pnpm export:cursor
```

For a dry run:

```bash
pnpm export:cursor -- --dry-run
```

The README records that the export script uses `git subtree split --prefix=plugins/cursor` and pushes to `Automattic/wordpress-cursor-plugin` on `sync/from-build-with-wordpress`. PR #18 records the important history boundary: the Cursor subtree history was connected with a normal merge commit so future subtree pulls continue to work.

## Manual smoke testing

After build and verification pass, smoke-test representative generated outputs in the target agent when changing shared behavior or a specific surface:

1. Open or copy the relevant `plugins/<surface>/` folder into the agent's expected project root.
2. Confirm `wordpress-studio` is available where the surface supports MCP.
3. Confirm `wordpress-telemetry` is available where the surface includes telemetry MCP.
4. Ask the agent to perform representative WordPress tasks:
   - create a new site
   - build or edit a theme
   - create a custom block
   - create a custom plugin
   - run a performance, accessibility, or frontend audit

## CI and Docs Agent workflows

Merged workflow PRs record two maintenance lanes:

- PR #22 added the developer docs Docs Agent lane with read-only Studio and WordPress agent skills context plus build/verify checks.
- PR #23 routes manual dispatch to bootstrap documentation and push-to-`trunk` runs to maintenance.
- PR #21 added a scheduled/manual skills maintenance workflow for live Build with WordPress agent skills.

For documentation-only edits, stay inside the configured writable documentation paths. For generated output or skill changes, run the full build and verification sequence so generated artifacts stay synchronized.
