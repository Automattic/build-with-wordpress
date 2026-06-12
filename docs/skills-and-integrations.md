# Skills and integrations

Build with WordPress packages WordPress workflow guidance for multiple coding agents. This page explains the integration contracts that maintainers should preserve when changing skills or generator behavior.

## Adoption path for maintainers

Start here when making a change:

1. Identify whether the behavior belongs in shared skill source, generated package wiring, telemetry, or documentation.
2. If the behavior is WordPress workflow guidance, edit `skills/` first.
3. If the behavior is surface-specific packaging, edit `scripts/build-plugins.mjs` and add verifier coverage.
4. If the behavior is a runtime event emitted through telemetry MCP, edit `scripts/wordpress-telemetry-mcp.mjs`, rebuild telemetry, and update generated packages.
5. Run `pnpm build` and `pnpm verify` before reviewing the diff.

## Skill package contract

The repository's skill package is directory-based. Each top-level directory under `skills/` is a named skill that can be copied into agent-native skill locations.

| Skill | Purpose in the package |
| --- | --- |
| `wordpress-creator` | Top-level router for WordPress creation work. |
| `site-creator` | Creates full WordPress sites. |
| `theme-creator` | Builds or edits WordPress themes, including block-theme workflows. |
| `design-previews-creator` | Produces multiple design preview directions before implementation. |
| `block-creator` | Creates custom blocks. |
| `plugin-creator` | Creates custom plugins. |
| `auditing` | Runs or guides performance, accessibility, and frontend audits. |
| `studio` | Fallback Studio CLI guidance and Studio-specific operations when MCP is unavailable. |

The generator discovers skill names from `skills/`, so adding or removing a top-level skill changes generated readmes, instructions, and copied skill sets.

## WordPress Studio integration

WordPress Studio is the runtime dependency for site operations. Build with WordPress generated packages should teach agents to:

- prefer the Studio MCP server when the surface supports MCP;
- use the `studio` skill as a fallback when MCP is not configured;
- use `wp_cli` through Studio MCP for WordPress operations that are not covered by a higher-level tool;
- validate blocks, inspect screenshots, and run audits through Studio-backed capabilities where available.

The developer-docs and skills-agent workflows use the read-only `studio` context alias as evidence for Studio MCP tools, the Studio system prompt, and the Studio MCP command implementation. Keep generated package claims aligned with that context when Studio changes.

## WordPress agent skills context

The workflow also provides the read-only `wordpress-agent-skills` alias. Treat it as evidence for portable skill packaging conventions and related maintenance workflows. This repository remains the write boundary and source of truth for Build with WordPress-specific skills and generated package outputs.

## MCP integration behavior

Generated packages use MCP differently depending on each agent's capabilities:

- surfaces with repository-local MCP config receive a config file that exposes `wordpress-studio` and often `wordpress-telemetry`;
- surfaces with app-level MCP setup receive README or setup guidance instead of unsupported config files;
- surfaces without built-in MCP support still receive skills and setup instructions, but must not imply automatic MCP registration.

When changing MCP behavior, update both generation and verification. The verifier should assert the expected file path and config shape for the affected surface.

## Telemetry MCP behavior

The telemetry MCP server is local to this repository's generated packages. It is bundled from `scripts/wordpress-telemetry-mcp.mjs` into `dist/wordpress-telemetry-mcp.mjs` and embedded or referenced by generated packages as needed.

Maintainers should preserve these boundaries:

- telemetry is agent-package support code, not the Studio runtime;
- telemetry source changes require `pnpm build:telemetry-mcp` or the full `pnpm build`;
- generated packages that include telemetry command wiring must be verified by `scripts/verify-plugins.mjs`;
- telemetry schema or tool changes should be documented here or in a future telemetry reference page.

## Integration failure modes

Common failure modes and where to fix them:

| Symptom | Likely boundary | Fix |
| --- | --- | --- |
| A generated package is missing a skill | Build copy contract | Check `skills/`, `copySkillSet()`, target skill directory, and `verifySharedSkillSet()`. |
| MCP servers are unavailable in an agent | Surface packaging or user setup | Confirm the surface supports repository-local MCP config; otherwise update README setup guidance. |
| A generated README lists stale skills | Skill discovery or generated README builder | Rebuild with `pnpm build`; if stale after rebuild, update the relevant README builder. |
| Cursor package is current here but not in the standalone repo | Export workflow | Run `pnpm export:cursor` after build and verification, then open/update the standalone plugin PR. |
| Verification passes but a new generated file is wrong | Missing verifier coverage | Add a focused assertion to `scripts/verify-plugins.mjs`. |

## Design principles for contributors

- Prefer one shared WordPress behavior source and adapt it per agent at build time.
- Use each agent surface's native extension points rather than inventing a universal package layout.
- Treat generated files as reviewable artifacts, not primary source.
- Add verification for every generated contract that a user or marketplace depends on.
- Be explicit when a surface has setup-only behavior because it lacks repository-local MCP or skill support.
- Keep Studio-owned runtime behavior separate from Build with WordPress-owned packaging behavior.
