# WordPress.com for Conductor

This output packages Conductor repository settings and guidance for using the shared Build with WordPress agent outputs inside Conductor workspaces.

Conductor is a workspace layer for parallel Claude Code, Codex, and Cursor agents. It creates isolated Git worktrees, runs setup and run scripts from each workspace, and then helps review, open PRs, and archive finished branches.

## Generated files

- `.conductor/settings.toml` configures shared Conductor repository scripts.
- `README.md` documents how Conductor should use the existing Claude Code, Codex, and Cursor outputs from this repository.

## Setup

1. Install Conductor for macOS from https://www.conductor.build/.
2. Open the repository you want Conductor to manage.
3. Copy this output's `.conductor/settings.toml` into the repository root when the Build with WordPress package scripts are the workflow you want new Conductor workspaces to share.
4. Install or sync the underlying agent configs for the agents you plan to run:
   - Claude Code: use `plugins/claude-code/`.
   - Codex: use `plugins/codex/`.
   - Cursor: use `plugins/cursor/`.
5. In Conductor, use Sync Agent Configs or the agent/provider settings to make the same MCP servers available to Claude Code, Codex, and Cursor.

## Scripts

Current Conductor docs recommend committed repository settings in `.conductor/settings.toml` for shared setup and run scripts. Legacy `conductor.json` is not generated because current docs mark it as legacy and Conductor ignores repo-level `conductor.json` once `.conductor/settings.toml` exists.

The generated settings use:

```toml
"$schema" = "https://conductor.build/schemas/settings.repo.schema.json"

[scripts]
setup = "pnpm install"
run = "pnpm build && pnpm verify"
run_mode = "concurrent"
```

Adjust `scripts.setup` and `scripts.run` for repositories that consume these WordPress.com agent files instead of developing this package directly. Use `$CONDUCTOR_PORT` in run scripts when a workspace starts a local web server.

## MCP support

Conductor supports MCP servers through the app's MCP/provider configuration and can sync agent configs between Claude Code and Codex. The current repository settings schema documents scripts, prompts, environment variables, providers, and Git behavior, but it does not define a repository-level MCP server table.

For that reason this output does not invent a Conductor-specific MCP file. Use the existing MCP configs generated for the underlying agents:

- Claude Code: `plugins/claude-code/.mcp.json`
- Codex: `plugins/codex/plugins/wordpress-studio/.mcp.json`
- Cursor: `plugins/cursor/mcp.json`

Those configs launch the shared `studio mcp` server plus the bundled `wordpress-telemetry` server. Conductor's MCP support and Sync Agent Configs should point at the same shared substrate instead of adding another WordPress.com backend.

## Message queues

Conductor message queues are a native composer/workspace feature. They do not require generated files in this package. Queue multiple prompts in Conductor when a workspace needs ordered follow-up work; keep durable WordPress.com workflow guidance in the underlying agent outputs and shared skills.

## Source links

- Product overview: https://www.conductor.build/
- Workflow and workspaces: https://www.conductor.build/docs/concepts/workflow and https://www.conductor.build/docs/concepts/workspaces-and-branches
- Scripts and repository settings: https://www.conductor.build/docs/reference/scripts and https://www.conductor.build/docs/reference/settings
- Settings reference: https://www.conductor.build/docs/reference/settings/reference
- Legacy conductor.json: https://www.conductor.build/docs/reference/conductor-json
- MCPs and message queues changelog: https://www.conductor.build/changelog/0.1.0-mcps-message-queues
- Repo settings migration changelog: https://www.conductor.build/changelog/0.62.0-repo-settings-browser-preview
- Sync agent configs changelog: https://www.conductor.build/changelog/0.57.0-sync-agent-configs
