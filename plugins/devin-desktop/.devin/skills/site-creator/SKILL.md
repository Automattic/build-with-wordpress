---
name: site-creator
description: Create a WordPress site from a rough idea using Studio and shared WordPress skills.
---

# Site Creator

Use this skill when the user wants a new WordPress site created from a prompt, brief, or rough idea.

## Ownership

This skill is an orchestrator. It should:

- extract or infer the site brief at the start of the workflow
- use `design-previews-creator` to present the user with design directions
- use `theme-creator` for theme implementation
- use `auditing` for post-build performance, accessibility, or QA requests
- use `studio` for WordPress site operations, review, and iteration

Do not duplicate specialist guidance here when another skill already owns it.

## Workflow

### 1. Verify Studio readiness

Use `studio`.

### 2. Resolve the site

Use `studio` to decide whether to create a new site or use an existing one.

Once you move from discovery into the real build workflow, call `record_workflow_event` with `workflow: "site-build"` and `stage: "started"`.

### 3. Build the brief

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

Guidance:

- infer intelligently, but do not pretend certainty where there is none
- keep the brief concise and practical
- favor modern, block-theme-friendly section structures
- decide whether the site should feel like full-width landing-page bands, a more contained editorial layout, or a mix of both
- if full-width sections fit the brief, note that in `Layout Intent` and carry it into the implementation

### 4. Present the brief and ask for the next step

Present the brief in this exact shape:

**Site Name:** ...
**Site Type:** ...
**Primary Goal:** ...
**Target Audience:** ...
**Tone:** ...
**Brand Keywords:** ...
**Key Sections:** ...
**Layout Intent:** ...

Then ask a single combined question that both validates the brief and chooses the next step.

Use this exact wording:

"Does this brief look right? If you'd like changes, tell me what to adjust. Otherwise, do you want to see some design options, or just proceed with the build?"

Wait for the user's answer before continuing.

If the user requests changes to the brief:

- update the brief
- present the revised brief in the same shape
- ask the same combined question again

If the user wants design options:

- create a design workspace inside the selected site
- use `design-previews-creator` to generate three previews in parallel
- wait for the user to choose a direction, or request modifications
- pass the selected preview and any requested changes into `theme-creator`

If the user wants to proceed with the build:

- use `theme-creator` to create or update the theme from the confirmed brief

### 5. Configure WordPress

Use `studio` for any required WordPress configuration.

### 6. Validate and review

Use the review and iteration workflow from `studio` after content or visible site changes.

If this workflow writes serialized block content into theme files or `wp_cli` page/post content, the `studio` validation loop is mandatory before considering the work complete.

If the user asks for performance tuning, accessibility review, or a general polish pass after the build, hand off to `auditing`.

When the site build is complete, call `record_workflow_event` with `workflow: "site-build"` and `stage: "completed"`.

## Important

- Keep the finished site editable in WordPress.
- Do not restate Studio operational guidance here; rely on `studio` for MCP preference, site-path handling, and fallback behavior.
