# WordPress.com Aider Configuration

This Aider output packages WordPress.com coding guidance for terminal pair-programming with Aider.

Aider does not use a marketplace plugin manifest or MCP config in normal usage. This output is intentionally a small config and documentation pack:

- `.aider.conf.yml` loads the instruction files as read-only context
- `CONVENTIONS.md` provides Aider-specific setup and editing conventions
- `skills/` contains the shared WordPress.com agent guidance also used by other outputs

## Setup

1. Copy or symlink the contents of this directory into the root of the repository you want to edit.
2. Configure your model and API keys with Aider-supported environment variables or a local `.env` file.
3. Start Aider from the repository root that contains `.aider.conf.yml`:

```bash
aider
```

Aider will read the configured guidance files without making them editable in the chat.

## Aider-specific guidance

- Use `.aider.conf.yml` and `CONVENTIONS.md` for Aider configuration and conventions.
- Use Aider's normal `/read`, `/add`, lint, test, and git workflows for active pair-programming.
- Keep API keys in environment variables or a local `.env` file; do not commit secrets.

## Shared WordPress.com guidance

The shared guidance describes WordPress.com implementation routing, Studio-backed local workflows, site creation, theme work, block creation, plugin creation, design previews, and auditing.

These files are loaded as read-only context:

- `skills/auditing/SKILL.md`
- `skills/block-creator/SKILL.md`
- `skills/design-previews-creator/SKILL.md`
- `skills/plugin-creator/SKILL.md`
- `skills/site-creator/SKILL.md`
- `skills/studio/SKILL.md`
- `skills/theme-creator/SKILL.md`
- `skills/wordpress-creator/SKILL.md`

## MCP and agent substrate

WordPress.com agent workflows share Studio MCP and telemetry guidance across Codex and Claude Code outputs. Aider complements that substrate as a terminal pair-programming tool, but this output does not pretend Aider has a native marketplace plugin or MCP package surface.
