# Contributor Workflows

This page describes the day-to-day workflows for maintainers changing Build with WordPress. Use it with the [Architecture](architecture.md) and [Generated outputs](generated-outputs.md) references when preparing a pull request.

## Prerequisites

- Node.js compatible with the repository's scripts. The telemetry bundle targets Node 18.
- `pnpm` 10.8.1, as declared by `package.json`.
- WordPress Studio installed when manually testing generated packages that launch `studio mcp` or use the Studio CLI.
- Git access to `Automattic/wordpress-cursor-plugin` only when running the Cursor export workflow.

Install dependencies:

```bash
pnpm install
```

CI-parity install:

```bash
pnpm install --frozen-lockfile
```

## Core commands

| Command | Source | Purpose |
| --- | --- | --- |
| `pnpm build` | `package.json` | Bundles telemetry MCP and regenerates all plugin packages. |
| `pnpm build:telemetry-mcp` | `package.json` | Rebuilds only `dist/wordpress-telemetry-mcp.mjs`. |
| `pnpm verify` | `package.json` | Runs generated-output verification across plugin packages. |
| `pnpm export:cursor` | `package.json` | Exports `plugins/cursor/` to the standalone Cursor plugin repository branch. |

## Standard change workflow

1. Identify the source boundary for the change:
   - portable WordPress behavior: `skills/`;
   - generated package layout or manifest logic: `scripts/build-plugins.mjs`;
   - generated-output test contract: `scripts/verify-plugins.mjs`;
   - telemetry MCP behavior: `scripts/wordpress-telemetry-mcp.mjs` and possibly `scripts/build-telemetry-mcp.mjs`.
2. Make the source change.
3. Run `pnpm build`.
4. Run `pnpm verify`.
5. Inspect generated package diffs under `plugins/`.
6. Update documentation when the architecture, public generated files, setup workflow, or integration contract changes.

Avoid editing generated packages as the only source of a change. If a file under `plugins/` should change, update the generator or skill source that writes it.

## Change recipes

### Update WordPress workflow guidance

1. Edit the relevant skill in `skills/`.
2. If the skill appears in a new location or requires new metadata, update `scripts/build-plugins.mjs`.
3. Run:

   ```bash
   pnpm build
   pnpm verify
   ```

4. Spot-check representative generated skill copies in plugin outputs.

### Update MCP server configuration

1. Update the MCP generation logic in `scripts/build-plugins.mjs`.
2. Update `scripts/verify-plugins.mjs` so it fails on the old or invalid config shape.
3. Run `pnpm build && pnpm verify`.
4. Manually smoke test at least one MCP-enabled generated surface if the command, args, or server names changed.

Expected MCP server names are:

- `wordpress-studio`
- `wordpress-telemetry`

### Update telemetry behavior

1. Edit `scripts/wordpress-telemetry-mcp.mjs`.
2. Keep the tool name `record_workflow_event` stable unless you also update every generated instruction and verification contract that refers to it.
3. Run:

   ```bash
   pnpm build:telemetry-mcp
   pnpm build
   pnpm verify
   ```

4. Confirm telemetry remains non-blocking and respects `WP_SITE_CREATOR_NO_TELEMETRY=1`.

### Add a generated agent surface

1. Add generator support in `scripts/build-plugins.mjs`.
2. Add a generated output directory under `plugins/<surface>/` through the build.
3. Include skills when the surface supports them.
4. Include `wordpress-studio` and `wordpress-telemetry` MCP setup when the surface supports MCP.
5. Add a verifier function in `scripts/verify-plugins.mjs` for the files users or marketplaces consume.
6. Add the surface to the package matrix in `README.md` and [Generated outputs](generated-outputs.md).
7. Run `pnpm build && pnpm verify`.

### Export Cursor output

Cursor output has an additional publishing workflow because Cursor consumes a standalone plugin repository.

```bash
pnpm build
pnpm verify
pnpm export:cursor
```

Dry run:

```bash
pnpm export:cursor -- --dry-run
```

The export script pushes a subtree split of `plugins/cursor` to `Automattic/wordpress-cursor-plugin` on `sync/from-build-with-wordpress`. Open or update a pull request from that branch to the standalone repository's `main` branch.

## Manual smoke testing

After verification passes, manually test representative generated output when the change affects runtime behavior:

1. Open or copy a generated `plugins/<surface>/` package into the corresponding agent's expected project root.
2. Confirm the agent sees the WordPress instructions and skills.
3. For MCP-enabled surfaces, confirm `wordpress-studio` and `wordpress-telemetry` are available.
4. Try representative tasks:
   - create a new site;
   - build or edit a theme;
   - create a custom block;
   - create a custom plugin;
   - run a performance, accessibility, or frontend audit.
5. If Studio MCP is unavailable, confirm the generated Studio guidance routes the agent to the Studio CLI fallback path.

## CI and automation

The repository includes GitHub Actions workflows for documentation maintenance and skills maintenance under `.github/workflows/`:

- `developer-docs-agent.yml` runs the technical documentation agent lane for bootstrap and maintenance documentation updates.
- `skills-agent.yml` runs the skills maintenance lane.

Manual documentation bootstrap runs should create or improve the initial documentation structure. Push-triggered merge checks should make the smallest source-grounded documentation update needed for newly merged code or finish with no changes when docs are current.

## Pull request checklist

Before requesting review:

- [ ] Source changes are in `skills/` or `scripts/`, not only in generated output.
- [ ] `pnpm build` has been run when generated output should change.
- [ ] `pnpm verify` passes locally or in CI.
- [ ] Generated package diffs are expected and bounded.
- [ ] Documentation is updated for public contracts, setup commands, generated files, or integration behavior.
- [ ] Cursor export has been run or intentionally not run when `plugins/cursor/` changes.

## Contributor design principles

- Prefer one shared source of WordPress behavior and many native generated package shapes.
- Keep the generated output reviewable by making verifier expectations explicit.
- Preserve stable public names: `wordpress-studio`, `wordpress-telemetry`, `WordPress Studio`, and `record_workflow_event`.
- Keep telemetry non-blocking and opt-out aware.
- Keep Studio runtime ownership separate from this repository's agent-facing packaging responsibilities.

## Related documentation

- [Architecture](architecture.md)
- [Generated outputs](generated-outputs.md)
- [Skills and integrations](skills-and-integrations.md)
