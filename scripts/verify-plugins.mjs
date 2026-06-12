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
const cursorPluginDisplayName = pluginDisplayName;
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
const openCodePluginDir = path.join(root, "plugins", "opencode");
const rooPluginDir = path.join(root, "plugins", "roo-code");
const geminiPluginDir = path.join(root, "plugins", "gemini");
const copilotPluginDir = path.join(root, "plugins", "copilot");
const kiloCodePluginDir = path.join(root, "plugins", "kilo-code");
const windsurfPluginDir = path.join(root, "plugins", "windsurf");

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

async function verifyMcpConfig(pluginDir, surfaceName, configPath = ".mcp.json") {
  await access(path.join(pluginDir, configPath));

  const mcpRaw = await readFile(path.join(pluginDir, configPath), "utf8");
  const mcp = JSON.parse(mcpRaw);
  const servers = mcp.mcpServers ?? mcp.servers;

  if (!servers || typeof servers !== "object") {
    throw new Error(`${surfaceName} MCP config is missing a server wrapper`);
  }

  if (!servers["wordpress-studio"]) {
    throw new Error(`${surfaceName} MCP config is missing the wordpress-studio entry`);
  }

  if (!servers["wordpress-telemetry"]) {
    throw new Error(`${surfaceName} MCP config is missing the wordpress-telemetry entry`);
  }
}

async function verifyOpenCodeMcpConfig() {
  await access(path.join(openCodePluginDir, "opencode.json"));

  const configRaw = await readFile(
    path.join(openCodePluginDir, "opencode.json"),
    "utf8"
  );
  const config = JSON.parse(configRaw);

  if (config.$schema !== "https://opencode.ai/config.json") {
    throw new Error("OpenCode config is missing the OpenCode schema");
  }

  if (!config.mcp || typeof config.mcp !== "object") {
    throw new Error("OpenCode config is missing the mcp wrapper");
  }

  if (config.mcp["wordpress-studio"]?.type !== "local") {
    throw new Error("OpenCode config is missing the local wordpress-studio MCP entry");
  }

  if (!Array.isArray(config.mcp["wordpress-studio"]?.command)) {
    throw new Error("OpenCode wordpress-studio MCP entry must use command array syntax");
  }

  if (config.mcp["wordpress-studio"].command.join(" ") !== "studio mcp") {
    throw new Error("OpenCode wordpress-studio MCP command should launch studio mcp");
  }

  if (config.mcp["wordpress-telemetry"]?.type !== "local") {
    throw new Error("OpenCode config is missing the local wordpress-telemetry MCP entry");
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

  if (manifest.displayName !== cursorPluginDisplayName) {
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

async function verifyOpenCodePlugin(skillNames) {
  await access(path.join(openCodePluginDir, "README.md"));
  await access(path.join(openCodePluginDir, "AGENTS.md"));
  await access(path.join(openCodePluginDir, ".opencode", "agents", "wordpress-com.md"));
  await access(path.join(openCodePluginDir, ".opencode", "commands", "wordpress.md"));
  await access(path.join(openCodePluginDir, ".opencode", "plugins", "README.md"));
  await verifySharedSkillSet(path.join(openCodePluginDir, ".opencode"), skillNames);
  await verifyOpenCodeMcpConfig();
  await verifyTelemetryScript(openCodePluginDir, "OpenCode");

  const readme = await readFile(path.join(openCodePluginDir, "README.md"), "utf8");
  if (!readme.includes("WordPress.com")) {
    throw new Error("OpenCode README should use the WordPress.com product name");
  }
}

async function verifyKiloCodePlugin(skillNames) {
  await access(path.join(kiloCodePluginDir, "README.md"));
  await access(path.join(kiloCodePluginDir, "AGENTS.md"));
  await access(path.join(kiloCodePluginDir, "kilo.jsonc"));
  await access(path.join(kiloCodePluginDir, ".kilo", "agents", "wordpress-com.md"));
  await access(path.join(kiloCodePluginDir, ".kilo", "rules", "wordpress-com.md"));
  await access(path.join(kiloCodePluginDir, ".kilo", "plugin", "README.md"));
  await verifySharedSkillSet(path.join(kiloCodePluginDir, ".kilo"), skillNames);
  await verifyTelemetryScript(kiloCodePluginDir, "Kilo Code");

  const configRaw = await readFile(path.join(kiloCodePluginDir, "kilo.jsonc"), "utf8");
  const config = JSON.parse(configRaw);

  if (config.$schema !== "https://app.kilo.ai/config.json") {
    throw new Error("Kilo Code config is missing the Kilo schema");
  }

  if (!Array.isArray(config.instructions)) {
    throw new Error("Kilo Code config is missing project instructions");
  }

  if (!config.instructions.includes(".kilo/rules/wordpress-com.md")) {
    throw new Error("Kilo Code config should load the generated custom rule");
  }

  if (!config.mcp || typeof config.mcp !== "object") {
    throw new Error("Kilo Code config is missing the mcp wrapper");
  }

  if (config.mcp["wordpress-studio"]?.type !== "local") {
    throw new Error("Kilo Code config is missing the local wordpress-studio MCP entry");
  }

  if (!Array.isArray(config.mcp["wordpress-studio"]?.command)) {
    throw new Error("Kilo Code wordpress-studio MCP entry must use command array syntax");
  }

  if (config.mcp["wordpress-studio"].command.join(" ") !== "studio mcp") {
    throw new Error("Kilo Code wordpress-studio MCP command should launch studio mcp");
  }

  if (config.mcp["wordpress-telemetry"]?.type !== "local") {
    throw new Error("Kilo Code config is missing the local wordpress-telemetry MCP entry");
  }

  const readme = await readFile(path.join(kiloCodePluginDir, "README.md"), "utf8");
  if (!readme.includes("https://kilocode.ai/docs/customize/custom-rules")) {
    throw new Error("Kilo Code README should link official custom rules docs");
  }
  if (!readme.includes("https://kilocode.ai/docs/automate/mcp/using-in-kilo-code")) {
    throw new Error("Kilo Code README should link official MCP docs");
  }
  if (!readme.includes("https://github.com/Kilo-Org/kilo-marketplace")) {
    throw new Error("Kilo Code README should link the Kilo Marketplace repository");
  }
}

async function verifyRooPlugin(skillNames) {
  await access(path.join(rooPluginDir, "README.md"));
  await access(path.join(rooPluginDir, "AGENTS.md"));
  await access(path.join(rooPluginDir, ".roo", "rules", "wordpress-com.md"));
  await access(path.join(rooPluginDir, ".roo", "rules-code", "wordpress-com-code.md"));
  await verifySharedSkillSet(rooPluginDir, skillNames);
  await verifyTelemetryScript(rooPluginDir, "Roo Code");

  const mcpPath = path.join(rooPluginDir, ".roo", "mcp.json");
  await access(mcpPath);

  const mcpRaw = await readFile(mcpPath, "utf8");
  const mcp = JSON.parse(mcpRaw);

  if (!mcp.mcpServers?.["wordpress-studio"]) {
    throw new Error("Roo Code MCP config is missing the wordpress-studio entry");
  }

  if (!mcp.mcpServers?.["wordpress-telemetry"]) {
    throw new Error("Roo Code MCP config is missing the wordpress-telemetry entry");
  }
}

async function verifyGeminiPlugin(skillNames) {
  await access(path.join(geminiPluginDir, "GEMINI.md"));
  await access(path.join(geminiPluginDir, "README.md"));
  await verifySharedSkillSet(geminiPluginDir, skillNames);
  await verifyMcpConfig(
    geminiPluginDir,
    "Gemini plugin",
    path.join(".gemini", "settings.json"),
  );
  await verifyTelemetryScript(geminiPluginDir, "Gemini");

  const instructions = await readFile(path.join(geminiPluginDir, "GEMINI.md"), "utf8");

  if (!instructions.includes("WordPress Studio MCP server")) {
    throw new Error("Gemini instructions are missing Studio MCP guidance");
  }

  if (!instructions.includes("skills/wordpress-creator/SKILL.md")) {
    throw new Error("Gemini instructions are missing wordpress-creator routing guidance");
  }
}

async function verifyCopilotPlugin(skillNames) {
  await access(path.join(copilotPluginDir, ".github", "copilot-instructions.md"));
  await access(
    path.join(
      copilotPluginDir,
      ".github",
      "instructions",
      "wordpress-studio.instructions.md",
    ),
  );
  await access(path.join(copilotPluginDir, ".vscode", "mcp.json"));
  await access(path.join(copilotPluginDir, "README.md"));
  await verifySharedSkillSet(copilotPluginDir, skillNames);
  await verifyMcpConfig(
    copilotPluginDir,
    "GitHub Copilot plugin",
    path.join(".vscode", "mcp.json"),
  );
  await verifyTelemetryScript(copilotPluginDir, "GitHub Copilot");

  const instructionsRaw = await readFile(
    path.join(copilotPluginDir, ".github", "copilot-instructions.md"),
    "utf8",
  );

  if (!instructionsRaw.includes("WordPress Studio for GitHub Copilot")) {
    throw new Error("Copilot instructions are missing the expected heading");
  }
}

async function verifyWindsurfPlugin(skillNames) {
  await access(path.join(windsurfPluginDir, "README.md"));
  await access(path.join(windsurfPluginDir, ".devin", "rules", "wordpress-com.md"));
  await access(path.join(windsurfPluginDir, ".devin", "rules", "wordpress-com-mcp.md"));
  await verifySharedSkillSet(windsurfPluginDir, skillNames);
  await verifyMcpConfig(windsurfPluginDir, "Windsurf plugin", "mcp_config.json");
  await verifyTelemetryScript(windsurfPluginDir, "Windsurf");

  const alwaysOnRule = await readFile(
    path.join(windsurfPluginDir, ".devin", "rules", "wordpress-com.md"),
    "utf8",
  );
  if (!alwaysOnRule.startsWith("---\ntrigger: always_on\n---")) {
    throw new Error("Windsurf workspace rule is missing always_on trigger frontmatter");
  }

  const mcpRule = await readFile(
    path.join(windsurfPluginDir, ".devin", "rules", "wordpress-com-mcp.md"),
    "utf8",
  );
  if (!mcpRule.includes("trigger: model_decision")) {
    throw new Error("Windsurf MCP rule is missing model_decision trigger frontmatter");
  }

  const readme = await readFile(path.join(windsurfPluginDir, "README.md"), "utf8");
  if (!readme.includes("~/.codeium/windsurf/mcp_config.json")) {
    throw new Error("Windsurf README is missing the Cascade MCP config path");
  }
}

async function main() {
  const skillNames = await getSharedSkillNames();

  await verifyCodexPlugin(skillNames);
  await verifyClaudePlugin(skillNames);
  await verifyCursorPlugin(skillNames);
  await verifyContinueOutput();
  await verifyOpenCodePlugin(skillNames);
  await verifyKiloCodePlugin(skillNames);
  await verifyRooPlugin(skillNames);
  await verifyGeminiPlugin(skillNames);
  await verifyCopilotPlugin(skillNames);
  await verifyWindsurfPlugin(skillNames);

  console.log("Codex, Claude, Cursor, Continue, OpenCode, Kilo Code, Roo Code, Gemini, Copilot, and Windsurf verification passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
