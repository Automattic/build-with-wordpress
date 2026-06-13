# Contributor Workflows

This guide describes how to change Build with WordPress safely. The repository is a generator-backed documentation and package source: contributors usually edit `skills/**`, `scripts/**`, or docs, then regenerate and verify `plugins/**` before review.

Source evidence: `README.md`, `package.json`, `scripts/build-plugins.mjs`, `scripts/build-telemetry-mcp.mjs`, `scripts/verify-plugins.mjs`, `scripts/export-cursor-plugin.mjs`, `.github/workflows/skills-agent.yml`, `.github/workflows/developer-docs-agent.yml`, and generated `plugins/**` README files.

## Local setup

Use the package manager declared in `package.json`:

```bash
pnpm install
```

The project is private and uses Node scripts with dependencies on `@modelcontextprotocol/sdk`, `esbuild`, and `zod`. The lockfiles in the repository should stay in sync with `package.json`.

## Standard change loop

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm verify
```

Recommended review flow:

1. Edit the canonical source: shared skill files in `skills/**`, generator templates in `scripts/build-plugins.mjs`, telemetry source in `scripts/wordpress-telemetry-mcp.mjs`, verification logic in `scripts/verify-plugins.mjs`, or docs in `docs/**`.
2. Run `pnpm build` to rebuild the telemetry MCP artifact and generated plugin outputs.
3. Run `pnpm verify` to confirm generated artifacts match the repository contract.
4. Inspect the generated diff, especially `plugins/**` files for every affected surface.
5. Manually smoke-test at least one representative generated package when changing user-facing agent instructions, MCP config, or skill routing.

## Common tasks

### Update shared WordPress guidance

1. Edit the relevant `skills/<skill-name>/` files.
2. Run `pnpm build` so generated packages receive the updated skill copy.
3. Run `pnpm verify` so stale or missing skill copies are caught.
4. Inspect `plugins/**` diffs to confirm each surface either received the skill update or uses its documented custom skill destination.

Use `wordpress-creator` for cross-workflow routing changes. Use narrower skills for implementation details tied to site creation, themes, blocks, plugins, design previews, Studio operation, or audits.

### Add a new skill

1. Add `skills/<new-skill>/SKILL.md` and any supporting files.
2. Update generator instructions if agents should mention the skill explicitly in README, rules, prompts, commands, or manifests.
3. Update `scripts/verify-plugins.mjs` if it checks an explicit skill list or a target-specific skill destination.
4. Run `pnpm build` and `pnpm verify`.
5. Confirm every generated package either includes the new skill or has an intentional surface-specific exception documented in its README.

### Add or revise an agent surface

1. Add or change a target in `scripts/build-plugins.mjs`.
2. Choose the native output shape for that surface: copied skills, rules, prompts, commands, package manifest, MCP config, setup-only README, or another documented extension point.
3. Prefer shared helpers for MCP configuration. Keep `wordpress-studio` mapped to `studio mcp` and include `wordpress-telemetry` when the surface supports project-local MCP.
4. Add or update verification rules in `scripts/verify-plugins.mjs`.
5. Run `pnpm build` and `pnpm verify`.
6. Inspect the new `plugins/<surface>/README.md` or setup notes to confirm users know how to install, copy, or enable the output.

### Change telemetry MCP behavior

1. Edit `scripts/wordpress-telemetry-mcp.mjs`.
2. Run `pnpm build:telemetry-mcp` to rebuild `dist/wordpress-telemetry-mcp.mjs` when you only need the telemetry artifact, or run `pnpm build` to regenerate all plugin packages.
3. Run `pnpm verify` to confirm generated telemetry bootstrap entries remain valid.
4. Inspect MCP-capable outputs for the `wordpress-telemetry` server entry.

### Export Cursor output

Cursor has a standalone publishable plugin repository. Keep this repository as the source of truth:

```bash
pnpm build
pnpm verify
pnpm export:cursor
```

For validation without pushing:

```bash
pnpm export:cursor -- --dry-run
```

The export script splits `plugins/cursor` and pushes the result to `Automattic/wordpress-cursor-plugin` on `sync/from-build-with-wordpress`. Open or update the standalone repository PR from that branch.

## Manual smoke tests

After generator or skill changes, test at least one output that matches the changed contract:

- For MCP-capable outputs, confirm both `wordpress-studio` and `wordpress-telemetry` appear where the target agent expects MCP servers.
- Ask the agent to create or update a WordPress site and confirm it starts with `wordpress-creator` or the correct narrower skill.
- Confirm Studio MCP is preferred for site management, screenshots, block validation, performance checks, and `wp_cli` operations.
- Confirm the generated package README tells users how to install, copy, or enable the output.
- For setup-only surfaces, confirm the README accurately explains what the surface does and does not support.

Representative WordPress task prompts from the root README include creating a new site, building or editing a theme, creating a custom block, creating a custom plugin, and running performance, accessibility, or frontend audits.

## Automation workflows

- `.github/workflows/skills-agent.yml` runs the skills maintenance lane. Use it for source-guided changes to skills and generated packages.
- `.github/workflows/developer-docs-agent.yml` runs the developer documentation lane. Bootstrap runs create or improve the docs structure; maintenance runs make focused updates for source changes.

Both automation paths should preserve the same source-of-truth model: update canonical source, regenerate generated artifacts when needed, verify, then review the diff.

## Review checklist

Before opening a pull request, confirm:

- `pnpm build` has been run after changes to `skills/**`, telemetry source, or generator templates.
- `pnpm verify` passes.
- Generated output diffs are intentional and limited to affected surfaces.
- MCP-capable outputs still connect `wordpress-studio` to `studio mcp`.
- Telemetry-capable outputs still include `wordpress-telemetry` with generated Node bootstrap arguments.
- Setup-only outputs accurately explain their installation and MCP constraints.
- Root README and `docs/README.md` remain accurate entry points for developer documentation.

## Related docs

- [Architecture](architecture.md)
- [Generated outputs](generated-outputs.md)
- [Skills and integrations](skills-and-integrations.md)
