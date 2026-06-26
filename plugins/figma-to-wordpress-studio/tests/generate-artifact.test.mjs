import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import esbuild from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pluginDir = path.resolve(__dirname, "..");

async function loadModule() {
	return loadSourceModule("index.ts");
}

async function loadPayloadModule() {
	return loadSourceModule("payload.ts");
}

async function loadExporterModule() {
  return loadSourceModule("exporter.ts");
}

async function loadSourceModule(sourceFile) {
  const outfile = path.join(tmpdir(), `figma-to-wordpress-studio-${Date.now()}-${Math.random()}.mjs`);
  await esbuild.build({
    entryPoints: [path.join(pluginDir, "src", sourceFile)],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile,
    logLevel: "silent",
  });

  return import(pathToFileURL(outfile));
}

test("generates HTML, CSS, metadata, and diagnostics from the sample fixture", async () => {
  const { generateWebsiteArtifact } = await loadModule();
  const scene = JSON.parse(await readFile(path.join(pluginDir, "fixtures", "sample-scene.json"), "utf8"));
  const artifact = generateWebsiteArtifact(scene, {
    title: "Sample Landing Page",
    includeMetadata: true,
    generatedAt: "2026-01-01T00:00:00.000Z",
  });

  assert.match(artifact.files["index.html"], /<main class="landing-page-section">/);
  assert.match(artifact.files["index.html"], /<h1 class="hero-title-text">Build faster with WordPress<\/h1>/);
  assert.match(artifact.files["index.html"], /<a class="primary-button-section" href="#start">/);
  assert.match(artifact.files["index.html"], /<img class="hero-image-image" src="assets\/hero-placeholder.png" alt="Abstract WordPress builder interface">/);
  assert.match(artifact.files["assets/styles.css"], /\.hero-section-section \{/);
  assert.match(artifact.files["assets/styles.css"], /font-size: 56px;/);
  assert.equal(artifact.metadata.nodeCount, 8);
  assert.equal(artifact.diagnostics.length, 1);
  assert.deepEqual(artifact.diagnostics[0], {
    level: "warning",
    nodeId: "1:7",
    nodeName: "Prototype Connection",
    message: "Unsupported node type: CONNECTOR",
  });
  assert.match(artifact.files["metadata.json"], /"nodeCount": 8/);
});

test("emits data URI image assets and escapes text content", async () => {
  const { generateWebsiteArtifact } = await loadModule();
  const artifact = generateWebsiteArtifact({
    id: "root",
    name: "Escaping Demo",
    type: "FRAME",
    children: [
      {
        id: "text",
        name: "Body",
        type: "TEXT",
        characters: "Use <safe> & semantic-ish HTML",
      },
      {
        id: "image",
        name: "Logo Image",
        type: "IMAGE",
        image: {
          dataUri: "data:image/svg+xml,%3Csvg%3E%3C/svg%3E",
          alt: "Logo",
        },
      },
    ],
  });

  assert.match(artifact.files["index.html"], /Use &lt;safe&gt; &amp; semantic-ish HTML/);
  assert.match(artifact.files["index.html"], /src="assets\/logo-image.svg"/);
  assert.equal(artifact.files["assets/logo-image.svg"], "data:image/svg+xml,%3Csvg%3E%3C/svg%3E");
});

test("serializes base64 data URI image assets as artifact file payloads", async () => {
  const { generateWebsiteArtifact } = await loadModule();
  const { toWebsiteArtifactBundle } = await loadPayloadModule();
  const artifact = generateWebsiteArtifact({
    id: "root",
    name: "Image Bundle Demo",
    type: "FRAME",
    children: [
      {
        id: "image",
        name: "Hero Photo",
        type: "IMAGE",
        image: {
          dataUri: "data:image/png;base64,ZmFrZS1wbmc=",
          alt: "Hero",
        },
      },
    ],
  });
  const bundle = toWebsiteArtifactBundle(artifact, {
    id: "root",
    name: "Image Bundle Demo",
    type: "DOCUMENT",
    exportedAt: "2026-01-01T00:00:00.000Z",
    root: { id: "root", name: "Image Bundle Demo", type: "FRAME", visible: true },
    assets: [],
  });
  const imageFile = bundle.files.find((file) => file.path === "website/assets/hero-photo.png");

  assert.equal(imageFile.content, undefined);
  assert.equal(imageFile.content_base64, "ZmFrZS1wbmc=");
  assert.equal(imageFile.mime_type, "image/png");
});

test("generates a Studio CLI import payload for the Figma handoff", async () => {
  const { generateStaticArtifact } = await loadExporterModule();
  const artifact = generateStaticArtifact({
    id: "root",
    name: "Studio CLI Demo",
    type: "DOCUMENT",
    exportedAt: "2026-01-01T00:00:00.000Z",
    root: {
      id: "frame",
      name: "Landing Page",
      type: "FRAME",
      visible: true,
      children: [
        {
          id: "headline",
          name: "Headline",
          type: "TEXT",
          visible: true,
          characters: "Import with Studio CLI",
        },
      ],
    },
    assets: [],
  });

  assert.equal(artifact.studioImportPayload.schema, "blocks-engine/php-transformer/site-artifact/v1");
  assert.equal(artifact.studioImportPayload.entrypoint, "website/index.html");
  assert.ok(artifact.studioImportPayload.files.some((file) => file.path === "website/index.html"));
});

test("generates a source-first Figma handoff payload with debug summary", async () => {
  const { toFigmaSourcePayload } = await loadPayloadModule();
  const selection = {
    id: "root",
    name: "Studio Figma Source Demo",
    type: "DOCUMENT",
    exportedAt: "2026-01-01T00:00:00.000Z",
    root: {
      id: "doc",
      name: "Document",
      type: "DOCUMENT",
      visible: true,
      children: [
        {
          id: "page-1",
          name: "Landing",
          type: "PAGE",
          visible: true,
          children: [
            {
              id: "frame-1",
              name: "Hero",
              type: "FRAME",
              visible: true,
              children: [
                {
                  id: "headline",
                  name: "Headline",
                  type: "TEXT",
                  visible: true,
                  characters: "Import with Studio",
                },
              ],
            },
          ],
        },
      ],
    },
    source: {
      provider: "figma",
      plugin: "figma-to-wordpress-studio",
      fileKey: "abc123",
      fileName: "Studio Figma Source Demo",
      editorType: "figma",
      currentPage: { id: "page-1", name: "Landing" },
    },
    selectionIntent: {
      scope: "selected-nodes",
      pageId: "page-1",
      pageName: "Landing",
      selectedNodeIds: ["frame-1"],
      rootNodeIds: ["frame-1"],
    },
    currentPage: {
      id: "page-1",
      name: "Landing",
      type: "PAGE",
      visible: true,
      children: [
        {
          id: "frame-1",
          name: "Hero",
          type: "FRAME",
          visible: true,
          children: [
            {
              id: "headline",
              name: "Headline",
              type: "TEXT",
              visible: true,
              characters: "Import with Studio",
            },
          ],
        },
      ],
    },
    selectedNodes: [
      {
        id: "frame-1",
        name: "Hero",
        type: "FRAME",
        visible: true,
        children: [
          {
            id: "headline",
            name: "Headline",
            type: "TEXT",
            visible: true,
            characters: "Import with Studio",
          },
        ],
      },
    ],
    assets: [{ id: "asset-1", name: "Hero.png", format: "PNG", dataUrl: "data:image/png;base64,YQ==" }],
  };
  const artifact = {
    title: selection.name,
    html: "",
    css: "",
    studioImportPayload: { schema: "blocks-engine/php-transformer/site-artifact/v1" },
    files: {},
    diagnostics: [{ level: "warning", nodeId: "frame-1", nodeName: "Hero", message: "Review layout" }],
  };
  const source = toFigmaSourcePayload(selection, artifact, "handoff-123");

  assert.equal(source.schema, "wordpress-studio/figma-source/v1");
  assert.equal(source.source.metadata.fileKey, "abc123");
  assert.equal(source.intent.scope, "selected-nodes");
  assert.deepEqual(source.intent.selectedNodeIds, ["frame-1"]);
  assert.equal(source.scenegraph.currentPage.id, "page-1");
  assert.equal(source.scenegraph.selectedNodes[0].id, "frame-1");
  assert.equal(source.transform.route, "static-site-importer/figma");
  assert.equal(source.transform.options.preserveSourceScenegraph, true);
  assert.equal(source.debug.handoffId, "handoff-123");
  assert.equal(source.debug.generatedArtifact.schema, "blocks-engine/php-transformer/site-artifact/v1");
  assert.equal(source.debug.summary.scope, "selected-nodes");
  assert.equal(source.debug.summary.selectedNodeCount, 1);
  assert.equal(source.debug.summary.nodeCount, 2);
  assert.equal(source.debug.summary.assetCount, 1);
  assert.equal(source.debug.summary.diagnosticCount, artifact.diagnostics.length);
  assert.equal(source.debug.summary.warningCount, 1);
});

test("reports missing image sources with node identity", async () => {
  const { generateWebsiteArtifact } = await loadModule();
  const artifact = generateWebsiteArtifact({
    id: "missing-image",
    name: "Missing Image",
    type: "IMAGE",
  });

  assert.equal(artifact.diagnostics.length, 1);
  assert.equal(artifact.diagnostics[0].nodeId, "missing-image");
  assert.equal(artifact.diagnostics[0].nodeName, "Missing Image");
  assert.equal(artifact.diagnostics[0].message, "Image node is missing image.src or image.dataUri");
});

test("preserves Figma bounding-box positions when available", async () => {
  const { generateWebsiteArtifact } = await loadModule();
  const artifact = generateWebsiteArtifact({
    id: "root",
    name: "Positioned Demo",
    type: "FRAME",
    x: 100,
    y: 200,
    width: 400,
    height: 300,
    children: [
      {
        id: "headline",
        name: "Hero Title",
        type: "TEXT",
        x: 140,
        y: 260,
        width: 240,
        height: 60,
        characters: "Placed title",
        fills: [
          {
            type: "SOLID",
            color: { r: 0.1, g: 0.2, b: 0.3 },
          },
        ],
        style: {
          fontSize: 32,
          fontWeight: "Bold",
        },
      },
    ],
  });

  const css = artifact.files["assets/styles.css"];
  assert.match(css, /\.hero-title-text \{/);
  assert.match(css, /position: absolute;/);
  assert.match(css, /left: 40px;/);
  assert.match(css, /top: 60px;/);
  assert.match(css, /color: rgb\(26, 51, 77\);/);
  assert.match(css, /font-weight: 700;/);
});
