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
  const outfile = path.join(tmpdir(), `figma-to-wordpress-${Date.now()}-${Math.random()}.mjs`);
  await esbuild.build({
    entryPoints: [path.join(pluginDir, "src", "index.ts")],
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
