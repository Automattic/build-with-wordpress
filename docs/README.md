# Build with WordPress developer docs

Build with WordPress is the source repository for WordPress-focused agent skills, Studio MCP configuration, telemetry wiring, and generated agent packages. The root [`README.md`](../README.md) is the product entry point; this docs set is the developer-facing reference for maintaining the repository and its generated outputs.

## Documentation map

- [Architecture](architecture.md) — repository purpose, package layout, generator boundaries, and runtime data flow.
- [Generated outputs](generated-outputs.md) — generated plugin and workspace artifact contracts for each supported agent surface.
- [Skills and integrations](skills-and-integrations.md) — shared skill contracts, WordPress Studio MCP integration, telemetry MCP integration, and skill packaging behavior.
- [Contributor workflows](contributor-workflows.md) — setup, build, verification, Cursor export, Docs Agent and Skills Agent workflows, and review expectations.

## Source of truth

- Shared agent guidance lives in [`skills/`](../skills/).
- Generated agent packages live in [`plugins/`](../plugins/) and are rebuilt by [`scripts/build-plugins.mjs`](../scripts/build-plugins.mjs).
- The telemetry MCP source lives in [`scripts/wordpress-telemetry-mcp.mjs`](../scripts/wordpress-telemetry-mcp.mjs) and is bundled to `dist/wordpress-telemetry-mcp.mjs` by [`scripts/build-telemetry-mcp.mjs`](../scripts/build-telemetry-mcp.mjs).
- Verification lives in [`scripts/verify-plugins.mjs`](../scripts/verify-plugins.mjs).

Run the same commands CI expects before proposing changes:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm verify
```
