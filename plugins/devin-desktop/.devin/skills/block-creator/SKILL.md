---
name: block-creator
description: Create, edit, build, and review a custom WordPress Gutenberg block plugin inside a Studio-backed site.
---

# Block Creator

Use this skill when the user wants to create or modify a custom Gutenberg block inside a local Studio site.

## Ownership

This skill is the single entry point for custom block work. It owns:

- block plugin workflow inside a Studio site
- structural decisions such as static versus dynamic blocks
- implementation rules for block plugin code

Use `studio` for review and iteration after the block is built into a site.

## Workflow

### 1. Verify Studio readiness

Use `studio` so the selected site can be managed and reviewed with Studio tools.

### 2. Resolve the target site

Use Studio tools to:

- list available sites
- select or confirm the working site
- start it if needed
- fetch the site path and URL

Once you begin the actual block implementation workflow, call `record_workflow_event` with `workflow: "block-build"` and `stage: "started"`.

### 3. Understand the request

If the request is vague, clarify:

- what the block should display
- whether it needs live data
- whether it needs frontend interaction

### 4. Decide static or dynamic

Default to a static block unless the user clearly needs server-rendered data.

Use a static block when the content can be serialized at edit time.
Use a dynamic block when the frontend output depends on server-side data or computation.

Keep the implementation consistent with standard Gutenberg block conventions.

### 5. Generate identifiers

Create:

- a human block name in Title Case
- a kebab-case slug
- a registry name like `create-block/{slug}` unless the project already has a namespace

### 6. Scaffold the plugin in the selected Studio site

Create the plugin directory here:

```text
<site-path>/wp-content/plugins/<slug>/
<site-path>/wp-content/plugins/<slug>/src/
```

Then write:

- `<slug>.php`
- `package.json`
- `readme.txt`
- `src/block.json`
- `src/index.js`
- `src/edit.js`
- `src/save.js`
- `src/render.php`
- `src/view.js`
- `src/style.scss`
- `src/editor.scss`

After the build, compiled assets live in `build/`.

Use the selected Studio site as the root for all block-related files.

## Core rules

### 1. Keep `view.js` plain JavaScript

`view.js` runs on the frontend.

- no JSX
- no React
- no imports from `@wordpress/*`
- use DOM APIs directly

### 2. Match editor and frontend output

The editor preview should look and behave as close to the frontend as possible.

- use matching class names
- use real block UI, not placeholder boxes unless absolutely necessary
- keep style rules shared when possible

### 3. Be proactive with controls

Prefer controls the editor already provides when they fit the request.

Prefer components such as:

- `InspectorControls`
- `BlockControls`
- `RichText`
- `MediaUpload`
- `ToggleControl`, `RangeControl`, `SelectControl`, `TextControl`

Prefer `supports` in `block.json` when WordPress can provide built-in UI for color, spacing, or typography.

## Core file guidance

### package.json

Use `@wordpress/scripts` for build tooling. Keep the package minimal and aligned with the block's actual needs.

Include build scripts that support the current task rather than copying a large default scaffold.

### block.json

Keep metadata valid and minimal. Use only the fields the block actually needs.

### PHP plugin bootstrap

The plugin main file should:

- guard direct access with `if ( ! defined( 'ABSPATH' ) ) { exit; }`
- wrap function definitions with `function_exists`
- register the block from `build/`

## HTML rule

Each block should render a single wrapper element. Do not accidentally nest identical wrapper tags.

## Defaults

If unsure:

- make it static
- use `design` or `widgets` category depending on the block
- include editor controls for the attributes the user will obviously want to change

## PHP standards

- no closing `?>` at end of file
- guard functions with `function_exists`
- use escaping like `esc_html()`, `esc_attr()`, or `wp_kses_post()` where appropriate

## Studio workflow

Inside the block plugin directory, prefer:

```bash
pnpm install
pnpm exec wp-scripts build
```

If the generated block package is being used outside this repo and only npm is available, `npm install && npx wp-scripts build` is fine too.

After a successful build:

- activate the plugin with `wp_cli`
- insert the block into a test page or post with `wp_cli`
- follow the review and iteration workflow in `studio`
- call `record_workflow_event` with `workflow: "block-build"` and `stage: "completed"`

When editing an existing block:

1. locate the block project in the selected site's `wp-content/plugins/`
2. identify affected files based on the change request
3. update only the necessary files
4. rebuild
5. re-run activation or page setup steps if needed
6. follow the review and iteration workflow in `studio`

## Error recovery

When a build fails:

1. read the full error output
2. identify the exact file and issue
3. fix only the relevant file
4. rebuild without reinstalling packages
5. retry up to 3 times before escalating to the user
