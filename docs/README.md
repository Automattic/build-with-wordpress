# Build with WordPress Developer Documentation

Build with WordPress is the canonical source for WordPress-focused agent skills, WordPress Studio MCP setup, telemetry support, and generated packages across coding-agent surfaces. This documentation system is for maintainers and integrators who need to understand, use, and extend the repository.

Start here before changing skills, generator code, verification contracts, or generated plugin artifacts.

## Adoption path

1. Read the top-level [README](../README.md) for the product overview, supported agent surfaces, and basic commands.
2. Read [Architecture](architecture.md) to understand the source boundaries: `skills/`, `scripts/`, and generated `plugins/` output.
3. Read [Generated outputs](generated-outputs.md) before editing generated package logic or reviewing `plugins/` diffs.
4. Read [Skills and integrations](skills-and-integrations.md) before changing WordPress workflow guidance, Studio MCP behavior, or agent-surface integration rules.
5. Read [Contributor workflows](contributor-workflows.md) before opening a pull request or exporting Cursor output.

## Documentation map

| Page | Scope | Use it when you need to... |
| --- | --- | --- |
| [Architecture](architecture.md) | Repository layout, product names, module boundaries, runtime data flow, storage/auth boundaries, failure modes, and design principles. | Understand how shared skills, generator scripts, verification, telemetry, Studio MCP, and generated packages fit together. |
| [Generated outputs](generated-outputs.md) | Generated package matrix, build pipeline, generated-output contracts, MCP config shape, telemetry MCP tool reference, verifier expectations, and Cursor export contract. | Change or review generated files under `plugins/`, add a surface, or reason about package artifacts. |
| [Skills and integrations](skills-and-integrations.md) | Skill inventory, Studio integration concepts, MCP contracts, relationship to WordPress agent skills packaging, and safe extension boundaries. | Update shared skills, Studio guidance, or agent integration behavior. |
| [Contributor workflows](contributor-workflows.md) | Setup, commands, change recipes, manual smoke testing, CI automation contracts, and pull request checklist. | Prepare, verify, and review a repository change. |

## Repository source inventory

| Area | Path | Contract documented here |
| --- | --- | --- |
| Adoption entry point | `README.md` | Product purpose, supported generated surfaces, quick commands, testing, and Cursor publishing. |
| Portable skills | `skills/**/SKILL.md` | Shared WordPress workflows copied or adapted into agent-native packages. See [Skills and integrations](skills-and-integrations.md). |
| Plugin generator | `scripts/build-plugins.mjs` | Writes generated packages under `plugins/`. See [Architecture](architecture.md) and [Generated outputs](generated-outputs.md). |
| Telemetry source | `scripts/wordpress-telemetry-mcp.mjs` | Local MCP server exposing `record_workflow_event`. See [Generated outputs](generated-outputs.md#telemetry-mcp-tool-reference). |
| Telemetry bundler | `scripts/build-telemetry-mcp.mjs` | Bundles telemetry for Node 18 into `dist/wordpress-telemetry-mcp.mjs`. See [Generated outputs](generated-outputs.md#build-pipeline). |
| Generated verifier | `scripts/verify-plugins.mjs` | Executable contract for generated package files, skill copies, MCP config, telemetry artifact usage, manifests, and metadata. See [Generated outputs](generated-outputs.md#verification-as-generated-output-contract). |
| Cursor exporter | `scripts/export-cursor-plugin.mjs` | Subtree export from `plugins/cursor/` to `Automattic/wordpress-cursor-plugin`. See [Contributor workflows](contributor-workflows.md#export-cursor-output). |
| Generated packages | `plugins/**` | Agent-native output directories. See [Generated outputs](generated-outputs.md#generated-package-matrix). |
| Automation | `.github/workflows/**` | Documentation and skills maintenance workflows. See [Contributor workflows](contributor-workflows.md#ci-and-automation). |

## Core commands

```bash
pnpm install
pnpm build
pnpm verify
```

Use `pnpm build:telemetry-mcp` for telemetry-only bundling and `pnpm export:cursor` for the standalone Cursor plugin export flow.

## Source evidence used by this documentation

This bootstrap surface is grounded in the repository source inventory: `package.json` command scripts, `scripts/build-plugins.mjs`, `scripts/build-telemetry-mcp.mjs`, `scripts/verify-plugins.mjs`, `scripts/export-cursor-plugin.mjs`, `scripts/wordpress-telemetry-mcp.mjs`, the shared `skills/**/SKILL.md` directories, generated `plugins/**` packages, and the automation under `.github/workflows/**`. Integration notes also use the read-only `studio` and `wordpress-agent-skills` context aliases as evidence for Studio MCP ownership and shared skill packaging patterns.

## Current generated surfaces

Build with WordPress currently generates outputs for Aider, Amp, Claude Code, Cline, Codex, Conductor, Continue, Cursor, Devin CLI, Devin Desktop, Factory Droid, Gemini, GitHub Copilot, Hermes, Junie, Kilo Code, OpenClaw, OpenCode, Pi, Qodo, Roo Code, and Zed.

See [Generated outputs](generated-outputs.md#generated-package-matrix) for each surface's output directory and native files.

## Maintenance rule of thumb

If behavior should be shared, change `skills/`. If a generated file shape should change, update `scripts/build-plugins.mjs`. If reviewers need confidence that the generated shape remains valid, update `scripts/verify-plugins.mjs`. Then run `pnpm build && pnpm verify` and inspect the generated package diff.
