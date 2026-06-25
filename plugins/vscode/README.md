# WordPress Studio for VS Code

Use WordPress Studio from VS Code Copilot Agent by connecting the current workspace to Studio's MCP tools. The extension can write VS Code's supported `.vscode/mcp.json` configuration so Copilot Agent can use Studio for local WordPress site management, WP-CLI, screenshots, block validation, and audits.

## Quick start

1. Install WordPress Studio and make sure the `studio` command is available on your `PATH`.
2. Open a workspace folder in VS Code.
3. When prompted, choose `Configure` to add WordPress Studio MCP to this workspace.
4. Open Copilot Chat in Agent mode and ask it to use the `wordpress-studio` tools.

The prompt appears once per workspace. To configure manually, open the Command Palette with `Cmd+Shift+P` and run `WordPress Studio: Configure Workspace MCP`.

Example prompts:

- `Use the wordpress-studio MCP tools to list my Studio sites.`
- `Use WordPress Studio to inspect the current site and tell me what tools are available.`
- `Use wp_cli through WordPress Studio to check the active theme.`

If Copilot does not see the tools immediately, reload the VS Code window and try again.

## What it includes

- a first-run workspace prompt plus commands to validate Studio availability, show/copy the bundled MCP config, and merge the WordPress Studio MCP servers into the open workspace.
- `mcp.json` with `wordpress-studio` and `wordpress-telemetry` server entries.
- `skills/` as reference Build with WordPress playbooks for editor users and future extension behavior.

## MCP integration

VS Code supports workspace MCP configuration through `.vscode/mcp.json` with a top-level `servers` object. The `WordPress Studio: Configure Workspace MCP` command creates or updates that file in the open workspace, preserves unrelated server entries, and prompts before replacing an existing managed WordPress server that differs from the bundled configuration.

This extension writes workspace MCP config rather than registering an extension-owned MCP provider. That keeps the integration explicit and reviewable in the workspace.

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
