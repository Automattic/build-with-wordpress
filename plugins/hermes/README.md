# WordPress.com for Hermes

This Hermes output packages the shared Build with WordPress skills for Hermes Agent.

## Official Hermes surface

- Hermes Agent: https://hermes-agent.nousresearch.com/
- Hermes repository: https://github.com/NousResearch/hermes-agent
- Skills docs: https://hermes-agent.nousresearch.com/docs/user-guide/features/skills
- Plugin docs: https://hermes-agent.nousresearch.com/docs/user-guide/features/plugins
- Agent Skills standard and hub: https://agentskills.io

Hermes supports both skills and Git-distributed plugins, so this output includes both:

- `skills/` as a Skills Hub-compatible GitHub tap layout
- `plugin.yaml` and `__init__.py` for `hermes plugins install user/repo` style distribution
- `.hermes/config.yaml` as a copyable MCP server snippet for the WordPress Studio and telemetry MCP servers

## Included skills

- `auditing`
- `block-creator`
- `design-previews-creator`
- `plugin-creator`
- `site-creator`
- `studio`
- `theme-creator`
- `wordpress-creator`

## Installing as a skill tap

Publish this directory from a repository with `skills/` at its root, then install individual skills with Hermes' GitHub tap flow:

```bash
hermes skills tap add owner/repo
hermes skills install owner/repo/wordpress-creator
```

## Installing as a Hermes plugin

Hermes can install Git-hosted plugins with:

```bash
hermes plugins install owner/repo
hermes plugins enable wordpress-studio
```

The generated plugin registers each bundled skill with Hermes through `ctx.register_skill()`.

## MCP setup

Copy the `.hermes/config.yaml` MCP server snippet into the target Hermes profile config, then restart Hermes. The config launches the existing WordPress Studio MCP server plus the bundled `wordpress-telemetry` MCP server. This package does not introduce a new WordPress backend service.
