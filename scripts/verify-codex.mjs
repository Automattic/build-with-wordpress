import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist", "codex");

const requiredPaths = [
  path.join(distDir, ".codex-plugin", "plugin.json"),
  path.join(distDir, ".mcp.json"),
  path.join(distDir, "README.md"),
  path.join(distDir, "skills", "studio", "SKILL.md"),
  path.join(distDir, "skills", "theme-creator", "SKILL.md"),
  path.join(distDir, "skills", "site-creator", "SKILL.md"),
  path.join(distDir, "skills", "block-creator", "SKILL.md")
];

async function main() {
  for (const requiredPath of requiredPaths) {
    await access(requiredPath);
  }

  const manifestRaw = await readFile(
    path.join(distDir, ".codex-plugin", "plugin.json"),
    "utf8"
  );
  const manifest = JSON.parse(manifestRaw);

  if (manifest.name !== "build-with-wordpress") {
    throw new Error("Unexpected Codex plugin name");
  }

  if (manifest.skills !== "./skills/") {
    throw new Error("Codex plugin manifest is missing the skills path");
  }

  if (manifest.mcpServers !== "./.mcp.json") {
    throw new Error("Codex plugin manifest is missing the MCP config path");
  }

  const mcpRaw = await readFile(path.join(distDir, ".mcp.json"), "utf8");
  const mcp = JSON.parse(mcpRaw);

  if (!mcp["wordpress-studio"]) {
    throw new Error("wordpress-studio MCP entry is missing");
  }

  console.log("Codex plugin verification passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
