---
name: site-builder
description: Orchestrate an MCP-first WordPress site build using Studio and shared WordPress skills.
---

# Site Builder

Use this skill when the user asks to build a WordPress site from a prompt, brief, or rough idea.

## Ownership

This skill is an orchestrator. It should:

- get the brief from `spec-builder`
- use `theme-builder` for theme implementation rules
- use `studio-mcp` for WordPress site operations, review, and iteration
- if a `site-image-builder` skill is available, use it to generate 3-5 relevant images, including photorealistic imagery where appropriate, to be used on the site landing page when the design would benefit from generated visuals

Do not duplicate specialist guidance here when another skill already owns it.

## Workflow

### 1. Verify Studio MCP readiness

Start with `studio-mcp`.

### 2. Build the brief

Use `spec-builder`.

### 3. Resolve the site

Use `studio-mcp` to resolve whether to create a new site or use an existing one, then make sure the chosen site is running.

Once the site is resolved, treat that `<site-path>` as the root for all generated outputs related to the build.

### 4. Build the theme

Use `theme-builder` to create or update the theme.

### 5. Configure WordPress

Use `studio-mcp` and `wp_cli` for any required WordPress configuration.

### 6. Validate and review

Use the review and iteration workflow from `studio-mcp` after content or visible site changes.

## Important

- Prefer Studio MCP tools over shell commands when the MCP tool exists.
- Keep the build editable in WordPress after generation.
- If MCP is unavailable, fall back to `studio-cli` rather than inlining a second operations workflow here.
- Do not place generated artifacts in the Codex launch directory by default. Put them inside the selected Studio site instead.
