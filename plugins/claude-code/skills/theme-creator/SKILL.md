---
name: theme-creator
description: Create a modern WordPress block theme.
---

# Theme Creator

Use this skill when the user wants a new WordPress theme or a substantial visual overhaul for a local Studio site.

## Ownership

This skill owns:

- block theme implementation rules
- landing page and template composition
- WordPress-native layout structure for theme content
- theme-local artifact placement inside the selected Studio site

Use `studio` for the review loop after making changes. Use `auditing` when the user wants performance, accessibility, or broader frontend QA after the theme work.

## Principles

- Build block themes, not classic themes.
- Use modern WordPress patterns: `theme.json`, template parts, templates, core blocks.
- Prefer CSS and block composition over raw HTML blocks.
- Keep the theme editable in the Site Editor.
- Use Studio tools for activation, validation, and screenshots.

## Required files

At minimum:

```text
<theme-slug>/
├── theme.json
├── style.css
├── functions.php
├── templates/
│   ├── index.html
│   └── page.html
└── parts/
    ├── header.html
    └── footer.html
```

## Design approach

- choose a clear visual direction
- build a strong landing page, not a generic shell
- use purposeful typography, spacing, and color
- avoid generic AI-looking aesthetics
- design for desktop and mobile
- if the caller provides a selected design preview, treat that preview as the primary visual source for the theme's header, hero, and overall design language

Once you are committed to the theme implementation workflow and before the main file-writing phase, call `record_workflow_event` with `workflow: "theme-build"` and `stage: "started"`.

## Theme rules

- No `core/html` blocks for layout sections or normal text content.
- Use proper block markup only.
- No decorative HTML comments outside block delimiters.
- Put visual styling in `style.css`.
- Block themes do not automatically load `style.css` on the front end. You must explicitly enqueue it in `functions.php` with `wp_enqueue_style( '<slug>-style', get_stylesheet_uri() )` on the `wp_enqueue_scripts` hook.
- Enqueue editor styles so the editor resembles the front end.
- Add `prefers-reduced-motion` handling when using animations.

## Layout rules

- Choose the layout approach that best fits the brief. Do not force every site into full-width landing-page bands.
- If you decide full-width sections are appropriate for this site type or brief, use WordPress-native full-width section structure first.
- For those sections, make the outer top-level `core/group` block use `{"align":"full","layout":{"type":"default"}}`.
- For full-width landing-page sections, use a strict shell pattern:
  - outer section: `core/group` with `align:"full"` and `layout.type:"default"`
  - inner content shell: immediate child `core/group` with `align:"wide"`
  - primary `core/columns` inside that shell should also use `align:"wide"` when the section is meant to feel expansive
- Keep readable text and card grids inside an inner container block instead of constraining the outer full-width section itself.
- Do not leave intermediate groups or columns at constrained or default width between the full-width section and the main content shell unless the design intentionally calls for a narrow reading measure.
- Keep `theme.json` layout settings aligned with the design, including sensible `contentSize` and `wideSize` values.
- Do not rely on CSS alone to make a constrained block look full width when Gutenberg block alignment should carry that responsibility.
- If screenshots still show boxed or constrained sections after using full-width blocks, inspect wrapper alignment, serialized block markup, template layout, and `theme.json` before adding custom breakout CSS.

## Verification flow

After writing or updating block theme files:

1. run the `studio` block validation loop on every template or template-part file containing serialized block markup
2. if validation reports invalid blocks, repair the markup and re-run until all blocks validate cleanly
3. activate the theme with `wp_cli`
4. update site settings if needed with `wp_cli`
5. follow the review and iteration workflow in `studio`
6. call `record_workflow_event` with `workflow: "theme-build"` and `stage: "completed"`

If the user asks whether the result is fast, accessible, or polished beyond the normal review loop, use `auditing`.
