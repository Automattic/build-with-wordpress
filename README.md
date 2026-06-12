# Build with WordPress

Shared source for WordPress-focused agent skills and plugin packaging.

This repo currently packages shared skills and setup files for Codex, Claude Code, Cursor, Continue, GitHub Copilot, Gemini, Qodo, Roo Code, Windsurf/Cascade, and Aider as separate outputs:

- prefers the WordPress Studio MCP server for site management, screenshots, and block validation
- falls back to the Studio CLI through a shared Studio skill when MCP is unavailable
- uses `wp_cli` through the MCP server as the general-purpose WordPress escape hatch
- includes a top-level WordPress routing skill for choosing the right implementation path
- includes a custom block development skill for custom Gutenberg block plugins
- includes a custom plugin development skill for extending functionality outside what themes and blocks can offer
- includes an auditing skill for performance, accessibility, and frontend quality review
- can optionally generate three design preview directions before building a site theme
- bundles a plugin-local telemetry MCP server so workflow events do not depend on Studio shipping telemetry support
- includes an Aider config and conventions pack for terminal pair-programming
- keeps skills shared so other surfaces can reuse them later
- includes Continue-native setup files for WordPress.com rules, prompts, and MCP configuration
- adds Roo Code workspace rules and project MCP config without introducing a Roo-specific backend service
- adds a Qodo `AGENTS.md` workspace package and documents Qodo's manual MCP setup path from official Qodo docs
- adds Windsurf/Cascade workspace rules and MCP config without introducing a Windsurf-specific backend service

## Testing

- Make sure you have WordPress Studio installed and the `studio` CLI is available
- Clone this repo
- Run:

```bash
pnpm install
pnpm build
pnpm verify
```

### Test in Codex

1. Open a new project in the Codex app using `./plugins/codex` as the project root.
2. Under Plugins, install `WordPress Studio`.
3. Confirm the generated MCP config exists at `plugins/codex/plugins/wordpress-studio/.mcp.json`.
4. Confirm the bundled telemetry server exists at `plugins/codex/plugins/wordpress-studio/scripts/wordpress-telemetry-mcp.mjs`.
5. Try representative tasks such as:
   - creating a new site
   - building or editing a theme
   - creating a custom block
   - creating a custom plugin
   - running an audit request
6. For workflow telemetry coverage, make sure the generated `wordpress-telemetry` MCP server starts alongside `wordpress-studio`.

### Test in Claude Code

1. From the repo root, launch Claude with:

```bash
claude --plugin-dir ./plugins/claude-code
```

2. Install or enable the `WordPress Studio` plugin in Claude Code.
3. Confirm the generated MCP config exists at `plugins/claude-code/.mcp.json`.
4. Confirm the bundled telemetry server exists at `plugins/claude-code/scripts/wordpress-telemetry-mcp.mjs`.
5. Try the same representative tasks:
   - creating a new site
   - building or editing a theme
   - creating a custom block
   - creating a custom plugin
   - running an audit request
6. For workflow telemetry coverage, make sure the generated `wordpress-telemetry` MCP server starts alongside `wordpress-studio`.

### Test in Roo Code

1. Install the Roo Code VS Code extension.
2. Open `./plugins/roo-code` as the VS Code workspace root, or copy that folder's contents into a target workspace root.
3. Confirm the generated workspace rules exist at `plugins/roo-code/.roo/rules/wordpress-com.md` and `plugins/roo-code/.roo/rules-code/wordpress-com-code.md`.
4. Confirm the generated project MCP config exists at `plugins/roo-code/.roo/mcp.json`.
5. In Roo Code, enable MCP servers and confirm `wordpress-studio` and `wordpress-telemetry` are available.
6. Try the same representative tasks:
   - creating a new site
   - building or editing a theme
   - creating a custom block
    - creating a custom plugin
    - running an audit request

### Test in GitHub Copilot

1. Copy or open `./plugins/copilot` as the project root in VS Code.
2. Confirm the generated repository instructions exist at `plugins/copilot/.github/copilot-instructions.md`.
3. Confirm the scoped WordPress instructions exist at `plugins/copilot/.github/instructions/wordpress-studio.instructions.md`.
4. Confirm the generated VS Code MCP config exists at `plugins/copilot/.vscode/mcp.json`.
5. Start Copilot Chat in agent mode and try representative WordPress.com tasks:
   - creating a new site
   - building or editing a theme
   - creating a custom block
   - creating a custom plugin
   - running an audit request
6. For workflow telemetry coverage, make sure the generated `wordpress-telemetry` MCP server starts alongside `wordpress-studio`.

### Test in Gemini

1. Copy or reference `./plugins/gemini` as the Gemini project context directory.
2. Confirm the generated Gemini instructions exist at `plugins/gemini/GEMINI.md`.
3. Confirm the generated MCP config exists at `plugins/gemini/.gemini/settings.json`.
4. Confirm the bundled telemetry server exists at `plugins/gemini/scripts/wordpress-telemetry-mcp.mjs`.
5. Try the same representative tasks:
   - creating a new site
   - building or editing a theme
   - creating a custom block
   - creating a custom plugin
   - running an audit request
6. For workflow telemetry coverage, make sure the generated `wordpress-telemetry` MCP server starts alongside `wordpress-studio`.

### Test in Continue

1. Review the generated Continue output in `./plugins/continue`.
2. Confirm the generated setup files exist:
   - `plugins/continue/README.md`
   - `plugins/continue/config.yaml`
   - `plugins/continue/.continue/rules/wordpress-com.md`
   - `plugins/continue/.continue/prompts/create-wordpress-com-site.md`
   - `plugins/continue/.continue/prompts/audit-wordpress-com-project.md`
   - `plugins/continue/.continue/mcpServers/wordpress-com.yaml`
3. In Continue, copy the `.continue/` examples into a project or merge the `config.yaml` MCP snippet into `~/.continue/config.yaml`.
4. Use Continue Agent mode for WordPress.com MCP tool access.

### Test in Qodo

1. Install Qodo IDE Plugin for VS Code, JetBrains, or Visual Studio.
2. Open `./plugins/qodo` as the workspace root, or copy that folder's `AGENTS.md`, `skills/`, and `scripts/` into a target workspace root.
3. Confirm Qodo can read the generated repository guidance at `plugins/qodo/AGENTS.md`.
4. If your Qodo plan supports Agentic Tools, add the MCP JSON shown in `plugins/qodo/README.md` through Qodo's Tools Management page or enterprise MCP allow-list.
5. Try representative local review or agent tasks:
   - creating a new site
   - building or editing a theme
   - creating a custom block
   - creating a custom plugin
   - running an audit request
6. For workflow telemetry coverage, make sure the generated `wordpress-telemetry` MCP server starts alongside `wordpress-studio` after you add the documented MCP JSON in Qodo.

### Test in Windsurf/Cascade

1. Install Devin Desktop / Windsurf and complete onboarding.
2. Build the generated output with `pnpm build`.
3. Confirm the generated Cascade rules exist at `plugins/windsurf/.devin/rules/`.
4. Confirm the generated MCP config exists at `plugins/windsurf/mcp_config.json`.
5. Confirm the bundled telemetry server exists at `plugins/windsurf/scripts/wordpress-telemetry-mcp.mjs`.
6. Copy the servers from `plugins/windsurf/mcp_config.json` into `~/.codeium/windsurf/mcp_config.json`.
7. In Cascade MCP settings, confirm `wordpress-studio` and `wordpress-telemetry` are enabled.
8. Try representative WordPress.com tasks such as site review, theme edits, block validation, or plugin planning.

### Test in Aider

1. From a git repo you want to edit with Aider, copy or symlink the contents of `./plugins/aider` into the repo root.
2. Configure Aider with environment variables or a local `.env` file.
3. Confirm the generated config exists at `plugins/aider/.aider.conf.yml`.
4. Confirm the conventions file exists at `plugins/aider/CONVENTIONS.md`.
5. Start Aider from the repo root that contains `.aider.conf.yml`.
6. Try a representative WordPress.com coding task and confirm Aider loads the conventions as read-only context.

## Current scope

- Shared skills for:
  - WordPress request routing
  - Studio workflows
  - Performance, accessibility, and frontend auditing
  - Block theme creation
  - Site creation orchestration
  - Design preview generation and selection
  - Custom block creation
  - Plugin creation
- Generated MCP configs in the packaged plugin outputs
- A bundled standalone telemetry MCP server built from repo-local Node dependencies
- Codex packaging output in `plugins/codex/`
- Claude Code packaging output in `plugins/claude-code/`
- Cursor packaging output in `plugins/cursor/`
- Continue setup output in `plugins/continue/`
- Roo Code workspace output in `plugins/roo-code/`
- Gemini packaging output in `plugins/gemini/`
- GitHub Copilot packaging output in `plugins/copilot/`
- Qodo workspace output in `plugins/qodo/`
- Windsurf/Cascade workspace output in `plugins/windsurf/`
- Aider config and conventions output in `plugins/aider/`
- Bundled telemetry artifact in `dist/`
- `pnpm` scripts for build and verification

## Skill layout

- `skills/`
  Shared skills intended to stay portable across agent surfaces.

The build packages the shared skills into:

- `plugins/codex/plugins/wordpress-studio/skills/`
- `plugins/claude-code/skills/`
- `plugins/cursor/skills/`
- `plugins/roo-code/skills/`
- `plugins/gemini/skills/`
- `plugins/copilot/skills/`
- `plugins/qodo/skills/`
- `plugins/windsurf/skills/`
- `plugins/aider/skills/`

It also generates plugin-specific MCP configs or setup guidance for each surface:

- Codex: `plugins/codex/plugins/wordpress-studio/.mcp.json`
- Claude Code: `plugins/claude-code/.mcp.json`
- Cursor: `plugins/cursor/mcp.json`
- Continue: `plugins/continue/.continue/mcpServers/wordpress-com.yaml`
- Roo Code: `plugins/roo-code/.roo/mcp.json`
- Gemini: `plugins/gemini/.gemini/settings.json`
- GitHub Copilot: `plugins/copilot/.vscode/mcp.json`
- Qodo: documented in `plugins/qodo/README.md` because official Qodo docs describe MCP setup through Agentic Tools or enterprise allow-lists, not automatic repo-local `.mcp.json` discovery
- Windsurf/Cascade: `plugins/windsurf/mcp_config.json`

Aider does not use a normal marketplace plugin or MCP package surface, so the Aider output uses `.aider.conf.yml` to read conventions and shared guidance files.

The telemetry server source lives in `scripts/wordpress-telemetry-mcp.mjs` and is bundled to:

- `dist/wordpress-telemetry-mcp.mjs`

## Commands

```bash
pnpm install
pnpm build:telemetry-mcp
pnpm build
pnpm verify
```

## Cursor Publishing

Cursor requires a standalone plugin repository. This repo remains the canonical source for shared WordPress skills and generated plugin packaging, while the publishable Cursor repository lives at:

https://github.com/Automattic/wordpress-cursor-plugin

Do not edit the standalone Cursor repository as the source of truth. Update `skills/` and the Cursor packaging generator here, run the normal build and verification, then export `plugins/cursor/` to the standalone repo:

```bash
pnpm build
pnpm verify
pnpm export:cursor
```

The export command runs `git subtree split --prefix=plugins/cursor` and pushes the result to `Automattic/wordpress-cursor-plugin` on `sync/from-build-with-wordpress`. Open or update a PR from that branch into the standalone repo's `main` branch, then submit the standalone repo to Cursor.

For a dry run:

```bash
pnpm export:cursor -- --dry-run
```

## Output

The Codex plugin repo is generated to:

```text
plugins/codex/
```

That folder contains:

- `.agents/plugins/marketplace.json`
- `plugins/wordpress-studio/.codex-plugin/plugin.json`
- `plugins/wordpress-studio/.mcp.json`
- `plugins/wordpress-studio/scripts/wordpress-telemetry-mcp.mjs`
- `plugins/wordpress-studio/skills/`
- `plugins/wordpress-studio/README.md`

The generated Codex MCP config launches both `studio mcp` and the bundled `wordpress-telemetry` MCP server.

The Claude Code plugin is generated to:

```text
plugins/claude-code/
```

That folder currently contains:

- `.claude-plugin/plugin.json`
- `.mcp.json`
- `scripts/wordpress-telemetry-mcp.mjs`
- `skills/`
- `README.md`

The generated Claude Code MCP config launches both `studio mcp` and the bundled `wordpress-telemetry` MCP server.

The GitHub Copilot plugin is generated to:

```text
plugins/copilot/
```

That folder currently contains:

- `.github/copilot-instructions.md`
- `.github/instructions/wordpress-studio.instructions.md`
- `.vscode/mcp.json`
- `scripts/wordpress-telemetry-mcp.mjs`
- `skills/`
- `README.md`

The generated Cursor MCP config launches both `studio mcp` and the bundled `wordpress-telemetry` MCP server.

The Continue setup output is generated to:

```text
plugins/continue/
```

That folder currently contains:

- `README.md`
- `config.yaml`
- `.continue/rules/wordpress-com.md`
- `.continue/prompts/create-wordpress-com-site.md`
- `.continue/prompts/audit-wordpress-com-project.md`
- `.continue/mcpServers/wordpress-com.yaml`

The generated Continue MCP guidance uses the same existing `studio mcp` entrypoint as the shared WordPress.com MCP substrate. Continue-specific files cover rules, prompts, and MCP block placement; they do not define a separate backend service.

The generated Copilot MCP config launches both `studio mcp` and the bundled `wordpress-telemetry` MCP server through VS Code's MCP configuration.

The Gemini plugin is generated to:

```text
plugins/gemini/
```

That folder currently contains:

- `.gemini/settings.json`
- `GEMINI.md`
- `scripts/wordpress-telemetry-mcp.mjs`
- `skills/`
- `README.md`

The generated Gemini MCP config launches both `studio mcp` and the bundled `wordpress-telemetry` MCP server. `GEMINI.md` is the project-level instruction file for Gemini CLI and Gemini Code Assist workflows.

The Roo Code workspace output is generated to:

```text
plugins/roo-code/
```

That folder currently contains:

- `.roo/mcp.json`
- `.roo/rules/wordpress-com.md`
- `.roo/rules-code/wordpress-com-code.md`
- `AGENTS.md`
- `scripts/wordpress-telemetry-mcp.mjs`
- `skills/`
- `README.md`

The generated Roo Code project MCP config launches both `studio mcp` and the bundled `wordpress-telemetry` MCP server. The `.roo/rules/` files are Roo-specific; the WordPress.com MCP and skill behavior is shared with the other outputs.

The Qodo workspace output is generated to:

```text
plugins/qodo/
```

That folder currently contains:

- `AGENTS.md`
- `scripts/wordpress-telemetry-mcp.mjs`
- `skills/`
- `README.md`

The generated Qodo output follows official Qodo docs by using repo-local `AGENTS.md` for project guidance and documenting MCP JSON for Qodo's Agentic Tools UI or enterprise allow-list. Qodo's docs do not describe automatic repo-local `.mcp.json` discovery, so this output intentionally does not generate a Qodo-only `.mcp.json` file.

The Aider output is generated to:

```text
plugins/aider/
```

That folder currently contains:

- `.aider.conf.yml`
- `CONVENTIONS.md`
- `skills/`
- `README.md`

The generated Aider config loads `CONVENTIONS.md` and the shared WordPress.com guidance files as read-only context.
