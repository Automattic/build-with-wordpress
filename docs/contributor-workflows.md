# Contributor workflows

Use this guide when changing skills, generator code, generated outputs, workflows, or developer documentation.

## Local setup

Install dependencies with the pinned package manager from `package.json`:

```bash
pnpm install --frozen-lockfile
```

The main commands are:

| Command | Runs | Use when |
| --- | --- | --- |
| `pnpm build` | `node scripts/build-telemetry-mcp.mjs && node scripts/build-plugins.mjs` | Skills, telemetry, generator templates, manifests, or generated output contracts changed. |
| `pnpm build:telemetry-mcp` | `node scripts/build-telemetry-mcp.mjs` | Only the telemetry MCP bundle needs to be refreshed. |
| `pnpm verify` | `node scripts/verify-plugins.mjs` | Before every PR that affects skills, generator code, generated output files, or package metadata. |
| `pnpm export:cursor` | `node scripts/export-cursor-plugin.mjs` | Export the generated Cursor output to the standalone Cursor plugin repository. |

CI and the Docs Agent workflow expect:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm verify
git diff --exit-code
```

The final diff check matters because `plugins/` is committed. If `pnpm build` changes generated files, commit them with the source change.

## Changing shared skills

1. Edit the canonical skill in `skills/<skill>/SKILL.md`.
2. Keep frontmatter accurate (`name`, `description`) because package consumers load skills by those fields and directory names.
3. Keep cross-skill ownership clear. Broad routing belongs in `wordpress-creator`; Studio MCP mechanics belong in `studio`; specialist skills own their implementation workflows.
4. Run `pnpm build` to copy the updated skill into every generated output.
5. Run `pnpm verify` to confirm all expected skill copies and output-specific checks pass.
6. Review the generated `plugins/**/skills/**/SKILL.md` diff for accidental formatting or content drift.

## Changing generated output contracts

1. Update `scripts/build-plugins.mjs` first.
2. Add or update verification in `scripts/verify-plugins.mjs` for every new required file, manifest field, MCP config shape, README phrase, skill location, or marketplace contract.
3. Run `pnpm build`.
4. Run `pnpm verify`.
5. Confirm no generated output contains a copied `scripts/wordpress-telemetry-mcp.mjs` bundle; MCP configs should embed the shared `dist/wordpress-telemetry-mcp.mjs` bootstrap instead.
6. Document user-facing or developer-facing contract changes in `README.md`, `docs/`, or a relevant `plugins/**/README.md` template.

Generated READMEs under `plugins/` are produced by the generator. Change their template functions in `scripts/build-plugins.mjs`, then rebuild.

## Changing telemetry behavior

1. Edit `scripts/wordpress-telemetry-mcp.mjs`.
2. Preserve the non-blocking behavior: network failures must not break agent workflows.
3. Preserve the opt-out contract: `WP_SITE_CREATOR_NO_TELEMETRY=1` skips the pixel request.
4. Run `pnpm build:telemetry-mcp` or `pnpm build` to refresh `dist/wordpress-telemetry-mcp.mjs`.
5. Run `pnpm build` if generated MCP bootstrap payloads must be regenerated.
6. Run `pnpm verify`.

## Cursor export workflow

Cursor requires a standalone plugin repository. Build with WordPress remains the source of truth, and `plugins/cursor/` is exported to `Automattic/wordpress-cursor-plugin`.

Normal export:

```bash
pnpm build
pnpm verify
pnpm export:cursor
```

Dry run:

```bash
pnpm export:cursor -- --dry-run
```

`export-cursor-plugin.mjs` requires a clean working tree unless `--dry-run` is used, creates a temporary subtree split branch for `plugins/cursor`, pushes it to `sync/from-build-with-wordpress` on the standalone repository by default, and deletes the local split branch. It also supports `--remote` and `--branch` overrides.

## Workflow automation

### Developer Docs Agent

`.github/workflows/developer-docs-agent.yml` runs on manual dispatch and pushes to `trunk`.

- manual dispatch sets `run_kind` to `bootstrap`
- push events set `run_kind` to `maintenance`
- writable paths are `README.md`, `docs/**`, and `plugins/**/README.md`
- the bootstrap contract requires `README.md`, `docs/README.md`, `docs/architecture.md`, `docs/generated-outputs.md`, `docs/skills-and-integrations.md`, and `docs/contributor-workflows.md`
- the contract also requires the README entry point to link to `docs/README.md`, the docs index to link to the four topic pages, at least five markdown files under `docs/**`, and no configured backlog/deferment phrases

### Skills Agent

`.github/workflows/skills-agent.yml` runs manually and weekly. It writes only to `skills/**`, `plugins/**/skills/**`, and `plugins/**/README.md`, with the same build, verify, and generated-output drift checks as the developer docs lane.

## Documentation maintenance rules

- Keep repository-level developer docs in `docs/` and the root `README.md`.
- Keep plugin-specific contract notes in `plugins/**/README.md` only when a generated output needs local setup or publishing guidance.
- When source behavior changes, update the docs in the same PR.
- When docs change without source changes, verify the documented behavior against `skills/`, `scripts/`, `plugins/`, workflow files, open issues, or context evidence.
- Use the read-only context aliases `studio` and `wordpress-agent-skills` as evidence for integration behavior, but keep Build with WordPress as the only write boundary.
