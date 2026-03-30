---
name: site-image-builder
description: Generate image assets for a WordPress site build in Codex, using GPT image generation for photorealistic images, hero art, illustrations, textures, and other site design imagery.
---

# Site Image Builder

Use this skill when a WordPress site created in Codex needs generated imagery that should become part of the design, including photorealistic images.

## Ownership

This skill owns:

- deciding when a site needs generated raster assets instead of CSS-only or block-only treatment
- deciding when a site needs generated photorealistic or illustrative imagery instead of CSS-only or block-only treatment
- using Codex image generation for project-bound site imagery
- placing final image assets into the selected Studio site's theme files

Use `imagegen` for the actual image generation or image editing workflow.

## Workflow

1. Resolve the selected `<site-path>` and theme location through the main site workflow.
2. Decide whether the need is for a new generated asset or an edit of an existing image.
3. Use `imagegen` when the asset should be an image such as a photorealistic scene, hero image, poster, collage, texture, illustration, or atmospheric background image.
4. Save the chosen final asset into the selected Studio site, usually under `<site-path>/wp-content/themes/<theme-slug>/assets/images/`.
5. Reference the saved asset from the theme markup, patterns, or CSS.

## Guardrails

- Do not use this skill for simple shapes, icons, or graphics that should be built directly in blocks, CSS, or SVG.
- Do not leave project assets only in `$CODEX_HOME/generated_images/...`; move or copy the final asset into the selected Studio site before finishing.
- Do not overwrite an existing theme asset unless the user explicitly asked for replacement; prefer a versioned sibling filename instead.
- Keep prompts aligned with the approved site brief, visual direction, and content tone.
