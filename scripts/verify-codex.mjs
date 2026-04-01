import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const pluginDir = path.join(root, "plugins", "build-with-wordpress");

const requiredPaths = [
  path.join(pluginDir, ".codex-plugin", "plugin.json"),
  path.join(pluginDir, ".mcp.json"),
  path.join(pluginDir, "README.md"),
  path.join(pluginDir, "skills", "studio", "SKILL.md"),
  path.join(pluginDir, "skills", "theme-creator", "SKILL.md"),
  path.join(pluginDir, "skills", "site-creator", "SKILL.md"),
  path.join(pluginDir, "skills", "design-previews-creator", "SKILL.md"),
  path.join(pluginDir, "skills", "block-creator", "SKILL.md"),
  path.join(pluginDir, "skills", "plugin-creator", "SKILL.md"),
  path.join(pluginDir, "skills", "wordpress-creator", "SKILL.md")
];

async function main() {
  for (const requiredPath of requiredPaths) {
    await access(requiredPath);
  }

  const manifestRaw = await readFile(
    path.join(pluginDir, ".codex-plugin", "plugin.json"),
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

  const mcpRaw = await readFile(path.join(pluginDir, ".mcp.json"), "utf8");
  const mcp = JSON.parse(mcpRaw);

  if (!mcp.mcpServers || typeof mcp.mcpServers !== "object") {
    throw new Error("Codex plugin MCP config is missing the mcpServers wrapper");
  }

  if (!mcp.mcpServers["wordpress-studio"]) {
    throw new Error("wordpress-studio MCP entry is missing");
  }

  console.log("Codex plugin verification passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
