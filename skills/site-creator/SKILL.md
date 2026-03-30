---
name: site-creator
description: Create a WordPress site from a rough idea using Studio and shared WordPress skills.
---

# Site Creator

Use this skill when the user wants a new WordPress site created from a prompt, brief, or rough idea.

## Ownership

This skill is an orchestrator. It should:

- extract or infer the site brief at the start of the workflow
- use `theme-creator` for theme implementation
- use `studio` for WordPress site operations, review, and iteration
- if a `site-image-builder` skill is available, use it to generate 3-5 relevant images, including photorealistic imagery where appropriate, when the design would benefit from custom visuals

Do not duplicate specialist guidance here when another skill already owns it.

## Workflow

### 1. Build the brief

Extract or infer:

- Site name
- Site type
- Primary goal
- Target audience
- Tone
- Brand keywords
- Key sections
- Layout intent

If the user shared images, logos, or design documents, inspect them for clues about the brand and visual direction.

Present the brief in this exact shape:

**Site Name:** ...
**Site Type:** ...
**Primary Goal:** ...
**Target Audience:** ...
**Tone:** ...
**Brand Keywords:** ...
**Key Sections:** ...
**Layout Intent:** ...

Then ask for confirmation before creating the site unless the user clearly asked you to proceed without pausing.

Guidance:

- infer intelligently, but do not pretend certainty where there is none
- keep the brief concise and practical
- favor modern, block-theme-friendly section structures
- decide whether the site should feel like full-width landing-page bands, a more contained editorial layout, or a mix of both
- if full-width sections fit the brief, note that in `Layout Intent` and carry it into the implementation
- if the user says "surprise me" or "just build it," choose a strong direction and proceed

### 2. Verify Studio readiness

Start with `studio`.

### 3. Resolve the site

Use `studio` to decide whether to create a new site or use an existing one, then make sure the chosen site is running.

Once the site is resolved, treat that `<site-path>` as the root for all generated outputs related to the build.

### 4. Create the theme

Use `theme-creator` to create or update the theme.

### 5. Configure WordPress

Use `studio` and `wp_cli` for any required WordPress configuration.

### 6. Validate and review

Use the review and iteration workflow from `studio` after content or visible site changes.

## Important

- Prefer Studio MCP tools over shell commands when the MCP tool exists.
- Keep the finished site editable in WordPress.
- If MCP is unavailable, fall back through the `studio` skill rather than inlining a separate operations workflow here.
- Do not place generated artifacts in the Codex launch directory by default. Put them inside the selected Studio site instead.
