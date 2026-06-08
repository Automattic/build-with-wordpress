import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const sharedSkillsDir = path.join(root, "skills");
const pluginName = "wordpress-studio";
const pluginDisplayName = "WordPress Studio";
const codexRootDir = path.join(root, "plugins", "codex");
const codexPluginDir = path.join(codexRootDir, "plugins", pluginName);
const codexMarketplacePath = path.join(
  codexRootDir,
  ".agents",
  "plugins",
  "marketplace.json"
);
const claudePluginDir = path.join(root, "plugins", "claude-code");
const geminiPluginDir = path.join(root, "plugins", "gemini");

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

async function verifyMcpConfig(pluginDir, surfaceName, relativePath = ".mcp.json") {
  await access(path.join(pluginDir, relativePath));

  const mcpRaw = await readFile(path.join(pluginDir, relativePath), "utf8");
  const mcp = JSON.parse(mcpRaw);

  if (!mcp.mcpServers || typeof mcp.mcpServers !== "object") {
    throw new Error(`${surfaceName} MCP config is missing the mcpServers wrapper`);
  }

  if (!mcp.mcpServers["wordpress-studio"]) {
    throw new Error(`${surfaceName} MCP config is missing the wordpress-studio entry`);
  }

  if (!mcp.mcpServers["wordpress-telemetry"]) {
    throw new Error(`${surfaceName} MCP config is missing the wordpress-telemetry entry`);
  }
}

async function verifyTelemetryScript(pluginDir, surfaceName) {
  try {
    await access(path.join(pluginDir, "scripts", "wordpress-telemetry-mcp.mjs"));
  } catch (error) {
    throw new Error(`${surfaceName} plugin is missing scripts/wordpress-telemetry-mcp.mjs`);
  }
}

async function verifyCodexPlugin(skillNames) {
  await access(path.join(codexPluginDir, ".codex-plugin", "plugin.json"));
  await access(path.join(codexPluginDir, "README.md"));
  await access(codexMarketplacePath);
  await verifySharedSkillSet(codexPluginDir, skillNames);
  await verifyMcpConfig(codexPluginDir, "Codex plugin");
  await verifyTelemetryScript(codexPluginDir, "Codex");

  const manifestRaw = await readFile(
    path.join(codexPluginDir, ".codex-plugin", "plugin.json"),
    "utf8"
  );
  const manifest = JSON.parse(manifestRaw);

  if (manifest.name !== pluginName) {
    throw new Error("Unexpected Codex plugin name");
  }

  if (manifest.skills !== "./skills/") {
    throw new Error("Codex plugin manifest is missing the skills path");
  }

  if (manifest.mcpServers !== "./.mcp.json") {
    throw new Error("Codex plugin manifest is missing the MCP config path");
  }

  if (manifest.interface?.displayName !== pluginDisplayName) {
    throw new Error("Codex plugin manifest has the wrong display name");
  }

  const marketplaceRaw = await readFile(codexMarketplacePath, "utf8");
  const marketplace = JSON.parse(marketplaceRaw);
  const pluginEntry = marketplace.plugins?.find((entry) => entry.name === pluginName);

  if (marketplace.name !== pluginName) {
    throw new Error("Codex marketplace has the wrong name");
  }

  if (marketplace.interface?.displayName !== pluginDisplayName) {
    throw new Error("Codex marketplace has the wrong display name");
  }

  if (!pluginEntry) {
    throw new Error("Codex marketplace is missing the wordpress-studio plugin entry");
  }

  if (pluginEntry.source?.path !== `./plugins/${pluginName}`) {
    throw new Error("Codex marketplace has the wrong plugin path");
  }
}

async function verifyClaudePlugin(skillNames) {
  await access(path.join(claudePluginDir, ".claude-plugin", "plugin.json"));
  await access(path.join(claudePluginDir, "README.md"));
  await verifySharedSkillSet(claudePluginDir, skillNames);
  await verifyMcpConfig(claudePluginDir, "Claude plugin");
  await verifyTelemetryScript(claudePluginDir, "Claude");

  const manifestRaw = await readFile(
    path.join(claudePluginDir, ".claude-plugin", "plugin.json"),
    "utf8"
  );
  const manifest = JSON.parse(manifestRaw);

  if (manifest.name !== pluginName) {
    throw new Error("Unexpected Claude plugin name");
  }
}

async function verifyGeminiPlugin(skillNames) {
  await access(path.join(geminiPluginDir, "GEMINI.md"));
  await access(path.join(geminiPluginDir, "README.md"));
  await verifySharedSkillSet(geminiPluginDir, skillNames);
  await verifyMcpConfig(geminiPluginDir, "Gemini plugin", path.join(".gemini", "settings.json"));
  await verifyTelemetryScript(geminiPluginDir, "Gemini");

  const instructions = await readFile(path.join(geminiPluginDir, "GEMINI.md"), "utf8");

  if (!instructions.includes("WordPress Studio MCP server")) {
    throw new Error("Gemini instructions are missing Studio MCP guidance");
  }

  if (!instructions.includes("skills/wordpress-creator/SKILL.md")) {
    throw new Error("Gemini instructions are missing wordpress-creator routing guidance");
  }
}

async function main() {
  const skillNames = await getSharedSkillNames();

  await verifyCodexPlugin(skillNames);
  await verifyClaudePlugin(skillNames);
  await verifyGeminiPlugin(skillNames);

  console.log("Codex, Claude, and Gemini plugin verification passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
