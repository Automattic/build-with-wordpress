# Figma to WordPress

This plugin moves a Figma file into WordPress by generating static HTML/CSS internally and importing that artifact with Static Site Importer and Blocks Engine in WordPress Playground.

It does not port Static Site Importer, Blocks Engine, WordPress, PHP, or Playground internals to TypeScript. The TypeScript code extracts Figma scene data, builds a static artifact, and creates a Playground blueprint that runs the WordPress/PHP import path.

## Flow

```text
Figma plugin controller + UI
  -> selected Figma scene
  -> static HTML/CSS website artifact
  -> runner payload
  -> Playground blueprint URL
  -> WordPress Playground boots WordPress/PHP in WASM
  -> Static Site Importer installs and imports through Blocks Engine
```

## Boundaries

- Implemented: a Figma Desktop-loadable plugin shell with whole-file export.
- Implemented: a reusable scene-to-HTML/CSS artifact generator with diagnostics and tests.
- Implemented: a Playground blueprint URL that installs Static Site Importer from GitHub and calls `static-site-importer/import-website-artifact` with the generated artifact.
- Implemented: a standalone runner page that decodes the payload and opens the same Playground import URL.
- Not implemented: running Static Site Importer from TypeScript.
- Not implemented: in-plugin embedded Playground validation; the reliable path opens Playground in a browser tab.
- Not implemented: automated visual parity/block validation after import.

## Files

- `manifest.json` is a minimal Figma plugin manifest for local development.
- `src/code.ts` is the Figma plugin main thread entry.
- `src/ui.ts` is the Figma UI-side handoff logic.
- `src/index.ts` contains the reusable Figma-scene-to-website-artifact generator.
- `src/payload.ts` contains the reusable TypeScript interfaces and Playground blueprint URL builders.
- `src/ui.html` is the Figma UI shell bundled into `dist/ui.html`.
- `runner/playground-runner.html` is the browser fallback runner page.

## Local Test

1. Run `npm run build --prefix plugins/figma-to-wordpress`.
2. In Figma Desktop, use Plugins -> Development -> Import plugin from manifest, then select `plugins/figma-to-wordpress/manifest.json`.
3. Open the plugin and choose `Open in WordPress Playground`.
4. If Figma blocks embedding or navigation, copy the generated runner URL and open it in a normal browser tab.
5. Confirm WordPress Playground boots, installs Static Site Importer, runs the import, and opens wp-admin.

For quick syntax verification without a full Figma build pipeline:

```bash
npm run check --prefix plugins/figma-to-wordpress
npm run build --prefix plugins/figma-to-wordpress
npm test --prefix plugins/figma-to-wordpress
```

## Figma Iframe Fallback

Figma plugin UIs run in a constrained iframe-like environment. Cross-origin iframes, WASM boot, popup behavior, and navigation can be restricted depending on host context and plugin permissions. The supported fallback is to build the same payload, encode it into a runner URL fragment, and ask the user to open the runner page in a browser tab.

See [`../../docs/figma-playground-runner.md`](../../docs/figma-playground-runner.md) for the integration notes.
