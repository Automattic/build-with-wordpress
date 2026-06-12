# Generated output contracts

`plugins/` contains committed generated packages for coding-agent surfaces. The source of truth is the shared skill source in `skills/`, the generator in `scripts/build-plugins.mjs`, and the telemetry MCP source in `scripts/wordpress-telemetry-mcp.mjs`.

## Build pipeline

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm verify
```

`pnpm build` runs two steps from `package.json`:

1. `node scripts/build-telemetry-mcp.mjs` bundles the telemetry MCP server.
2. `node scripts/build-plugins.mjs` regenerates all agent packages under `plugins/`.

`pnpm build:telemetry-mcp` rebuilds only `dist/wordpress-telemetry-mcp.mjs` for telemetry-source-only edits.

## Common generated responsibilities

Each generated package adapts the same WordPress guidance to the target surface:

- expose or document WordPress Studio MCP where the surface supports MCP configuration;
- include the shared skills in the target surface's native skill or instruction location;
- route WordPress work to the appropriate skill: site creation, theme creation, design previews, block creation, plugin creation, auditing, and Studio fallback operations;
- provide agent-facing setup instructions through README files, rules, prompts, commands, or package manifests;
- include telemetry MCP wiring where supported by the surface layout.

The generated outputs should not be edited as the primary source of truth. Change the skill source or generator, then rebuild.

## Surface output matrix

| Surface | Folder | Contract highlights |
| --- | --- | --- |
| Aider | `plugins/aider/` | `.aider.conf.yml`, `CONVENTIONS.md`, README, copied `skills/`. |
| Amp | `plugins/amp/` | `AGENTS.md`, `.agents/skills/`, `.amp/settings.json`, and `.amp/plugins/wordpress-studio.ts`. |
| Claude Code | `plugins/claude-code/` | `.claude-plugin/plugin.json`, `.mcp.json`, README, copied `skills/`. |
| Cline | `plugins/cline/` | `.clinerules/`, `.cline/skills/`, `mcp.json`, README. |
| Codex | `plugins/codex/` | Marketplace metadata, plugin manifest, `.mcp.json`, README, copied `skills/`. |
| Conductor | `plugins/conductor/` | `.conductor/settings.toml` and setup notes for app/provider-level MCP configuration. |
| Continue | `plugins/continue/` | `config.yaml`, `.continue/rules/`, prompts, MCP server YAML, README. |
| Cursor | `plugins/cursor/` | Cursor plugin package exported to `Automattic/wordpress-cursor-plugin`. |
| Devin CLI | `plugins/devin/` | `AGENTS.md`, `.devin/config.json`, `.devin/skills/`, README. |
| Factory Droid | `plugins/factory/` | Marketplace files, plugin files, commands, Droid config, hooks, MCP config, copied skills. |
| Gemini | `plugins/gemini/` | `GEMINI.md`, `.gemini/settings.json`, copied `skills/`, README. |
| GitHub Copilot | `plugins/copilot/` | `.github/copilot-instructions.md`, scoped instructions, `.vscode/mcp.json`. |
| Junie | `plugins/junie/` | `.junie/AGENTS.md`, `.junie/skills/`, `.junie/mcp/mcp.json`, README. |
| Kilo Code | `plugins/kilo-code/` | `kilo.jsonc`, `AGENTS.md`, `.kilo/agents/`, `.kilo/rules/`, `.kilo/skills/`. |
| OpenCode | `plugins/opencode/` | `AGENTS.md`, `.opencode/`, commands, agents, skills, MCP config. |
| Pi | `plugins/pi/` | `package.json` with `pi-package` metadata and copied `skills/`; MCP setup is not built in. |
| Qodo | `plugins/qodo/` | `AGENTS.md`, copied `skills/`, and README guidance for Qodo Agentic Tools or enterprise allow-lists. |
| Roo Code | `plugins/roo-code/` | `.roo/mcp.json`, `.roo/rules/`, `.roo/rules-code/`, copied `skills/`. |
| Windsurf/Cascade | `plugins/windsurf/` | `.devin/rules/`, `mcp_config.json`, copied `skills/`. |
| Zed | `plugins/zed/` | `AGENTS.md`, `.agents/skills/`, `.zed/settings.json`, README. |

## MCP server contract

Generated MCP configuration uses two logical servers where supported:

- `wordpress-studio` delegates site operations to WordPress Studio's MCP server.
- `wordpress-telemetry` runs this repository's generated telemetry MCP command for workflow events.

Some surfaces use `mcpServers`; others use a surface-specific shape such as `servers` or YAML blocks. The verifier accepts these differences and checks the generated layout expected for each surface.

## Verification expectations

`pnpm verify` is the review gate for generated outputs. It checks representative package contracts for each surface instead of merely confirming files exist. Maintainers should add verification whenever they add a new generated file responsibility, because generated outputs are otherwise easy to drift.

Before opening a PR:

1. Run `pnpm build`.
2. Run `pnpm verify`.
3. Review diffs in both source inputs and generated `plugins/**` outputs.
4. If generated output changes unexpectedly, fix the generator or skill source rather than editing generated files by hand.

## Adding a new agent surface

1. Add generation logic to `scripts/build-plugins.mjs` using the target surface's native extension point.
2. Include shared skills or instructions in the place the surface actually reads.
3. Add MCP and telemetry wiring only where the surface supports it; document setup-only surfaces clearly.
4. Add `scripts/verify-plugins.mjs` checks for the new package's manifest, skill copy, MCP config, README, and any special files.
5. Run `pnpm build` and commit the generated `plugins/<surface>/` folder.
6. Update `README.md` and this page with the new surface contract.

## Cursor export contract

Cursor requires a standalone plugin repository. The generated source remains `plugins/cursor/` in this repository, but publishing uses:

```bash
pnpm build
pnpm verify
pnpm export:cursor
```

`pnpm export:cursor` splits the `plugins/cursor` subtree and pushes it to the `sync/from-build-with-wordpress` branch of `Automattic/wordpress-cursor-plugin` by default. Use a dry run before publishing when validating the export path:

```bash
pnpm export:cursor -- --dry-run
```
