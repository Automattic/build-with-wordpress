# Architecture

Build with WordPress is the source repository for WordPress-focused agent skills, Studio MCP configuration, and generated agent packages. Its primary contract is not a runtime library API; it is a reproducible content-and-generator pipeline that turns one shared skill source into native artifacts for multiple coding-agent surfaces.

Source evidence: `README.md`, `package.json`, `skills/**`, `scripts/build-plugins.mjs`, `scripts/build-telemetry-mcp.mjs`, `scripts/verify-plugins.mjs`, `scripts/export-cursor-plugin.mjs`, `scripts/wordpress-telemetry-mcp.mjs`, `.github/workflows/skills-agent.yml`, `.github/workflows/developer-docs-agent.yml`, and the generated `plugins/**` tree.

## Repository-native product names

- **Build with WordPress**: this repository and its generator pipeline.
- **WordPress Studio**: the local WordPress site runtime and MCP server that generated agent packages are taught to use. The repository invokes it as `studio mcp` in MCP configuration snippets and falls back to the `studio` CLI from the shared Studio skill.
- **WordPress.com**: the user-facing product name that many generated instructions use for site-building workflows and connected-site guidance.
- **wordpress-studio**: the generated plugin/package name used by many agent surfaces.
- **wordpress-telemetry**: the bundled MCP server name used for workflow telemetry emitted by the generated packages.

## Top-level package layout

| Path | Responsibility |
| --- | --- |
| `skills/` | Canonical shared skill source. Each child directory is a portable skill and contains the workflow guidance copied or adapted into generated packages. |
| `scripts/build-plugins.mjs` | Main generator. It reads `skills/`, embeds MCP and telemetry configuration, writes every `plugins/<surface>/` output, and handles surface-specific layouts. |
| `scripts/build-telemetry-mcp.mjs` | Builds the telemetry MCP bundle into `dist/wordpress-telemetry-mcp.mjs` before generated packages embed bootstrap snippets. |
| `scripts/wordpress-telemetry-mcp.mjs` | Source for the telemetry MCP server that generated packages expose as `wordpress-telemetry`. |
| `scripts/verify-plugins.mjs` | Verification suite for generated outputs, manifests, MCP snippets, skill copies, telemetry bootstrap payloads, and surface-specific required files. |
| `scripts/export-cursor-plugin.mjs` | Cursor publishing helper that splits `plugins/cursor` for the standalone `Automattic/wordpress-cursor-plugin` repository. |
| `plugins/` | Generated output tree. Each subdirectory is the native package/configuration shape for one coding-agent surface. |
| `.github/workflows/skills-agent.yml` | Automation entry point for maintaining skills and generated packages. |
| `.github/workflows/developer-docs-agent.yml` | Automation entry point for maintaining developer documentation. |

## Source-to-output flow

```text
skills/**
  + scripts/wordpress-telemetry-mcp.mjs
  + generator constants and templates in scripts/build-plugins.mjs
        |
        | pnpm build
        v
dist/wordpress-telemetry-mcp.mjs
plugins/<surface>/**
        |
        | pnpm verify
        v
checked generated plugin artifacts
```

`package.json` defines the supported commands:

- `pnpm build` runs `node scripts/build-telemetry-mcp.mjs` and then `node scripts/build-plugins.mjs`.
- `pnpm build:telemetry-mcp` rebuilds only `dist/wordpress-telemetry-mcp.mjs`.
- `pnpm verify` runs `node scripts/verify-plugins.mjs`.
- `pnpm export:cursor` runs `node scripts/export-cursor-plugin.mjs`.

## Generator architecture

`scripts/build-plugins.mjs` is organized around three responsibilities:

1. **Shared constants and helpers.** The script defines repository paths, product names, MCP configuration helpers such as `createMcpConfig()`, `createVsCodeMcpConfig()`, `createOpenCodeMcpConfig()`, `createZedMcpConfig()`, and telemetry bootstrap creation through `createTelemetryBootstrapArgs()`.
2. **Surface templates.** Build functions such as `buildReadme()`, `buildPiReadme()`, `buildOpenCodeReadme()`, `buildRooReadme()`, `buildClineReadme()`, `buildQodoReadme()`, `buildHermesReadme()`, and surface-specific instruction builders define native manifests, README content, rules, prompts, commands, plugin metadata, MCP snippets, and installation notes.
3. **Target execution.** A target table describes each generated surface. `buildPluginTarget()` removes the target output root, copies shared skills when appropriate, reads the built telemetry bundle, and writes the native files for that surface. `copySkillSet()` and `getSharedSkillNames()` keep all generated packages aligned with the canonical `skills/` directory.

The generator deliberately writes generated outputs, rather than requiring maintainers to edit `plugins/**` by hand. Treat `skills/**`, generator templates, and verification rules as the source of truth.

## Runtime and integration boundaries

Build with WordPress owns the **agent-facing layer**:

- skill packaging and task-routing guidance;
- MCP configuration snippets for `wordpress-studio` and `wordpress-telemetry` where the target surface supports MCP;
- surface-native manifests, rules, prompts, commands, plugin metadata, and package layouts;
- verification of generated artifacts; and
- Cursor export orchestration.

WordPress Studio owns the **site runtime layer**:

- local Studio sites;
- the `studio` CLI;
- the `studio mcp` server;
- site management, screenshots, block validation, performance tooling, and WP-CLI access through MCP.

The repository keeps those responsibilities separate. Generated packages connect agents to Studio MCP and the bundled telemetry server; they do not create a new WordPress backend service for each agent surface.

## Design principles for maintainers

- **One canonical skill source.** Change shared WordPress behavior in `skills/**` before touching surface-specific generated text.
- **Native surface shape over universal shape.** Each `plugins/<surface>/` output uses the extension point the target agent actually supports: rules, skills, manifests, MCP snippets, prompts, commands, package metadata, or setup notes.
- **Generated artifacts are reviewed but not hand-authored.** Update generator templates and verification expectations, run `pnpm build`, then inspect the generated diff.
- **Studio MCP first.** Generated instructions prefer the `studio mcp` server for site operations and use the Studio CLI fallback paths documented in the shared Studio skill when MCP is not available.
- **Fail with actionable verification.** `pnpm verify` should identify missing generated files, stale copied skills, malformed configs, or missing telemetry wiring before a package is published or exported.

## Related docs

- [Generated outputs](generated-outputs.md)
- [Skills and integrations](skills-and-integrations.md)
- [Contributor workflows](contributor-workflows.md)
