# Figma to WordPress Studio

`plugins/figma-to-wordpress-studio` moves a Figma file into WordPress by preparing a Studio CLI source for `studio create --from <source>`. Studio creates the site and imports the result with Static Site Importer and Blocks Engine.

## Architecture

```text
Figma plugin UI
  -> Figma document scene data
  -> Studio import artifact JSON
  -> studio create --from <artifact-json>
  -> WordPress Studio site
  -> Static Site Importer / Blocks Engine inside WordPress
```

The TypeScript boundary stops at artifact construction and a user-facing CLI command. WordPress, PHP, Static Site Importer, Blocks Engine, and Studio site orchestration remain Studio runtime concerns.

## Figma Iframe Limits

Figma plugin UIs run in a constrained browser context. That context is friendly to HTML, CSS, and client-side JavaScript, but it is not a normal browser tab.

Practical constraints for this browser-based flow:

- Cross-origin iframes can be blocked or limited.
- Popup and new-tab behavior can be host-dependent.
- Large WASM boot flows may not behave reliably inside the plugin UI.
- Clipboard access can require user activation.
- Local file URLs can behave differently between desktop Figma, browser Figma, and development builds.

Because of those constraints, the primary integration shape is a CLI handoff: the plugin saves an artifact JSON source and presents/copies `studio create --from <source>`. If a native bridge or deeper Studio integration exists later, it can consume the same artifact source.

## Studio And PHP Role

WordPress Studio is the correct place to run WordPress and PHP plugin logic. It provides the WordPress runtime and accepts flexible `studio create --from <source>` inputs, including artifact JSON, `.fig`, file, directory, zip, and URL shapes.

Static Site Importer and Blocks Engine should run in that WordPress runtime because they are WordPress/PHP import systems. The Figma plugin should not reimplement them in TypeScript. The plugin's job is to hand off design data with enough metadata for Studio to route through Static Site Importer and clean up importer dependencies after a successful import.

## Current Boundary

Implemented now:

- `GeneratedWebsiteArtifact` for static generated files from Figma.
- `blocks-engine/php-transformer/site-artifact/v1` for the Studio CLI artifact handoff.
- A Figma UI client that downloads the artifact JSON and copies `studio create --from ./<artifact>.studio-import.json`.

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
4. Use `Save Studio import payload`.
5. Run the copied `studio create --from ./<artifact>.studio-import.json` command from a terminal, adjusting the path to the saved artifact if needed.

## Next Integration Step

The next meaningful step is richer Studio-side progress/error reporting around CLI imports and post-import block/visual validation. That should remain in the Studio layer, not by porting PHP importer behavior into the Figma plugin.
