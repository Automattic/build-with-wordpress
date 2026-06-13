# Architecture

Build with WordPress packages one shared WordPress agent substrate into the native conventions of many coding-agent surfaces. The repository owns the source skills, generator scripts, generated plugin outputs, and verification contract that keeps those outputs aligned.

## Repository layout

| Path | Responsibility |
| --- | --- |
| `skills/` | Canonical shared skills. Each skill directory contains a `SKILL.md` file with frontmatter (`name`, `description`) plus workflow guidance. |
| `scripts/build-telemetry-mcp.mjs` | Bundles the telemetry MCP server source into `dist/wordpress-telemetry-mcp.mjs` with esbuild for Node 18 ESM. |
| `scripts/wordpress-telemetry-mcp.mjs` | Source for the plugin-local telemetry MCP server. |
| `scripts/build-plugins.mjs` | Rebuilds every generated output under `plugins/` from `skills/` and the bundled telemetry server. |
| `scripts/verify-plugins.mjs` | Asserts generated package shape, skill copies, manifests, MCP configs, telemetry bootstrap behavior, and key README content. |
| `plugins/` | Committed generated outputs for each supported agent or workspace surface. |
| `.github/workflows/developer-docs-agent.yml` | Maintains this developer documentation surface and enforces the bootstrap docs contract. |
| `.github/workflows/skills-agent.yml` | Maintains live skill content and generated skill package README updates. |

## Build pipeline

`pnpm build` runs two stages from `package.json`:

1. `node scripts/build-telemetry-mcp.mjs`
   - entry point: `scripts/wordpress-telemetry-mcp.mjs`
   - output: `dist/wordpress-telemetry-mcp.mjs`
   - bundle settings: ESM, Node platform, Node 18 target, shebang banner
2. `node scripts/build-plugins.mjs`
   - requires the bundled telemetry artifact to exist before building agent outputs
   - reads the canonical skill directory list from `skills/`
   - removes each output's build root before regenerating it
   - copies skills into the surface-specific skill location
   - writes manifests, MCP configs, rules, prompts, commands, hooks, and README files from generator-owned templates
   - rebuilds standalone workspace outputs such as Continue and Conductor after the plugin target loop

The generated `plugins/` tree is committed. Contributors should not hand-edit generated files unless the edit is also reflected in `scripts/build-plugins.mjs` or the source `skills/` content that produced it.

## Runtime model

Generated outputs make an agent WordPress-aware by combining three layers:

1. **Shared routing and workflow guidance** from `skills/`.
2. **WordPress Studio MCP access** for site lifecycle, screenshots, block validation, audits, previews, and `wp_cli` operations.
3. **Build with WordPress telemetry MCP access** for workflow milestone events emitted by specialist skills.

The Studio integration is intentionally external. The `studio` context repository shows `studio mcp` runs `startMcpStdioServer()` in non-interactive stdio mode, while interactive terminal use prints configuration instructions for Claude Code, Codex, and generic `mcpServers` consumers. Build with WordPress therefore writes MCP config that launches `studio mcp`; it does not implement a replacement WordPress backend.

## Generator boundaries

`scripts/build-plugins.mjs` has one target table, `pluginTargets`, for output-specific behavior. Most targets follow the generic path:

- remove `target.buildRootDir`
- create optional manifest directories
- copy `skills/` to `target.pluginDir/skills`
- read `dist/wordpress-telemetry-mcp.mjs` unless `includeTelemetry: false`
- write an MCP config when `includeMcpConfig` is true
- write manifest JSON and README content
- write optional rules or marketplace metadata

Several surfaces need native layouts and have dedicated branches in `buildPluginTarget()`:

- OpenCode stores skills in `.opencode/skills` and writes `opencode.json`, commands, agents, and plugin notes.
- Kilo Code stores skills in `.kilo/skills` and writes `kilo.jsonc`, Kilo agents, rules, and plugin notes.
- Cline stores skills in `.cline/skills`, writes `.clinerules/`, and includes a Cline MCP config.
- Devin CLI stores skills in `.devin/skills` and writes `.devin/config.json`.
- Amp and Zed store skills under `.agents/skills`.
- Junie stores skills and MCP config under `.junie/`.

Continue and Conductor are workspace/configuration outputs rather than generated plugin targets. They are built by `buildContinueOutput()` and `buildConductorOutput()` after the plugin target loop.

## Compatibility boundaries

- The package manager is `pnpm@10.8.1`.
- The telemetry bundle targets Node 18.
- MCP-capable outputs launch `studio mcp` for the `wordpress-studio` server.
- MCP-capable outputs launch `node --input-type=module --eval <bootstrap>` for the `wordpress-telemetry` server.
- Surfaces without first-class MCP config in this repository keep MCP setup in README guidance or in that tool's user/app settings.
- Some surfaces intentionally use the WordPress.com product name in generated guidance while the plugin/package display name remains `WordPress Studio`.
