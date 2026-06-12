# Generated outputs

Build with WordPress commits generated agent packages under `plugins/`. The generated files are not throwaway build artifacts: they are the user-facing distribution surface and are verified by `pnpm verify`.

## Build pipeline

```bash
pnpm install
pnpm build
pnpm verify
```

`pnpm build` performs two steps from `package.json`:

1. `node scripts/build-telemetry-mcp.mjs` bundles `scripts/wordpress-telemetry-mcp.mjs` into `dist/wordpress-telemetry-mcp.mjs` with `esbuild`.
2. `node scripts/build-plugins.mjs` reads shared skills and the telemetry bundle, then rewrites generated packages under `plugins/`.

Use `pnpm build:telemetry-mcp` only when rebuilding the telemetry MCP artifact. Use `pnpm export:cursor` after build and verify when publishing the Cursor package to the standalone Cursor repository.

## Inputs and shared contracts

| Input | Used for | Notes |
| --- | --- | --- |
| `skills/*/SKILL.md` | Shared workflow content copied or referenced by every agent output. | Keep behavior changes here when they should apply across surfaces. |
| `scripts/wordpress-telemetry-mcp.mjs` | Source for the bundled `wordpress-telemetry` MCP server. | Packaged into generated outputs that support a local telemetry MCP server. |
| `scripts/build-plugins.mjs` | Surface-specific generation logic. | Owns native manifests, MCP config shapes, commands, hooks, README files, and path conventions. |
| `package.json` scripts | Build, verify, and export entry points. | `pnpm build` must precede `pnpm verify`. |
| Context evidence from `studio` | Studio MCP/CLI integration behavior. | The generated packages point to `studio mcp`; Studio itself owns that server. |
| Context evidence from `wordpress-agent-skills` | Skill packaging conventions. | This repository keeps portable `SKILL.md` workflows and packages them per target surface. |

## Shared MCP servers

Most surfaces that support MCP receive two logical servers:

```json
{
  "mcpServers": {
    "wordpress-studio": {
      "command": "studio",
      "args": ["mcp"]
    },
    "wordpress-telemetry": {
      "command": "node",
      "args": ["..."]
    }
  }
}
```

The exact JSON, YAML, TOML, or settings shape varies by surface. The logical contract is consistent:

- `wordpress-studio` launches the existing WordPress Studio MCP server for site management, screenshots, block validation, audits, and `wp_cli`.
- `wordpress-telemetry` launches this repository's bundled telemetry MCP server for meaningful workflow milestones such as specialist skill `started` and `completed` events.
- If a surface lacks a repository-local MCP mechanism, its output documents the compatibility path instead of inventing an unsupported config file.

## Telemetry MCP contract

The telemetry server source lives in `scripts/wordpress-telemetry-mcp.mjs` and is bundled into generated outputs. Generated skill instructions refer to the `record_workflow_event` tool for workflow milestones.

Representative event payload:

```json
{
  "workflow": "theme-build",
  "stage": "completed",
  "surface": "claude-code"
}
```

Specialist skills currently mention these workflows:

- `theme-build` from `theme-creator`;
- `block-build` from `block-creator`;
- `plugin-build` from `plugin-creator`.

Do not add telemetry calls for every small action. The `studio` skill says to use telemetry only for meaningful milestones when a specialist skill asks for it.

## Generated package matrix

| Surface | Output directory | Main generated contract |
| --- | --- | --- |
| Aider | `plugins/aider/` | `.aider.conf.yml`, `CONVENTIONS.md`, copied `skills/`, and README guidance. No invented marketplace plugin or MCP package surface. |
| Amp | `plugins/amp/` | `AGENTS.md`, `.agents/skills/`, `.amp/settings.json`, `.amp/plugins/wordpress-studio.ts`, telemetry server copy, and README. |
| Claude Code | `plugins/claude-code/` | `.claude-plugin/plugin.json`, `.mcp.json`, copied `skills/`, telemetry server copy, and README. |
| Cline | `plugins/cline/` | `.clinerules/`, `.cline/skills/`, `mcp.json`, and README/compatibility notes. |
| Codex | `plugins/codex/` | Marketplace metadata, plugin manifest, `.mcp.json`, copied `skills/`, telemetry server copy, and README. |
| Conductor | `plugins/conductor/` | `.conductor/settings.toml` and README that points to underlying Claude Code, Codex, and Cursor configs for MCP. |
| Continue | `plugins/continue/` | `config.yaml`, `.continue/rules/`, `.continue/prompts/`, `.continue/mcpServers/`, and README. |
| Cursor | `plugins/cursor/` | Cursor plugin package that is exported to `Automattic/wordpress-cursor-plugin`. |
| Devin CLI | `plugins/devin/` | `AGENTS.md`, `.devin/config.json`, `.devin/skills/`, and README. |
| Factory Droid | `plugins/factory/` | Factory marketplace/plugin manifests, command, Droid, hooks, MCP config, copied skills, telemetry server, and README. |
| Gemini | `plugins/gemini/` | `GEMINI.md`, `.gemini/settings.json`, copied `skills/`, and README. |
| GitHub Copilot | `plugins/copilot/` | `.github/copilot-instructions.md`, scoped instructions, `.vscode/mcp.json`, and README. |
| Junie | `plugins/junie/` | `.junie/AGENTS.md`, `.junie/skills/`, `.junie/mcp/mcp.json`, and README. |
| Kilo Code | `plugins/kilo-code/` | `kilo.jsonc`, `AGENTS.md`, `.kilo/agents/`, `.kilo/rules/`, `.kilo/skills/`, and README. |
| OpenCode | `plugins/opencode/` | `AGENTS.md`, `opencode.json`, `.opencode/agents/`, `.opencode/commands/`, `.opencode/skills/`, MCP config, compatibility plugin README, and README. |
| Pi | `plugins/pi/` | `package.json` with `pi-package` metadata and copied `skills/`. MCP is intentionally not generated because Pi does not provide built-in MCP support in the documented contract. |
| Qodo | `plugins/qodo/` | `AGENTS.md`, copied `skills/`, README, and MCP setup guidance for Qodo Agentic Tools or enterprise allow-lists. |
| Roo Code | `plugins/roo-code/` | `.roo/mcp.json`, `.roo/rules/`, `.roo/rules-code/`, copied `skills/`, and README. |
| Windsurf/Cascade | `plugins/windsurf/` | `.devin/rules/`, `mcp_config.json`, copied `skills/`, and README. |
| Zed | `plugins/zed/` | `AGENTS.md`, `.agents/skills/`, `.zed/settings.json`, and README. |

## Verification contract

Before opening a pull request that changes skills, generator code, telemetry code, or generated outputs, run:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm verify
```

Expected contributor behavior:

1. Edit source inputs first (`skills/`, `scripts/wordpress-telemetry-mcp.mjs`, or `scripts/build-plugins.mjs`).
2. Run `pnpm build` so `plugins/` reflects the source change.
3. Run `pnpm verify` so generated files match expected paths and contracts.
4. Review generated diffs for every surface touched by the change.

Generated README files inside `plugins/*/README.md` are part of the output contract. Update generator README builders, not just generated README files, when a README change should survive the next build.

## Cursor export workflow

Cursor requires a standalone plugin repository. Build with WordPress remains the source of truth for Cursor output:

```bash
pnpm build
pnpm verify
pnpm export:cursor
```

`pnpm export:cursor` uses `git subtree split --prefix=plugins/cursor` and pushes to `Automattic/wordpress-cursor-plugin` on `sync/from-build-with-wordpress`. For a dry run:

```bash
pnpm export:cursor -- --dry-run
```

Open or update a pull request from the sync branch into the standalone Cursor repository's `main` branch after export.
