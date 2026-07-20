# Figma to WordPress Studio

`plugins/figma-to-wordpress-studio` moves a Figma file into WordPress by posting a Figma source payload to the local WordPress Studio app. Studio creates the site and imports the result with Static Site Importer and Blocks Engine.

## Architecture

```text
Figma plugin UI
  -> current-page scenegraph + selected-node intent
  -> Studio Figma source payload
  -> local WordPress Studio handoff endpoint
  -> WordPress Studio site
  -> Static Site Importer / Blocks Engine inside WordPress
```

The TypeScript boundary stops at source capture and a local handoff request. WordPress, PHP, Static Site Importer, Blocks Engine, and Studio site orchestration remain Studio runtime concerns.

## Figma Iframe Limits

Figma plugin UIs run in a constrained browser context. That context is friendly to HTML, CSS, and client-side JavaScript, but it is not a normal browser tab.

Practical constraints for this browser-based flow:

- Cross-origin iframes can be blocked or limited.
- Popup and new-tab behavior can be host-dependent.
- Large WASM boot flows may not behave reliably inside the plugin UI.
- Clipboard access can require user activation.
- Local file URLs can behave differently between desktop Figma, browser Figma, and development builds.

Because of those constraints, the integration shape is a local Studio handoff: the plugin posts Figma source data to Studio's loopback endpoint. If Studio is not running, the plugin surfaces the connection error.

## Studio And PHP Role

WordPress Studio is the correct place to run WordPress and PHP plugin logic. It provides the WordPress runtime and accepts flexible `studio create --from <source>` inputs, including Figma source, artifact JSON, `.fig`, file, directory, zip, and URL shapes.

Static Site Importer and Blocks Engine should run in that WordPress runtime because they are WordPress/PHP import systems. The Figma plugin should not reimplement them in TypeScript. The plugin's job is to hand off design data with enough metadata for Studio to route through Static Site Importer and clean up importer dependencies after a successful import.

## Current Boundary

Implemented now:

- `GeneratedWebsiteArtifact` for static generated files from Figma.
- `wordpress-studio/figma-source/v1` for the primary Studio Figma handoff.
- `blocks-engine/php-transformer/site-artifact/v1` retained as debug/diagnostic context.
- A Figma UI client that posts the source payload to local Studio.

## Source Payload Contract

`toFigmaSourcePayload()` produces `wordpress-studio/figma-source/v1`. Studio receives it as the `source` property of a JSON request, alongside the Figma document name as `siteName`.

The payload preserves the source needed for a Studio-side transform:

- `source` identifies Figma, includes file and page metadata, and records the export timestamp.
- `intent` records whether the user selected nodes or the current page, including the page and selected root node IDs.
- `scenegraph` includes the normalized current page and selected nodes rather than only generated HTML.
- `assets` carries the normalized exported assets.
- `transform` requests the `static-site-importer/figma` route with a WordPress target, preserved source scenegraph, asset import, selection scope, page ID, and selected node IDs.
- `debug` carries a per-request handoff ID, generated artifact context, diagnostics, and metadata.

The debug summary is deterministic from the selected source and generated artifact. It reports the selection scope and page, selected-node count, recursive node count, asset count, and diagnostic, warning, and error counts. When no nodes are selected, node counting falls back to the current page. `generate-artifact.test.mjs` fixes this shape with a selected-node fixture and verifies the route, preservation options, handoff ID, generated artifact, and summary counts.

## Handoff And Diagnostics

The UI posts to `http://127.0.0.1:48732/figma-to-wordpress/import` with `Content-Type: application/json`. The Studio button remains disabled until normalized selection data is available and while a request is active.

Each request receives a `figma-...` handoff ID. On success, Studio may return `requestId`, `siteName`, `siteUrl`, and `importSummary`; the UI displays the accepted site and logs those values with the handoff ID, payload schema, selection identity, source summary, and generated artifact file/entrypoint summary.

A non-2xx response or a response without `success: true` is a failed handoff. The visible error uses Studio's response message when available, appends its request ID for correlation, and otherwise includes the HTTP status. Network and response failures are logged with the same handoff ID and source summary, so Studio and Figma logs can be correlated without treating the debug artifact as the primary import contract.

Not implemented yet:

- Post-import block validation and visual parity checks.

## Local Testing

From the repository root, run the plugin checks:

```bash
npm run check --prefix plugins/figma-to-wordpress-studio
npm run build --prefix plugins/figma-to-wordpress-studio
npm test --prefix plugins/figma-to-wordpress-studio
```

Figma development test:

1. Run `npm run build --prefix plugins/figma-to-wordpress-studio`.
2. Load `plugins/figma-to-wordpress-studio/manifest.json` as a Figma development plugin.
3. Run the plugin.
4. Start a compatible WordPress Studio build.
5. Use `Open in WordPress Studio`.
6. Studio creates the site and opens the local site URL in your browser. If Studio is not reachable, the plugin reports the connection error.

## Next Integration Step

The next meaningful step is Studio-side routing for `wordpress-studio/figma-source/v1`, plus richer progress/error reporting around imports and post-import block/visual validation. That should remain in the Studio layer, not by porting PHP importer behavior into the Figma plugin.
