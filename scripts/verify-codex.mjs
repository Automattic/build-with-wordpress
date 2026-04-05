import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const sharedSkillsDir = path.join(root, "skills");
const codexPluginDir = path.join(root, "plugins", "build-with-wordpress");
const claudePluginDir = path.join(root, "plugins", "claude-code");

async function getSharedSkillNames() {
  const entries = await readdir(sharedSkillsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

async function verifySharedSkillSet(pluginDir, skillNames) {
  for (const skillName of skillNames) {
    await access(path.join(pluginDir, "skills", skillName, "SKILL.md"));
  }
}

async function verifyMcpConfig(pluginDir, surfaceName) {
  await access(path.join(pluginDir, ".mcp.json"));

  const mcpRaw = await readFile(path.join(pluginDir, ".mcp.json"), "utf8");
  const mcp = JSON.parse(mcpRaw);

  if (!mcp.mcpServers || typeof mcp.mcpServers !== "object") {
    throw new Error(`${surfaceName} MCP config is missing the mcpServers wrapper`);
  }

  if (!mcp.mcpServers["wordpress-studio"]) {
    throw new Error(`${surfaceName} MCP config is missing the wordpress-studio entry`);
  }
}

async function verifyCodexPlugin(skillNames) {
  await access(path.join(codexPluginDir, ".codex-plugin", "plugin.json"));
  await access(path.join(codexPluginDir, "README.md"));
  await verifySharedSkillSet(codexPluginDir, skillNames);
  await verifyMcpConfig(codexPluginDir, "Codex plugin");

  const manifestRaw = await readFile(
    path.join(codexPluginDir, ".codex-plugin", "plugin.json"),
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
}

async function verifyClaudePlugin(skillNames) {
  await access(path.join(claudePluginDir, ".claude-plugin", "plugin.json"));
  await access(path.join(claudePluginDir, "README.md"));
  await verifySharedSkillSet(claudePluginDir, skillNames);
  await verifyMcpConfig(claudePluginDir, "Claude plugin");

  const manifestRaw = await readFile(
    path.join(claudePluginDir, ".claude-plugin", "plugin.json"),
    "utf8"
  );
  const manifest = JSON.parse(manifestRaw);

  if (manifest.name !== "build-with-wordpress") {
    throw new Error("Unexpected Claude plugin name");
  }
}

async function main() {
  const skillNames = await getSharedSkillNames();

  await verifyCodexPlugin(skillNames);
  await verifyClaudePlugin(skillNames);

  console.log("Codex and Claude plugin verification passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
