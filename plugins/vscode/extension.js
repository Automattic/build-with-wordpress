const vscode = require("vscode");
const { execFile } = require("child_process");
const { readFile } = require("fs/promises");
const path = require("path");

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
  context.subscriptions.push(
    vscode.commands.registerCommand("wordpressStudio.checkStudio", checkStudio),
    vscode.commands.registerCommand("wordpressStudio.showMcpConfig", () => showMcpConfig(context)),
    vscode.commands.registerCommand("wordpressStudio.copyMcpConfig", () => copyMcpConfig(context))
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
