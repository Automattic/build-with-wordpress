import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");
const watch = process.argv.includes("--watch");

await mkdir(distDir, { recursive: true });

const commonOptions = {
  bundle: true,
  target: "es2017",
  format: "iife",
  sourcemap: watch ? "inline" : false,
};

async function writeUiHtml() {
  const [template, uiScript] = await Promise.all([
    readFile(path.join(root, "src", "ui.html"), "utf8"),
    readFile(path.join(distDir, "ui.js"), "utf8"),
  ]);

  await writeFile(
    path.join(distDir, "ui.html"),
    template.replace("<!-- UI_SCRIPT -->", `<script>${uiScript}</script>`),
  );
}

if (watch) {
  const controllerContext = await esbuild.context({
    ...commonOptions,
    entryPoints: [path.join(root, "src", "code.ts")],
    outfile: path.join(distDir, "code.js"),
  });
  const uiContext = await esbuild.context({
    ...commonOptions,
    entryPoints: [path.join(root, "src", "ui.ts")],
    outfile: path.join(distDir, "ui.js"),
  });

  await controllerContext.watch();
  await uiContext.watch();
  await writeUiHtml();
  console.log("Watching Figma to WordPress plugin sources.");
} else {
  await Promise.all([
    esbuild.build({
      ...commonOptions,
      entryPoints: [path.join(root, "src", "code.ts")],
      outfile: path.join(distDir, "code.js"),
    }),
    esbuild.build({
      ...commonOptions,
      entryPoints: [path.join(root, "src", "ui.ts")],
      outfile: path.join(distDir, "ui.js"),
    }),
  ]);
  await writeUiHtml();
}
