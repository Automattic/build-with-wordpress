import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getMcpServerEntries,
  hasWordPressMcpServerEntries,
  wordpressStudioMcpArgs,
  wordpressStudioMcpCommand,
  wordpressStudioMcpServerName,
  wordpressTelemetryMcpCommand,
  wordpressTelemetryMcpServerName,
} from "./mcp-setup-contract.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const sharedSkillsDir = path.join(root, "skills");
const pluginName = "wordpress-studio";
const pluginDisplayName = "WordPress Studio";
const cursorPluginName = pluginName;
const cursorPluginDisplayName = pluginDisplayName;
const cursorPluginRepository = "https://github.com/Automattic/wordpress-cursor-plugin";
const cursorRequiredKeywords = [
  "wordpress",
  "studio",
  "wp-cli",
  "cursor",
  "site-creator",
  "theme-creator",
  "block-creator",
  "plugin-creator",
];
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
const conductorOutputDir = path.join(root, "plugins", "conductor");
const openCodePluginDir = path.join(root, "plugins", "opencode");
const rooPluginDir = path.join(root, "plugins", "roo-code");
const juniePluginDir = path.join(root, "plugins", "junie");
const geminiPluginDir = path.join(root, "plugins", "gemini");
const copilotPluginDir = path.join(root, "plugins", "copilot");
const kiloCodePluginDir = path.join(root, "plugins", "kilo-code");
const qodoPluginDir = path.join(root, "plugins", "qodo");
const zedPluginDir = path.join(root, "plugins", "zed");
const devinDesktopPluginDir = path.join(root, "plugins", "devin-desktop");
const clinePluginDir = path.join(root, "plugins", "cline");
const aiderPluginDir = path.join(root, "plugins", "aider");
const factoryOutputDir = path.join(root, "plugins", "factory");
const factoryPluginDir = path.join(factoryOutputDir, "plugins", pluginName);
const factoryMarketplacePath = path.join(
  factoryOutputDir,
  ".factory-plugin",
  "marketplace.json",
);
const devinPluginDir = path.join(root, "plugins", "devin");
const ampPluginDir = path.join(root, "plugins", "amp");
const piPluginDir = path.join(root, "plugins", "pi");
const hermesPluginDir = path.join(root, "plugins", "hermes");
const openClawPluginDir = path.join(root, "plugins", "openclaw");
const vsCodePluginDir = path.join(root, "plugins", "vscode");

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
  const servers = getMcpServerEntries(mcp);

  if (!servers || typeof servers !== "object") {
    throw new Error(`${surfaceName} MCP config is missing a server wrapper`);
  }

  if (!hasWordPressMcpServerEntries(servers)) {
    throw new Error(`${surfaceName} MCP config is missing WordPress MCP entries`);
  }
}

function verifyLocalCommandArrayMcpConfig(mcp, surfaceName) {
  if (!mcp || typeof mcp !== "object") {
    throw new Error(`${surfaceName} config is missing the mcp wrapper`);
  }

  const studioEntry = mcp[wordpressStudioMcpServerName];
  if (studioEntry?.type !== "local") {
    throw new Error(`${surfaceName} config is missing the local ${wordpressStudioMcpServerName} MCP entry`);
  }

  if (!Array.isArray(studioEntry?.command)) {
    throw new Error(`${surfaceName} ${wordpressStudioMcpServerName} MCP entry must use command array syntax`);
  }

  if (studioEntry.command.join(" ") !== [wordpressStudioMcpCommand, ...wordpressStudioMcpArgs].join(" ")) {
    throw new Error(`${surfaceName} ${wordpressStudioMcpServerName} MCP command should launch studio mcp`);
  }

  if (mcp[wordpressTelemetryMcpServerName]?.type !== "local") {
    throw new Error(`${surfaceName} config is missing the local ${wordpressTelemetryMcpServerName} MCP entry`);
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

  verifyLocalCommandArrayMcpConfig(config.mcp, "OpenCode");
}

async function verifyTelemetryScript(pluginDir, surfaceName) {
  try {
    await access(path.join(pluginDir, "scripts", "wordpress-telemetry-mcp.mjs"));
    throw new Error(`${surfaceName} plugin should not copy scripts/wordpress-telemetry-mcp.mjs; MCP configs embed the shared dist artifact`);
  } catch (error) {
    if (error.message?.includes("should not copy")) {
      throw error;
    }
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

  if (manifest.version !== "0.3.0") {
    throw new Error("Cursor plugin manifest has the wrong version");
  }

  if (!manifest.description?.includes("WordPress sites and applications")) {
    throw new Error("Cursor plugin manifest is missing the listing description");
  }

  if (manifest.author?.name !== "Automattic") {
    throw new Error("Cursor plugin manifest has the wrong author");
  }

  if (manifest.homepage !== "https://developer.wordpress.com/") {
    throw new Error("Cursor plugin manifest has the wrong homepage");
  }

  if (manifest.repository !== cursorPluginRepository) {
    throw new Error("Cursor plugin manifest has the wrong repository");
  }

  if (manifest.license !== "GPL-2.0-or-later") {
    throw new Error("Cursor plugin manifest has the wrong license");
  }

  for (const keyword of cursorRequiredKeywords) {
    if (!manifest.keywords?.includes(keyword)) {
      throw new Error(`Cursor plugin manifest is missing keyword ${keyword}`);
    }
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

async function verifyConductorOutput() {
  await access(path.join(conductorOutputDir, "README.md"));
  await access(path.join(conductorOutputDir, ".conductor", "settings.toml"));

  const settings = await readFile(
    path.join(conductorOutputDir, ".conductor", "settings.toml"),
    "utf8",
  );

  if (!settings.includes('"$schema" = "https://conductor.build/schemas/settings.repo.schema.json"')) {
    throw new Error("Conductor settings are missing the repository schema URL");
  }

  if (!settings.includes("[scripts]")) {
    throw new Error("Conductor settings must define a scripts table");
  }

  if (!settings.includes('setup = "pnpm install"')) {
    throw new Error("Conductor settings are missing the setup script");
  }

  if (!settings.includes('run = "pnpm build && pnpm verify"')) {
    throw new Error("Conductor settings are missing the run script");
  }

  const readme = await readFile(path.join(conductorOutputDir, "README.md"), "utf8");

  if (!readme.includes("WordPress.com for Conductor")) {
    throw new Error("Conductor README is missing the expected title");
  }

  if (!readme.includes("Legacy `conductor.json` is not generated")) {
    throw new Error("Conductor README must explain why conductor.json is not generated");
  }

  if (!readme.includes("does not define a repository-level MCP server table")) {
    throw new Error("Conductor README must explain MCP config boundaries");
  }

  if (!readme.includes("message queues are a native composer/workspace feature")) {
    throw new Error("Conductor README must explain message queue boundaries");
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

  verifyLocalCommandArrayMcpConfig(config.mcp, "Kilo Code");

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

  if (!hasWordPressMcpServerEntries(mcp.mcpServers)) {
    throw new Error("Roo Code MCP config is missing WordPress MCP entries");
  }
}

async function verifyClinePlugin(skillNames) {
  await access(path.join(clinePluginDir, "README.md"));
  await access(path.join(clinePluginDir, ".clinerules", "wordpress-com.md"));
  await access(path.join(clinePluginDir, ".cline", "plugins", "README.md"));
  await verifySharedSkillSet(path.join(clinePluginDir, ".cline"), skillNames);
  await verifyMcpConfig(clinePluginDir, "Cline plugin", "mcp.json");
  await verifyTelemetryScript(clinePluginDir, "Cline");

  const readme = await readFile(path.join(clinePluginDir, "README.md"), "utf8");
  if (!readme.includes("WordPress.com for Cline")) {
    throw new Error("Cline README is missing the expected title");
  }
  if (!readme.includes("https://docs.cline.bot/customization/cline-rules.md")) {
    throw new Error("Cline README must link official rules documentation");
  }
  if (!readme.includes("https://docs.cline.bot/customization/skills.md")) {
    throw new Error("Cline README must link official skills documentation");
  }
  if (!readme.includes("https://docs.cline.bot/mcp/mcp-overview.md")) {
    throw new Error("Cline README must link official MCP documentation");
  }
  if (!readme.includes("https://docs.cline.bot/mcp/mcp-marketplace.md")) {
    throw new Error("Cline README must link official MCP Marketplace documentation");
  }
  if (!readme.includes("https://docs.cline.bot/customization/plugins.md")) {
    throw new Error("Cline README must link official plugin documentation");
  }

  const rules = await readFile(
    path.join(clinePluginDir, ".clinerules", "wordpress-com.md"),
    "utf8",
  );
  if (!rules.includes("WordPress.com Cline Rules")) {
    throw new Error("Cline rules are missing the expected heading");
  }
  if (!rules.includes(".cline/skills/<name>/SKILL.md")) {
    throw new Error("Cline rules must point at Cline skills");
  }
}

async function verifyJuniePlugin(skillNames) {
  await access(path.join(juniePluginDir, "README.md"));
  await access(path.join(juniePluginDir, ".junie", "AGENTS.md"));
  await verifySharedSkillSet(path.join(juniePluginDir, ".junie"), skillNames);
  await verifyMcpConfig(
    juniePluginDir,
    "Junie plugin",
    path.join(".junie", "mcp", "mcp.json"),
  );
  await verifyTelemetryScript(juniePluginDir, "Junie");

  const readme = await readFile(path.join(juniePluginDir, "README.md"), "utf8");
  if (!readme.includes("WordPress.com for Junie")) {
    throw new Error("Junie README is missing the expected title");
  }
  if (!readme.includes("https://www.jetbrains.com/help/junie/guidelines-and-memory.html")) {
    throw new Error("Junie README must link official guidelines documentation");
  }
  if (!readme.includes("https://www.jetbrains.com/help/junie/junie-cli-mcp-configuration.html")) {
    throw new Error("Junie README must link official MCP documentation");
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

async function verifyVsCodePlugin(skillNames) {
  await access(path.join(vsCodePluginDir, "package.json"));
  await access(path.join(vsCodePluginDir, "extension.js"));
  await access(path.join(vsCodePluginDir, "README.md"));
  await access(path.join(vsCodePluginDir, "LICENSE"));
  await access(path.join(vsCodePluginDir, "images", "icon.png"));
  await verifySharedSkillSet(vsCodePluginDir, skillNames);
  await verifyMcpConfig(vsCodePluginDir, "VS Code plugin", "mcp.json");
  await verifyTelemetryScript(vsCodePluginDir, "VS Code");

  const manifestRaw = await readFile(
    path.join(vsCodePluginDir, "package.json"),
    "utf8",
  );
  const manifest = JSON.parse(manifestRaw);

  if (manifest.name !== "wordpress-studio-vscode") {
    throw new Error("VS Code extension manifest has the wrong name");
  }

  if (manifest.displayName !== pluginDisplayName) {
    throw new Error("VS Code extension manifest has the wrong display name");
  }

  if (manifest.publisher !== "automattic") {
    throw new Error("VS Code extension manifest should use the Automattic Marketplace publisher");
  }

  if (manifest.main !== "./extension.js") {
    throw new Error("VS Code extension manifest is missing the runtime entrypoint");
  }

  if (manifest.icon !== "images/icon.png") {
    throw new Error("VS Code extension manifest is missing the icon path");
  }

  for (const packagedFile of ["extension.js", "mcp.json", "README.md", "LICENSE", "images/icon.png", "skills/**"]) {
    if (!manifest.files?.includes(packagedFile)) {
      throw new Error(`VS Code extension manifest files list is missing ${packagedFile}`);
    }
  }

  if (!manifest.engines?.vscode) {
    throw new Error("VS Code extension manifest is missing engines.vscode");
  }

  const commands = manifest.contributes?.commands?.map((entry) => entry.command) ?? [];
  for (const command of [
    "wordpressStudio.checkStudio",
    "wordpressStudio.configureWorkspaceMcp",
    "wordpressStudio.validateMcpConfig",
    "wordpressStudio.showMcpConfig",
    "wordpressStudio.copyMcpConfig",
  ]) {
    if (!commands.includes(command)) {
      throw new Error(`VS Code extension manifest is missing command ${command}`);
    }
  }

  const extensionSource = await readFile(
    path.join(vsCodePluginDir, "extension.js"),
    "utf8",
  );

  if (!extensionSource.includes("execFile(\"studio\", [\"--version\"]")) {
    throw new Error("VS Code extension runtime should check studio availability");
  }

  if (!extensionSource.includes("configureWorkspaceMcp")) {
    throw new Error("VS Code extension runtime should configure workspace MCP");
  }

  if (!extensionSource.includes("servers[\"wordpress-studio\"]")) {
    throw new Error("VS Code extension runtime should validate the VS Code MCP servers wrapper");
  }

  if (!extensionSource.includes("mcp.json")) {
    throw new Error("VS Code extension runtime should read the bundled MCP config");
  }

  const readme = await readFile(path.join(vsCodePluginDir, "README.md"), "utf8");
  if (!readme.includes("publisher `automattic`")) {
    throw new Error("VS Code README must document the Marketplace publisher");
  }
}

async function verifyQodoPlugin(skillNames) {
  await access(path.join(qodoPluginDir, "AGENTS.md"));
  await access(path.join(qodoPluginDir, "README.md"));
  await verifySharedSkillSet(qodoPluginDir, skillNames);
  await verifyTelemetryScript(qodoPluginDir, "Qodo");

  const agentsRaw = await readFile(path.join(qodoPluginDir, "AGENTS.md"), "utf8");
  if (!agentsRaw.includes("WordPress Studio for Qodo")) {
    throw new Error("Qodo AGENTS.md is missing the expected heading");
  }
  if (!agentsRaw.includes("skills/wordpress-creator/SKILL.md")) {
    throw new Error("Qodo AGENTS.md is missing wordpress-creator routing guidance");
  }

  const readmeRaw = await readFile(path.join(qodoPluginDir, "README.md"), "utf8");
  const requiredDocLinks = [
    "https://docs.qodo.ai/qodo-ide",
    "https://docs.qodo.ai/qodo-ide/agent/agents.md-support",
    "https://docs.qodo.ai/qodo-ide/tools-mcps/agentic-tools-mcps",
    "https://docs.qodo.ai/install-and-configure/configuration-overview/configuration-file",
    "https://docs.qodo.ai/agent-skills",
  ];

  for (const link of requiredDocLinks) {
    if (!readmeRaw.includes(link)) {
      throw new Error(`Qodo README is missing official reference: ${link}`);
    }
  }

  if (!readmeRaw.includes("does not document a repo-local `.mcp.json`")) {
    throw new Error("Qodo README must explain why no repo-local MCP config is generated");
  }
}

async function verifyZedPlugin(skillNames) {
  await access(path.join(zedPluginDir, "README.md"));
  await access(path.join(zedPluginDir, "AGENTS.md"));
  await access(path.join(zedPluginDir, ".zed", "settings.json"));
  await verifySharedSkillSet(path.join(zedPluginDir, ".agents"), skillNames);
  await verifyTelemetryScript(zedPluginDir, "Zed");

  const settingsRaw = await readFile(
    path.join(zedPluginDir, ".zed", "settings.json"),
    "utf8",
  );
  const settings = JSON.parse(settingsRaw);

  if (!hasWordPressMcpServerEntries(settings.context_servers)) {
    throw new Error("Zed settings are missing WordPress context servers");
  }

  if (settings.context_servers[wordpressStudioMcpServerName].command !== wordpressStudioMcpCommand) {
    throw new Error(`Zed ${wordpressStudioMcpServerName} context server should launch studio`);
  }

  const readme = await readFile(path.join(zedPluginDir, "README.md"), "utf8");
  const requiredDocLinks = [
    "https://zed.dev/docs/ai/instructions",
    "https://zed.dev/docs/ai/skills",
    "https://zed.dev/docs/ai/agent-settings",
    "https://zed.dev/docs/ai/agent-profiles",
    "https://zed.dev/docs/ai/mcp",
    "https://zed.dev/docs/extensions/developing-extensions",
    "https://zed.dev/docs/extensions/mcp-extensions",
    "https://zed.dev/docs/extensions/agent-servers",
  ];

  for (const docLink of requiredDocLinks) {
    if (!readme.includes(docLink)) {
      throw new Error(`Zed README is missing official documentation link: ${docLink}`);
    }
  }

  if (!readme.includes("does not generate a Zed extension")) {
    throw new Error("Zed README must document the extension packaging decision");
  }
}

async function verifyDevinDesktopPlugin(skillNames) {
  await access(path.join(devinDesktopPluginDir, "README.md"));
  await access(path.join(devinDesktopPluginDir, ".devin", "rules", "wordpress-com.md"));
  await access(path.join(devinDesktopPluginDir, ".devin", "rules", "wordpress-com-mcp.md"));
  await verifySharedSkillSet(devinDesktopPluginDir, skillNames);
  await verifyMcpConfig(devinDesktopPluginDir, "Devin Desktop plugin", "mcp_config.json");
  await verifyTelemetryScript(devinDesktopPluginDir, "Devin Desktop");

  const alwaysOnRule = await readFile(
    path.join(devinDesktopPluginDir, ".devin", "rules", "wordpress-com.md"),
    "utf8",
  );
  if (!alwaysOnRule.startsWith("---\ntrigger: always_on\n---")) {
    throw new Error("Devin Desktop workspace rule is missing always_on trigger frontmatter");
  }

  const mcpRule = await readFile(
    path.join(devinDesktopPluginDir, ".devin", "rules", "wordpress-com-mcp.md"),
    "utf8",
  );
  if (!mcpRule.includes("trigger: model_decision")) {
    throw new Error("Devin Desktop MCP rule is missing model_decision trigger frontmatter");
  }

  const readme = await readFile(path.join(devinDesktopPluginDir, "README.md"), "utf8");
  if (!readme.includes("~/.codeium/windsurf/mcp_config.json")) {
    throw new Error("Devin Desktop README is missing the Cascade MCP config path");
  }
  if (!readme.includes("plugins/devin-desktop/mcp_config.json")) {
    throw new Error("Devin Desktop README is missing the generated output path");
  }
}

async function verifyAiderPlugin(skillNames) {
  await access(path.join(aiderPluginDir, ".aider.conf.yml"));
  await access(path.join(aiderPluginDir, "CONVENTIONS.md"));
  await access(path.join(aiderPluginDir, "README.md"));
  await verifySharedSkillSet(aiderPluginDir, skillNames);

  const config = await readFile(path.join(aiderPluginDir, ".aider.conf.yml"), "utf8");

  if (!config.includes("read:")) {
    throw new Error("Aider config is missing the read list");
  }

  if (!config.includes("CONVENTIONS.md")) {
    throw new Error("Aider config does not load CONVENTIONS.md");
  }

  for (const skillName of skillNames) {
    const skillPath = `skills/${skillName}/SKILL.md`;
    if (!config.includes(skillPath)) {
      throw new Error(`Aider config does not load ${skillPath}`);
    }
  }
}

async function verifyFactoryPlugin(skillNames) {
  await access(path.join(factoryPluginDir, ".factory-plugin", "plugin.json"));
  await access(factoryMarketplacePath);
  await access(path.join(factoryPluginDir, "README.md"));
  await access(path.join(factoryPluginDir, "commands", "wordpress.md"));
  await access(path.join(factoryPluginDir, "droids", "wordpress-builder.md"));
  await access(path.join(factoryPluginDir, "hooks", "hooks.json"));
  await access(path.join(factoryPluginDir, "hooks", "session-context.sh"));
  await verifySharedSkillSet(factoryPluginDir, skillNames);
  await verifyMcpConfig(factoryPluginDir, "Factory Droid plugin", "mcp.json");
  await verifyTelemetryScript(factoryPluginDir, "Factory Droid");

  const manifestRaw = await readFile(
    path.join(factoryPluginDir, ".factory-plugin", "plugin.json"),
    "utf8",
  );
  const manifest = JSON.parse(manifestRaw);

  if (manifest.name !== pluginName) {
    throw new Error("Unexpected Factory Droid plugin name");
  }

  if (!manifest.description || !manifest.version) {
    throw new Error("Factory Droid plugin manifest is missing required metadata");
  }

  const marketplaceRaw = await readFile(factoryMarketplacePath, "utf8");
  const marketplace = JSON.parse(marketplaceRaw);
  const pluginEntry = marketplace.plugins?.find((entry) => entry.name === pluginName);

  if (marketplace.name !== pluginName) {
    throw new Error("Factory Droid marketplace has the wrong name");
  }

  if (pluginEntry?.source !== `./plugins/${pluginName}`) {
    throw new Error("Factory Droid marketplace has the wrong plugin source path");
  }

  const command = await readFile(
    path.join(factoryPluginDir, "commands", "wordpress.md"),
    "utf8",
  );
  if (!command.includes("$ARGUMENTS")) {
    throw new Error("Factory Droid command must forward user arguments");
  }

  const droid = await readFile(
    path.join(factoryPluginDir, "droids", "wordpress-builder.md"),
    "utf8",
  );
  if (!droid.includes("name: wordpress-builder")) {
    throw new Error("Factory Droid custom droid is missing the expected name");
  }
  if (!droid.includes('mcpServers: ["wordpress-studio", "wordpress-telemetry"]')) {
    throw new Error("Factory Droid custom droid should scope the WordPress MCP servers");
  }

  const hooksRaw = await readFile(
    path.join(factoryPluginDir, "hooks", "hooks.json"),
    "utf8",
  );
  const hooks = JSON.parse(hooksRaw);
  if (!hooks.hooks?.SessionStart?.[0]?.hooks?.[0]?.command?.includes("${DROID_PLUGIN_ROOT}")) {
    throw new Error("Factory Droid hook must use DROID_PLUGIN_ROOT for plugin-local scripts");
  }
}

async function verifyDevinPlugin(skillNames) {
  await access(path.join(devinPluginDir, "README.md"));
  await access(path.join(devinPluginDir, "AGENTS.md"));
  await access(path.join(devinPluginDir, ".devin", "config.json"));
  await verifySharedSkillSet(path.join(devinPluginDir, ".devin"), skillNames);
  await verifyTelemetryScript(devinPluginDir, "Devin CLI");

  const configRaw = await readFile(
    path.join(devinPluginDir, ".devin", "config.json"),
    "utf8",
  );
  const config = JSON.parse(configRaw);

  if (!hasWordPressMcpServerEntries(config.mcpServers)) {
    throw new Error("Devin config is missing WordPress MCP entries");
  }

  if (config.mcpServers[wordpressStudioMcpServerName].command !== wordpressStudioMcpCommand) {
    throw new Error(`Devin ${wordpressStudioMcpServerName} MCP command should launch studio`);
  }

  const readme = await readFile(path.join(devinPluginDir, "README.md"), "utf8");
  if (!readme.includes("https://docs.devin.ai/cli/extensibility/index.md")) {
    throw new Error("Devin README is missing official Devin documentation links");
  }

  const agents = await readFile(path.join(devinPluginDir, "AGENTS.md"), "utf8");
  if (!agents.includes(".devin/skills/<name>/SKILL.md")) {
    throw new Error("Devin AGENTS.md is missing Devin skill path guidance");
  }
}

async function verifyAmpPlugin(skillNames) {
  await access(path.join(ampPluginDir, "README.md"));
  await access(path.join(ampPluginDir, "AGENTS.md"));
  await access(path.join(ampPluginDir, ".amp", "settings.json"));
  await access(path.join(ampPluginDir, ".amp", "plugins", "wordpress-studio.ts"));
  await verifySharedSkillSet(path.join(ampPluginDir, ".agents"), skillNames);
  await verifyTelemetryScript(ampPluginDir, "Amp");

  const settingsRaw = await readFile(
    path.join(ampPluginDir, ".amp", "settings.json"),
    "utf8",
  );
  const settings = JSON.parse(settingsRaw);
  const servers = settings["amp.mcpServers"];

  if (!servers || typeof servers !== "object") {
    throw new Error("Amp settings are missing amp.mcpServers");
  }

  if (servers[wordpressStudioMcpServerName]?.command !== wordpressStudioMcpCommand) {
    throw new Error(`Amp settings must launch ${wordpressStudioMcpServerName} with studio`);
  }

  if (!Array.isArray(servers[wordpressStudioMcpServerName]?.args)) {
    throw new Error(`Amp ${wordpressStudioMcpServerName} MCP config is missing args`);
  }

  if (servers[wordpressStudioMcpServerName].args.join(" ") !== wordpressStudioMcpArgs.join(" ")) {
    throw new Error(`Amp ${wordpressStudioMcpServerName} MCP args should launch studio mcp`);
  }

  if (servers[wordpressTelemetryMcpServerName]?.command !== wordpressTelemetryMcpCommand) {
    throw new Error("Amp settings are missing the bundled telemetry MCP server");
  }

  const agentsMd = await readFile(path.join(ampPluginDir, "AGENTS.md"), "utf8");
  if (!agentsMd.includes("WordPress.com Amp Instructions")) {
    throw new Error("Amp AGENTS.md is missing the expected heading");
  }

  const pluginRaw = await readFile(
    path.join(ampPluginDir, ".amp", "plugins", "wordpress-studio.ts"),
    "utf8",
  );
  if (!pluginRaw.includes("registerCommand")) {
    throw new Error("Amp plugin must register a command");
  }

  const readme = await readFile(path.join(ampPluginDir, "README.md"), "utf8");
  if (!readme.includes("https://ampcode.com/manual")) {
    throw new Error("Amp README must link the official Amp manual");
  }
  if (!readme.includes("does not document a marketplace-style plugin manifest")) {
    throw new Error("Amp README must document the marketplace-manifest conclusion");
  }
}

async function verifyPiPlugin(skillNames) {
  await access(path.join(piPluginDir, "package.json"));
  await access(path.join(piPluginDir, "README.md"));
  await verifySharedSkillSet(piPluginDir, skillNames);

  const manifestRaw = await readFile(path.join(piPluginDir, "package.json"), "utf8");
  const manifest = JSON.parse(manifestRaw);

  if (!manifest.keywords?.includes("pi-package")) {
    throw new Error("Pi package manifest is missing the pi-package keyword");
  }

  if (manifest.pi?.skills?.[0] !== "./skills") {
    throw new Error("Pi package manifest is missing the pi.skills path");
  }

  try {
    await access(path.join(piPluginDir, ".mcp.json"));
    throw new Error("Pi output should not generate an MCP config");
  } catch (error) {
    if (error.message === "Pi output should not generate an MCP config") {
      throw error;
    }
  }

  try {
    await access(path.join(piPluginDir, "scripts", "wordpress-telemetry-mcp.mjs"));
    throw new Error("Pi output should not bundle the telemetry MCP server");
  } catch (error) {
    if (error.message === "Pi output should not bundle the telemetry MCP server") {
      throw error;
    }
  }

  const readme = await readFile(path.join(piPluginDir, "README.md"), "utf8");
  if (!readme.includes("@earendil-works/pi-coding-agent")) {
    throw new Error("Pi README is missing the official Pi coding-agent package name");
  }
  if (!readme.includes("no built-in MCP support")) {
    throw new Error("Pi README must document the MCP compatibility boundary");
  }
}

async function verifyHermesPlugin(skillNames) {
  await access(path.join(hermesPluginDir, "plugin.yaml"));
  await access(path.join(hermesPluginDir, "__init__.py"));
  await access(path.join(hermesPluginDir, "README.md"));
  await access(path.join(hermesPluginDir, ".hermes", "config.yaml"));
  await verifySharedSkillSet(hermesPluginDir, skillNames);
  await verifyTelemetryScript(hermesPluginDir, "Hermes");

  const manifest = await readFile(path.join(hermesPluginDir, "plugin.yaml"), "utf8");
  if (!manifest.includes("name: wordpress-studio")) {
    throw new Error("Hermes plugin.yaml is missing the plugin name");
  }

  const pluginPython = await readFile(path.join(hermesPluginDir, "__init__.py"), "utf8");
  for (const skillName of skillNames) {
    if (!pluginPython.includes(`ctx.register_skill(${JSON.stringify(skillName)}`)) {
      throw new Error(`Hermes plugin does not register ${skillName}`);
    }
  }

  const configRaw = await readFile(
    path.join(hermesPluginDir, ".hermes", "config.yaml"),
    "utf8",
  );
  const config = JSON.parse(configRaw);
  if (!hasWordPressMcpServerEntries(config.mcp_servers)) {
    throw new Error("Hermes config is missing WordPress MCP entries");
  }

  const readme = await readFile(path.join(hermesPluginDir, "README.md"), "utf8");
  const requiredDocLinks = [
    "https://hermes-agent.nousresearch.com/",
    "https://github.com/NousResearch/hermes-agent",
    "https://hermes-agent.nousresearch.com/docs/user-guide/features/skills",
    "https://hermes-agent.nousresearch.com/docs/user-guide/features/plugins",
    "https://agentskills.io",
  ];

  for (const docLink of requiredDocLinks) {
    if (!readme.includes(docLink)) {
      throw new Error(`Hermes README is missing official documentation link: ${docLink}`);
    }
  }

  if (!readme.includes("hermes plugins install")) {
    throw new Error("Hermes README is missing plugin install guidance");
  }
}

async function verifyOpenClawPlugin(skillNames) {
  await access(path.join(openClawPluginDir, "package.json"));
  await access(path.join(openClawPluginDir, "AGENTS.md"));
  await access(path.join(openClawPluginDir, "README.md"));
  await verifySharedSkillSet(openClawPluginDir, skillNames);
  await verifyMcpConfig(openClawPluginDir, "OpenClaw plugin", "mcp.json");
  await verifyTelemetryScript(openClawPluginDir, "OpenClaw");

  const manifestRaw = await readFile(path.join(openClawPluginDir, "package.json"), "utf8");
  const manifest = JSON.parse(manifestRaw);

  if (manifest.name !== pluginName) {
    throw new Error("Unexpected OpenClaw package name");
  }

  if (manifest.openclaw?.skills !== "./skills") {
    throw new Error("OpenClaw package manifest is missing the skills path");
  }

  if (manifest.openclaw?.mcpServers !== "./mcp.json") {
    throw new Error("OpenClaw package manifest is missing the MCP config path");
  }

  if (!manifest.openclaw?.compat?.pluginApi) {
    throw new Error("OpenClaw package manifest is missing openclaw.compat.pluginApi");
  }

  if (!manifest.openclaw?.build?.openclawVersion) {
    throw new Error("OpenClaw package manifest is missing openclaw.build.openclawVersion");
  }

  const readme = await readFile(path.join(openClawPluginDir, "README.md"), "utf8");
  const requiredDocLinks = [
    "https://openclaw.ai",
    "https://github.com/openclaw/openclaw",
    "https://clawhub.ai",
    "https://github.com/openclaw/clawhub",
  ];

  for (const docLink of requiredDocLinks) {
    if (!readme.includes(docLink)) {
      throw new Error(`OpenClaw README is missing official documentation link: ${docLink}`);
    }
  }

  const agentsMd = await readFile(path.join(openClawPluginDir, "AGENTS.md"), "utf8");
  if (!agentsMd.includes("skills/wordpress-creator/SKILL.md")) {
    throw new Error("OpenClaw AGENTS.md is missing skill loading guidance");
  }
}

async function main() {
  const skillNames = await getSharedSkillNames();
  const verificationTasks = [
    ["Codex", () => verifyCodexPlugin(skillNames)],
    ["Claude", () => verifyClaudePlugin(skillNames)],
    ["Cursor", () => verifyCursorPlugin(skillNames)],
    ["Continue", verifyContinueOutput],
    ["Conductor", verifyConductorOutput],
    ["OpenCode", () => verifyOpenCodePlugin(skillNames)],
    ["Kilo Code", () => verifyKiloCodePlugin(skillNames)],
    ["Roo Code", () => verifyRooPlugin(skillNames)],
    ["Cline", () => verifyClinePlugin(skillNames)],
    ["Junie", () => verifyJuniePlugin(skillNames)],
    ["Gemini", () => verifyGeminiPlugin(skillNames)],
    ["Copilot", () => verifyCopilotPlugin(skillNames)],
    ["VS Code", () => verifyVsCodePlugin(skillNames)],
    ["Qodo", () => verifyQodoPlugin(skillNames)],
    ["Zed", () => verifyZedPlugin(skillNames)],
    ["Devin Desktop", () => verifyDevinDesktopPlugin(skillNames)],
    ["Aider", () => verifyAiderPlugin(skillNames)],
    ["Factory Droid", () => verifyFactoryPlugin(skillNames)],
    ["Devin", () => verifyDevinPlugin(skillNames)],
    ["Amp", () => verifyAmpPlugin(skillNames)],
    ["Pi", () => verifyPiPlugin(skillNames)],
    ["Hermes", () => verifyHermesPlugin(skillNames)],
    ["OpenClaw", () => verifyOpenClawPlugin(skillNames)],
  ];
  const passedSurfaces = [];

  for (const [surfaceName, verifySurface] of verificationTasks) {
    try {
      await verifySurface();
      passedSurfaces.push(surfaceName);
    } catch (error) {
      error.message = `${surfaceName} verification failed: ${error.message}`;
      throw error;
    }
  }

  console.log(`${passedSurfaces.join(", ")} verification passed`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
