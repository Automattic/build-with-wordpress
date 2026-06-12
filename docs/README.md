# Build with WordPress developer documentation

Build with WordPress is the canonical source for WordPress-focused coding-agent skills, MCP setup, and generated packages across supported agent surfaces. This documentation is for maintainers and integrators who need to understand the repository architecture, update shared skills, regenerate plugin artifacts, and verify changes.

## Start here

1. Read [Architecture](architecture.md) to understand the repository boundaries: shared skills in `skills/`, generator scripts in `scripts/`, committed outputs in `plugins/`, and WordPress Studio as the runtime boundary.
2. Read [Skills and integrations](skills-and-integrations.md) when changing agent behavior, WordPress Studio MCP usage, skill routing, or public tool/event names.
3. Read [Generated outputs](generated-outputs.md) before editing generated plugin artifacts or surface-specific packaging.
4. Read [Contributor workflows](contributor-workflows.md) for local setup, build/verify commands, Cursor export, smoke testing, and deferred documentation coverage.

## Documentation map

| Page | Scope |
| --- | --- |
| [Architecture](architecture.md) | Repository inventory, product boundaries, generation flow, main generator responsibilities, agent-facing contract, permissions/storage/failure boundaries, and design principles. |
| [Generated outputs](generated-outputs.md) | Build pipeline, generator inputs, shared MCP server contract, telemetry MCP contract, generated package matrix, verification contract, and Cursor export workflow. |
| [Skills and integrations](skills-and-integrations.md) | Skill file format, skill inventory, routing model, WordPress Studio integration, skill packaging, agent integration patterns, public tool/event names, and examples. |
| [Contributor workflows](contributor-workflows.md) | Local setup, common commands, workflows by source area, review checklist, manual smoke testing, automation notes, and future coverage. |

## Repository-native concepts

- **Build with WordPress** is the source repository and generator for shared WordPress agent behavior.
- **WordPress Studio** is the local WordPress runtime, CLI, and MCP server used by generated agent packages.
- **Shared skills** live in `skills/*/SKILL.md` and define portable WordPress workflows.
- **Generated outputs** live in `plugins/<surface>/` and adapt shared skills into native agent packaging.
- **`wordpress-studio` MCP** is the generated logical MCP server that runs `studio mcp`.
- **`wordpress-telemetry` MCP** is the bundled telemetry server generated from this repository.

## Core commands

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm verify
```

For Cursor publishing:

```bash
pnpm export:cursor
```

## Source evidence

This bootstrap documentation was grounded in:

- `README.md`;
- `package.json` command definitions;
- `skills/*/SKILL.md` shared skill source;
- `scripts/build-plugins.mjs`, `scripts/build-telemetry-mcp.mjs`, `scripts/wordpress-telemetry-mcp.mjs`, `scripts/verify-plugins.mjs`, and `scripts/export-cursor-plugin.mjs`;
- generated package directories under `plugins/` and plugin-local README files;
- `.github/workflows/developer-docs-agent.yml` and `.github/workflows/skills-agent.yml`;
- read-only context evidence from `studio` and `wordpress-agent-skills` for integration behavior.

## Maintenance rule

When source behavior changes, update the relevant documentation page in the same pull request. Keep the index linked only to written pages and keep detailed future work in [Contributor workflows](contributor-workflows.md#future-coverage).
