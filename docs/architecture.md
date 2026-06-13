# Architecture

Build with WordPress is the source repository for WordPress-focused coding-agent packages. It keeps one shared skill source in `skills/`, then uses Node.js build scripts to generate native package layouts under `plugins/` for many agent surfaces.

The repository is intentionally small and artifact-oriented: source guidance, generator scripts, generated plugin folders, and verification scripts live together so a contributor can change a skill, rebuild every package, and review the exact generated diff before shipping.

## Repository layout

| Path | Role |
| --- | --- |
| `README.md` | Product entry point, install/build commands, generated surface summary, and Cursor export notes. |
| `docs/` | Developer documentation for architecture, generated outputs, integrations, and workflows. |
| `skills/` | Canonical WordPress agent skill source. These directories are the human-maintained guidance that generated packages consume. |
| `scripts/build-plugins.mjs` | Main generator for plugin/package output folders under `plugins/`. |
| `scripts/build-telemetry-mcp.mjs` | Builds the telemetry MCP bundle used by generated MCP-capable outputs. |
| `scripts/wordpress-telemetry-mcp.mjs` | Source implementation for the local telemetry MCP server. |
| `scripts/verify-plugins.mjs` | Verifies generated package files, configuration shape, and committed artifact consistency. |
| `scripts/export-cursor-plugin.mjs` | Exports `plugins/cursor/` to the standalone Cursor plugin repository workflow. |
| `plugins/` | Committed generated package outputs for each supported agent surface. |
| `.github/workflows/developer-docs-agent.yml` | Maintains this developer documentation surface. |
| `.github/workflows/skills-agent.yml` | Maintains live skill source and generated skill copies. |

## Core architecture

```text
skills/*
  + scripts/wordpress-telemetry-mcp.mjs
  + scripts/build-plugins.mjs
          |
          v
plugins/<agent>/ native files, copied skills, MCP config, package manifests
          |
          v
scripts/verify-plugins.mjs checks generated output before PRs merge
```

The source of truth flows in one direction:

1. Contributors edit canonical skill directories in `skills/` and generator logic in `scripts/`.
2. `pnpm build` runs `scripts/build-telemetry-mcp.mjs` and then `scripts/build-plugins.mjs`.
3. The build writes generated files into `plugins/<surface>/` using each agent's native conventions.
4. `pnpm verify` runs `scripts/verify-plugins.mjs` to prove the committed generated outputs match the expected contracts.
5. The docs and workflow drift checks require `git diff --exit-code` after build/verify so generated changes are committed with their source changes.

## Canonical skill domains

The top-level directories in `skills/` define the repository's WordPress behavior domains:

| Skill directory | Responsibility |
| --- | --- |
| `skills/wordpress-creator/` | Routing and overall WordPress creation guidance across site, theme, block, plugin, and audit tasks. |
| `skills/site-creator/` | New WordPress site creation workflows. |
| `skills/theme-creator/` | Block theme creation and theme-editing workflows. |
| `skills/design-previews-creator/` | Three-direction design preview workflow before theme implementation. |
| `skills/block-creator/` | Custom block creation workflows. |
| `skills/plugin-creator/` | Custom plugin creation workflows. |
| `skills/auditing/` | Performance, accessibility, frontend, and related site audit workflows. |
| `skills/studio/` | Shared WordPress Studio operating guidance and fallback CLI behavior. |

Generated packages may copy these skills into different locations (`skills/`, `.agents/skills/`, `.cline/skills/`, `.devin/skills/`, `.kilo/skills/`, and similar) depending on what the target agent supports. See [Generated outputs](generated-outputs.md) for package-level contracts.

## Runtime boundary with WordPress Studio

Build with WordPress does not own WordPress sites, the Studio desktop app, or the `studio` CLI. Those live in WordPress Studio. This repository owns the agent-facing layer that teaches coding agents how to use Studio and WordPress safely:

- WordPress Studio MCP setup for site management, screenshots, block validation, and WP-CLI access where supported.
- Studio CLI fallback guidance through the shared `skills/studio/` skill when MCP is unavailable.
- Agent-native instruction files and rules that route WordPress work to the right skill.
- Telemetry MCP bootstrap files generated from the local telemetry bundle.

The configured `studio` context evidence points to Studio MCP and AI tool source paths (`apps/cli/ai/tools/**`, `apps/cli/ai/system-prompt.ts`, and `apps/cli/commands/mcp.ts`). Keep integration documentation scoped to that boundary: Studio owns runtime tools; Build with WordPress owns packaging and guidance for agents to call them.

## Generator and verifier responsibilities

`package.json` exposes four public contributor commands:

| Command | Backing script | Purpose |
| --- | --- | --- |
| `pnpm build` | `scripts/build-telemetry-mcp.mjs` then `scripts/build-plugins.mjs` | Rebuild all generated package artifacts. |
| `pnpm build:telemetry-mcp` | `scripts/build-telemetry-mcp.mjs` | Rebuild only the telemetry MCP bundle. |
| `pnpm verify` | `scripts/verify-plugins.mjs` | Validate generated outputs and package contracts. |
| `pnpm export:cursor` | `scripts/export-cursor-plugin.mjs` | Export `plugins/cursor/` to the standalone Cursor plugin repository branch. |

Treat `scripts/build-plugins.mjs` and `scripts/verify-plugins.mjs` as paired contracts. If the generator creates a new file, location, MCP server declaration, skill copy, manifest field, or agent-specific setup note, the verifier should encode the invariant that prevents stale or partial generated output from being committed.

## Generated artifact ownership

Files under `plugins/` are committed generated artifacts, not independent source trees. Edit source skills and generator code first, run `pnpm build`, then review the generated output. Direct edits under `plugins/` are appropriate only when changing a package-specific README or when the generator intentionally treats that file as static source.

Cursor is the exception with an external publication step. `plugins/cursor/` is still generated here, then `pnpm export:cursor` exports that subtree to `Automattic/wordpress-cursor-plugin`.

## Automation lanes

Two GitHub Actions workflows keep the repository current:

- **Developer Docs Agent** (`.github/workflows/developer-docs-agent.yml`) runs manually as a bootstrap pass and on pushes to `trunk` as maintenance. It may write `README.md`, `docs/**`, and `plugins/**/README.md`.
- **Skills Agent** (`.github/workflows/skills-agent.yml`) runs manually and weekly. It may write `skills/**`, generated skill copies under `plugins/**/skills/**`, and plugin README files.

Both workflows use the same verification commands: `pnpm install --frozen-lockfile`, `pnpm build`, and `pnpm verify`, followed by a generated-output drift check.