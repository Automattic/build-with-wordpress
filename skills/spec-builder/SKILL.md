---
name: spec-builder
description: Extract a practical WordPress site brief from a simple user request before building.
---

# Site Specification

Use this skill when the user wants a new WordPress site, theme, or substantial redesign and the brief is still fuzzy.

## Ownership

This skill owns the brief only.

It should capture design and layout intent at the decision level, not implementation details. Theme structure belongs in `theme-builder`.

## Goal

Turn a loose request into a compact site brief that is actionable for a theme builder or site builder workflow.

## Capture

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

## Output format

Present the brief in this exact shape:

**Site Name:** ...
**Site Type:** ...
**Primary Goal:** ...
**Target Audience:** ...
**Tone:** ...
**Brand Keywords:** ...
**Key Sections:** ...
**Layout Intent:** ...

Then ask for confirmation before building.

## Guidance

- Infer intelligently, but do not pretend certainty where there is none.
- Keep the brief concise and practical.
- Favor modern block-theme-friendly section structures.
- Infer whether the site should feel like full-width landing-page bands, a more contained editorial layout, or a mix of both.
- If full-width sections seem appropriate for the site type or brief, note that in `Layout Intent` and carry it forward into the build.
- If the user says "surprise me" or "just build it," choose a strong direction and proceed.
