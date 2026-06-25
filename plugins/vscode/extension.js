const vscode = require("vscode");
const { execFile } = require("child_process");
const { mkdir, readFile, writeFile } = require("fs/promises");
const path = require("path");

const managedServerNames = ["wordpress-studio", "wordpress-telemetry"];
const workspacePromptStateKey = "wordpressStudio.configureMcpPrompted";

function runStudioVersion() {
  return new Promise((resolve, reject) => {
    execFile("studio", ["--version"], { timeout: 10000 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
        return;
      }
      resolve((stdout || stderr).trim());
    });
  });
}

async function readMcpConfig(context) {
  return readFile(path.join(context.extensionPath, "mcp.json"), "utf8");
}

async function readBundledMcpConfig(context) {
  const raw = await readMcpConfig(context);
  const config = JSON.parse(raw);

  if (!config.servers || typeof config.servers !== "object") {
    throw new Error("Bundled MCP config is missing the VS Code servers wrapper.");
  }

  if (!config.servers["wordpress-studio"]) {
    throw new Error("Bundled MCP config is missing servers.wordpress-studio.");
  }

  return config;
}

function getWorkspaceFolder() {
  const folders = vscode.workspace.workspaceFolders ?? [];

  if (folders.length === 0) {
    return null;
  }

  return folders[0];
}

function configsMatch(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function readWorkspaceMcpConfig(mcpPath) {
  try {
    const raw = await readFile(mcpPath, "utf8");
    const config = JSON.parse(raw);

    if (!config || typeof config !== "object" || Array.isArray(config)) {
      throw new Error("Workspace MCP config must be a JSON object.");
    }

    if (config.servers === undefined) {
      config.servers = {};
    }

    if (!config.servers || typeof config.servers !== "object" || Array.isArray(config.servers)) {
      throw new Error("Workspace MCP config servers field must be a JSON object.");
    }

    return config;
  } catch (error) {
    if (error.code === "ENOENT") {
      return { servers: {} };
    }

    throw error;
  }
}

async function checkStudio() {
  try {
    const version = await runStudioVersion();
    vscode.window.showInformationMessage(
      version ? "Studio CLI is available: " + version : "Studio CLI is available."
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      "Studio CLI was not found. Install WordPress Studio and ensure the studio command is on PATH. " + error.message
    );
  }
}

function workspaceMcpMatchesBundled(workspaceConfig, bundledConfig) {
  for (const serverName of managedServerNames) {
    const bundledServer = bundledConfig.servers[serverName];

    if (bundledServer && !configsMatch(workspaceConfig.servers[serverName], bundledServer)) {
      return false;
    }
  }

  return true;
}

async function configureWorkspaceMcp(context) {
  const workspaceFolder = getWorkspaceFolder();

  if (!workspaceFolder) {
    vscode.window.showErrorMessage("Open a workspace folder before configuring WordPress Studio MCP.");
    return;
  }

  let bundledConfig;
  try {
    bundledConfig = await readBundledMcpConfig(context);
  } catch (error) {
    vscode.window.showErrorMessage("Cannot configure WordPress Studio MCP. " + error.message);
    return;
  }

  const workspaceMcpDir = path.join(workspaceFolder.uri.fsPath, ".vscode");
  const workspaceMcpPath = path.join(workspaceMcpDir, "mcp.json");
  let workspaceConfig;

  try {
    workspaceConfig = await readWorkspaceMcpConfig(workspaceMcpPath);
  } catch (error) {
    vscode.window.showErrorMessage("Cannot read workspace MCP config. " + error.message);
    return;
  }

  for (const serverName of managedServerNames) {
    const bundledServer = bundledConfig.servers[serverName];

    if (!bundledServer) {
      continue;
    }

    const existingServer = workspaceConfig.servers[serverName];
    if (existingServer && !configsMatch(existingServer, bundledServer)) {
      const choice = await vscode.window.showWarningMessage(
        "Workspace MCP server " + serverName + " already exists and differs from the bundled WordPress Studio config.",
        { modal: true },
        "Replace",
        "Cancel"
      );

      if (choice !== "Replace") {
        vscode.window.showInformationMessage("WordPress Studio MCP config was not changed.");
        return;
      }
    }

    workspaceConfig.servers[serverName] = bundledServer;
  }

  try {
    await mkdir(workspaceMcpDir, { recursive: true });
    await writeFile(workspaceMcpPath, JSON.stringify(workspaceConfig, null, 2) + "\n", "utf8");
    vscode.window.showInformationMessage("Configured WordPress Studio MCP at " + workspaceMcpPath + ".");
  } catch (error) {
    vscode.window.showErrorMessage("Cannot write workspace MCP config. " + error.message);
  }
}

async function promptConfigureWorkspaceMcp(context) {
  const workspaceFolder = getWorkspaceFolder();

  if (!workspaceFolder || context.workspaceState.get(workspacePromptStateKey)) {
    return;
  }

  let bundledConfig;
  try {
    bundledConfig = await readBundledMcpConfig(context);
  } catch (error) {
    return;
  }

  const workspaceMcpPath = path.join(workspaceFolder.uri.fsPath, ".vscode", "mcp.json");
  let workspaceConfig;
  try {
    workspaceConfig = await readWorkspaceMcpConfig(workspaceMcpPath);
  } catch (error) {
    return;
  }

  if (workspaceMcpMatchesBundled(workspaceConfig, bundledConfig)) {
    await context.workspaceState.update(workspacePromptStateKey, true);
    return;
  }

  const choice = await vscode.window.showInformationMessage(
    "Configure WordPress Studio MCP for this workspace so Copilot Agent can use WordPress Studio tools?",
    "Configure",
    "Not now"
  );

  await context.workspaceState.update(workspacePromptStateKey, true);

  if (choice === "Configure") {
    await configureWorkspaceMcp(context);
  }
}

async function validateMcpConfig(context) {
  let version;
  try {
    version = await runStudioVersion();
  } catch (error) {
    vscode.window.showErrorMessage(
      "Studio CLI was not found. Install WordPress Studio and ensure the studio command is on PATH. " + error.message
    );
    return;
  }

  try {
    await readBundledMcpConfig(context);
  } catch (error) {
    vscode.window.showErrorMessage("Bundled WordPress Studio MCP config is invalid. " + error.message);
    return;
  }

  vscode.window.showInformationMessage(
    "WordPress Studio MCP config is valid. Studio CLI: " + (version || "available") + "."
  );
}

async function showMcpConfig(context) {
  const config = await readMcpConfig(context);
  const document = await vscode.workspace.openTextDocument({
    content: config,
    language: "json",
  });
  await vscode.window.showTextDocument(document, { preview: true });
}

async function copyMcpConfig(context) {
  const config = await readMcpConfig(context);
  await vscode.env.clipboard.writeText(config);
  vscode.window.showInformationMessage("Copied WordPress Studio MCP config to the clipboard.");
}

function activate(context) {
  promptConfigureWorkspaceMcp(context);

  context.subscriptions.push(
    vscode.commands.registerCommand("wordpressStudio.checkStudio", checkStudio),
    vscode.commands.registerCommand("wordpressStudio.configureWorkspaceMcp", () => configureWorkspaceMcp(context)),
    vscode.commands.registerCommand("wordpressStudio.validateMcpConfig", () => validateMcpConfig(context)),
    vscode.commands.registerCommand("wordpressStudio.showMcpConfig", () => showMcpConfig(context)),
    vscode.commands.registerCommand("wordpressStudio.copyMcpConfig", () => copyMcpConfig(context))
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
