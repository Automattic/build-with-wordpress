import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const sharedSkillsDir = path.join(root, "skills");
const pluginName = "wordpress-studio";
const pluginDisplayName = "WordPress Studio";
const cursorPluginName = pluginName;
const codexRootDir = path.join(root, "plugins", "codex");
const codexPluginDir = path.join(codexRootDir, "plugins", pluginName);
const codexMarketplacePath = path.join(
  codexRootDir,
  ".agents",
  "plugins",
  "marketplace.json"
);
const claudePluginDir = path.join(root, "plugins", "claude-code");
const cursorPluginDir = path.join(root, "plugins", "cursor");
const continueOutputDir = path.join(root, "plugins", "continue");

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

async function verifyMcpConfig(pluginDir, surfaceName, configFileName = ".mcp.json") {
  await access(path.join(pluginDir, configFileName));

  const mcpRaw = await readFile(path.join(pluginDir, configFileName), "utf8");
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

async function verifyCursorPlugin(skillNames) {
  await access(path.join(cursorPluginDir, ".cursor-plugin", "plugin.json"));
  await access(path.join(cursorPluginDir, "README.md"));
  await access(path.join(cursorPluginDir, "rules", "wordpress-studio.mdc"));
  await verifySharedSkillSet(cursorPluginDir, skillNames);
  await verifyMcpConfig(cursorPluginDir, "Cursor plugin", "mcp.json");
  await verifyTelemetryScript(cursorPluginDir, "Cursor");

  const manifestRaw = await readFile(
    path.join(cursorPluginDir, ".cursor-plugin", "plugin.json"),
    "utf8"
  );
  const manifest = JSON.parse(manifestRaw);

  if (manifest.name !== cursorPluginName) {
    throw new Error("Unexpected Cursor plugin name");
  }

  if (manifest.displayName !== pluginDisplayName) {
    throw new Error("Cursor plugin manifest has the wrong display name");
  }

  if (manifest.rules !== "./rules/") {
    throw new Error("Cursor plugin manifest is missing the rules path");
  }

  if (manifest.skills !== "./skills/") {
    throw new Error("Cursor plugin manifest is missing the skills path");
  }

  if (manifest.mcpServers !== "./mcp.json") {
    throw new Error("Cursor plugin manifest is missing the MCP config path");
  }

  const ruleRaw = await readFile(
    path.join(cursorPluginDir, "rules", "wordpress-studio.mdc"),
    "utf8"
  );

  if (!ruleRaw.startsWith("---\n")) {
    throw new Error("Cursor rule is missing frontmatter");
  }

  if (!ruleRaw.includes("alwaysApply: true")) {
    throw new Error("Cursor rule is missing alwaysApply frontmatter");
  }
}

async function verifyContinueOutput() {
  const requiredFiles = [
    "README.md",
    "config.yaml",
    path.join(".continue", "rules", "wordpress-com.md"),
    path.join(".continue", "prompts", "create-wordpress-com-site.md"),
    path.join(".continue", "prompts", "audit-wordpress-com-project.md"),
    path.join(".continue", "mcpServers", "wordpress-com.yaml"),
  ];

  for (const filePath of requiredFiles) {
    await access(path.join(continueOutputDir, filePath));
  }

  const readme = await readFile(
    path.join(continueOutputDir, "README.md"),
    "utf8"
  );
  if (!readme.includes("WordPress.com for Continue")) {
    throw new Error("Continue README is missing the expected title");
  }
  if (!readme.includes("Continue-specific pieces")) {
    throw new Error("Continue README must explain Continue-specific pieces");
  }
  if (!readme.includes("Shared WordPress.com substrate")) {
    throw new Error("Continue README must explain the shared MCP substrate");
  }

  const mcpServerBlock = await readFile(
    path.join(continueOutputDir, ".continue", "mcpServers", "wordpress-com.yaml"),
    "utf8"
  );
  if (!mcpServerBlock.includes("mcpServers:")) {
    throw new Error("Continue MCP block is missing mcpServers");
  }
  if (!mcpServerBlock.includes("command: studio")) {
    throw new Error("Continue MCP block must use the existing studio MCP entrypoint");
  }

  const rule = await readFile(
    path.join(continueOutputDir, ".continue", "rules", "wordpress-com.md"),
    "utf8"
  );
  if (!rule.includes("name: WordPress.com")) {
    throw new Error("Continue rule is missing WordPress.com frontmatter");
  }
}

async function main() {
  const skillNames = await getSharedSkillNames();

  await verifyCodexPlugin(skillNames);
  await verifyClaudePlugin(skillNames);
  await verifyCursorPlugin(skillNames);
  await verifyContinueOutput();

  console.log("Codex, Claude, Cursor, and Continue verification passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
