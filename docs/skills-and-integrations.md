# Skills and Integration Contracts

Build with WordPress integrates coding agents with WordPress Studio by packaging shared WordPress guidance into each agent's native surface. This page documents the public contracts contributors should preserve when changing skills or integration output.

## Shared skill contract

The canonical skill source is `skills/`. Each skill directory is expected to contain a `SKILL.md` file because `verify-plugins.mjs` discovers skill directory names and checks generated outputs for copied `SKILL.md` files.

Current shared skill directories:

| Skill | Purpose in generated packages |
| --- | --- |
| `studio` | Teaches agents how to use WordPress Studio and the Studio MCP/CLI boundary. |
| `wordpress-creator` | Routes broad WordPress creation requests to the right implementation path. |
| `site-creator` | Guides site creation workflows. |
| `theme-creator` | Guides theme creation or editing workflows. |
| `block-creator` | Guides custom block creation workflows. |
| `plugin-creator` | Guides custom plugin creation workflows. |
| `design-previews-creator` | Guides generation of multiple design preview directions before building. |
| `auditing` | Guides performance, accessibility, frontend, or implementation audits. |

When adding a skill:

1. Add `skills/<new-skill>/SKILL.md`.
2. Run `pnpm build` so each output receives the new skill where applicable.
3. Run `pnpm verify` so missing copies are caught.
4. Smoke-test at least one MCP-capable output and any output with a custom skill packaging shape.

## Studio integration contract

WordPress Studio is the runtime dependency. Build with WordPress packages agent-facing instructions and settings that use Studio; it does not implement Studio site management itself.

Generated guidance should keep these boundaries clear:

- Use `studio mcp` where an agent supports local MCP configuration.
- Use `wp_cli` through the Studio MCP server as the general-purpose WordPress escape hatch.
- Fall back to Studio CLI guidance when MCP is unavailable or not supported by the target agent surface.
- Do not claim that Build with WordPress owns Studio sites, screenshots, block validation, or other runtime operations.

The read-only `studio` context supports this boundary. In Studio source, `apps/cli/commands/mcp.ts` is the CLI entry point for `studio mcp`, `apps/cli/ai/tools/**` contains AI tool integrations, and `apps/cli/ai/system-prompt.ts` provides Studio's own agent-facing runtime guidance. Build with WordPress should consume those behaviors through generated guidance rather than duplicating them.

## MCP server contracts

### `wordpress-studio`

Where local MCP configuration is supported, generated outputs should expose a `wordpress-studio` server entry that launches Studio's MCP server. The common command is:

```json
{
  "command": "studio",
  "args": ["mcp"]
}
```

Some agents require different wrappers or command-array syntax. For example, `verify-plugins.mjs` has a dedicated OpenCode check requiring local MCP entries and a command array that joins to `studio mcp`.

### `wordpress-telemetry`

Telemetry-capable outputs include a second local MCP server, `wordpress-telemetry`, pointing at the generated telemetry server script copied into the output. The representative shape is:

```json
{
  "command": "node",
  "args": ["./scripts/wordpress-telemetry-mcp.mjs"]
}
```

The repository bundles this script so Build with WordPress workflow events do not depend on Studio shipping telemetry support.

## Compatibility boundaries

Not every agent supports the same integration primitives. Source-grounded compatibility decisions should be captured in generated README files and verifier coverage.

Examples from recent accepted PRs:

- **Pi:** PR #39 added a Pi package with `pi-package` metadata and `pi.skills`, but no generated MCP or telemetry MCP files because Pi does not include built-in MCP support.
- **Qodo:** PR #43 uses `AGENTS.md`, shared skills, and telemetry files, while documenting MCP setup through Qodo Agentic Tools or enterprise allow-lists rather than automatic repo-local `.mcp.json` discovery.
- **Conductor:** PR #44 generates `.conductor/settings.toml` and setup notes, while keeping MCP setup in Conductor app/provider settings and underlying agent configs.
- **Zed:** PR #35 uses project instructions, project-local skills, and `context_servers`; it does not generate a Zed extension.
- **Cline:** PR #38 generates workspace rules, shared skills, and MCP settings while avoiding unsupported extension marketplace claims.

## Skill packaging context

The read-only `wordpress-agent-skills` context is useful evidence for packaging decisions. Its `docs/packaging.md` and `skills/**` tree describe the broader WordPress Agent Skills packaging model. Build with WordPress should stay compatible with the skill package conventions that target agents actually support, but the generated output layout remains repository-specific and is enforced by `scripts/build-plugins.mjs` plus `scripts/verify-plugins.mjs`.

## Common integration examples

### Add a new shared behavior

Use this path when the behavior should apply across surfaces:

1. Update or add `skills/<skill-name>/SKILL.md`.
2. If the behavior needs an agent-specific command, rule, prompt, or manifest field, update the relevant builder in `scripts/build-plugins.mjs`.
3. Add verifier assertions if the generated shape changes.
4. Run `pnpm build && pnpm verify`.
5. Smoke-test representative outputs.

### Add a new agent surface

Use this path when supporting a new coding agent:

1. Research official docs for project instructions, skills, MCP, commands, hooks, package manifests, and marketplace/listing support.
2. Decide whether the output is a package, project-local config, setup guidance, or unsupported.
3. Add generator functions for the target output under `scripts/build-plugins.mjs`.
4. Copy shared skills unless the target has a different official skill loading contract.
5. Configure `wordpress-studio` and `wordpress-telemetry` only where supported.
6. Add `verify-plugins.mjs` coverage for the exact output shape and any intentional absences.
7. Update the README output table and this documentation if the architecture changes.
8. Run `pnpm build && pnpm verify`.

### Update Studio runtime assumptions

Use the `studio` context as evidence before changing Studio-related guidance. If Studio changes the CLI command, MCP tool names, or runtime behavior, update the shared `studio` skill and regenerate outputs. Do not hard-code unverified Studio behavior in a generated output for just one surface unless that surface requires a different configuration wrapper.

## Failure modes and maintenance notes

- **Generated output drift:** If `plugins/**` does not match `skills/` or generator code, rerun `pnpm build` and commit the generated diff.
- **Missing skill copies:** `pnpm verify` fails when an output expected to copy shared skills is missing `SKILL.md` files.
- **MCP wrapper mismatch:** Different agents use different wrappers (`mcpServers`, `servers`, VS Code settings, OpenCode schema). Update the surface-specific generator and verifier together.
- **Unsupported feature claims:** If official docs do not describe marketplace publishing, repo-local MCP, or extension packaging, document the limitation instead of generating speculative files.
- **Cursor publication drift:** Cursor consumers use the standalone repo; export from `plugins/cursor/` after build and verification.
