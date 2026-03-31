---
name: plugin-creator
description: Create or update a custom WordPress plugin for site functionality that should not live in a theme or a block. Use when the user needs reusable behavior, admin/settings UI, hooks, REST endpoints, scheduled tasks, integrations, or server-side logic for a Studio-backed site.
---

# Plugin Creator

Use this skill when the user needs custom WordPress functionality that should survive theme changes.

## Ownership

This skill owns:

- minimal plugin scaffolding inside the selected Studio site
- plugin-specific implementation guardrails

Use `studio` for site selection, activation, `wp_cli`, and review.

## Workflow

1. Use `studio` to resolve the target site.
2. Create the plugin under `<site-path>/wp-content/plugins/<slug>/`.
3. Start with the smallest viable structure:
   - a main plugin file with the header
   - only add extra files, classes, or build tooling when the request needs them
4. Keep load-time side effects light. Register hooks predictably and add activation, deactivation, or uninstall behavior only when the request actually needs lifecycle work.
5. If the plugin accepts input or exposes admin actions, enforce capability checks and nonces, sanitize on input, and escape on output.
6. If the plugin needs JS or CSS assets, add the minimal build setup required for those assets instead of scaffolding a large default toolchain.
7. Activate and verify through `studio`.

## Guardrails

- Do not create a plugin for pure styling or template work.
- Keep the plugin editable and easy to reason about.
- Prefer the smallest viable file set and dependency footprint.
