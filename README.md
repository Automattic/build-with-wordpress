# Build with WordPress

Shared source for WordPress-focused agent skills and plugin packaging.

This repo currently packages shared skills and setup files for Amp, Cline, Codex, Claude Code, Cursor, Continue, Devin CLI, Factory Droid, GitHub Copilot, Gemini, Junie, Kilo Code, Pi, Qodo, Roo Code, Windsurf/Cascade, Aider, and Zed as separate outputs:

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
- adds Kilo Code-native rules, skills, agent, AGENTS.md, plugin directory documentation, and project MCP config
- includes Devin CLI project config, rules, and skills under Devin's documented `.devin/` surfaces
- adds Cline workspace rules, skills, MCP settings, and Cline plugin-surface documentation from official Cline docs
- adds a Pi skills package using Pi's official package manifest and Agent Skills support
- adds Roo Code workspace rules and project MCP config without introducing a Roo-specific backend service
- adds a Qodo `AGENTS.md` workspace package and documents Qodo's manual MCP setup path from official Qodo docs
- adds Zed project instructions, project-local skills, and project settings for MCP without introducing a Zed-specific backend service
- adds Windsurf/Cascade workspace rules and MCP config without introducing a Windsurf-specific backend service
- includes a Factory Droid marketplace output with a native Droid plugin, command, custom Droid, hook, and MCP configuration
- adds Amp-native repository guidance, skills, MCP settings, and a project plugin command based on the official Amp manual
- adds Junie project guidelines, skills, and project MCP config using Junie's `.junie/` conventions

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

### Test in Cline

1. Install Cline using the official instructions at https://docs.cline.bot/getting-started/installing-cline.md.
2. Open `./plugins/cline` as the project root, or copy its generated files into a target workspace root.
3. Confirm the generated Cline files exist:
   - `plugins/cline/.clinerules/wordpress-com.md`
   - `plugins/cline/.cline/skills/`
   - `plugins/cline/.cline/plugins/README.md`
   - `plugins/cline/mcp.json`
4. Merge the server entries from `plugins/cline/mcp.json` into Cline's MCP settings.
5. Confirm the `wordpress-studio` and `wordpress-telemetry` MCP tools are available in Cline.
6. Try the same representative tasks:
   - creating a new site
   - building or editing a theme
   - creating a custom block
   - creating a custom plugin
   - running an audit request

### Test in Amp

1. Install Amp using the official instructions at https://ampcode.com/manual.
2. Open `./plugins/amp` as the project root, or copy its generated files into a target workspace root.
3. Confirm the generated Amp files exist:
   - `plugins/amp/AGENTS.md`
   - `plugins/amp/.agents/skills/`
   - `plugins/amp/.amp/settings.json`
   - `plugins/amp/.amp/plugins/wordpress-studio.ts`
4. Start Amp from that project root and approve workspace MCP servers if prompted.
5. Confirm the configured MCP servers with `amp mcp doctor` or Amp's MCP UI.
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

### Test in Kilo Code

1. Install Kilo Code from the official docs: https://kilocode.ai/docs/getting-started/installing
2. Open `./plugins/kilo-code` as the Kilo Code project root, or copy `kilo.jsonc`, `AGENTS.md`, and `.kilo/` into a target workspace root.
3. Confirm the generated Kilo config exists at `plugins/kilo-code/kilo.jsonc`.
4. Confirm the generated Kilo custom rule exists at `plugins/kilo-code/.kilo/rules/wordpress-com.md`.
5. Confirm the shared skills exist under `plugins/kilo-code/.kilo/skills/`.
6. In Kilo Code, confirm `wordpress-studio` and `wordpress-telemetry` are available in MCP settings.
7. Try the same representative tasks:
   - creating a new site
   - building or editing a theme
   - creating a custom block
   - creating a custom plugin
   - running an audit request

### Test in Junie

1. Copy or open `./plugins/junie` as the Junie project root.
2. Confirm the generated Junie guidelines exist at `plugins/junie/.junie/AGENTS.md`.
3. Confirm the generated Junie skills exist at `plugins/junie/.junie/skills/`.
4. Confirm the generated project MCP config exists at `plugins/junie/.junie/mcp/mcp.json`.
5. Start Junie in a JetBrains IDE or Junie CLI and confirm `wordpress-studio` and `wordpress-telemetry` are available from MCP settings or the `/mcp` command.
6. Try the same representative tasks:
   - creating a new site
   - building or editing a theme
   - creating a custom block
   - creating a custom plugin
   - running an audit request
7. For workflow telemetry coverage, make sure the generated `wordpress-telemetry` MCP server starts alongside `wordpress-studio`.

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

### Test in Zed

1. Open `./plugins/zed` as a Zed workspace root, or copy that folder's contents into a target workspace root.
2. Confirm the generated project instructions exist at `plugins/zed/AGENTS.md`.
3. Confirm the generated project-local skills exist under `plugins/zed/.agents/skills/`.
4. Confirm the generated Zed MCP config exists at `plugins/zed/.zed/settings.json`.
5. Trust the worktree in Zed so project-local skills are available.
6. In the Agent Panel settings, confirm the `wordpress-studio` and `wordpress-telemetry` context servers are active.
7. Try representative WordPress.com tasks:
   - creating a new site
   - building or editing a theme
   - creating a custom block
   - creating a custom plugin
   - running an audit request

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

### Test in Factory Droid

1. Review the generated Factory marketplace output in `./plugins/factory`.
2. Confirm the generated setup files exist:
   - `plugins/factory/.factory-plugin/marketplace.json`
   - `plugins/factory/plugins/wordpress-studio/.factory-plugin/plugin.json`
   - `plugins/factory/plugins/wordpress-studio/mcp.json`
   - `plugins/factory/plugins/wordpress-studio/commands/wordpress.md`
   - `plugins/factory/plugins/wordpress-studio/droids/wordpress-builder.md`
   - `plugins/factory/plugins/wordpress-studio/hooks/hooks.json`
   - `plugins/factory/plugins/wordpress-studio/skills/`
3. Install from the local marketplace with Factory Droid:

```bash
droid plugin marketplace add ./plugins/factory
droid plugin install wordpress-studio@wordpress-studio --scope project
```

4. In Droid, confirm the `wordpress-studio` and `wordpress-telemetry` MCP servers are available, then try representative WordPress.com tasks.

### Test in Devin CLI

1. Review the generated Devin output in `./plugins/devin`.
2. Confirm the generated setup files exist:
   - `plugins/devin/README.md`
   - `plugins/devin/AGENTS.md`
   - `plugins/devin/.devin/config.json`
   - `plugins/devin/.devin/skills/`
   - `plugins/devin/scripts/wordpress-telemetry-mcp.mjs`
3. Open `./plugins/devin` as the Devin CLI project root, or copy `AGENTS.md` and `.devin/` into a target project root.
4. Confirm Devin CLI can see the configured `wordpress-studio` and `wordpress-telemetry` MCP servers.
5. Try the same representative tasks:
   - creating a new site
   - building or editing a theme
   - creating a custom block
   - creating a custom plugin
   - running an audit request

### Test in Pi

1. Review the generated Pi output in `./plugins/pi`.
2. Confirm the generated Pi package manifest exists at `plugins/pi/package.json`.
3. Confirm the manifest includes the `pi-package` keyword and `pi.skills` path.
4. Install the local package with Pi:

```bash
pi install ./plugins/pi
```

5. For a project-local install, use `pi install -l ./plugins/pi`.
6. Use the skills as Pi-readable WordPress workflows. Pi's official docs state that Pi has no built-in MCP support, so direct Studio MCP tool access requires a future Pi TypeScript extension.

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
- Factory Droid marketplace output in `plugins/factory/`
- Devin CLI setup output in `plugins/devin/`
- Roo Code workspace output in `plugins/roo-code/`
- Cline workspace output in `plugins/cline/`
- Gemini packaging output in `plugins/gemini/`
- Kilo Code packaging output in `plugins/kilo-code/`
- Junie packaging output in `plugins/junie/`
- GitHub Copilot packaging output in `plugins/copilot/`
- Qodo workspace output in `plugins/qodo/`
- Zed workspace output in `plugins/zed/`
- Windsurf/Cascade workspace output in `plugins/windsurf/`
- Aider config and conventions output in `plugins/aider/`
- Amp workspace output in `plugins/amp/`
- Pi package output in `plugins/pi/`
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
- `plugins/cline/.cline/skills/`
- `plugins/factory/plugins/wordpress-studio/skills/`
- `plugins/gemini/skills/`
- `plugins/junie/.junie/skills/`
- `plugins/copilot/skills/`
- `plugins/kilo-code/.kilo/skills/`
- `plugins/qodo/skills/`
- `plugins/zed/.agents/skills/`
- `plugins/windsurf/skills/`
- `plugins/aider/skills/`
- `plugins/devin/.devin/skills/`
- `plugins/amp/.agents/skills/`
- `plugins/pi/skills/`

It also generates plugin-specific MCP configs or setup guidance for each surface:

- Codex: `plugins/codex/plugins/wordpress-studio/.mcp.json`
- Claude Code: `plugins/claude-code/.mcp.json`
- Cursor: `plugins/cursor/mcp.json`
- Continue: `plugins/continue/.continue/mcpServers/wordpress-com.yaml`
- Factory Droid: `plugins/factory/plugins/wordpress-studio/mcp.json`
- Devin CLI: `plugins/devin/.devin/config.json`
- Roo Code: `plugins/roo-code/.roo/mcp.json`
- Cline: `plugins/cline/mcp.json`
- Gemini: `plugins/gemini/.gemini/settings.json`
- Junie: `plugins/junie/.junie/mcp/mcp.json`
- GitHub Copilot: `plugins/copilot/.vscode/mcp.json`
- Kilo Code: `plugins/kilo-code/kilo.jsonc`
- Qodo: documented in `plugins/qodo/README.md` because official Qodo docs describe MCP setup through Agentic Tools or enterprise allow-lists, not automatic repo-local `.mcp.json` discovery
- Zed: `plugins/zed/.zed/settings.json`
- Windsurf/Cascade: `plugins/windsurf/mcp_config.json`
- Amp: `plugins/amp/.amp/settings.json`

Aider does not use a normal marketplace plugin or MCP package surface, so the Aider output uses `.aider.conf.yml` to read conventions and shared guidance files.

Pi is intentionally not listed here. The official Pi documentation says Pi has no built-in MCP support; the supported compatibility path is a future Pi TypeScript extension that registers equivalent tools or bridges MCP.

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

The Factory Droid marketplace output is generated to:

```text
plugins/factory/
```

That folder currently contains:

- `.factory-plugin/marketplace.json`
- `plugins/wordpress-studio/.factory-plugin/plugin.json`
- `plugins/wordpress-studio/mcp.json`
- `plugins/wordpress-studio/scripts/wordpress-telemetry-mcp.mjs`
- `plugins/wordpress-studio/commands/wordpress.md`
- `plugins/wordpress-studio/droids/wordpress-builder.md`
- `plugins/wordpress-studio/hooks/hooks.json`
- `plugins/wordpress-studio/hooks/session-context.sh`
- `plugins/wordpress-studio/skills/`
- `plugins/wordpress-studio/README.md`

The generated Factory Droid MCP config launches both `studio mcp` and the bundled `wordpress-telemetry` MCP server. The Factory output follows the official Factory plugin, skills, custom slash command, custom Droid, MCP, hooks, and marketplace docs:

- https://docs.factory.ai/cli/configuration/plugins
- https://docs.factory.ai/guides/building/building-plugins
- https://docs.factory.ai/cli/configuration/skills
- https://docs.factory.ai/cli/configuration/custom-slash-commands
- https://docs.factory.ai/cli/configuration/custom-droids
- https://docs.factory.ai/cli/configuration/mcp
- https://docs.factory.ai/reference/hooks-reference

The Devin CLI setup output is generated to:

```text
plugins/devin/
```

That folder currently contains:

- `AGENTS.md`
- `.devin/config.json`
- `.devin/skills/`
- `scripts/wordpress-telemetry-mcp.mjs`
- `README.md`

The generated Devin config launches both `studio mcp` and the bundled `wordpress-telemetry` MCP server through Devin's documented project config surface. Devin's official docs support project rules in `AGENTS.md`, project skills in `.devin/skills/<name>/SKILL.md`, and project MCP servers in `.devin/config.json`.

Official Devin references:

- Extensibility overview: https://docs.devin.ai/cli/extensibility/index.md
- Rules and AGENTS.md: https://docs.devin.ai/cli/extensibility/rules.md
- Skills overview: https://docs.devin.ai/cli/extensibility/skills/overview.md
- Skill format: https://docs.devin.ai/cli/extensibility/skills/creating-skills.md
- MCP configuration: https://docs.devin.ai/cli/extensibility/mcp/configuration.md
- Configuration files: https://docs.devin.ai/cli/extensibility/configuration.md

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

The Kilo Code output is generated to:

```text
plugins/kilo-code/
```

That folder currently contains:

- `kilo.jsonc`
- `AGENTS.md`
- `.kilo/agents/wordpress-com.md`
- `.kilo/rules/wordpress-com.md`
- `.kilo/plugin/README.md`
- `.kilo/skills/`
- `scripts/wordpress-telemetry-mcp.mjs`
- `README.md`

The generated Kilo Code project config launches both `studio mcp` and the bundled `wordpress-telemetry` MCP server using Kilo's current `mcp` config shape. It uses Kilo-native rules, agents, skills, and AGENTS.md support documented at https://kilocode.ai/docs/.

The Zed workspace output is generated to:

```text
plugins/zed/
```

That folder currently contains:

- `.agents/skills/`
- `.zed/settings.json`
- `AGENTS.md`
- `scripts/wordpress-telemetry-mcp.mjs`
- `README.md`

The generated Zed MCP config launches both `studio mcp` and the bundled `wordpress-telemetry` MCP server through Zed's `context_servers` settings shape. Zed's official docs support project `AGENTS.md` instructions and project-local `.agents/skills/`, so this output does not generate a Zed extension package.

The Pi package is generated to:

```text
plugins/pi/
```

That folder currently contains:

- `package.json`
- `skills/`
- `README.md`

The generated Pi package uses Pi's official package format: `package.json` contains the `pi-package` keyword and a `pi.skills` entry pointing at `./skills`. It does not generate MCP configuration or bundle the telemetry MCP server because Pi's official documentation does not expose built-in MCP configuration.

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

The Cline workspace output is generated to:

```text
plugins/cline/
```

That folder currently contains:

- `.clinerules/wordpress-com.md`
- `.cline/skills/`
- `.cline/plugins/README.md`
- `mcp.json`
- `scripts/wordpress-telemetry-mcp.mjs`
- `README.md`

The generated Cline MCP config launches both `studio mcp` and the bundled `wordpress-telemetry` MCP server. The Cline output uses Cline-native workspace rules, skills, and MCP configuration instead of claiming extension marketplace packaging because official Cline plugin docs currently scope plugins to the Cline SDK, CLI, and Kanban.

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

The Amp workspace output is generated to:

```text
plugins/amp/
```

That folder currently contains:

- `AGENTS.md`
- `.agents/skills/`
- `.amp/settings.json`
- `.amp/plugins/wordpress-studio.ts`
- `scripts/wordpress-telemetry-mcp.mjs`
- `README.md`

The generated Amp MCP settings launch both `studio mcp` and the bundled `wordpress-telemetry` MCP server. The Amp output uses official Amp project-local surfaces documented in the Owner's Manual: AGENTS.md, skills, MCP settings, and plugins. Amp does not document a marketplace-style project manifest for this packaging path, so this repo ships plain generated workspace files instead.

Official Amp references:

- https://ampcode.com/manual
- https://ampcode.com/manual#AGENTS.md
- https://ampcode.com/manual#agent-skills
- https://ampcode.com/manual#mcp
- https://ampcode.com/manual#plugins
- https://ampcode.com/manual/plugin-api
