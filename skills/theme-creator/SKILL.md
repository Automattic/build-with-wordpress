---
name: theme-creator
description: "Create a modern WordPress block theme with theme.json configuration, block templates, template parts, and global styles for a Studio-backed site. Use when the user asks to build a WordPress theme, FSE theme, full site editing theme, block-based theme, or requests visual design work involving theme.json, block patterns, or Gutenberg templates."
---

# Theme Creator

Use this skill when the user asks to create a WordPress theme, build an FSE or block-based theme, design a full site editing layout, configure theme.json, or do a substantial visual overhaul for a local Studio site.

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
- Block themes do not automatically load `style.css` on the front end — enqueue it explicitly in `functions.php` (see example below).
- Enqueue editor styles so the editor resembles the front end.
- Add `prefers-reduced-motion` handling when using animations.

### functions.php bootstrap

```php
<?php
add_action( 'wp_enqueue_scripts', function () {
    wp_enqueue_style( '<slug>-style', get_stylesheet_uri(), array(), wp_get_theme()->get( 'Version' ) );
} );
add_action( 'after_setup_theme', function () {
    add_editor_style( 'style.css' );
} );
```

## Layout rules

- Choose the layout approach that best fits the brief — not every site needs full-width landing-page bands.
- Keep `theme.json` layout settings aligned with the design, including sensible `contentSize` and `wideSize` values.
- Use Gutenberg block alignment instead of CSS-only workarounds for full-width sections.
- If screenshots show boxed sections after using full-width blocks, inspect wrapper alignment, serialized block markup, and `theme.json` before adding custom breakout CSS.

### Full-width section pattern

When full-width sections are appropriate, use this strict shell:

```html
<!-- wp:group {"align":"full","layout":{"type":"default"}} -->
<div class="wp-block-group alignfull">
  <!-- wp:group {"align":"wide"} -->
  <div class="wp-block-group alignwide">
    <!-- wp:columns {"align":"wide"} -->
    <div class="wp-block-columns alignwide">
      <!-- column content here -->
    </div>
    <!-- /wp:columns -->
  </div>
  <!-- /wp:group -->
</div>
<!-- /wp:group -->
```

Keep readable text and card grids inside the inner `align:"wide"` shell. Do not leave intermediate groups at constrained width between the full-width outer section and the content shell.

## Verification flow

After writing or updating block theme files:

1. run the `studio` block validation loop on every template or template-part file containing serialized block markup
2. if validation reports invalid blocks, repair the markup and re-run until all blocks validate cleanly
3. activate the theme with `wp_cli`
4. update site settings if needed with `wp_cli`
5. follow the review and iteration workflow in `studio`
6. call `record_workflow_event` with `workflow: "theme-build"` and `stage: "completed"`

If the user asks whether the result is fast, accessible, or polished beyond the normal review loop, use `auditing`.
