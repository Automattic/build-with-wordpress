---
name: wordpress-creator
description: Route WordPress build requests to the right implementation path for a Studio-backed site. Use when the user wants WordPress work and it is not yet clear whether the task should be handled as full-site creation, theme work, a custom block, or a plugin.
---

# WordPress Creator

Use this skill as the top-level decision maker for WordPress implementation work.

## Ownership

This skill owns:

- choosing between `site-creator`, `theme-creator`, `block-creator`, and `plugin-creator`
- picking the smallest fitting WordPress abstraction
- handing execution off to the specialist skill once the approach is clear

## Routing rules

- Use `site-creator` when the user wants a new site, homepage, landing page, or a full site built from a brief.
- Use `theme-creator` when the main work is templates, layout, styling, presentation, or a visual redesign.
- Use `block-creator` when the main deliverable is an editor-insertable content block.
- Use `plugin-creator` when the request is reusable site functionality, admin/settings UI, REST endpoints, scheduled tasks, integrations, or backend behavior that should survive theme changes.
- If the request could fit more than one path, choose the smallest abstraction that cleanly solves it.

## Guardrails

- Do not reach for a plugin when a theme or block would solve the request more directly.
- Do not route pure presentation work into `plugin-creator`.
- Do not route reusable backend behavior into `theme-creator`.
- Once the path is clear, rely on the specialist skill instead of restating its workflow here.
