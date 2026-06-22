# Figma to WordPress

`plugins/figma-to-wordpress` moves a Figma file into WordPress. Internally it generates a static HTML/CSS website artifact, then hands that artifact to a WordPress Playground runner that imports it with Static Site Importer and Blocks Engine.

## Architecture

```text
Figma plugin UI
  -> GeneratedWebsiteArtifact
  -> PlaygroundRunnerPayload
  -> runner URL or generated runner page
  -> WordPress Playground blueprint
  -> Static Site Importer / Blocks Engine inside WordPress
```

The TypeScript boundary stops at payload construction and Playground blueprint creation. WordPress, PHP, Static Site Importer, and Blocks Engine remain WordPress-side runtime concerns.

## Figma Iframe Limits

Figma plugin UIs run in a constrained browser context. That context is friendly to HTML, CSS, and client-side JavaScript, but it is not a normal browser tab.

Practical constraints for this browser-based flow:

- Cross-origin iframes can be blocked or limited.
- Popup and new-tab behavior can be host-dependent.
- Large WASM boot flows may not behave reliably inside the plugin UI.
- Clipboard access can require user activation.
- Local file URLs can behave differently between desktop Figma, browser Figma, and development builds.

Because of those constraints, the primary integration shape is a browser fallback: the plugin builds the same runner payload and opens or copies a runner URL. If in-plugin embedding works later, it can consume the same `PlaygroundRunnerPayload` interface.

## Playground And PHP Role

WordPress Playground is the correct place to run WordPress and PHP plugin logic. It provides a browser-hosted WordPress runtime backed by WebAssembly PHP and a virtual filesystem.

Static Site Importer and Blocks Engine should run in that WordPress runtime because they are WordPress/PHP import systems. The Figma plugin should not reimplement them in TypeScript. The plugin's job is to hand off a generated static artifact with enough metadata for the Playground runner to install/activate/import with those plugins.

## Current Boundary

Implemented now:

- `GeneratedWebsiteArtifact` for static generated files from Figma.
- `PlaygroundRunnerPayload` for the Playground handoff plan.
- Runner URL construction with an encoded payload fragment.
- A standalone runner HTML page that decodes and displays the payload.
- A Playground URL builder that installs Static Site Importer from GitHub, writes the artifact JSON into `/tmp/figma-to-wordpress-artifact.json`, and runs the `static-site-importer/import-website-artifact` ability.

Not implemented yet:

- Embedded Playground execution inside the Figma iframe.
- Post-import block validation and visual parity checks.

## Local Testing

From the repository root, run the plugin checks:

```bash
npm run check --prefix plugins/figma-to-wordpress
npm run build --prefix plugins/figma-to-wordpress
npm test --prefix plugins/figma-to-wordpress
```

Manual runner test:

1. Build or otherwise serve `plugins/figma-to-wordpress/runner/playground-runner.html`.
2. Use `buildRunnerPayload()` and `buildRunnerUrl()` from `src/payload.ts` to create a URL with `#payload=...`.
3. Open the URL in a browser.
4. Confirm the payload is decoded and the Playground link opens a session that installs Static Site Importer and runs the artifact import.

Figma development test:

1. Run `npm run build --prefix plugins/figma-to-wordpress`.
2. Load `plugins/figma-to-wordpress/manifest.json` as a Figma development plugin.
3. Run the plugin.
4. Use `Open in WordPress Playground`.
5. If the runner does not open from inside Figma, paste the copied URL into a normal browser tab.

## Next Integration Step

The next meaningful step is a hosted runner page with richer progress/error reporting around the Playground import and post-import block/visual validation. That should remain in the WordPress/Playground runner layer, not by porting PHP importer behavior into the Figma plugin.
