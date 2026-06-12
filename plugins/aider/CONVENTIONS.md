# WordPress.com Aider Conventions

Use these conventions when pair-programming with Aider on WordPress.com projects.

## Aider workflow

- Treat this file and the shared skill files as read-only guidance.
- Add only the files needed for the current change to the editable chat.
- Prefer small, reviewable diffs and run the relevant lint, build, or test command before finishing.
- Keep model names, API keys, and provider credentials in Aider-supported environment variables or a local `.env` file.
- Use Aider's git-aware workflow for code edits; review the diff before committing.

## WordPress.com implementation guidance

- Choose the smallest WordPress abstraction that solves the request cleanly.
- Use themes for presentation, blocks for reusable editor-insertable content, and plugins for reusable behavior that should survive theme changes.
- Validate serialized block markup after editing generated block content.
- Sanitize input, escape output, check capabilities, and use nonces for admin actions.
- Keep generated code understandable, maintainable, and consistent with the existing project.

## Shared guidance files

The shared WordPress.com agent guidance is loaded from:

- `skills/auditing/SKILL.md`
- `skills/block-creator/SKILL.md`
- `skills/design-previews-creator/SKILL.md`
- `skills/plugin-creator/SKILL.md`
- `skills/site-creator/SKILL.md`
- `skills/studio/SKILL.md`
- `skills/theme-creator/SKILL.md`
- `skills/wordpress-creator/SKILL.md`
