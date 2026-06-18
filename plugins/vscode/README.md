# WordPress Studio for VS Code

This VS Code extension integrates WordPress Studio MCP with the current workspace by writing VS Code's supported `.vscode/mcp.json` configuration shape. It does not publish anything to the Marketplace from this repository.

## What it includes

- `package.json` with VS Code extension metadata and command contributions.
- `extension.js` with commands to validate Studio availability, show/copy the bundled MCP config, and merge the WordPress Studio MCP servers into the open workspace.
- `mcp.json` with `wordpress-studio` and `wordpress-telemetry` server entries.
- `skills/` as reference Build with WordPress playbooks for editor users and future extension behavior.

## MCP integration

VS Code supports workspace MCP configuration through `.vscode/mcp.json` with a top-level `servers` object. The `WordPress Studio: Configure Workspace MCP` command creates or updates that file in the open workspace, preserves unrelated server entries, and prompts before replacing an existing managed WordPress server that differs from the bundled configuration.

The extension targets VS Code `^1.95.0`. The published `@types/vscode@1.95.0` API surface does not include `contributes.mcpServerDefinitionProviders` or `vscode.lm.registerMcpServerDefinitionProvider`, so this package does not register an extension-owned MCP provider yet. When this package raises its VS Code engine to a version with stable MCP provider APIs, the file-write command can be complemented with provider registration.

## Marketplace placeholder

The manifest uses the Visual Studio Marketplace publisher `automattic`. This repo intentionally does not include publish automation or Marketplace credentials.

## Commands

- `WordPress Studio: Check Studio CLI` runs `studio --version` and reports whether the CLI is on `PATH`.
- `WordPress Studio: Configure Workspace MCP` merges the bundled `wordpress-studio` server, and `wordpress-telemetry` when bundled, into the open workspace's `.vscode/mcp.json`.
- `WordPress Studio: Validate MCP Config` runs `studio --version` and verifies the bundled VS Code MCP config contains `servers.wordpress-studio`.
- `WordPress Studio: Show MCP Config` opens the bundled `mcp.json` in an untitled JSON editor.
- `WordPress Studio: Copy MCP Config` copies the bundled `mcp.json` to the clipboard.

## Included skills

- `auditing`
- `block-creator`
- `design-previews-creator`
- `plugin-creator`
- `site-creator`
- `studio`
- `theme-creator`
- `wordpress-creator`
