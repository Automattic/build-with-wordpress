# Architecture

Build with WordPress is a source-and-generator repository for WordPress-focused coding-agent integrations. It keeps the shared WordPress agent guidance in one place, then adapts that guidance into the native files expected by each supported agent surface.

## Source inventory

| Area | Path | Responsibility | Evidence |
| --- | --- | --- | --- |
| Adoption README | `README.md` | Product framing, supported surfaces, common commands, Cursor export workflow, smoke-test expectations. | The README describes Build with WordPress as the canonical source for WordPress-focused agent skills, MCP setup, and generated packages. |
| Package scripts | `package.json` | Defines the supported local workflow: install dependencies, build generated artifacts, rebuild telemetry, export Cursor, and verify outputs. | `scripts.build`, `scripts.build:telemetry-mcp`, `scripts.export:cursor`, and `scripts.verify`. |
| Shared skill source | `skills/` | Canonical agent skill source copied or adapted into generated outputs. | Skill directories currently include `auditing`, `block-creator`, `design-previews-creator`, `plugin-creator`, `site-creator`, `studio`, `theme-creator`, and `wordpress-creator`. |
| Plugin generator | `scripts/build-plugins.mjs` | Converts shared skills, MCP snippets, telemetry server files, manifests, README files, rules, commands, prompts, hooks, and agent settings into `plugins/**`. | Generator constants include `pluginName = "wordpress-studio"`, `pluginDisplayName = "WordPress Studio"`, `sharedSkillsSourceDir`, `telemetryMcpServerDistPath`, and `pluginTargets`. |
| Telemetry bundler | `scripts/build-telemetry-mcp.mjs` | Builds the plugin-local telemetry MCP server used by generated outputs. | `package.json` runs it before `scripts/build-plugins.mjs`; README documents `pnpm build:telemetry-mcp`. |
| Telemetry server source | `scripts/wordpress-telemetry-mcp.mjs` | Source for the bundled `dist/wordpress-telemetry-mcp.mjs` copied into surfaces that support local MCP. | README describes plugin-local telemetry MCP so workflow events do not depend on Studio shipping telemetry support. |
| Output verifier | `scripts/verify-plugins.mjs` | Asserts generated files, shared skill copies, MCP entries, telemetry script presence, and surface-specific compatibility boundaries. | Verification helpers include `verifySharedSkillSet`, `verifyMcpConfig`, `verifyOpenCodeMcpConfig`, and `verifyTelemetryScript`. |
| Generated outputs | `plugins/**` | Reviewable generated artifacts for each supported coding-agent surface. | README table lists Aider, Amp, Claude Code, Cline, Codex, Conductor, Continue, Cursor, Devin CLI, Factory Droid, Gemini, GitHub Copilot, Junie, Kilo Code, OpenCode, Pi, Qodo, Roo Code, Windsurf/Cascade, and Zed. |
| Cursor publishing | `scripts/export-cursor-plugin.mjs`, `plugins/cursor/` | Splits the generated Cursor output into the standalone `Automattic/wordpress-cursor-plugin` repository. | README documents `pnpm export:cursor` and `-- --dry-run`; PRs #17, #18, and #19 record the standalone repository and subtree workflow. |

## Core concepts

### Shared skills

The repository-native source of behavior is `skills/`. Generated outputs should not invent independent WordPress guidance. Instead, each output either copies the skill tree directly or translates the same behavior into that agent's supported instruction, rule, prompt, command, or package surface.

The current skill set covers:

- WordPress Studio usage (`studio`)
- broad WordPress creation routing (`wordpress-creator`)
- site creation (`site-creator`)
- theme creation (`theme-creator`)
- block creation (`block-creator`)
- plugin creation (`plugin-creator`)
- design preview creation (`design-previews-creator`)
- audits (`auditing`)

### Studio MCP as the runtime boundary

Build with WordPress does not own WordPress sites or the Studio runtime. It teaches agents to use WordPress Studio. The generated integrations prefer the Studio MCP server for site management, screenshots, block validation, and related site operations, then fall back to Studio CLI guidance where MCP is unavailable. The README describes `wp_cli` through MCP as the general-purpose WordPress escape hatch.

This boundary matters when adding output support: repository-local package files can configure an agent, but they should not duplicate Studio functionality or claim support for runtime features that belong to Studio.

### Generated output contract

`plugins/**` is a generated artifact surface. Maintainers update source skills or generator functions, run `pnpm build`, and review regenerated output. `pnpm verify` is the contract that the generated tree still matches the expected shape.

The generator uses surface-specific builders rather than one generic package format because each agent has different extension points:

- manifest-based plugin packages for surfaces such as Codex, Claude Code, Cursor, Factory Droid, and Pi
- repository-local instructions, rules, skills, MCP settings, commands, hooks, prompts, or agent profiles for other surfaces
- compatibility-only setup notes where the official surface does not support repository-local MCP or marketplace packaging

### Telemetry MCP boundary

The generated outputs that support local MCP can include a plugin-local `wordpress-telemetry` server in addition to `wordpress-studio`. Verification checks for `scripts/wordpress-telemetry-mcp.mjs` in relevant outputs. This keeps workflow event wiring available even when Studio itself does not provide telemetry support.

### Verification as architecture enforcement

`verify-plugins.mjs` is not just a smoke test. It documents and enforces expected output contracts, including:

- every generated skill copy includes `SKILL.md`
- MCP wrappers use the expected object shape for a given surface
- `wordpress-studio` and `wordpress-telemetry` MCP entries exist where supported
- surface-specific manifests point at the correct skills and MCP config paths
- compatibility boundaries are preserved, such as Pi not generating MCP files and Qodo documenting Agentic Tools / enterprise MCP setup instead of automatic `.mcp.json` discovery

## Module flow

```text
skills/*/SKILL.md
        │
        ├── scripts/build-telemetry-mcp.mjs
        │       └── dist/wordpress-telemetry-mcp.mjs
        │
        └── scripts/build-plugins.mjs
                ├── reads shared skill names
                ├── creates surface-specific configs and docs
                ├── copies shared skills into each supported output
                ├── copies telemetry MCP server where supported
                └── writes plugins/** generated artifacts

scripts/verify-plugins.mjs
        └── checks plugins/** output shape, MCP entries, skills, manifests, docs, and compatibility boundaries
```

## Design principles for contributors

1. **Keep `skills/` canonical.** Generated copies should be rebuilt, not manually forked.
2. **Prefer native agent surfaces.** Use each agent's documented package, rule, prompt, MCP, or instruction convention instead of forcing one universal format.
3. **Document unsupported boundaries.** If an agent does not support repo-local MCP, marketplace packaging, or extension publishing, the generated output should say so and verification should protect that decision.
4. **Build then verify.** Any generator, skill, or output change should be accompanied by `pnpm build` and `pnpm verify`.
5. **Treat `plugins/**` as generated but reviewable.** Commit generated output changes so consumers can inspect and use the artifacts directly.
6. **Do not duplicate Studio.** Studio owns sites, the Studio CLI, and `studio mcp`; this repository owns agent-facing packaging and guidance around those capabilities.

## Recent decision evidence

Open issue #45 classifies generated outputs by official marketplace or listing status. It records that Claude Code and Codex/ChatGPT are already listed, Cursor is submitted through the standalone repository, Factory Droid needs submission, and several outputs require marketplace research or are project-local only.

Recently merged PRs document accepted output-shape decisions:

- #46 reframed the README as the canonical source for WordPress agent skills and generated packages.
- #44 added Conductor while preserving the boundary that MCP setup remains in Conductor app/provider settings and underlying agent configs.
- #43 added Qodo with `AGENTS.md`, shared skills, telemetry, and documented manual MCP setup through Qodo Agentic Tools / enterprise allow-lists.
- #42 added Devin CLI with project config, rules, skills, and MCP surfaces.
- #41 added Factory Droid marketplace/plugin/command/Droid/hooks/MCP/skills output.
- #40 added Kilo Code native config, rules, skills, agents, and MCP coverage.
- #39 added Pi package output and explicitly avoided MCP/telemetry MCP files because Pi does not expose built-in MCP support.
- #38 added Cline with workspace rules, shared skills, and MCP settings while avoiding unsupported extension marketplace claims.
- #37 added Junie with `.junie/` guidelines, skills, and MCP config.
- #36 added Amp with project-local instructions, skills, MCP settings, and a project plugin command.
- #35 added Zed with project instructions, skills, and MCP settings without generating a Zed extension.
