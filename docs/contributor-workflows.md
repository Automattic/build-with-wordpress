# Contributor workflows

This guide describes how to change Build with WordPress safely. The key rule is: edit source inputs, regenerate outputs, verify, and review the generated diff.

## Local setup

Use the package manager pinned in `package.json`:

```bash
pnpm install
```

For pull requests that need reproducible dependency installation, use:

```bash
pnpm install --frozen-lockfile
```

## Common commands

| Command | Purpose |
| --- | --- |
| `pnpm build` | Bundle telemetry MCP and regenerate all plugin outputs. |
| `pnpm build:telemetry-mcp` | Rebuild only `dist/wordpress-telemetry-mcp.mjs`. |
| `pnpm verify` | Verify generated plugin output contracts. |
| `pnpm export:cursor` | Export `plugins/cursor/` to the standalone Cursor plugin repository branch. |
| `pnpm export:cursor -- --dry-run` | Preview the Cursor export workflow without pushing. |

## Change workflow by source area

### Update shared WordPress behavior

Use this path when changing how agents should handle WordPress site creation, theme work, custom blocks, plugins, audits, Studio MCP fallback, or telemetry milestones.

1. Edit the relevant `skills/<name>/SKILL.md` file.
2. If the routing decision changes, update `skills/wordpress-creator/SKILL.md`.
3. If Studio operations change, update `skills/studio/SKILL.md` and avoid duplicating the same details in specialist skills.
4. Run `pnpm build`.
5. Run `pnpm verify`.
6. Review generated diffs under every `plugins/*` surface that receives copied skills or generated instructions.

### Add a new skill

1. Create `skills/<new-skill>/SKILL.md` with frontmatter `name` and `description`.
2. Define ownership, workflow, and guardrails.
3. Add or update handoffs from existing skills, especially `wordpress-creator` if this is a top-level route.
4. Run `pnpm build` so `scripts/build-plugins.mjs` copies or lists the skill in each output.
5. Run `pnpm verify`.
6. Inspect plugin README and instruction diffs to confirm the skill appears where users need it.

### Update one agent surface

Use this path when a target agent changes its native extension points, config schema, command format, or packaging requirements.

1. Edit the relevant builder functions in `scripts/build-plugins.mjs`.
2. Keep shared WordPress behavior in `skills/` unless the change is truly surface-specific.
3. Preserve the logical MCP contract (`wordpress-studio` and, where supported, `wordpress-telemetry`).
4. Update generator-produced README text in the builder function, not only the generated `plugins/<surface>/README.md` file.
5. Run `pnpm build` and `pnpm verify`.
6. Review the target surface output and check for unintended changes to other surfaces.

### Update telemetry behavior

1. Edit `scripts/wordpress-telemetry-mcp.mjs`.
2. Run `pnpm build:telemetry-mcp` or `pnpm build`.
3. Run `pnpm verify`.
4. Check generated plugin outputs that include `scripts/wordpress-telemetry-mcp.mjs` or inline telemetry bootstrap args.
5. Confirm skills still mention only meaningful milestones.

### Update generated README files

Generated package READMEs under `plugins/*/README.md` are built by `scripts/build-plugins.mjs`. To make a durable README change:

1. Find the corresponding `build<Surface>Readme` helper or shared `buildReadme` helper.
2. Edit the generator text.
3. Run `pnpm build`.
4. Run `pnpm verify`.

Direct edits to generated README files are useful only for experimentation because the next build may overwrite them.

## Review checklist

Before opening a pull request, verify:

- [ ] The changed source area is the right ownership boundary (`skills/` for shared behavior, generator for surface packaging, telemetry source for telemetry server behavior).
- [ ] `pnpm build` has been run after source changes.
- [ ] `pnpm verify` passes.
- [ ] Generated diffs are expected and limited to affected surfaces.
- [ ] Surface README changes were made through generator functions.
- [ ] MCP configs still point to `studio mcp` for `wordpress-studio` where the surface supports MCP.
- [ ] Surfaces that lack an official repository-local MCP or plugin mechanism document a compatibility path instead of adding invented config.
- [ ] Skills avoid duplicating specialist guidance and use `studio` for operational details.
- [ ] Any block markup workflow still requires Studio block validation.

## Cursor publishing

Build with WordPress is the source of truth for Cursor, but Cursor's marketplace flow uses the standalone repository `Automattic/wordpress-cursor-plugin`.

After source changes that affect Cursor:

```bash
pnpm build
pnpm verify
pnpm export:cursor
```

The export script runs a subtree split for `plugins/cursor` and pushes the result to `sync/from-build-with-wordpress` in the standalone repository. Then open or update a pull request from that branch into the standalone repo's `main` branch.

Use dry run mode when validating the export command itself:

```bash
pnpm export:cursor -- --dry-run
```

## Manual smoke testing

After build and verify, manually smoke test the relevant generated package when a change affects user-facing behavior:

1. Open or copy `plugins/<surface>/` into the agent's expected project root.
2. Install WordPress Studio and ensure `studio` is available on `PATH`.
3. Confirm the surface can see `wordpress-studio` MCP where supported.
4. Confirm the surface can see `wordpress-telemetry` MCP where supported.
5. Try representative tasks:
   - create a new site;
   - build or edit a theme;
   - create a custom block;
   - create a custom plugin;
   - run a performance, accessibility, or frontend audit.

## Automation

The repository includes workflow files for documentation and skills maintenance under `.github/workflows/`:

- `developer-docs-agent.yml` maintains developer-facing documentation.
- `skills-agent.yml` maintains the agent skill surface.

Manual documentation bootstrap runs may create or reshape the `docs/` surface. Push-triggered maintenance runs should make the smallest source-grounded documentation update needed for newly merged code or finish with no changes when docs are current.

## Future coverage

These items are useful follow-ups but were deferred from the initial bootstrap to keep the first documentation surface reviewable:

- **Detailed verifier rule reference:** `scripts/verify-plugins.mjs` is large and deserves a separate reference that enumerates each assertion group. Deferred because the bootstrap documents the command-level verification contract and generator-output responsibilities first.
- **Per-surface deep reference pages:** each of the 20 generated outputs could have a page with exact file paths and schema notes. Deferred because `docs/generated-outputs.md` now provides the shared contract and package matrix, while plugin-local README files already cover surface setup.
- **Telemetry server internals:** a future page can document the MCP server implementation, zod schemas, and stdio transport details. Deferred because the bootstrap captures public tool/event names and build packaging responsibilities.
- **GitHub Actions implementation details:** workflow YAML can be documented in a CI reference. Deferred because contributor workflows currently document when automation runs and what maintainers should do locally.
- **External context deltas:** deeper comparison against `studio` and `wordpress-agent-skills` can identify upstream compatibility changes over time. Deferred because those repositories are read-only evidence for this run and should not become a hard dependency in every topic page.
