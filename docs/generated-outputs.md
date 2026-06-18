# Generated Outputs

Build with WordPress generates agent-native packages under `plugins/`. The generator uses the shared skill source in `skills/`, repository constants, the shared MCP setup contract in `scripts/mcp-setup-contract.mjs`, generated telemetry artifact wiring, and per-surface conventions to produce files that each coding agent can consume.

Use this page when you need to understand what belongs in generated packages, how to update generator contracts, and how to verify generated artifacts before review.

## Build pipeline

The build command is defined in `package.json`:

```bash
pnpm build
# node scripts/build-telemetry-mcp.mjs && node scripts/build-plugins.mjs
```

The order is part of the contract:

1. `scripts/build-telemetry-mcp.mjs` bundles `scripts/wordpress-telemetry-mcp.mjs` with esbuild for Node 18 and writes `dist/wordpress-telemetry-mcp.mjs` with a Node shebang.
2. `scripts/build-plugins.mjs` writes all generated packages under `plugins/`.
3. Generated MCP configs embed a compressed bootstrap derived from the shared telemetry artifact instead of copying the telemetry source file into every package.

For telemetry-only changes, run:

```bash
pnpm build:telemetry-mcp
```

## Generated package matrix

| Surface | Generated directory | Primary generated files and contracts |
| --- | --- | --- |
| Aider | `plugins/aider/` | `.aider.conf.yml`, `CONVENTIONS.md`, `skills/`. |
| Amp | `plugins/amp/` | `AGENTS.md`, `.agents/skills/`, `.amp/settings.json`, `.amp/plugins/wordpress-studio.ts`. |
| Claude Code | `plugins/claude-code/` | `.claude-plugin/plugin.json`, `.mcp.json`, `skills/`. Manifest name is `wordpress-studio`. |
| Cline | `plugins/cline/` | `.clinerules/`, `.cline/skills/`, `mcp.json`. |
| Codex | `plugins/codex/` | Marketplace metadata, plugin manifest, `.mcp.json`, and `skills/` under `plugins/wordpress-studio/`. |
| Conductor | `plugins/conductor/` | `.conductor/settings.toml` and setup notes for app/provider-level MCP setup. |
| Continue | `plugins/continue/` | `config.yaml`, `.continue/rules/`, prompts, and MCP server YAML. |
| Cursor | `plugins/cursor/` | Cursor plugin files exported separately to `Automattic/wordpress-cursor-plugin`. |
| Devin CLI | `plugins/devin/` | `AGENTS.md`, `.devin/config.json`, `.devin/skills/`. |
| Factory Droid | `plugins/factory/` | Marketplace, plugin, command, Droid, hooks, MCP config, and skills. |
| Gemini | `plugins/gemini/` | `GEMINI.md`, `.gemini/settings.json`, `skills/`. |
| GitHub Copilot | `plugins/copilot/` | `.github/copilot-instructions.md`, scoped instructions, `.vscode/mcp.json`. |
| Hermes | `plugins/hermes/` | `plugin.yaml`, `__init__.py`, `.hermes/config.yaml`, `skills/`. |
| Junie | `plugins/junie/` | `.junie/AGENTS.md`, `.junie/skills/`, `.junie/mcp/mcp.json`. |
| Kilo Code | `plugins/kilo-code/` | `kilo.jsonc`, `AGENTS.md`, `.kilo/agents/`, `.kilo/rules/`, `.kilo/skills/`. |
| OpenClaw | `plugins/openclaw/` | `package.json` with OpenClaw package metadata, `AGENTS.md`, `mcp.json`, `skills/`. |
| OpenCode | `plugins/opencode/` | `AGENTS.md`, `opencode.json`, commands, agents, skills, and MCP config. |
| Pi | `plugins/pi/` | `package.json` with `pi-package` metadata and `skills/`. |
| Qodo | `plugins/qodo/` | `AGENTS.md`, `skills/`, and MCP setup guidance for Qodo Agentic Tools. |
| Roo Code | `plugins/roo-code/` | `.roo/mcp.json`, `.roo/rules/`, `.roo/rules-code/`, `skills/`. |
| Windsurf/Cascade | `plugins/windsurf/` | `.devin/rules/`, `mcp_config.json`, `skills/`. |
| Zed | `plugins/zed/` | `AGENTS.md`, `.agents/skills/`, `.zed/settings.json`. |

Some surfaces support a complete plugin/marketplace package. Others only support workspace instructions, local settings, or user-facing setup notes. The generator should use the best supported native integration point for each surface.

## Shared generated contracts

### Skill packaging

Surfaces with skill support must receive the shared skill set from `skills/`. `scripts/verify-plugins.mjs` reads the shared skill directory, sorts directory names, and checks generated skill locations with `verifySharedSkillSet()`.

Representative contract:

```text
skills/<skill-name>/SKILL.md
        │
        └── generated into the surface-specific skill directory
            when that agent supports skills
```

If you add, rename, or remove a shared skill, update the generator and run `pnpm build && pnpm verify` so each generated package remains aligned.

### MCP configuration

MCP-enabled outputs should configure both servers through the shared setup contract in `scripts/mcp-setup-contract.mjs`. The Studio entry launches the local Studio MCP command. The telemetry entry launches Node with an inline bootstrap generated from the built telemetry artifact:

```json
{
  "mcpServers": {
    "wordpress-studio": {
      "command": "studio",
      "args": ["mcp"]
    },
    "wordpress-telemetry": {
      "command": "node",
      "args": ["--input-type=module", "--eval", "<inline telemetry bootstrap>"]
    }
  }
}
```

The inline telemetry bootstrap is generated by reading `dist/wordpress-telemetry-mcp.mjs`, Brotli-compressing it, and writing a small `--eval` program that pushes `--surface <surface>` into `process.argv`, decompresses the payload, and imports it as a `data:text/javascript` module. This keeps generated packages self-contained without copying `scripts/wordpress-telemetry-mcp.mjs` into every output.

`scripts/mcp-setup-contract.mjs` owns the shared server names, Studio command, telemetry bootstrap arguments, standard `mcpServers` wrapper, VS Code `servers` wrapper, Zed `context_servers` wrapper, and local command-array shape used by OpenCode-compatible configs. Some agents still use another native wrapper around the same entries, such as Hermes `mcp_servers` or Amp `amp.mcpServers`. `verifyMcpConfig()` and surface-specific checks import the same contract so verifier expectations move with the generator when a new editor connector is added.

### Telemetry artifact

The telemetry source lives at `scripts/wordpress-telemetry-mcp.mjs`; generated packages should not copy that source file. The built artifact is `dist/wordpress-telemetry-mcp.mjs`; `scripts/build-plugins.mjs` reads that artifact and embeds a compressed bootstrap in generated MCP configs with a surface-specific `--surface` argument so stats identify the agent surface.

`verifyTelemetryScript()` fails a generated package if it contains `scripts/wordpress-telemetry-mcp.mjs` inside the package tree. Verification also checks that MCP-capable outputs expose `wordpress-telemetry` in the surface's native config wrapper.

### Manifest and marketplace metadata

Several surfaces require package metadata. Verification checks representative fields, including:

- plugin name `wordpress-studio`
- display name `WordPress Studio`
- skills path such as `./skills/`
- MCP config path such as `./.mcp.json`
- marketplace entries pointing to the generated plugin path
- schema URLs and package metadata required by a surface

Keep these values stable unless the corresponding agent surface changes its contract.

## Telemetry MCP tool reference

Source: `scripts/wordpress-telemetry-mcp.mjs`.

Server metadata:

| Field | Value |
| --- | --- |
| MCP server name | `wordpress-telemetry` |
| Version | `0.1.0` |
| Transport | stdio |
| Surface argument | `--surface <surface>`; sanitized to lowercase alphanumeric tokens and hyphens |

Tool:

| Tool | Purpose | Input |
| --- | --- | --- |
| `record_workflow_event` | Record plugin workflow telemetry for milestone events. | `{ "workflow": "site-build", "stage": "started" }` where `workflow` is a non-empty string and `stage` is `started` or `completed`. |

Behavior:

- The workflow value and surface are sanitized to lowercase tokens with hyphens.
- Empty sanitized workflow values return an MCP error response with `workflow must be a non-empty slug`.
- `WP_SITE_CREATOR_NO_TELEMETRY=1` skips the pixel request and returns a skipped message.
- Successful calls send a non-page-view pixel with group `agent-build-plugin` and stat `<surface>-<workflow>-<stage>`.
- Pixel failures are caught so telemetry cannot break the agent workflow.

Representative call:

```json
{
  "workflow": "site-build",
  "stage": "completed"
}
```

Representative success text:

```text
Recorded agent-build-plugin:<surface>-site-build-completed
```

## Verification as generated-output contract

Run the verification script after every generated output change:

```bash
pnpm verify
```

The verifier checks generated files rather than source style. It should fail when:

- a generated package is missing a required manifest, settings file, instructions file, or skill copy;
- an MCP-capable package is missing `wordpress-studio` or `wordpress-telemetry`;
- a package copies telemetry source instead of pointing to the built artifact;
- a surface-specific manifest uses the wrong plugin name, display name, schema, command, path, or package metadata.

When adding a new surface, add generator code and a verification function in the same change. The verification function should prove the public files that users or agent marketplaces consume.

## Cursor export contract

Cursor requires a standalone plugin repository. Build with WordPress remains the source of truth and exports `plugins/cursor/` to `Automattic/wordpress-cursor-plugin`.

Normal export:

```bash
pnpm build
pnpm verify
pnpm export:cursor
```

Dry run:

```bash
pnpm export:cursor -- --dry-run
```

The export script uses `git subtree split --prefix=plugins/cursor` and pushes the result to the standalone repository branch `sync/from-build-with-wordpress`. Open or update a pull request from that branch into the standalone repository's `main` branch.

## Maintenance checklist

Before opening a generated-output pull request:

1. Edit `skills/` and/or `scripts/`, not generated packages alone.
2. Run `pnpm install --frozen-lockfile` when dependencies changed or CI parity matters.
3. Run `pnpm build`.
4. Run `pnpm verify`.
5. Inspect generated package diffs for unexpected churn.
6. If Cursor output changed, run the Cursor export flow when maintainers are ready to update the standalone plugin repository.

## Related documentation

- [Architecture](architecture.md)
- [Skills and integrations](skills-and-integrations.md)
- [Contributor workflows](contributor-workflows.md)
