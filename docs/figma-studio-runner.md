# Figma to WordPress Studio

`plugins/figma-to-wordpress-studio` moves a Figma file into WordPress. It hands the design to a WordPress runner service that creates a Studio session and imports the result with Static Site Importer and Blocks Engine.

## Architecture

```text
Figma plugin UI
  -> Figma document scene data
  -> runner request
  -> WordPress runner service
  -> WordPress Studio session URL
  -> Static Site Importer / Blocks Engine inside WordPress
```

The TypeScript boundary stops at request construction and opening the returned Studio URL. WordPress, PHP, Static Site Importer, Blocks Engine, and Studio session orchestration remain WordPress-side runtime concerns.

## Figma Iframe Limits

Figma plugin UIs run in a constrained browser context. That context is friendly to HTML, CSS, and client-side JavaScript, but it is not a normal browser tab.

Practical constraints for this browser-based flow:

- Cross-origin iframes can be blocked or limited.
- Popup and new-tab behavior can be host-dependent.
- Large WASM boot flows may not behave reliably inside the plugin UI.
- Clipboard access can require user activation.
- Local file URLs can behave differently between desktop Figma, browser Figma, and development builds.

Because of those constraints, the primary integration shape is a service handoff: the plugin posts a runner request and opens the returned URL in a browser tab. If in-plugin embedding works later, it can consume the same runner response interface.

## Studio And PHP Role

WordPress Studio is the correct place to run WordPress and PHP plugin logic. It provides a browser-hosted WordPress runtime backed by WebAssembly PHP and a virtual filesystem.

Static Site Importer and Blocks Engine should run in that WordPress runtime because they are WordPress/PHP import systems. The Figma plugin should not reimplement them in TypeScript. The plugin's job is to hand off design data with enough metadata for the WordPress runner to transform, install, activate, and import with those plugins.

## Current Boundary

Implemented now:

- `GeneratedWebsiteArtifact` for static generated files from Figma.
- `figma-to-wordpress-studio/runner-request/v1` for the runner handoff plan.
- A Figma UI client that posts the runner request and opens the returned Studio URL.

Not implemented yet:

- The hosted WordPress runner endpoint that creates the Studio session.
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
4. Use `Open in WordPress Studio`.
5. Confirm the runner service returns a Studio URL that opens in a normal browser tab.

## Next Integration Step

The next meaningful step is a hosted WordPress runner endpoint with progress/error reporting around the Studio import and post-import block/visual validation. That should remain in the WordPress/Studio runner layer, not by porting PHP importer behavior into the Figma plugin.
