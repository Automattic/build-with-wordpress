import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const entryPoint = path.join(root, "scripts", "wordpress-telemetry-mcp.mjs");
const outdir = path.join(root, "dist");
const outfile = path.join(outdir, "wordpress-telemetry-mcp.mjs");

await mkdir(outdir, { recursive: true });

await build({
  entryPoints: [entryPoint],
  outfile,
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node18",
  legalComments: "none",
  banner: {
    js: "#!/usr/bin/env node",
  },
});
