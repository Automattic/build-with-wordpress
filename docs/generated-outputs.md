# Generated Outputs

Build with WordPress packages shared WordPress skills into generated agent outputs under `plugins/`. Each output should match the native extension point of its target agent and should preserve the repository's Studio boundary: agents use WordPress Studio and the Studio MCP server for runtime site operations; this repository ships instructions, skills, MCP config, package metadata, and setup guidance.

## Output matrix

| Surface | Output path | Generated contract | MCP / telemetry behavior |
| --- | --- | --- | --- |
| Aider | `plugins/aider/` | `.aider.conf.yml`, `CONVENTIONS.md`, copied `skills/`, README. | Configuration/conventions pack; no marketplace claim. |
| Amp | `plugins/amp/` | `AGENTS.md`, `.agents/skills/`, `.amp/settings.json`, `.amp/plugins/wordpress-studio.ts`, README. | Project-local MCP settings and a project plugin command. PR #36 records this as project-local, not marketplace packaging. |
| Claude Code | `plugins/claude-code/` | `.claude-plugin/plugin.json`, `.mcp.json`, copied `skills/`, telemetry script, README. | Verifier checks plugin manifest, skills path, MCP config, and telemetry script. Issue #45 records Claude Code as already listed. |
| Cline | `plugins/cline/` | `.clinerules/`, `.cline/skills/`, `mcp.json`, README and plugin-scope rationale. | Generated MCP settings; PR #38 documents avoiding unsupported marketplace/extension claims. |
| Codex | `plugins/codex/` | Codex marketplace metadata, plugin manifest, `.mcp.json`, copied `skills/`, telemetry script, README. | Verifier checks marketplace entry, manifest `skills` and `mcpServers` paths, MCP entries, and telemetry. Issue #45 records Codex/ChatGPT as already listed. |
| Conductor | `plugins/conductor/` | `.conductor/settings.toml` plus README/setup notes. | PR #44 records the boundary: MCP setup remains in Conductor app/provider settings and underlying Claude Code, Codex, and Cursor configs. |
| Continue | `plugins/continue/` | `config.yaml`, `.continue/rules/`, prompts, MCP server YAML, README. | Local YAML remains supported; issue #45 records no active Continue Hub submission. |
| Cursor | `plugins/cursor/` | `.cursor-plugin/plugin.json`, `rules/wordpress-studio.mdc`, `mcp.json`, copied `skills/`, telemetry script, README. | Exported to the standalone Cursor repository; verifier checks manifest, rules, MCP, skills, and telemetry. |
| Devin CLI | `plugins/devin/` | `AGENTS.md`, `.devin/config.json`, `.devin/skills/`, telemetry script, README. | PR #42 records Devin project config, rules, skills, and MCP surfaces. |
| Factory Droid | `plugins/factory/` | Factory marketplace files, native `wordpress-studio` plugin, slash command, custom Droid, hooks, MCP config, skills, telemetry script, README. | PR #41 records command, Droid, hooks, MCP, skills, and verifier coverage. Issue #45 records Factory as a submission target. |
| Gemini | `plugins/gemini/` | `GEMINI.md`, `.gemini/settings.json`, copied `skills/`, telemetry script, README. | Project settings configure Studio and telemetry where supported. |
| GitHub Copilot | `plugins/copilot/` | `.github/copilot-instructions.md`, scoped instructions, `.vscode/mcp.json`, README. | VS Code MCP settings use Studio and telemetry entries. |
| Junie | `plugins/junie/` | `.junie/AGENTS.md`, `.junie/skills/`, `.junie/mcp/mcp.json`, README. | PR #37 records Junie guidelines, skills, and MCP config. |
| Kilo Code | `plugins/kilo-code/` | `kilo.jsonc`, `AGENTS.md`, `.kilo/agents/`, `.kilo/rules/`, `.kilo/skills/`, plugin README, telemetry script. | PR #40 records MCP config, custom rules, skills, agents, and verifier coverage. |
| OpenCode | `plugins/opencode/` | `AGENTS.md`, `opencode.json`, `.opencode/` agents/commands/rules/skills, telemetry script, README. | Verifier checks OpenCode's local MCP command-array syntax for `studio mcp` and telemetry. |
| Pi | `plugins/pi/` | `package.json` with `pi-package` metadata and `pi.skills`, copied `skills/`, README. | PR #39 records the compatibility boundary: no generated MCP or telemetry MCP files because Pi does not include built-in MCP support. |
| Qodo | `plugins/qodo/` | `AGENTS.md`, copied `skills/`, telemetry script, README. | PR #43 records manual MCP setup through Qodo Agentic Tools or enterprise allow-lists instead of automatic repo-local `.mcp.json`. |
| Roo Code | `plugins/roo-code/` | `.roo/mcp.json`, `.roo/rules/`, `.roo/rules-code/`, copied `skills/`, telemetry script, README. | Workspace rules and project MCP config. |
| Windsurf / Cascade | `plugins/windsurf/` | `.devin/rules/`, `mcp_config.json`, copied `skills/`, telemetry script, README. | Issue #45 records that listing work may target the Devin Desktop/Cascade MCP Marketplace rather than a repo-local package listing. |
| Zed | `plugins/zed/` | `AGENTS.md`, `.agents/skills/`, `.zed/settings.json`, telemetry script, README. | PR #35 records the decision to use Zed-native instructions, skills, and `context_servers`, not a Zed extension. |

## Common generated files

Most outputs are composed from the same building blocks:

- **Shared skills:** copied from `skills/*/SKILL.md` into the surface's native skill location, commonly `skills/`, `.agents/skills/`, `.cline/skills/`, `.devin/skills/`, `.junie/skills/`, `.kilo/skills/`, or `.opencode/skill/` depending on the agent.
- **WordPress Studio MCP config:** a `wordpress-studio` server entry that starts `studio mcp` where the agent supports repository-local MCP settings.
- **Telemetry MCP config:** a `wordpress-telemetry` server entry pointing at the generated `scripts/wordpress-telemetry-mcp.mjs` copy where local MCP is supported.
- **Surface-specific instructions:** `AGENTS.md`, rules, prompts, conventions files, custom commands, custom agents/Droids, or editor settings.
- **README files:** generated setup and compatibility notes for outputs where the generator writes a README.

## Representative MCP contract

The standard JSON MCP shape uses a server wrapper with both Studio and telemetry entries. `verify-plugins.mjs` accepts `mcpServers` or `servers` wrappers for most JSON surfaces and has dedicated checks for OpenCode and VS Code-style shapes.

```json
{
  "mcpServers": {
    "wordpress-studio": {
      "command": "studio",
      "args": ["mcp"]
    },
    "wordpress-telemetry": {
      "command": "node",
      "args": ["./scripts/wordpress-telemetry-mcp.mjs"]
    }
  }
}
```

OpenCode is intentionally different. Its verifier requires `opencode.json` to use the OpenCode schema, local MCP entries, and command-array syntax where the Studio command joins to `studio mcp`.

## Adding or changing an output

1. Identify the target agent's official extension points: instructions, skills, MCP settings, commands, hooks, plugin manifests, package manifests, or marketplace files.
2. Add or update the relevant builder functions in `scripts/build-plugins.mjs`.
3. Add the target to `pluginTargets` or create a dedicated output builder when the shape does not fit the common target model.
4. Ensure generated output copies shared skills or explicitly documents why the surface uses another native mechanism.
5. Add or update verifier coverage in `scripts/verify-plugins.mjs` for file presence, manifest fields, MCP entries, telemetry script presence or absence, and compatibility boundaries.
6. Run:

   ```bash
   pnpm build
   pnpm verify
   ```

7. Review `plugins/**` diffs. Commit generated artifacts together with generator and verifier changes.

## Marketplace and publication status

Issue #45 is the current source of truth for marketplace/listing status. At bootstrap time it classifies outputs as already listed, submitted, needing submission, requiring research, having no confirmed marketplace, or being intentionally project-local. Maintainers should update that issue when submission status changes and should avoid inventing marketplace paths where official docs do not describe one.

Cursor has a special publishing path. `plugins/cursor/` is generated here, then exported to `Automattic/wordpress-cursor-plugin` with:

```bash
pnpm build
pnpm verify
pnpm export:cursor
```

Use `pnpm export:cursor -- --dry-run` before pushing if you only need to inspect the subtree split command.
