# Build with WordPress developer docs

Build with WordPress is the canonical source for WordPress-focused agent skills, WordPress Studio MCP setup, and generated packages across coding-agent surfaces. These docs are for maintainers and integrators who need to understand, use, and extend the repository.

## Start here

1. Read [Architecture](architecture.md) to understand the source inputs, generated outputs, Studio boundary, lifecycle, and repository extension points.
2. Read [Generated output contracts](generated-outputs.md) before changing anything under `plugins/` or adding a new agent surface.
3. Read [Skills and integrations](skills-and-integrations.md) before changing shared skills, Studio MCP behavior, telemetry wiring, or packaging conventions.
4. Use [Contributor workflows](contributor-workflows.md) as the checklist for local setup, build, verification, Cursor export, and automated maintenance.

## Written scope

This bootstrap documentation covers:

- repository purpose and package layout;
- shared skill source and generated package boundaries;
- generated plugin artifact responsibilities for all currently listed surfaces;
- WordPress Studio, MCP, `wp_cli`, and telemetry integration boundaries;
- build, verification, Cursor export, and CI/docs-agent workflows;
- contributor design principles and common failure modes;
- future coverage items that were intentionally deferred from this first pass.

## Documentation map

| Page | Use it for |
| --- | --- |
| [Architecture](architecture.md) | Source inventory, module boundaries, lifecycle, data/runtime boundaries, and extension points. |
| [Generated output contracts](generated-outputs.md) | Package output matrix, MCP contract, verification expectations, adding surfaces, and Cursor export behavior. |
| [Skills and integrations](skills-and-integrations.md) | Skill package contract, WordPress Studio integration, context evidence, MCP/telemetry behavior, failure modes, and design principles. |
| [Contributor workflows](contributor-workflows.md) | Local commands, standard change workflow, generated-output workflow, telemetry workflow, Cursor publishing, automation, PR checklist, and deferred docs coverage. |

## Maintenance rule

When source behavior changes, update docs in the same pull request if the change affects repository architecture, generated artifacts, setup commands, verification, Studio integration, package contracts, or contributor workflows. Generated package README files may also need updates when user-facing setup changes.
