# Contributor workflows

This page describes the day-to-day workflows for maintainers changing Build with WordPress source inputs, generated packages, and documentation.

## Local setup

Install with the package manager declared in `package.json`:

```bash
pnpm install --frozen-lockfile
```

The repository scripts are:

| Command | Purpose |
| --- | --- |
| `pnpm build` | Bundle telemetry MCP and regenerate every package in `plugins/`. |
| `pnpm build:telemetry-mcp` | Bundle only the telemetry MCP server. |
| `pnpm verify` | Run generated-output contract checks. |
| `pnpm export:cursor` | Export `plugins/cursor/` to the standalone Cursor plugin repository branch. |

## Standard change workflow

1. Make the source change in `skills/`, `scripts/`, workflow configuration, or docs.
2. Run `pnpm build` when the change can affect generated output.
3. Run `pnpm verify`.
4. Review generated diffs under `plugins/` alongside source diffs.
5. Update docs when a command, package layout, generated contract, Studio integration behavior, or contributor workflow changes.

## Editing shared skills

Use this workflow for WordPress guidance changes:

1. Edit the relevant top-level skill in `skills/`.
2. If a new top-level skill is added, confirm the generator should include it for all surfaces that copy shared skills.
3. Run `pnpm build` so generated packages receive the updated skill content and skill lists.
4. Run `pnpm verify` to catch missing copies or stale readmes.
5. Review the generated copies in `plugins/**` for expected adaptation.

The scheduled `Build With WordPress Skills Agent` workflow can maintain live skills. It uses writable paths for `skills/**`, generated skill copies, and generated plugin README files.

## Changing an agent package

Use this workflow when adding or changing a surface under `plugins/`:

1. Edit `scripts/build-plugins.mjs`, not the generated package by hand.
2. Use the target agent's native extension point: MCP config, settings, rules, prompts, commands, marketplace metadata, `AGENTS.md`, skill folders, or README setup notes.
3. Add or update assertions in `scripts/verify-plugins.mjs` for every file or behavior the package depends on.
4. Run `pnpm build`.
5. Run `pnpm verify`.
6. Update [Generated output contracts](generated-outputs.md) and the root README when the public output matrix changes.

## Changing telemetry MCP

Use this workflow when editing `scripts/wordpress-telemetry-mcp.mjs`:

1. Edit telemetry source.
2. Run `pnpm build:telemetry-mcp` for a focused rebuild, or `pnpm build` when generated packages must also be refreshed.
3. Run `pnpm verify` if generated package wiring or embedded telemetry output changed.
4. Document any schema, tool, or event contract changes in [Skills and integrations](skills-and-integrations.md) or a dedicated future telemetry reference.

## Cursor publishing workflow

Cursor output has a special publishing path because Cursor requires a standalone plugin repository.

```bash
pnpm build
pnpm verify
pnpm export:cursor
```

The export script defaults to:

- source prefix: `plugins/cursor`
- remote: `https://github.com/Automattic/wordpress-cursor-plugin.git`
- branch: `sync/from-build-with-wordpress`

Use a dry run when validating the split without pushing:

```bash
pnpm export:cursor -- --dry-run
```

After export, open or update the pull request from the sync branch into the standalone Cursor repository's `main` branch.

## Automated docs and skills maintenance

Two workflows use `Automattic/docs-agent`:

| Workflow | Trigger | Purpose | Writable paths |
| --- | --- | --- | --- |
| `Build With WordPress Developer Docs Agent` | Manual dispatch and pushes to `trunk` | Bootstrap or maintain technical developer docs. Manual runs use bootstrap mode; push runs use maintenance mode. | `README.md`, `docs/**`, `plugins/**/README.md` |
| `Build With WordPress Skills Agent` | Manual dispatch and weekly schedule | Maintain live skills and generated skill-package docs. | `skills/**`, `plugins/**/skills/**`, `plugins/**/README.md` |

Both workflows declare the same verification commands: `pnpm install --frozen-lockfile`, `pnpm build`, and `pnpm verify`. They also declare a drift check that expects generated package output to be committed after the build.

## Pull request checklist

Before requesting review, confirm:

- [ ] Source changes are in the canonical source location, not only in generated output.
- [ ] `pnpm build` has been run when generated output can change.
- [ ] `pnpm verify` passes locally or in CI.
- [ ] Generated `plugins/**` diffs are expected and reviewable.
- [ ] New generated package responsibilities have verifier coverage.
- [ ] Studio integration claims are grounded in the current Studio MCP/CLI behavior.
- [ ] Cursor export has been run or explicitly deferred when Cursor output changed.
- [ ] Developer docs and generated package README files reflect any public contract changes.

## Future coverage

The initial bootstrap docs intentionally focus on repository architecture, generated outputs, integration boundaries, and contributor workflows. Future docs should cover these deferred items when source changes make the details stable enough or a maintainer needs the reference:

- **Telemetry MCP reference:** needs a source-level inventory of `scripts/wordpress-telemetry-mcp.mjs` tools, request schemas, and failure behavior.
- **Per-surface verifier reference:** `scripts/verify-plugins.mjs` is large and contains many surface-specific assertions; a future page should map each assertion group to generated files.
- **Per-skill implementation reference:** each `skills/<name>/` directory deserves a focused page with triggers, required inputs, and examples.
- **Context evidence drift notes:** when `studio` or `wordpress-agent-skills` changes, docs should record accepted integration decisions that affect Build with WordPress packaging.
