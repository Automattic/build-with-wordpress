# Figma to WordPress Studio

This plugin moves a Figma file into WordPress by sending a Figma source payload to the local WordPress Studio app.

It does not port Static Site Importer, Blocks Engine, WordPress, PHP, or Studio internals to TypeScript. The TypeScript code extracts Figma scene data, captures the user's page/frame selection intent, and posts that source payload to Studio's local handoff endpoint. Studio owns site creation, Figma-to-WordPress transform/import through Static Site Importer and Blocks Engine, and cleanup after a successful import. If Studio is not running, the plugin surfaces the connection error.

## Flow

```text
Figma plugin controller + UI
  -> current-page scenegraph + selected-node intent
  -> Studio Figma source payload
  -> local WordPress Studio handoff endpoint
  -> WordPress Studio site
  -> Static Site Importer imports through Blocks Engine
```

## Boundaries

- Implemented: a Figma Desktop-loadable plugin shell with current-page scenegraph and selected-frame intent export.
- Implemented: a reusable scene-to-HTML/CSS artifact generator retained as debug/diagnostic context.
- Implemented: a Studio local handoff request.
- Not implemented: running Static Site Importer from TypeScript.
- Not implemented: automated visual parity/block validation after import.

## Files

- `manifest.json` is a minimal Figma plugin manifest for local development.
- `src/code.ts` is the Figma plugin main thread entry.
- `src/ui.ts` is the Figma UI-side handoff logic.
- `src/index.ts` contains the reusable Figma-scene-to-website-artifact generator.
- `src/payload.ts` contains the reusable TypeScript interfaces for the Studio Figma source handoff and debug artifact bundle.
- `src/ui.html` is the Figma UI shell bundled into `dist/ui.html`.

## Local Test

1. Run `npm run build --prefix plugins/figma-to-wordpress-studio`.
2. In Figma Desktop, use Plugins -> Development -> Import plugin from manifest, then select `plugins/figma-to-wordpress-studio/manifest.json`.
3. Start a compatible WordPress Studio build.
4. Open the plugin and choose `Open in WordPress Studio`.
5. Studio creates the site and opens the local site URL in your browser. If Studio is not reachable, the plugin reports the connection error.

For quick syntax verification without a full Figma build pipeline:

```bash
npm run check --prefix plugins/figma-to-wordpress-studio
npm run build --prefix plugins/figma-to-wordpress-studio
npm test --prefix plugins/figma-to-wordpress-studio
```

## Studio Handoff Boundary

Figma plugin UIs run in a constrained iframe-like environment and cannot spawn local shell commands. The supported boundary is a local Studio handoff: the plugin posts a Figma source payload to Studio's loopback endpoint. Studio accepts the source, creates the site, runs the Figma import route through Static Site Importer and Blocks Engine, and removes importer dependencies after a successful import.

The `Open in WordPress Studio` request body is source-first:

```json
{
  "source": {
    "schema": "wordpress-studio/figma-source/v1",
    "source": {
      "type": "figma",
      "metadata": {
        "provider": "figma",
        "plugin": "figma-to-wordpress-studio",
        "fileKey": "...",
        "fileName": "Marketing site",
        "editorType": "figma",
        "currentPage": { "id": "0:1", "name": "Landing" }
      },
      "exportedAt": "2026-01-01T00:00:00.000Z"
    },
    "intent": {
      "scope": "selected-nodes",
      "pageId": "0:1",
      "pageName": "Landing",
      "selectedNodeIds": ["1:2"],
      "rootNodeIds": ["1:2"]
    },
    "scenegraph": {
      "currentPage": {},
      "selectedNodes": []
    },
    "assets": [],
    "transform": {
      "target": "wordpress",
      "route": "static-site-importer/figma",
      "options": {
        "selectionScope": "selected-nodes",
        "pageId": "0:1",
        "selectedNodeIds": ["1:2"],
        "preserveSourceScenegraph": true,
        "importAssets": true
      }
    },
    "debug": {
      "generatedArtifact": {},
      "diagnostics": []
    }
  },
  "siteName": "Marketing site"
}
```

`debug.generatedArtifact` is diagnostic context only. Studio should route from `source`, `scenegraph`, and `transform`, not from a pre-rendered website artifact bundle.

See [`../../docs/figma-studio-runner.md`](../../docs/figma-studio-runner.md) for the integration notes.
