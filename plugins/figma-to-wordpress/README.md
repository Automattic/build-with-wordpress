# Figma to WordPress

This plugin moves a Figma file into WordPress by handing the design to a WordPress runner service that imports it with Static Site Importer and Blocks Engine in WordPress Playground.

It does not port Static Site Importer, Blocks Engine, WordPress, PHP, or Playground internals to TypeScript. The TypeScript code extracts Figma scene data, prepares the runner request, and opens the Playground session URL returned by the WordPress-side runner.

## Flow

```text
Figma plugin controller + UI
  -> whole Figma document scene data
  -> runner request
  -> WordPress runner service
  -> WordPress Playground session
  -> Static Site Importer imports through Blocks Engine
```

## Boundaries

- Implemented: a Figma Desktop-loadable plugin shell with whole-file export.
- Implemented: a reusable scene-to-HTML/CSS artifact generator with diagnostics and tests for the current local handoff.
- Implemented: a product-neutral runner request that can be posted to a WordPress-side Playground session service.
- Not implemented: running Static Site Importer from TypeScript.
- Not implemented: the hosted WordPress runner endpoint that creates the Playground session and returns its URL.
- Not implemented: automated visual parity/block validation after import.

## Files

- `manifest.json` is a minimal Figma plugin manifest for local development.
- `src/code.ts` is the Figma plugin main thread entry.
- `src/ui.ts` is the Figma UI-side handoff logic.
- `src/index.ts` contains the reusable Figma-scene-to-website-artifact generator.
- `src/payload.ts` contains the reusable TypeScript interfaces for the runner handoff.
- `src/wordpress-runner.ts` posts the runner request and expects an `open_url` response.
- `src/ui.html` is the Figma UI shell bundled into `dist/ui.html`.

## Local Test

1. Run `npm run build --prefix plugins/figma-to-wordpress`.
2. In Figma Desktop, use Plugins -> Development -> Import plugin from manifest, then select `plugins/figma-to-wordpress/manifest.json`.
3. Open the plugin and choose `Open in WordPress Playground`.
4. Confirm the WordPress runner service returns a Playground URL and the plugin opens it in a browser tab.

For quick syntax verification without a full Figma build pipeline:

```bash
npm run check --prefix plugins/figma-to-wordpress
npm run build --prefix plugins/figma-to-wordpress
npm test --prefix plugins/figma-to-wordpress
```

## Runner Boundary

Figma plugin UIs run in a constrained iframe-like environment. Cross-origin iframes, WASM boot, popup behavior, and navigation can be restricted depending on host context and plugin permissions. The supported boundary is a WordPress-side runner service: the plugin posts a runner request, the service creates the Playground session, and the plugin opens the returned URL.

See [`../../docs/figma-playground-runner.md`](../../docs/figma-playground-runner.md) for the integration notes.
