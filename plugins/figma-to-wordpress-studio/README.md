# Figma to WordPress Studio

This plugin moves a Figma file into WordPress by preparing a Studio CLI import payload for `studio create --from <source>`.

It does not port Static Site Importer, Blocks Engine, WordPress, PHP, or Studio internals to TypeScript. The TypeScript code extracts Figma scene data, prepares an artifact JSON source, and gives the user the `studio create --from ...` command. Studio owns site creation, import through Static Site Importer, and cleanup after a successful import.

## Flow

```text
Figma plugin controller + UI
  -> whole Figma document scene data
  -> Studio import artifact JSON
  -> studio create --from <artifact-json>
  -> WordPress Studio site
  -> Static Site Importer imports through Blocks Engine
```

## Boundaries

- Implemented: a Figma Desktop-loadable plugin shell with whole-file export.
- Implemented: a reusable scene-to-HTML/CSS artifact generator with diagnostics and tests for the current local handoff.
- Implemented: a Studio CLI import payload and copyable `studio create --from ...` command.
- Not implemented: running Static Site Importer from TypeScript.
- Not implemented: automated visual parity/block validation after import.

## Files

- `manifest.json` is a minimal Figma plugin manifest for local development.
- `src/code.ts` is the Figma plugin main thread entry.
- `src/ui.ts` is the Figma UI-side handoff logic.
- `src/index.ts` contains the reusable Figma-scene-to-website-artifact generator.
- `src/payload.ts` contains the reusable TypeScript interfaces for the Studio CLI artifact handoff.
- `src/ui.html` is the Figma UI shell bundled into `dist/ui.html`.

## Local Test

1. Run `npm run build --prefix plugins/figma-to-wordpress-studio`.
2. In Figma Desktop, use Plugins -> Development -> Import plugin from manifest, then select `plugins/figma-to-wordpress-studio/manifest.json`.
3. Open the plugin and choose `Save Studio import payload`.
4. Run the copied `studio create --from ./<artifact>.studio-import.json` command from a terminal, adjusting the path to the saved artifact if needed.

For quick syntax verification without a full Figma build pipeline:

```bash
npm run check --prefix plugins/figma-to-wordpress-studio
npm run build --prefix plugins/figma-to-wordpress-studio
npm test --prefix plugins/figma-to-wordpress-studio
```

## Studio CLI Boundary

Figma plugin UIs run in a constrained iframe-like environment and cannot spawn local shell commands. The supported boundary is a CLI handoff: the plugin saves the import artifact and presents/copies `studio create --from <source>`. Studio accepts the artifact source, creates the site, runs Static Site Importer, and removes SSI after a successful import.

See [`../../docs/figma-studio-runner.md`](../../docs/figma-studio-runner.md) for the integration notes.
