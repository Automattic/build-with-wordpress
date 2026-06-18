import { access, cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createLocalCommandArrayMcpConfig,
  createMcpConfig,
  createMcpServerEntries,
  createVsCodeMcpConfig,
  createZedMcpConfig,
} from "./mcp-setup-contract.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const pluginsDir = path.join(root, "plugins");
const sharedSkillsSourceDir = path.join(root, "skills");
const telemetryMcpServerDistPath = path.join(
  root,
  "dist",
  "wordpress-telemetry-mcp.mjs",
);
const pluginName = "wordpress-studio";
const pluginDisplayName = "WordPress Studio";
const cursorPluginName = pluginName;
const cursorPluginDisplayName = pluginDisplayName;
const continueOutputDir = path.join(pluginsDir, "continue");
const factoryOutputDir = path.join(pluginsDir, "factory");
const factoryPluginDir = path.join(factoryOutputDir, "plugins", pluginName);
const conductorOutputDir = path.join(pluginsDir, "conductor");
const geminiDisplayName = "WordPress.com";
const qodoPluginDir = path.join(pluginsDir, "qodo");
const hermesPluginDir = path.join(pluginsDir, "hermes");
const openClawPluginDir = path.join(pluginsDir, "openclaw");

function buildClineRules() {
  return `# WordPress.com Cline Rules

Use this workspace as a WordPress.com-aware Cline environment.

## Shared substrate

- Use the existing WordPress Studio MCP server for local WordPress site management, screenshots, block validation, performance tooling, and WP-CLI access.
- Use the bundled \`wordpress-telemetry\` MCP server for workflow telemetry emitted by this package.
- Treat these MCP servers as the shared WordPress.com agent substrate used by the other package outputs; Cline only supplies the workspace rules, skills, and MCP configuration surface.

## Cline-specific behavior

- Load these instructions from \`.clinerules/\`, Cline's primary workspace rules directory.
- Load detailed task playbooks from \`.cline/skills/<name>/SKILL.md\` when the request matches a bundled skill.
- Ask the user to configure the MCP servers from \`mcp.json\` in Cline's MCP settings if \`wordpress-studio\` or \`wordpress-telemetry\` tools are unavailable.

## WordPress.com work

- Refer to the product as WordPress.com in user-facing text.
- Start with the \`wordpress-creator\` skill unless the user clearly asks for a specific implementation path.
- Prefer Studio MCP tools before shelling out to the \`studio\` CLI.
- Use \`wp_cli\` through the WordPress Studio MCP server as the general-purpose WordPress escape hatch.
- Choose the smallest fitting WordPress abstraction: site, theme, block, plugin, or audit.
`;
}

function buildClinePluginsReadme() {
  return `# Cline Plugins

Cline's official plugin documentation says plugins currently apply to the Cline SDK, CLI, and Kanban, and are not applicable to the VS Code and JetBrains extensions yet.

This WordPress.com output does not ship a Cline SDK plugin because the current integration uses Cline-native workspace rules, Cline skills, and MCP configuration instead of a custom executable plugin hook.
`;
}

function buildRooWorkspaceRules() {
  return `# WordPress.com workspace rules

Use this workspace as a WordPress.com-aware Roo Code environment.

## Shared substrate

- Use the existing WordPress Studio MCP server for local WordPress site management, screenshots, block validation, performance tooling, and WP-CLI access.
- Use the bundled \`wordpress-telemetry\` MCP server for workflow telemetry emitted by this package.
- Treat these MCP servers as the shared WordPress.com agent substrate used by the other package outputs; Roo Code only supplies the VS Code workspace rule and MCP configuration surface.

## Roo-specific behavior

- Load these instructions from \`.roo/rules/\`, Roo Code's preferred workspace rules directory.
- Use Roo's MCP support to connect to \`.roo/mcp.json\` instead of creating a new backend service.
- Ask the user to enable MCP servers in Roo Code if \`wordpress-studio\` or \`wordpress-telemetry\` tools are unavailable.

## WordPress.com work

- Refer to the product as WordPress.com in user-facing text.
- Route WordPress implementation requests through the shared skills in \`skills/\`.
- Prefer Studio MCP tools before shelling out to the \`studio\` CLI.
- Use \`wp_cli\` through the WordPress Studio MCP server as the general-purpose WordPress escape hatch.
- Choose the smallest fitting WordPress abstraction: site, theme, block, plugin, or audit.
`;
}

function buildRooCodeModeRules() {
  return `# WordPress.com code mode rules

- Keep changes minimal and consistent with existing WordPress project conventions.
- Use Studio MCP for site inspection, screenshots, block validation, performance checks, and WP-CLI commands when available.
- Build custom Gutenberg blocks only when existing core blocks or installed custom blocks cannot solve the request.
- Build plugins for reusable functionality, admin/settings UI, REST endpoints, scheduled tasks, integrations, or backend behavior that should survive theme changes.
- Keep presentation-only work in themes or blocks.
- Verify changes with the repo's documented commands and relevant Studio MCP checks before summarizing work.
`;
}

function buildRooAgentsRules() {
  return `# WordPress.com Roo Code Agent Rules

This output packages the shared Build with WordPress skills for Roo Code.

- Roo-specific files live in \`.roo/\`: workspace rules in \`.roo/rules/\` and MCP configuration in \`.roo/mcp.json\`.
- Shared WordPress.com behavior lives in \`skills/\` and the existing WordPress Studio MCP flow.
- Do not create a new WordPress backend service for Roo Code. Connect Roo to the existing \`studio mcp\` server and bundled \`wordpress-telemetry\` server.
- Use the exact product name WordPress.com in user-facing text.
`;
}

function buildGeminiInstructions({ skillNames }) {
  const skillList = skillNames
    .map((skillName) => `- Load \`skills/${skillName}/SKILL.md\` when the task matches that workflow.`)
    .join("\n");

  return `# ${geminiDisplayName}

You are working with the ${geminiDisplayName} Gemini package.

Use the WordPress Studio MCP server as the primary interface for local WordPress site work:

- manage Studio sites with MCP tools before falling back to shell commands
- use Studio screenshots and block validation for visual and block correctness checks
- use WP-CLI through the Studio MCP server for arbitrary WordPress operations
- use the bundled wordpress-telemetry MCP server to report workflow events when available

The shared WordPress skills are packaged in this directory. Load the smallest relevant skill before planning or editing:

${skillList}

When a request involves WordPress implementation choices, start with \`skills/wordpress-creator/SKILL.md\` so the work routes to the right site, theme, block, plugin, or audit path.
`;
}

const codexMarketplaceManifest = {
  name: pluginName,
  interface: {
    displayName: pluginDisplayName,
  },
  plugins: [
    {
      name: pluginName,
      source: {
        source: "local",
        path: `./plugins/${pluginName}`,
      },
      policy: {
        installation: "AVAILABLE",
        authentication: "ON_INSTALL",
      },
      category: "Coding",
    },
  ],
};

const codexPluginManifest = {
  name: pluginName,
  version: "0.3.0",
  description:
    "Craft production-grade WordPress sites and applications. Everything from themes and plugins to commerce and deployment.",
  author: {
    name: "Automattic",
  },
  homepage: "https://developer.wordpress.com/",
  repository: "https://github.com/Automattic/build-with-wordpress",
  license: "GPL-2.0-or-later",
  keywords: [
    "wordpress",
    "studio",
    "wp-cli",
    "auditing",
    "wordpress-creator",
    "design-previews-creator",
    "block-theme",
    "site-creator",
    "theme-creator",
    "block-creator",
    "plugin-creator",
    "gutenberg",
    "codex",
  ],
  skills: "./skills/",
  mcpServers: "./.mcp.json",
  interface: {
    displayName: pluginDisplayName,
    shortDescription:
      "WordPress site building and auditing with Studio backed routing and review",
    longDescription:
      "Use WordPress Studio to choose the right WordPress implementation path, scaffold and iterate on Studio-backed sites, generate block themes, create custom Gutenberg blocks and plugins, run block validation, audit frontend quality, and review changes with screenshots.",
    developerName: "Automattic",
    category: "Coding",
    capabilities: ["Interactive", "Read", "Write"],
    websiteURL: "https://developer.wordpress.com/",
    defaultPrompt:
      "Help me choose the right WordPress approach for this task, then build it with Studio MCP",
  },
};

const claudePluginManifest = {
  name: pluginName,
  version: "0.3.0",
  description:
    "Craft production-grade WordPress sites and applications. Everything from themes and plugins to commerce and deployment.",
  author: {
    name: "Automattic",
  },
};

const windsurfRules = [
  {
    fileName: "wordpress-com.md",
    contents: `---
trigger: always_on
---

# WordPress.com

- Treat this workspace as a WordPress.com-aware build environment.
- Use the configured WordPress.com MCP tools before falling back to shell or manual WordPress operations.
- Prefer the smallest fitting WordPress abstraction: existing blocks first, then theme work, custom blocks, and plugins only when reusable functionality is required.
- Keep user-facing product text as WordPress.com.
- Ask for the target site only when the available MCP context does not identify it.
- Verify WordPress work through MCP-backed screenshots, block validation, audits, or WP-CLI commands when those tools are available.
`,
  },
  {
    fileName: "wordpress-com-mcp.md",
    contents: `---
trigger: model_decision
description: Use when configuring or troubleshooting Cascade MCP access for WordPress.com and Jetpack-connected sites.
---

# WordPress.com MCP

- Cascade reaches WordPress.com through the existing WordPress.com / Jetpack MCP flow exposed by the configured \`wordpress-studio\` MCP server.
- Do not create a new backend service for WordPress.com access.
- Keep the \`wordpress-studio\` server enabled for site operations, screenshots, block validation, audits, and WP-CLI access.
- Keep the \`wordpress-telemetry\` server enabled when workflow telemetry is needed.
- If Cascade cannot see WordPress.com tools, check Cascade MCP settings and the user's \`~/.codeium/windsurf/mcp_config.json\` file.
`,
  },
];

const factoryPluginManifest = {
  name: pluginName,
  version: "0.3.0",
  description:
    "Craft production-grade WordPress sites and applications with Droid, WordPress Studio MCP, shared skills, commands, hooks, and custom droids.",
  author: {
    name: "Automattic",
  },
  homepage: "https://developer.wordpress.com/",
  repository: "https://github.com/Automattic/build-with-wordpress",
  license: "GPL-2.0-or-later",
};

const factoryMarketplaceManifest = {
  name: pluginName,
  description: "WordPress Studio plugins for Factory Droid.",
  owner: {
    name: "Automattic",
  },
  plugins: [
    {
      name: pluginName,
      description: factoryPluginManifest.description,
      source: `./plugins/${pluginName}`,
      category: "Coding",
    },
  ],
};

const piPackageManifest = {
  name: "wordpress-studio-pi-package",
  version: "0.3.0",
  private: true,
  description: "WordPress Studio skills packaged for the Pi coding agent.",
  author: {
    name: "Automattic",
  },
  license: "GPL-2.0-or-later",
  keywords: ["pi-package", "wordpress", "studio", "agent-skills"],
  pi: {
    skills: ["./skills"],
  },
};

function buildOpenCodeConfig({ telemetrySource }) {
  return {
    "$schema": "https://opencode.ai/config.json",
    instructions: ["AGENTS.md"],
    mcp: createLocalCommandArrayMcpConfig({
      surface: "opencode",
      telemetrySource,
    }),
  };
}

const cursorPluginManifest = {
  name: cursorPluginName,
  displayName: cursorPluginDisplayName,
  version: "0.3.0",
  description:
    "Craft production-grade WordPress sites and applications. Everything from themes and plugins to commerce and deployment.",
  author: {
    name: "Automattic",
  },
  homepage: "https://developer.wordpress.com/",
  repository: "https://github.com/Automattic/wordpress-cursor-plugin",
  license: "GPL-2.0-or-later",
  keywords: [
    "wordpress",
    "studio",
    "wp-cli",
    "auditing",
    "wordpress-creator",
    "design-previews-creator",
    "block-theme",
    "site-creator",
    "theme-creator",
    "block-creator",
    "plugin-creator",
    "gutenberg",
    "cursor",
  ],
  rules: "./rules/",
  skills: "./skills/",
  mcpServers: "./mcp.json",
};

function buildReadme({ surfaceName, intro, skillNames, displayName = pluginDisplayName }) {
  const skillList = skillNames
    .map((skillName) => `- \`${skillName}\``)
    .join("\n");

  return `# ${displayName} Plugin

This ${surfaceName} plugin packages shared WordPress skills from the \`build-with-wordpress\` source repo as ${displayName}.

${intro}

It ships the shared skills from this repo so all supported surfaces stay aligned while we iterate on surface-specific packaging details.

## Included skills

${skillList}
`;
}

function buildPiReadme({ skillNames }) {
  const skillList = skillNames
    .map((skillName) => `- \`${skillName}\``)
    .join("\n");

  return `# WordPress Studio for Pi

This Pi package shares the Build with WordPress skills with the official Pi coding-agent surface.

## Official Pi surface

Pi's official coding-agent package is \`@earendil-works/pi-coding-agent\`, documented at https://pi.dev/docs/latest and implemented in https://github.com/earendil-works/pi/tree/main/packages/coding-agent.

The official Pi documentation describes these compatible extension points:

- repo instructions through \`AGENTS.md\` or \`CLAUDE.md\`
- Agent Skills loaded from \`skills/\` directories or package manifests
- TypeScript extensions for custom tools, commands, events, providers, and UI
- prompt templates and themes
- Pi packages installed from npm, git, or local paths

## Install

From this repository after \`pnpm build\`:

\`\`\`bash
pi install ./plugins/pi
\`\`\`

For a project-local install, use:

\`\`\`bash
pi install -l ./plugins/pi
\`\`\`

## Compatibility path

This output is intentionally a skills-only Pi package. Pi's official docs state that Pi has no built-in MCP support; MCP support should be built as a TypeScript extension if we want Pi to call the WordPress Studio MCP server directly.

Until that extension exists, use these skills as Pi-readable WordPress workflows and use the Studio CLI fallback paths documented in the shared \`studio\` skill when MCP tools are unavailable.

## Included skills

${skillList}
`;
}

function buildCursorRule() {
  return `---
description: Route WordPress site, theme, block, plugin, and audit work through WordPress Studio skills and MCP.
alwaysApply: true
---

# WordPress Studio

Use the shared WordPress Studio skills in this plugin for WordPress site building and audit work.

- Start with \`wordpress-creator\` unless the user clearly asks for a specific implementation path.
- Use Studio MCP for local site management, screenshots, block validation, frontend audits, and \`wp_cli\` access.
- Choose the smallest fitting WordPress abstraction: site, theme, block, plugin, or audit.
- Keep WordPress workflow guidance in the shared skills rather than duplicating it in Cursor-specific rules.
`;
}

function buildContinueReadme() {
  return `# WordPress.com for Continue

This output shows how to configure the Continue IDE assistant for WordPress.com work using Continue-native configuration files.

Continue does not install this repository as a plugin. Instead, copy the example files into your Continue workspace or user configuration:

- \`.continue/rules/wordpress-com.md\` contains WordPress.com instructions for Agent, Chat, and Edit modes
- \`.continue/prompts/create-wordpress-com-site.md\` adds a reusable slash-command prompt for new site work
- \`.continue/prompts/audit-wordpress-com-project.md\` adds a reusable slash-command prompt for review work
- \`.continue/mcpServers/wordpress-com.yaml\` shows the MCP server block Continue can load in Agent mode
- \`config.yaml\` shows the equivalent user-level \`~/.continue/config.yaml\` snippet

## Setup

1. Install Continue in VS Code or JetBrains.
2. Copy the example \`.continue/\` directory from this folder into the root of the project you want Continue to help with.
3. Open Continue's local config at \`~/.continue/config.yaml\` and merge in the relevant parts of \`config.yaml\` if you prefer user-level configuration.
4. Keep using the existing WordPress.com and Jetpack MCP flow. The example MCP block launches \`studio mcp\`, matching the shared WordPress.com MCP substrate used by the other outputs in this repository. If your environment exposes the WordPress.com or Jetpack MCP bridge through a different command, replace only the \`command\` and \`args\` values with that existing entrypoint.
5. Use Continue Agent mode when you need MCP tools; Continue exposes MCP tools to Agent mode.

## Continue-specific pieces

These files are specific to Continue:

- local rule files under \`.continue/rules/\`
- local prompt files under \`.continue/prompts/\` with \`invokable: true\`
- local MCP server blocks under \`.continue/mcpServers/\`
- optional user-level \`~/.continue/config.yaml\` snippets

## Shared WordPress.com substrate

The WordPress.com behavior remains shared across agent surfaces:

- WordPress.com and Jetpack access comes from the existing MCP flow, not a Continue-only backend
- site management, WordPress operations, and Jetpack-connected tools should use that MCP substrate when available
- implementation guidance stays aligned with the shared WordPress skills in this repository
- Continue contributes the IDE-specific packaging format around the same WordPress.com workflow

## Continue references

- Configuration: https://docs.continue.dev/customize/deep-dives/configuration
- Rules: https://docs.continue.dev/customize/deep-dives/rules
- Prompts: https://docs.continue.dev/customize/deep-dives/prompts
- MCP tools: https://docs.continue.dev/customize/deep-dives/mcp
`;
}

function buildContinueConfigSnippet() {
  return `# Merge the relevant sections into ~/.continue/config.yaml.
# Continue also loads project-local files from .continue/rules,
# .continue/prompts, and .continue/mcpServers when they are present in a workspace.

name: WordPress.com
version: 0.0.1
schema: v1

# Project-local rule and prompt files can stay in .continue/rules and
# .continue/prompts. If you publish them to Continue Hub, reference them here:
# rules:
#   - uses: your-org/wordpress-com
# prompts:
#   - uses: your-org/create-wordpress-com-site
#   - uses: your-org/audit-wordpress-com-project

mcpServers:
  - name: WordPress.com MCP
    type: stdio
    command: studio
    args:
      - mcp
`;
}

function buildContinueWordPressRule() {
  return `---
name: WordPress.com
alwaysApply: true
description: WordPress.com guidance for Continue Agent, Chat, and Edit requests.
---

# WordPress.com

- Use the product name WordPress.com in user-facing text.
- Prefer the WordPress.com and Jetpack MCP tools for site discovery, site changes, screenshots, validation, and WordPress operations when they are available.
- Use Continue Agent mode for tasks that need MCP tools.
- Preserve existing project conventions and make the smallest complete change.
- For themes, blocks, plugins, and content changes, inspect the current WordPress project structure before editing.
- Use WordPress APIs, Gutenberg block markup, and WP-CLI-compatible operations instead of custom one-off storage or service layers.
- Explain whether a recommendation depends on Continue configuration or the shared WordPress.com MCP substrate.
`;
}

function buildContinueCreateSitePrompt() {
  return `---
name: Create WordPress.com site
description: Plan and build a WordPress.com site change using Continue and MCP tools.
invokable: true
---

# Create WordPress.com Site Work

Use Continue Agent mode and the configured WordPress.com MCP tools to help create or update a WordPress.com site.

1. Inspect the current project and available WordPress.com MCP tools.
2. Identify whether the task is best handled with blocks, a theme, a plugin, content edits, or site settings.
3. Make the smallest complete implementation that matches the existing project conventions.
4. Validate the result with available WordPress.com MCP tools, screenshots, block validation, WP-CLI, or project tests.
5. Summarize what changed, what was verified, and any remaining manual review steps.
`;
}

function buildContinueAuditPrompt() {
  return `---
name: Audit WordPress.com project
description: Review a WordPress.com project for implementation, accessibility, performance, and editing quality.
invokable: true
---

# Audit WordPress.com Project

Review the selected WordPress.com project or change set.

Focus on:

- correctness and regressions
- block validity and editor compatibility
- accessibility
- responsive behavior
- frontend performance
- maintainability and WordPress conventions

Use the configured WordPress.com MCP tools when available. Report findings first, ordered by severity, with file or tool evidence where possible.
`;
}

function buildContinueMcpServerBlock() {
  return `name: WordPress.com MCP
version: 0.0.1
schema: v1
mcpServers:
  - name: WordPress.com MCP
    type: stdio
    command: studio
    args:
      - mcp
`;
}

function buildConductorSettings() {
  return `"$schema" = "https://conductor.build/schemas/settings.repo.schema.json"

[scripts]
setup = "pnpm install"
run = "pnpm build && pnpm verify"
run_mode = "concurrent"
`;
}

function buildConductorReadme() {
  return `# WordPress.com for Conductor

This output packages Conductor repository settings and guidance for using the shared Build with WordPress agent outputs inside Conductor workspaces.

Conductor is a workspace layer for parallel Claude Code, Codex, and Cursor agents. It creates isolated Git worktrees, runs setup and run scripts from each workspace, and then helps review, open PRs, and archive finished branches.

## Generated files

- \`.conductor/settings.toml\` configures shared Conductor repository scripts.
- \`README.md\` documents how Conductor should use the existing Claude Code, Codex, and Cursor outputs from this repository.

## Setup

1. Install Conductor for macOS from https://www.conductor.build/.
2. Open the repository you want Conductor to manage.
3. Copy this output's \`.conductor/settings.toml\` into the repository root when the Build with WordPress package scripts are the workflow you want new Conductor workspaces to share.
4. Install or sync the underlying agent configs for the agents you plan to run:
   - Claude Code: use \`plugins/claude-code/\`.
   - Codex: use \`plugins/codex/\`.
   - Cursor: use \`plugins/cursor/\`.
5. In Conductor, use Sync Agent Configs or the agent/provider settings to make the same MCP servers available to Claude Code, Codex, and Cursor.

## Scripts

Current Conductor docs recommend committed repository settings in \`.conductor/settings.toml\` for shared setup and run scripts. Legacy \`conductor.json\` is not generated because current docs mark it as legacy and Conductor ignores repo-level \`conductor.json\` once \`.conductor/settings.toml\` exists.

The generated settings use:

\`\`\`toml
"$schema" = "https://conductor.build/schemas/settings.repo.schema.json"

[scripts]
setup = "pnpm install"
run = "pnpm build && pnpm verify"
run_mode = "concurrent"
\`\`\`

Adjust \`scripts.setup\` and \`scripts.run\` for repositories that consume these WordPress.com agent files instead of developing this package directly. Use \`$CONDUCTOR_PORT\` in run scripts when a workspace starts a local web server.

## MCP support

Conductor supports MCP servers through the app's MCP/provider configuration and can sync agent configs between Claude Code and Codex. The current repository settings schema documents scripts, prompts, environment variables, providers, and Git behavior, but it does not define a repository-level MCP server table.

For that reason this output does not invent a Conductor-specific MCP file. Use the existing MCP configs generated for the underlying agents:

- Claude Code: \`plugins/claude-code/.mcp.json\`
- Codex: \`plugins/codex/plugins/wordpress-studio/.mcp.json\`
- Cursor: \`plugins/cursor/mcp.json\`

Those configs launch the shared \`studio mcp\` server plus the bundled \`wordpress-telemetry\` server. Conductor's MCP support and Sync Agent Configs should point at the same shared substrate instead of adding another WordPress.com backend.

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
`;
}

function buildOpenCodeReadme({ skillNames }) {
  const skillList = skillNames
    .map((skillName) => `- \`${skillName}\``)
    .join("\n");

  return `# WordPress.com for OpenCode

This OpenCode output packages the shared WordPress skills from the \`build-with-wordpress\` source repo for WordPress.com work.

It is intentionally OpenCode-native:

- \`opencode.json\` points OpenCode at the WordPress.com instructions and MCP servers
- \`.opencode/skills/\` contains the shared WordPress skills used by the other outputs
- \`.opencode/agents/wordpress-com.md\` gives OpenCode a focused WordPress.com agent
- \`.opencode/commands/wordpress.md\` provides a quick command for WordPress.com build tasks
- \`.opencode/plugins/README.md\` documents why no local OpenCode plugin JavaScript is shipped yet

## Setup

1. Install OpenCode using the official OpenCode setup instructions.
2. Install WordPress Studio and make sure the \`studio\` CLI is available on your \`PATH\`.
3. Open this directory as the project root, or copy \`opencode.json\`, \`AGENTS.md\`, and \`.opencode/\` into your project.
4. Start OpenCode from the configured project root.
5. Confirm the MCP servers are available with \`opencode mcp list\`.

## MCP setup

The OpenCode config uses the existing WordPress.com / Jetpack MCP flow through WordPress Studio:

\`\`\`json
{
  "mcp": {
    "wordpress-studio": {
      "type": "local",
      "command": ["studio", "mcp"],
      "enabled": true
    }
  }
}
\`\`\`

Use the normal Studio and WordPress.com connection flow to connect local sites, Jetpack-enabled sites, and WordPress.com-backed tooling. This output does not introduce a new backend service or OpenCode-specific WordPress.com MCP server.

The generated config also starts the bundled \`wordpress-telemetry\` MCP server so workflow events stay aligned with the other agent surfaces.

## What is OpenCode-specific

- OpenCode config lives in \`opencode.json\` and uses OpenCode's \`mcp\` shape.
- OpenCode rules live in \`AGENTS.md\` and are included through the \`instructions\` config key.
- OpenCode discovers skills from \`.opencode/skills/<name>/SKILL.md\`.
- OpenCode discovers commands from \`.opencode/commands/*.md\`.
- OpenCode discovers local plugins from \`.opencode/plugins/*.js\` or \`.opencode/plugins/*.ts\`; this output only documents that directory because no OpenCode-only plugin hook is needed for the current WordPress.com integration.

## What is shared

- The WordPress.com site-building workflows are the same shared skills used by Codex, Claude Code, and Cursor.
- The Studio MCP server remains the shared substrate for local site management, screenshots, block validation, \`wp_cli\`, and WordPress.com / Jetpack-connected workflows.
- The telemetry MCP server is the same bundled server generated for the other outputs, with the surface set to \`opencode\`.

## Included skills

${skillList}
`;
}

function buildDevinDesktopReadme({ skillNames }) {
  const skillList = skillNames
    .map((skillName) => `- \`${skillName}\``)
    .join("\n");

  return `# WordPress.com for Devin Desktop

This Devin Desktop output packages the shared WordPress agent substrate from the \`build-with-wordpress\` source repo for WordPress.com work.

## What is Devin Desktop-specific

- Cascade rules live in \`.devin/rules/*.md\`, which the official docs list as the preferred workspace rule location.
- \`mcp_config.json\` is shaped for Cascade's MCP configuration file at \`~/.codeium/windsurf/mcp_config.json\`.
- The rules tell Cascade when to use WordPress.com MCP tools and how to route WordPress implementation work.

## Migration from Windsurf

Windsurf/Cascade is now part of the Devin Desktop lineage, so this generated package lives at \`plugins/devin-desktop/\`. Cascade's official MCP config path still uses \`~/.codeium/windsurf/mcp_config.json\`, so the setup instructions keep that destination path while the repository output uses the Devin Desktop name.

## What is shared

- The WordPress.com MCP path uses the existing \`wordpress-studio\` MCP server; this output does not add a new backend service.
- Jetpack-connected site access stays part of the existing WordPress.com / Jetpack MCP flow.
- The bundled \`wordpress-telemetry\` MCP server is the same repo-local telemetry server used by the other outputs.
- Shared WordPress skills are copied into \`skills/\` so routing, Studio-backed workflows, auditing, theme, block, and plugin guidance stay aligned across agent surfaces.

## Setup

1. Install Devin Desktop and complete onboarding.
2. Optionally install the \`windsurf\` command in \`PATH\` during onboarding.
3. Build this repo with \`pnpm build\`.
4. Copy the servers from \`plugins/devin-desktop/mcp_config.json\` into \`~/.codeium/windsurf/mcp_config.json\`.
5. In Cascade MCP settings, confirm both servers are enabled:
   - \`wordpress-studio\`
   - \`wordpress-telemetry\`
6. Open this output folder or copy \`.devin/rules/\` into the workspace where Cascade should be WordPress.com-aware.
7. Ask Cascade for a WordPress.com site task and confirm it uses MCP tools before shell fallbacks.

## Included Cascade rules

- \`.devin/rules/wordpress-com.md\`: always-on WordPress.com routing and product guidance.
- \`.devin/rules/wordpress-com-mcp.md\`: model-decision MCP setup and troubleshooting guidance.

## Official references

- Rules and memories: https://docs.windsurf.com/windsurf/cascade/memories
- MCP configuration: https://docs.windsurf.com/windsurf/cascade/mcp
- AGENTS.md discovery: https://docs.devin.ai/desktop/cascade/agents-md
- Installation and onboarding: https://docs.windsurf.com/windsurf/getting-started

## Included shared skills

${skillList}
`;
}

function buildRooReadme({ skillNames }) {
  const skillList = skillNames
    .map((skillName) => `- \`${skillName}\``)
    .join("\n");

  return `# WordPress.com for Roo Code

This output packages the shared Build with WordPress skills for the Roo Code VS Code extension.

Roo-specific files in this folder are intentionally small:

- \`.roo/rules/wordpress-com.md\` gives Roo workspace-wide WordPress.com guidance using Roo's preferred directory-based rules surface.
- \`.roo/rules-code/wordpress-com-code.md\` adds Code mode guidance for implementation tasks.
- \`.roo/mcp.json\` connects Roo to the existing WordPress Studio MCP server and bundled \`wordpress-telemetry\` server.
- \`AGENTS.md\` mirrors the same high-level routing for Roo installations that load agent rules.

The shared WordPress.com substrate is not Roo-specific: the skills in \`skills/\`, the \`studio mcp\` server, and the embedded telemetry MCP bootstrap are the same flow used by the other agent outputs. Roo Code supplies the VS Code workspace rules and MCP configuration layer only.

## Setup

1. Install the Roo Code VS Code extension.
2. Open this folder, or copy its contents into the root of the workspace where Roo should assist with WordPress.com work.
3. Make sure WordPress Studio is installed and the \`studio\` CLI is available on your PATH.
4. In Roo Code, enable MCP servers.
5. Roo automatically detects project-level MCP config from \`.roo/mcp.json\`. If needed, open Roo Code's MCP settings and use \`Edit Project MCP\` to inspect or recreate the same config.

## MCP servers

\`.roo/mcp.json\` launches:

- \`wordpress-studio\`: runs \`studio mcp\` for WordPress site management, screenshots, block validation, performance tooling, and WP-CLI access.
- \`wordpress-telemetry\`: runs an embedded bootstrap generated from the shared telemetry server artifact.

This does not invent a Roo-only backend. Roo connects to the existing WordPress.com / Jetpack MCP flow through the same local Studio MCP entry point used by the other outputs.

## Included skills

${skillList}
`;
}

function buildClineReadme({ skillNames }) {
  const skillList = skillNames
    .map((skillName) => `- \`${skillName}\``)
    .join("\n");

  return `# WordPress.com for Cline

This output packages the shared Build with WordPress skills for Cline.

Cline-specific files in this folder are intentionally small:

- \`.clinerules/wordpress-com.md\` gives Cline workspace-wide WordPress.com guidance using Cline's primary workspace rules directory.
- \`.cline/skills/\` contains the shared WordPress skills using Cline's documented skill structure.
- \`mcp.json\` contains the MCP server entries to merge into Cline's MCP settings.
- \`.cline/plugins/README.md\` documents why this output does not ship a Cline SDK plugin yet.

The shared WordPress.com substrate is not Cline-specific: the skills, the \`studio mcp\` server, and the embedded telemetry MCP bootstrap are the same flow used by the other agent outputs. Cline supplies the workspace rules, skills, and MCP configuration layer only.

Cline's official plugin documentation says plugins currently apply to Cline SDK, CLI, and Kanban, and are not applicable to the VS Code and JetBrains extensions yet. This output therefore does not claim extension marketplace packaging; it packages the Cline-native workspace files that official docs support today.

## Setup

1. Install Cline using the official Cline installation instructions.
2. Open this folder, or copy \`.clinerules/\`, \`.cline/skills/\`, and \`mcp.json\` into the root of the workspace where Cline should assist with WordPress.com work.
3. Make sure WordPress Studio is installed and the \`studio\` CLI is available on your PATH.
4. Merge the server entries from \`mcp.json\` into Cline's MCP settings. Cline's docs describe CLI MCP settings at \`~/.cline/mcp.json\`; IDE extensions open their MCP settings JSON through the MCP Servers Configure tab.
5. Confirm the \`wordpress-studio\` and \`wordpress-telemetry\` MCP tools are available in Cline before starting site work.

## MCP servers

\`mcp.json\` launches:

- \`wordpress-studio\`: runs \`studio mcp\` for WordPress site management, screenshots, block validation, performance tooling, and WP-CLI access.
- \`wordpress-telemetry\`: runs an embedded bootstrap generated from the shared telemetry server artifact.

This does not invent a Cline-only backend. Cline connects to the existing WordPress.com / Jetpack MCP flow through the same local Studio MCP entry point used by the other outputs.

## Official Cline references

- Rules: https://docs.cline.bot/customization/cline-rules.md
- Skills: https://docs.cline.bot/customization/skills.md
- MCP: https://docs.cline.bot/mcp/mcp-overview.md
- MCP Marketplace: https://docs.cline.bot/mcp/mcp-marketplace.md
- Configuration locations: https://docs.cline.bot/getting-started/config.md
- Plugins: https://docs.cline.bot/customization/plugins.md
- Plugin installation: https://docs.cline.bot/sdk/plugin-install.md
- Installing Cline: https://docs.cline.bot/getting-started/installing-cline.md

## Included skills

${skillList}
`;
}

function buildAiderReadme({ skillNames }) {
  const skillList = skillNames
    .map((skillName) => `- \`skills/${skillName}/SKILL.md\``)
    .join("\n");

  return `# WordPress.com Aider Configuration

This Aider output packages WordPress.com coding guidance for terminal pair-programming with Aider.

Aider does not use a marketplace plugin manifest or MCP config in normal usage. This output is intentionally a small config and documentation pack:

- \`.aider.conf.yml\` loads the instruction files as read-only context
- \`CONVENTIONS.md\` provides Aider-specific setup and editing conventions
- \`skills/\` contains the shared WordPress.com agent guidance also used by other outputs

## Setup

1. Copy or symlink the contents of this directory into the root of the repository you want to edit.
2. Configure your model and API keys with Aider-supported environment variables or a local \`.env\` file.
3. Start Aider from the repository root that contains \`.aider.conf.yml\`:

\`\`\`bash
aider
\`\`\`

Aider will read the configured guidance files without making them editable in the chat.

## Aider-specific guidance

- Use \`.aider.conf.yml\` and \`CONVENTIONS.md\` for Aider configuration and conventions.
- Use Aider's normal \`/read\`, \`/add\`, lint, test, and git workflows for active pair-programming.
- Keep API keys in environment variables or a local \`.env\` file; do not commit secrets.

## Shared WordPress.com guidance

The shared guidance describes WordPress.com implementation routing, Studio-backed local workflows, site creation, theme work, block creation, plugin creation, design previews, and auditing.

These files are loaded as read-only context:

${skillList}

## MCP and agent substrate

WordPress.com agent workflows share Studio MCP and telemetry guidance across Codex and Claude Code outputs. Aider complements that substrate as a terminal pair-programming tool, but this output does not pretend Aider has a native marketplace plugin or MCP package surface.
`;
}

function buildAiderConventions({ skillNames }) {
  const skillList = skillNames
    .map((skillName) => `- \`skills/${skillName}/SKILL.md\``)
    .join("\n");

  return `# WordPress.com Aider Conventions

Use these conventions when pair-programming with Aider on WordPress.com projects.

## Aider workflow

- Treat this file and the shared skill files as read-only guidance.
- Add only the files needed for the current change to the editable chat.
- Prefer small, reviewable diffs and run the relevant lint, build, or test command before finishing.
- Keep model names, API keys, and provider credentials in Aider-supported environment variables or a local \`.env\` file.
- Use Aider's git-aware workflow for code edits; review the diff before committing.

## WordPress.com implementation guidance

- Choose the smallest WordPress abstraction that solves the request cleanly.
- Use themes for presentation, blocks for reusable editor-insertable content, and plugins for reusable behavior that should survive theme changes.
- Validate serialized block markup after editing generated block content.
- Sanitize input, escape output, check capabilities, and use nonces for admin actions.
- Keep generated code understandable, maintainable, and consistent with the existing project.

## Shared guidance files

The shared WordPress.com agent guidance is loaded from:

${skillList}
`;
}

function buildOpenCodeAgentsMd() {
  return `# WordPress.com OpenCode Instructions

Use WordPress.com as the user-facing product name.

## Role

You help users build, customize, audit, and troubleshoot WordPress.com sites using the smallest suitable WordPress abstraction.

## Workflow

- Start by loading the \`wordpress-creator\` skill for WordPress.com build, theme, block, plugin, site-creation, or audit requests.
- Prefer the WordPress Studio MCP server for site discovery, local site control, screenshots, block validation, and \`wp_cli\` access.
- Use WordPress.com / Jetpack-connected MCP tools through the existing Studio MCP flow when the task targets a connected WordPress.com site.
- Choose existing WordPress features and known plugins before creating custom code.
- Use custom block plugins for reusable editor blocks that core blocks cannot cover.
- Use custom plugins for reusable behavior that should survive theme changes.
- Use theme work for templates, layout, styling, and visual presentation.
- Verify changes with the relevant Studio MCP tools before calling the task complete.

## Shared Substrate

The WordPress.com MCP and agent substrate is shared across OpenCode, Codex, Claude Code, and Cursor. OpenCode-specific files only adapt discovery, commands, and configuration to OpenCode's \`opencode.json\` and \`.opencode/\` conventions.
`;
}

function buildOpenCodeAgent() {
  return `---
description: Builds, customizes, audits, and troubleshoots WordPress.com sites using Studio MCP and shared WordPress skills.
mode: all
---

You are a WordPress.com specialist for OpenCode.

Use WordPress.com as the product name in user-facing text. For WordPress.com build, theme, block, plugin, site-creation, or audit requests, load the \`wordpress-creator\` skill first and follow its routing.

Prefer the \`wordpress-studio\` MCP server for site operations, screenshots, block validation, \`wp_cli\`, and WordPress.com / Jetpack-connected workflows. Use the \`wordpress-telemetry\` MCP server for workflow telemetry when available.
`;
}

function buildOpenCodeCommand() {
  return `---
description: Route a WordPress.com task through the shared WordPress creator workflow
agent: build
---

Handle this WordPress.com request using the shared WordPress creator workflow:

$ARGUMENTS

Load the \`wordpress-creator\` skill, choose the smallest suitable implementation path, and use the \`wordpress-studio\` MCP server for site operations and verification.
`;
}

function buildOpenCodePluginsReadme() {
  return `# OpenCode Plugins

OpenCode loads project-local JavaScript or TypeScript plugins from this directory.

This WordPress.com output does not currently ship an OpenCode-only plugin hook. The integration uses OpenCode's native config, rules, agents, commands, skills, and MCP support instead of inventing a plugin marketplace or a new backend service.
`;
}

function buildKiloConfig({ telemetrySource }) {
  return {
    "$schema": "https://app.kilo.ai/config.json",
    instructions: [".kilo/rules/wordpress-com.md"],
    mcp: createLocalCommandArrayMcpConfig({
      surface: "kilo-code",
      telemetrySource,
    }),
  };
}

function buildKiloAgentsMd() {
  return `# WordPress.com Kilo Code Instructions

Use WordPress.com as the user-facing product name.

## Role

You help users build, customize, audit, and troubleshoot WordPress.com sites using the smallest suitable WordPress abstraction.

## Workflow

- Start by loading the \`wordpress-creator\` skill for WordPress.com build, theme, block, plugin, site-creation, or audit requests.
- Prefer the WordPress Studio MCP server for site discovery, local site control, screenshots, block validation, and \`wp_cli\` access.
- Use WordPress.com / Jetpack-connected MCP tools through the existing Studio MCP flow when the task targets a connected WordPress.com site.
- Choose existing WordPress features and known plugins before creating custom code.
- Use custom block plugins for reusable editor blocks that core blocks cannot cover.
- Use custom plugins for reusable behavior that should survive theme changes.
- Use theme work for templates, layout, styling, and visual presentation.
- Verify changes with the relevant Studio MCP tools before calling the task complete.

## Shared Substrate

The WordPress.com MCP and agent substrate is shared across Kilo Code, OpenCode, Codex, Claude Code, Cursor, and Roo Code. Kilo-specific files only adapt discovery, rules, agents, skills, plugins, and configuration to Kilo's \`kilo.jsonc\` and \`.kilo/\` conventions.
`;
}

function buildQodoAgentsMd({ skillNames }) {
  const skillList = skillNames
    .map((skillName) => `- For ${skillName} work, consult \`skills/${skillName}/SKILL.md\`.`)
    .join("\n");

  return `# WordPress Studio for Qodo

Use these instructions when Qodo IDE Plugin assists with WordPress site building, auditing, theme work, custom blocks, or plugins.

## Operating model

- Prefer WordPress Studio MCP tools for site management, screenshots, block validation, frontend audits, and WordPress operations when they are available in Qodo.
- Use \`wp_cli\` through the Studio MCP server as the general-purpose WordPress escape hatch.
- Route implementation requests through the smallest suitable WordPress abstraction: site settings, content, theme, block, plugin, or audit.
- Preserve existing project conventions and inspect the current WordPress structure before editing.
- Keep generated code accessible, performant, responsive, secure, and aligned with WordPress APIs and Gutenberg conventions.
- Verify changes with relevant Studio MCP tools, project tests, screenshots, block validation, or WP-CLI before summarizing completion.

## Shared WordPress skills

This Qodo output packages the same shared skill source as the other Build with WordPress outputs. The skills live in \`skills/\` and provide deeper task-specific guidance:

${skillList}

When a task maps to one of those skills, use the relevant \`skills/<name>/SKILL.md\` file as the detailed playbook. Start with \`skills/wordpress-creator/SKILL.md\` for broad WordPress implementation requests.
`;
}

function buildQodoReadme({ skillNames, telemetrySource }) {
  const skillList = skillNames
    .map((skillName) => `- \`${skillName}\``)
    .join("\n");
  const mcpConfig = JSON.stringify(
    createMcpConfig({
      surface: "qodo",
      telemetrySource,
    }),
    null,
    2,
  );

  return `# WordPress Studio for Qodo

This output packages the shared Build with WordPress skills for Qodo IDE Plugin.

Qodo-specific files in this folder are intentionally small:

- \`AGENTS.md\` provides repo-local WordPress guidance using Qodo's documented AGENTS.md support.
- \`skills/\` contains the shared WordPress skill playbooks used by the other outputs.
- The MCP setup below embeds the telemetry bootstrap generated from the shared \`dist/wordpress-telemetry-mcp.mjs\` artifact.

## Setup

1. Install Qodo IDE Plugin for VS Code, JetBrains, or Visual Studio.
2. Open this folder, or copy \`AGENTS.md\` and \`skills/\` into the root of the workspace where Qodo should assist with WordPress work.
3. Make sure WordPress Studio is installed and the \`studio\` CLI is available on your PATH.
4. If your Qodo plan supports Agentic Tools, add the MCP configuration below in Qodo's Tools Management page or through your enterprise MCP allow-list.
5. Use Qodo's local review workflows or agents for representative WordPress tasks such as creating a site, editing a theme, creating a custom block, creating a custom plugin, or running an audit.

## MCP setup

Qodo's official documentation describes MCP setup as an in-product Agentic Tools configuration or enterprise allow-list. It does not document a repo-local \`.mcp.json\` file that Qodo automatically loads, so this output documents the JSON to paste into Qodo instead of generating a Qodo-only MCP config file:

\`\`\`json
${mcpConfig}
\`\`\`

The \`wordpress-studio\` entry uses the existing \`studio mcp\` server for WordPress site management, screenshots, block validation, performance tooling, and WP-CLI access. The \`wordpress-telemetry\` entry uses the bundled telemetry server so workflow events stay aligned with the other agent surfaces.

## What is Qodo-specific

- Qodo automatically reads the closest repo-local \`AGENTS.md\` as project context for its IDE agent.
- Qodo workflows can be exported/imported as \`.toml\` files under Qodo's user-managed agent directory, but the official docs do not define a repository packaging convention for those files.
- Qodo Agentic Tools support local and remote MCPs through the Qodo UI or enterprise allow-list, not through a generated marketplace package in this repository.

## Official Qodo references

- IDE plugin overview and code-generation deprecation notice: https://docs.qodo.ai/qodo-ide
- IDE setup and marketplace links: https://docs.qodo.ai/qodo-ide/getting-started/setup-and-installation
- AGENTS.md support: https://docs.qodo.ai/qodo-ide/agent/agents.md-support
- Workflows and agent TOML files: https://docs.qodo.ai/qodo-ide/agent/workflows
- Agentic Tools MCP setup: https://docs.qodo.ai/qodo-ide/tools-mcps/agentic-tools-mcps
- Code review configuration file: https://docs.qodo.ai/install-and-configure/configuration-overview/configuration-file
- Qodo Skills: https://docs.qodo.ai/agent-skills

## Included skills

${skillList}
`;
}

function buildZedAgentsMd() {
  return `# WordPress.com Zed Instructions

Use WordPress.com as the user-facing product name.

## Role

You help users build, customize, audit, and troubleshoot WordPress.com sites using the smallest suitable WordPress abstraction.

## Workflow

- Start by loading the \`wordpress-creator\` skill for WordPress.com build, theme, block, plugin, site-creation, or audit requests.
- Prefer the WordPress Studio MCP server for site discovery, local site control, screenshots, block validation, and \`wp_cli\` access.
- Use WordPress.com / Jetpack-connected MCP tools through the existing Studio MCP flow when the task targets a connected WordPress.com site.
- Choose existing WordPress features and known plugins before creating custom code.
- Use custom block plugins for reusable editor blocks that core blocks cannot cover.
- Use custom plugins for reusable behavior that should survive theme changes.
- Use theme work for templates, layout, styling, and visual presentation.
- Verify changes with the relevant Studio MCP tools before calling the task complete.

## Shared Substrate

The WordPress.com MCP and agent substrate is shared across Zed, OpenCode, Codex, Claude Code, Cursor, Gemini, Copilot, and Roo Code. Zed-specific files only adapt discovery and MCP configuration to Zed's native \`AGENTS.md\`, \`.agents/skills/\`, and \`.zed/settings.json\` conventions.
`;
}

function buildKiloRule() {
  return `# WordPress.com for Kilo Code

- Use the product name WordPress.com in user-facing text.
- Prefer the configured \`wordpress-studio\` MCP server for site discovery, site changes, screenshots, block validation, and WordPress operations.
- Use the bundled \`wordpress-telemetry\` MCP server for workflow telemetry emitted by this package.
- Route implementation requests through the shared skills in \`.kilo/skills/\`, starting with \`wordpress-creator\` unless the user clearly asks for a narrower path.
- Preserve existing project conventions and make the smallest complete change.
- For themes, blocks, plugins, and content changes, inspect the current WordPress project structure before editing.
- Use WordPress APIs, Gutenberg block markup, and WP-CLI-compatible operations instead of custom one-off storage or service layers.
`;
}

function buildKiloAgent() {
  return `---
description: Builds, customizes, audits, and troubleshoots WordPress.com sites using Studio MCP and shared WordPress skills.
mode: all
---

You are a WordPress.com specialist for Kilo Code.

Use WordPress.com as the product name in user-facing text. For WordPress.com build, theme, block, plugin, site-creation, or audit requests, load the \`wordpress-creator\` skill first and follow its routing.

Prefer the \`wordpress-studio\` MCP server for site operations, screenshots, block validation, \`wp_cli\`, and WordPress.com / Jetpack-connected workflows. Use the \`wordpress-telemetry\` MCP server for workflow telemetry when available.
`;
}

function buildKiloPluginsReadme() {
  return `# Kilo Code Plugins

Kilo Code loads project-local JavaScript or TypeScript plugins from this directory.

This WordPress.com output does not currently ship a Kilo-only plugin hook. The integration uses Kilo's native config, custom rules, agents, skills, AGENTS.md, and MCP support instead of inventing a plugin marketplace or a new backend service.
`;
}

function buildKiloReadme({ skillNames }) {
  const skillList = skillNames
    .map((skillName) => `- \`${skillName}\``)
    .join("\n");

  return `# WordPress.com for Kilo Code

This Kilo Code output packages the shared WordPress skills from the \`build-with-wordpress\` source repo for WordPress.com work.

It is intentionally Kilo-native:

- \`kilo.jsonc\` configures project instructions and MCP servers using Kilo's current config shape.
- \`.kilo/rules/wordpress-com.md\` contains Kilo custom rules for the workspace.
- \`.kilo/skills/\` contains the shared Agent Skills used by the other outputs.
- \`.kilo/agents/wordpress-com.md\` defines a focused Kilo agent/mode for WordPress.com work.
- \`.kilo/plugin/README.md\` documents why no local Kilo plugin JavaScript is shipped yet.
- \`AGENTS.md\` provides portable project instructions that Kilo loads automatically.

## Setup

1. Install Kilo Code using the official installation docs.
2. Install WordPress Studio and make sure the \`studio\` CLI is available on your \`PATH\`.
3. Open this directory as the project root, or copy \`kilo.jsonc\`, \`AGENTS.md\`, and \`.kilo/\` into your project.
4. Start a new Kilo Code session from the configured project root so Kilo discovers the rules, skills, agent, and MCP servers.
5. Confirm the \`wordpress-studio\` and \`wordpress-telemetry\` MCP servers are available in Kilo's MCP settings.

## MCP setup

The Kilo config uses the existing WordPress.com / Jetpack MCP flow through WordPress Studio:

\`\`\`json
{
  "mcp": {
    "wordpress-studio": {
      "type": "local",
      "command": ["studio", "mcp"],
      "enabled": true
    }
  }
}
\`\`\`

Use the normal Studio and WordPress.com connection flow to connect local sites, Jetpack-enabled sites, and WordPress.com-backed tooling. This output does not introduce a new backend service or Kilo-specific WordPress.com MCP server.

The generated config also starts the bundled \`wordpress-telemetry\` MCP server so workflow events stay aligned with the other agent surfaces.

## What is Kilo-specific

- Kilo project config lives in \`kilo.jsonc\` and uses Kilo's \`mcp\` shape.
- Kilo custom rules live in \`.kilo/rules/*.md\` and are referenced through the \`instructions\` config key.
- Kilo discovers skills from \`.kilo/skills/<name>/SKILL.md\`.
- Kilo discovers agents/modes from \`.kilo/agents/*.md\`.
- Kilo discovers local plugins from \`.kilo/plugin/*.js\` or \`.kilo/plugin/*.ts\`; this output only documents that directory because no Kilo-only plugin hook is needed for the current WordPress.com integration.
- Kilo also loads \`AGENTS.md\` automatically, which preserves compatibility with the shared agent instruction convention.

## Official Kilo references

- Installation and extension distribution: https://kilocode.ai/docs/getting-started/installing
- Custom rules: https://kilocode.ai/docs/customize/custom-rules
- Custom modes and agents: https://kilocode.ai/docs/customize/custom-modes
- Agent Skills: https://kilocode.ai/docs/customize/skills
- AGENTS.md support: https://kilocode.ai/docs/customize/agents-md
- MCP configuration: https://kilocode.ai/docs/automate/mcp/using-in-kilo-code
- Plugins and marketplace-style extension support: https://kilocode.ai/docs/automate/extending/plugins
- Kilo Marketplace repository: https://github.com/Kilo-Org/kilo-marketplace

## What is shared

- The WordPress.com site-building workflows are the same shared skills used by Codex, Claude Code, Cursor, Roo Code, and OpenCode.
- The Studio MCP server remains the shared substrate for local site management, screenshots, block validation, \`wp_cli\`, and WordPress.com / Jetpack-connected workflows.
- The telemetry MCP server is the same bundled server generated for the other outputs, with the surface set to \`kilo-code\`.

## Included skills

${skillList}
`;
}

function buildZedReadme({ skillNames }) {
  const skillList = skillNames
    .map((skillName) => `- \`${skillName}\``)
    .join("\n");

  return `# WordPress.com for Zed

This output packages the shared Build with WordPress skills for Zed Agent.

Zed-specific files in this folder are intentionally small:

- \`AGENTS.md\` provides project instructions that Zed Agent loads as always-on guidance.
- \`.agents/skills/\` contains project-local Zed skills copied from the shared Build with WordPress skill source.
- \`.zed/settings.json\` configures Zed's \`context_servers\` entries for the existing WordPress Studio MCP server and bundled \`wordpress-telemetry\` server.

The shared WordPress.com substrate is not Zed-specific: the skills, the \`studio mcp\` server, and the embedded telemetry MCP bootstrap are the same flow used by the other agent outputs. Zed supplies native project instructions, project-local skills, and settings JSON around that workflow.

## Setup

1. Install Zed.
2. Install WordPress Studio and make sure the \`studio\` CLI is available on your PATH.
3. Open this folder, or copy \`AGENTS.md\`, \`.agents/\`, and \`.zed/\` into the root of the workspace where Zed should assist with WordPress.com work.
4. Trust the worktree in Zed so project-local skills are available.
5. Open the Agent Panel and confirm the \`wordpress-studio\` and \`wordpress-telemetry\` MCP servers are active.

## MCP servers

\`.zed/settings.json\` launches:

- \`wordpress-studio\`: runs \`studio mcp\` for WordPress site management, screenshots, block validation, performance tooling, and WP-CLI access.
- \`wordpress-telemetry\`: runs an embedded bootstrap generated from the shared telemetry server artifact.

This does not invent a Zed-only backend. Zed connects to the existing WordPress.com / Jetpack MCP flow through the same local Studio MCP entry point used by the other outputs.

## Zed documentation used for this output

- Instructions: https://zed.dev/docs/ai/instructions
- Skills: https://zed.dev/docs/ai/skills
- Agent settings: https://zed.dev/docs/ai/agent-settings
- Agent profiles: https://zed.dev/docs/ai/agent-profiles
- MCP support: https://zed.dev/docs/ai/mcp
- Extension packaging: https://zed.dev/docs/extensions/developing-extensions
- MCP server extensions: https://zed.dev/docs/extensions/mcp-extensions
- Agent server extensions: https://zed.dev/docs/extensions/agent-servers

## Packaging decision

Zed has a native package surface for project instructions, project-local skills, and MCP configuration, so this repository generates those files directly. It does not generate a Zed extension because Zed's extension packaging is for languages, debuggers, themes, snippets, and MCP servers. The current WordPress.com integration only needs to configure existing MCP server commands and ship instruction/skill files.

## Included skills

${skillList}
`;
}

function buildAmpSettings({ telemetrySource }) {
  return {
    "amp.mcpServers": createMcpServerEntries({
      surface: "amp",
      telemetrySource,
    }),
  };
}

function buildAmpAgentsMd({ skillNames }) {
  const skillList = skillNames
    .map((skillName) => `- Load \`.agents/skills/${skillName}/SKILL.md\` when the task matches that workflow.`)
    .join("\n");

  return `# WordPress.com Amp Instructions

Use this workspace as a WordPress.com-aware Amp environment.

## Role

You help users build, customize, audit, and troubleshoot WordPress.com sites using the smallest suitable WordPress abstraction.

## Workflow

- Start with the \`wordpress-creator\` skill for WordPress.com build, theme, block, plugin, site-creation, or audit requests.
- Prefer the WordPress Studio MCP server for site discovery, local site control, screenshots, block validation, and \`wp_cli\` access.
- Use WordPress.com / Jetpack-connected MCP tools through the existing Studio MCP flow when the task targets a connected WordPress.com site.
- Choose existing WordPress features and known plugins before creating custom code.
- Use custom block plugins for reusable editor blocks that core blocks cannot cover.
- Use custom plugins for reusable behavior that should survive theme changes.
- Use theme work for templates, layout, styling, and visual presentation.
- Verify changes with the relevant Studio MCP tools before calling the task complete.

## Shared Skills

${skillList}

## Shared Substrate

The WordPress.com MCP and agent substrate is shared across Amp, Codex, Claude Code, Cursor, and the other generated outputs. Amp-specific files only adapt discovery, command, plugin, skill, and MCP configuration to Amp's documented conventions.
`;
}

function buildAmpPlugin() {
  return `import type { PluginAPI } from '@ampcode/plugin'

export default function (amp: PluginAPI) {
	amp.registerCommand(
		'wordpress-studio-task',
		{
			title: 'WordPress Studio Task',
			category: 'wordpress',
			description: 'Append WordPress.com Studio workflow guidance to the current Amp thread.',
		},
		async (ctx) => {
			await ctx.thread?.append([
				{
					type: 'user-message',
					content:
						'Use the wordpress-creator skill, choose the smallest suitable WordPress.com implementation path, and prefer the wordpress-studio MCP server for site operations and verification.',
				},
			])
		},
	)
}
`;
}

function buildAmpReadme({ skillNames }) {
  const skillList = skillNames
    .map((skillName) => `- \`${skillName}\``)
    .join("\n");

  return `# WordPress.com for Amp

This Amp output packages the shared WordPress skills from the \`build-with-wordpress\` source repo for WordPress.com work.

It is Amp-native according to the official Sourcegraph Amp Owner's Manual:

- \`AGENTS.md\` provides repository guidance.
- \`.agents/skills/\` contains the shared WordPress skills.
- \`.amp/settings.json\` configures the WordPress Studio and bundled telemetry MCP servers.
- \`.amp/plugins/wordpress-studio.ts\` adds an Amp command using the documented plugin API.

Official Amp docs used as source of truth:

- Owner's Manual: https://ampcode.com/manual
- AGENTS.md guidance: https://ampcode.com/manual#AGENTS.md
- Agent skills and MCP-in-skills: https://ampcode.com/manual#agent-skills
- MCP configuration: https://ampcode.com/manual#mcp
- Plugins and commands: https://ampcode.com/manual#plugins
- Plugin API reference: https://ampcode.com/manual/plugin-api

## Setup

1. Install Amp using the official Amp setup instructions.
2. Install WordPress Studio and make sure the \`studio\` CLI is available on your \`PATH\`.
3. Open this directory as the project root, or copy \`AGENTS.md\`, \`.agents/\`, and \`.amp/\` into your project.
4. Start Amp from the configured project root.
5. Approve the workspace MCP servers if Amp prompts for trust.
6. Confirm the MCP servers are available with \`amp mcp doctor\` or the Amp MCP UI.

## MCP setup

\`.amp/settings.json\` launches:

- \`wordpress-studio\`: runs \`studio mcp\` for WordPress site management, screenshots, block validation, performance tooling, and WP-CLI access.
- \`wordpress-telemetry\`: runs an embedded bootstrap generated from the shared telemetry server artifact.

This output does not introduce a new backend service. Amp connects to the existing WordPress.com / Jetpack MCP flow through the same local Studio MCP entry point used by the other outputs.

## Marketplace and extension conclusion

The official Amp manual documents project plugins in \`.amp/plugins/*.ts\`, user/system/global plugin locations, AGENTS.md files, skills, MCP configuration, and plugin-registered commands/tools. It does not document a marketplace-style plugin manifest for project packages. This output therefore ships plain repository files using Amp's documented project-local surfaces instead of inventing a marketplace manifest.

## Included skills

${skillList}
`;
}

function buildJunieAgentsMd() {
  return `# WordPress.com Junie Guidelines

Use WordPress.com as the user-facing product name.

## Role

You help users build, customize, audit, and troubleshoot WordPress.com sites using the smallest suitable WordPress abstraction.

## Workflow

- Start by loading the \`wordpress-creator\` skill for WordPress.com build, theme, block, plugin, site-creation, or audit requests.
- Prefer the WordPress Studio MCP server for site discovery, local site control, screenshots, block validation, and \`wp_cli\` access.
- Use WordPress.com / Jetpack-connected MCP tools through the existing Studio MCP flow when the task targets a connected WordPress.com site.
- Choose existing WordPress features and known plugins before creating custom code.
- Use custom block plugins for reusable editor blocks that core blocks cannot cover.
- Use custom plugins for reusable behavior that should survive theme changes.
- Use theme work for templates, layout, styling, and visual presentation.
- Verify changes with the relevant Studio MCP tools before calling the task complete.

## Shared Substrate

The WordPress.com MCP and agent substrate is shared across Junie, OpenCode, Codex, Claude Code, Cursor, and other outputs. Junie-specific files only adapt discovery and configuration to Junie's \`.junie/\` conventions.
`;
}

function buildJunieReadme({ skillNames }) {
  const skillList = skillNames
    .map((skillName) => `- \`${skillName}\``)
    .join("\n");

  return `# WordPress.com for Junie

This Junie output packages the shared WordPress skills from the \`build-with-wordpress\` source repo for WordPress.com work.

It is intentionally Junie-native:

- \`.junie/AGENTS.md\` provides project-level Junie guidelines.
- \`.junie/skills/\` contains the shared WordPress skills used by the other outputs.
- \`.junie/mcp/mcp.json\` connects Junie to the existing WordPress Studio MCP server and bundled \`wordpress-telemetry\` server.

## Setup

1. Install Junie or use Junie from JetBrains AI Chat.
2. Install WordPress Studio and make sure the \`studio\` CLI is available on your \`PATH\`.
3. Open this folder as the project root, or copy \`.junie/\` into your project.
4. Confirm Junie loads project guidelines from \`.junie/AGENTS.md\`.
5. Confirm the MCP servers are available in Junie MCP settings or with the Junie CLI \`/mcp\` command.

## MCP servers

\`.junie/mcp/mcp.json\` launches:

- \`wordpress-studio\`: runs \`studio mcp\` for WordPress site management, screenshots, block validation, performance tooling, and WP-CLI access.
- \`wordpress-telemetry\`: runs an embedded bootstrap generated from the shared telemetry server artifact.

This does not invent a Junie-only backend. Junie connects to the existing WordPress.com / Jetpack MCP flow through the same local Studio MCP entry point used by the other outputs.

## Official Junie references

- Getting started: https://www.jetbrains.com/help/junie/get-started-with-junie.html
- IDE plugin and AI Chat usage: https://www.jetbrains.com/help/junie/junie-ide-plugin.html
- Guidelines and memory: https://www.jetbrains.com/help/junie/guidelines-and-memory.html
- Agent skills: https://www.jetbrains.com/help/junie/agent-skills.html
- CLI MCP configuration: https://www.jetbrains.com/help/junie/junie-cli-mcp-configuration.html
- IDE MCP settings: https://www.jetbrains.com/help/junie/junie-plugin-mcp-settings.html

## What is Junie-specific

- Junie loads project guidelines from \`.junie/AGENTS.md\`, falling back to root \`AGENTS.md\` when needed.
- Junie loads project skills from \`.junie/skills/<name>/SKILL.md\`.
- Junie loads project MCP servers from \`.junie/mcp/mcp.json\`.

## What is shared

- The WordPress.com site-building workflows are the same shared skills used by Codex, Claude Code, Cursor, OpenCode, and other outputs.
- The Studio MCP server remains the shared substrate for local site management, screenshots, block validation, \`wp_cli\`, and WordPress.com / Jetpack-connected workflows.
- The telemetry MCP server is the same bundled server generated for the other outputs, with the surface set to \`junie\`.

## Included skills

${skillList}
`;
}

function buildCopilotInstructions({ skillNames }) {
  const skillList = skillNames.map((skillName) => `- ${skillName}`).join("\n");

  return `# WordPress Studio for GitHub Copilot

Use these instructions when helping build, debug, review, or explain WordPress projects.

## Operating model

- Prefer WordPress Studio MCP tools for site management, screenshots, block validation, and WordPress operations when they are available.
- Use \`wp_cli\` through the Studio MCP server as the general-purpose WordPress escape hatch.
- Route implementation requests through the matching WordPress path: site/theme work, custom blocks, custom plugins, design previews, or auditing.
- Keep generated code production-oriented: accessible, performant, responsive, secure, and aligned with WordPress coding conventions.
- Preserve existing project conventions before introducing new patterns.
- For Gutenberg work, prefer native block APIs and validate block markup in a running Studio site when possible.
- For theme work, prefer block themes and WordPress-supported configuration in \`theme.json\`.
- For plugin work, keep behavior in plugins instead of themes unless the behavior is presentation-only.

## Shared WordPress skills

This WordPress Studio Copilot output packages the same shared skill source as the Codex and Claude Code outputs. The skills live in \`skills/\` and provide deeper task-specific guidance:

${skillList}

When a task maps to one of those skills, use the relevant \`skills/<name>/SKILL.md\` file as the detailed playbook.
`;
}

function buildCopilotScopedInstructions() {
  return `---
applyTo: "**/*.{php,js,jsx,ts,tsx,json,css,scss,html,md}"
---

# WordPress Studio MCP

When working in a WordPress project, prefer the configured WordPress Studio MCP servers for site-aware operations:

- \`wordpress-studio\` for Studio sites, screenshots, block validation, and WP-CLI access.
- \`wordpress-telemetry\` for workflow telemetry emitted by the WordPress Studio skill flows.

Use MCP evidence for behavior claims when a site can be run locally. If MCP is unavailable, explain the limitation and use repository evidence instead.
`;
}

function createAiderConfig({ skillNames }) {
  const readFiles = [
    "CONVENTIONS.md",
    ...skillNames.map((skillName) => `skills/${skillName}/SKILL.md`),
  ];

  return `# WordPress.com guidance for Aider.\n# See https://aider.chat/docs/config.html and https://aider.chat/docs/usage/conventions.html.\nread:\n${readFiles.map((file) => `  - ${file}`).join("\n")}\n`;
}

function buildFactoryCommand() {
  return `---
description: Route a WordPress.com task through the shared WordPress Creator skill.
argument-hint: <wordpress task>
---

# Build with WordPress.com

Handle this WordPress.com request using the shared WordPress Creator workflow:

$ARGUMENTS

Load the \`wordpress-creator\` skill first, choose the smallest suitable WordPress abstraction, and use the \`wordpress-studio\` MCP server for site operations and verification when available.
`;
}

function buildFactoryDroid() {
  return `---
name: wordpress-builder
description: Builds, customizes, audits, and troubleshoots WordPress.com sites using WordPress Studio MCP and the shared Build with WordPress skills.
model: inherit
tools: ["Read", "LS", "Grep", "Glob", "Create", "Edit", "ApplyPatch", "Execute"]
mcpServers: ["wordpress-studio", "wordpress-telemetry"]
---

You are a WordPress.com specialist Droid.

Use WordPress.com as the user-facing product name. For build, theme, block, plugin, site-creation, or audit requests, load \`skills/wordpress-creator/SKILL.md\` first and follow its routing to the smallest suitable implementation path.

Prefer the \`wordpress-studio\` MCP server for site discovery, local site control, screenshots, block validation, \`wp_cli\`, and WordPress.com or Jetpack-connected workflows. Use the \`wordpress-telemetry\` MCP server for workflow telemetry when available.

Verify changes with relevant Studio MCP tools, project tests, block validation, screenshots, or WP-CLI evidence before reporting completion.
`;
}

function buildFactoryHooksJson() {
  return {
    description: "Adds WordPress Studio plugin context at Droid session start.",
    hooks: {
      SessionStart: [
        {
          hooks: [
            {
              type: "command",
              command: "sh ${DROID_PLUGIN_ROOT}/hooks/session-context.sh",
              timeout: 10,
            },
          ],
        },
      ],
    },
  };
}

function buildFactorySessionContextHook() {
  return `#!/usr/bin/env sh
set -eu

printf '%s\n' 'WordPress Studio Droid plugin is active. Load skills/wordpress-creator/SKILL.md for WordPress.com build, theme, block, plugin, site creation, or audit tasks. Prefer the wordpress-studio MCP server for site operations and verification when available.'
`;
}

function buildFactoryReadme({ skillNames }) {
  const skillList = skillNames.map((skillName) => `- \`${skillName}\``).join("\n");

  return `# WordPress Studio for Factory Droid

This Factory output packages the shared Build with WordPress skills as a native Droid plugin.

## Factory-native pieces

- \`.factory-plugin/plugin.json\` is the Factory plugin manifest.
- \`skills/\` contains the shared WordPress skills. Droid can invoke these automatically, and users can invoke them as slash commands.
- \`commands/wordpress.md\` adds a user-invoked \`/wordpress\` workflow shortcut.
- \`droids/wordpress-builder.md\` adds a custom Droid subagent for focused WordPress.com work.
- \`mcp.json\` configures the shared \`wordpress-studio\` MCP server and bundled \`wordpress-telemetry\` MCP server.
- \`hooks/hooks.json\` adds lightweight session-start context using \`\${DROID_PLUGIN_ROOT}\`.

## Marketplace layout

The parent \`plugins/factory/\` directory is a local Factory marketplace:

- \`.factory-plugin/marketplace.json\` lists the \`wordpress-studio\` plugin.
- \`plugins/wordpress-studio/\` contains this plugin.

## Local install

From this repository root after running \`pnpm build\`:

\`\`\`bash
droid plugin marketplace add ./plugins/factory
droid plugin install wordpress-studio@wordpress-studio --scope project
\`\`\`

Factory's plugin documentation also supports adding marketplaces from GitHub repositories. If this output is published from a dedicated marketplace repository, add that repository URL with \`droid plugin marketplace add <url>\` and install \`wordpress-studio@wordpress-studio\`.

## MCP servers

\`mcp.json\` launches:

- \`wordpress-studio\`: runs \`studio mcp\` for WordPress site management, screenshots, block validation, performance tooling, and WP-CLI access.
- \`wordpress-telemetry\`: runs the bundled telemetry MCP server generated by this package.

No secrets are stored in the project MCP config.

## Included skills

${skillList}

## Factory documentation used

- Plugins: https://docs.factory.ai/cli/configuration/plugins
- Building plugins: https://docs.factory.ai/guides/building/building-plugins
- Skills: https://docs.factory.ai/cli/configuration/skills
- Custom slash commands: https://docs.factory.ai/cli/configuration/custom-slash-commands
- Custom Droids: https://docs.factory.ai/cli/configuration/custom-droids
- MCP: https://docs.factory.ai/cli/configuration/mcp
- Hooks reference: https://docs.factory.ai/reference/hooks-reference
`;
}

function buildDevinAgentsMd() {
  return `# WordPress.com Devin Instructions

Use this output as a Devin CLI project configuration for WordPress.com work.

## Workflow

- Start with the \`wordpress-creator\` skill for WordPress.com build, theme, block, plugin, site-creation, or audit requests.
- Prefer the WordPress Studio MCP server for site discovery, local site control, screenshots, block validation, frontend audits, and \`wp_cli\` access.
- Use the bundled \`wordpress-telemetry\` MCP server for workflow telemetry when available.
- Choose the smallest fitting WordPress abstraction: site settings, content, theme, block, plugin, or audit.
- Keep WordPress.com as the user-facing product name.

## Devin-Specific Setup

- Devin CLI loads project rules from \`AGENTS.md\`.
- Devin CLI loads project skills from \`.devin/skills/<name>/SKILL.md\`.
- Devin CLI loads shared project MCP servers from \`.devin/config.json\`.
- This output uses Devin-native project configuration around the shared WordPress.com MCP and skill substrate; it does not introduce a Devin-specific backend service.
`;
}

function buildDevinReadme({ skillNames }) {
  const skillList = skillNames
    .map((skillName) => `- \`${skillName}\``)
    .join("\n");

  return `# WordPress.com for Devin CLI

This Devin output packages the shared Build with WordPress skills for Devin CLI using Devin-native project configuration.

## Official Devin surfaces used

- Project rules: \`AGENTS.md\`
- Project config: \`.devin/config.json\`
- Project skills: \`.devin/skills/<name>/SKILL.md\`
- MCP servers: \`mcpServers\` in Devin config

Official references:

- Extensibility overview: https://docs.devin.ai/cli/extensibility/index.md
- Rules and AGENTS.md: https://docs.devin.ai/cli/extensibility/rules.md
- Skills overview: https://docs.devin.ai/cli/extensibility/skills/overview.md
- Skill format: https://docs.devin.ai/cli/extensibility/skills/creating-skills.md
- MCP configuration: https://docs.devin.ai/cli/extensibility/mcp/configuration.md
- Configuration files: https://docs.devin.ai/cli/extensibility/configuration.md

## Setup

1. Install Devin CLI using the official Devin CLI instructions.
2. Install WordPress Studio and make sure the \`studio\` CLI is available on your \`PATH\`.
3. Open this directory as the project root, or copy \`AGENTS.md\` and \`.devin/\` into the root of the project where Devin should assist with WordPress.com work.
4. Start Devin CLI from the configured project root.
5. Confirm the configured MCP servers are available in Devin CLI.

## MCP servers

\`.devin/config.json\` launches:

- \`wordpress-studio\`: runs \`studio mcp\` for WordPress site management, screenshots, block validation, performance tooling, and WP-CLI access.
- \`wordpress-telemetry\`: runs an embedded bootstrap generated from the shared telemetry server artifact.

This does not invent a Devin-only backend. Devin connects to the existing WordPress.com / Jetpack MCP flow through the same local Studio MCP entry point used by the other outputs.

## Included skills

${skillList}
`;
}

function buildDevinConfig({ telemetrySource }) {
  return createMcpConfig({
    surface: "devin",
    telemetrySource,
  });
}

function buildHermesPluginYaml() {
  return `name: wordpress-studio
version: "0.3.0"
description: WordPress.com site building and auditing skills for Hermes, backed by WordPress Studio MCP.
`;
}

function buildHermesPluginPython({ skillNames }) {
  const registrations = skillNames
    .map((skillName) => `    ctx.register_skill(${JSON.stringify(skillName)}, root / "skills" / ${JSON.stringify(skillName)})`)
    .join("\n");

  return `"""Hermes plugin for Build with WordPress shared skills."""

from pathlib import Path


def register(ctx):
    root = Path(__file__).parent
${registrations}
`;
}

function buildHermesConfig({ telemetrySource }) {
  return {
    mcp_servers: createMcpConfig({
      surface: "hermes",
      telemetrySource,
    }).mcpServers,
  };
}

function buildHermesReadme({ skillNames }) {
  const skillList = skillNames
    .map((skillName) => `- \`${skillName}\``)
    .join("\n");

  return `# WordPress.com for Hermes

This Hermes output packages the shared Build with WordPress skills for Hermes Agent.

## Official Hermes surface

- Hermes Agent: https://hermes-agent.nousresearch.com/
- Hermes repository: https://github.com/NousResearch/hermes-agent
- Skills docs: https://hermes-agent.nousresearch.com/docs/user-guide/features/skills
- Plugin docs: https://hermes-agent.nousresearch.com/docs/user-guide/features/plugins
- Agent Skills standard and hub: https://agentskills.io

Hermes supports both skills and Git-distributed plugins, so this output includes both:

- \`skills/\` as a Skills Hub-compatible GitHub tap layout
- \`plugin.yaml\` and \`__init__.py\` for \`hermes plugins install user/repo\` style distribution
- \`.hermes/config.yaml\` as a copyable MCP server snippet for the WordPress Studio and telemetry MCP servers

## Included skills

${skillList}

## Installing as a skill tap

Publish this directory from a repository with \`skills/\` at its root, then install individual skills with Hermes' GitHub tap flow:

\`\`\`bash
hermes skills tap add owner/repo
hermes skills install owner/repo/wordpress-creator
\`\`\`

## Installing as a Hermes plugin

Hermes can install Git-hosted plugins with:

\`\`\`bash
hermes plugins install owner/repo
hermes plugins enable wordpress-studio
\`\`\`

The generated plugin registers each bundled skill with Hermes through \`ctx.register_skill()\`.

## MCP setup

Copy the \`.hermes/config.yaml\` MCP server snippet into the target Hermes profile config, then restart Hermes. The config launches the existing WordPress Studio MCP server plus the bundled \`wordpress-telemetry\` MCP server. This package does not introduce a new WordPress backend service.
`;
}

const openClawPackageManifest = {
  name: pluginName,
  version: "0.3.0",
  description:
    "WordPress.com site building and auditing skills for OpenClaw, backed by WordPress Studio MCP.",
  publisher: "Automattic",
  license: "GPL-2.0-or-later",
  homepage: "https://developer.wordpress.com/",
  repository: "https://github.com/Automattic/build-with-wordpress",
  keywords: [
    "wordpress",
    "wordpress-com",
    "studio",
    "mcp",
    "openclaw",
    "clawhub",
  ],
  openclaw: {
    compat: {
      pluginApi: "^1.0.0",
    },
    build: {
      openclawVersion: ">=0.1.0",
    },
    skills: "./skills",
    mcpServers: "./mcp.json",
  },
};

function buildOpenClawAgentsMd({ skillNames }) {
  const skillList = skillNames
    .map((skillName) => `- Load \`skills/${skillName}/SKILL.md\` when the task matches that workflow.`)
    .join("\n");

  return `# WordPress.com OpenClaw Instructions

Use this package as the WordPress.com and WordPress Studio layer for OpenClaw.

## Shared substrate

- Use the WordPress Studio MCP server for local site management, screenshots, block validation, performance tooling, and WP-CLI access.
- Use the bundled \`wordpress-telemetry\` MCP server when workflow telemetry is available.
- Treat ClawHub as the distribution surface for this package's skills and native package metadata.
- Refer to the product as WordPress.com in user-facing text.

## Skills

${skillList}

Start with \`skills/wordpress-creator/SKILL.md\` for broad WordPress implementation requests so OpenClaw routes the task to the right site, theme, block, plugin, or audit workflow.
`;
}

function buildOpenClawReadme({ skillNames }) {
  const skillList = skillNames
    .map((skillName) => `- \`${skillName}\``)
    .join("\n");

  return `# WordPress.com for OpenClaw

This OpenClaw output packages the shared Build with WordPress skills for OpenClaw and ClawHub.

## Official OpenClaw surface

- OpenClaw: https://openclaw.ai
- OpenClaw repository: https://github.com/openclaw/openclaw
- ClawHub: https://clawhub.ai
- ClawHub repository: https://github.com/openclaw/clawhub

ClawHub describes itself as OpenClaw's public skill registry and also exposes a native package catalog for code plugins and bundle plugins. This output therefore includes both:

- \`skills/\` for ClawHub-compatible skill publishing
- \`package.json\` with \`openclaw.compat.pluginApi\` and \`openclaw.build.openclawVersion\` metadata for native OpenClaw package publishing

## Included skills

${skillList}

## MCP setup

The generated \`mcp.json\` launches the existing WordPress Studio MCP server plus the bundled \`wordpress-telemetry\` MCP server. This package does not introduce a new WordPress backend service.

Use the normal Studio and WordPress.com connection flow to connect local sites, Jetpack-enabled sites, and WordPress.com-backed tooling.
`;
}
const pluginTargets = [
  {
    logName: "Codex",
    buildRootDir: path.join(pluginsDir, "codex"),
    pluginDir: path.join(pluginsDir, "codex", "plugins", pluginName),
    legacyCleanupPaths: [
      path.join(pluginsDir, "build-with-wordpress"),
      path.join(pluginsDir, "codex", "build-with-wordpress"),
      path.join(root, ".agents", "plugins", "marketplace.json"),
    ],
    manifestDir: ".codex-plugin",
    manifestFileName: "plugin.json",
    manifestContents: codexPluginManifest,
    marketplacePath: path.join(
      pluginsDir,
      "codex",
      ".agents",
      "plugins",
      "marketplace.json",
    ),
    marketplaceContents: codexMarketplaceManifest,
    readmeIntro: `It is intentionally Studio-MCP-first:

- local site workflows use the WordPress Studio MCP server
- screenshots and block validation come from Studio MCP tools
- frontend audits can use Studio MCP performance tooling
- \`wp_cli\` is the flexible escape hatch for arbitrary WordPress operations
- \`wordpress-creator\` routes requests to the right WordPress implementation path
- custom WordPress plugins can be scaffolded inside a selected Studio site and reviewed there
- custom Gutenberg blocks can be scaffolded inside a selected Studio site and reviewed there`,
    includeMcpConfig: true,
    surface: "codex",
  },
  {
    logName: "Claude Code",
    buildRootDir: path.join(pluginsDir, "claude-code"),
    pluginDir: path.join(pluginsDir, "claude-code"),
    legacyCleanupPaths: [],
    manifestDir: ".claude-plugin",
    manifestFileName: "plugin.json",
    manifestContents: claudePluginManifest,
    readmeIntro: `It is a first-pass Claude Code package built from the same shared skills as the Codex plugin.

- WordPress request routing stays shared across surfaces
- Studio-backed site, theme, block, and plugin workflows stay shared
- frontend auditing stays shared across surfaces
- the plugin output is intentionally minimal while we add Claude-specific packaging details later`,
    includeMcpConfig: true,
    surface: "claude-code",
  },
  {
    logName: "Cursor",
    buildRootDir: path.join(pluginsDir, "cursor"),
    pluginDir: path.join(pluginsDir, "cursor"),
    legacyCleanupPaths: [],
    manifestDir: ".cursor-plugin",
    manifestFileName: "plugin.json",
    manifestContents: cursorPluginManifest,
    readmeIntro: `It is a Cursor plugin built from the same shared skills as the Codex and Claude Code plugins.

- The generated \`plugins/cursor/\` folder uses Cursor's single-plugin layout
- Cursor discovers plugin skills from \`skills/\`
- Cursor discovers persistent guidance from \`rules/\`
- Cursor discovers MCP servers from root \`mcp.json\`
- WordPress request routing stays shared across surfaces
- Studio-backed site, theme, block, plugin, and audit workflows stay shared

## Standalone export and listing

Build with WordPress is the source of truth for this generated package. The standalone Cursor plugin repository is https://github.com/Automattic/wordpress-cursor-plugin and should be updated through the repository export script, not by manually editing exported files.

From the source repository, verify the generated output first:

\`\`\`bash
pnpm build
pnpm verify
pnpm export:cursor -- --dry-run
\`\`\`

When maintainers are ready to update the standalone repository, run \`pnpm export:cursor\` from a clean source worktree. The exporter creates a subtree split of \`plugins/cursor/\` and pushes it to \`sync/from-build-with-wordpress\` in the standalone repository.

Before submitting or updating the Cursor listing, confirm the exported standalone branch contains the expected \`.cursor-plugin/plugin.json\`, \`README.md\`, \`mcp.json\`, \`rules/wordpress-studio.mdc\`, and full \`skills/\` tree; review the listing-facing manifest fields for name, display name, version, description, author, homepage, repository, license, and keywords; then open or update the standalone repository pull request for review. Submit to Cursor only after the standalone repository PR is accepted.`,
    includeMcpConfig: true,
    mcpConfigPath: "mcp.json",
    displayName: cursorPluginDisplayName,
    surface: "cursor",
    extraFiles: async ({ pluginDir }) => {
      await mkdir(path.join(pluginDir, "rules"), { recursive: true });
      await writeFile(
        path.join(pluginDir, "rules", "wordpress-studio.mdc"),
        buildCursorRule(),
        "utf8",
      );
    },
  },
  {
    logName: "GitHub Copilot",
    buildRootDir: path.join(pluginsDir, "copilot"),
    pluginDir: path.join(pluginsDir, "copilot"),
    legacyCleanupPaths: [],
    readmeIntro: `It is a first-pass GitHub Copilot package built from the same shared skills as the Codex and Claude Code plugins.

- repository instructions give Copilot WordPress-specific defaults
- scoped instructions point Copilot at the Studio MCP servers when available
- the VS Code MCP config launches both Studio MCP and the bundled telemetry MCP server
- the shared skills are included as reference playbooks for deeper task-specific guidance`,
    includeMcpConfig: true,
    mcpConfigPath: path.join(".vscode", "mcp.json"),
    mcpConfigFactory: createVsCodeMcpConfig,
    surface: "copilot",
    extraFiles: async ({ pluginDir, skillNames }) => {
      await mkdir(path.join(pluginDir, ".github", "instructions"), {
        recursive: true,
      });
      await mkdir(path.join(pluginDir, ".vscode"), { recursive: true });
      await writeFile(
        path.join(pluginDir, ".github", "copilot-instructions.md"),
        buildCopilotInstructions({ skillNames }),
        "utf8",
      );
      await writeFile(
        path.join(
          pluginDir,
          ".github",
          "instructions",
          "wordpress-studio.instructions.md",
        ),
        buildCopilotScopedInstructions(),
        "utf8",
      );
    },
  },
  {
    logName: "Gemini",
    displayName: geminiDisplayName,
    buildRootDir: path.join(pluginsDir, "gemini"),
    pluginDir: path.join(pluginsDir, "gemini"),
    legacyCleanupPaths: [],
    readmeIntro: `It is a Gemini CLI and Gemini Code Assist package built from the same shared skills as the Codex, Claude Code, and Cursor plugins.

- \`GEMINI.md\` provides project-level WordPress guidance for Gemini
- \`.gemini/settings.json\` configures the Studio and telemetry MCP servers for Gemini CLI
- WordPress request routing stays shared across surfaces
    - Studio-backed site, theme, block, plugin, and audit workflows stay shared`,
    includeMcpConfig: true,
    mcpConfigPath: path.join(".gemini", "settings.json"),
    surface: "gemini",
    extraFiles: async ({ pluginDir, skillNames }) => {
      await writeFile(
        path.join(pluginDir, "GEMINI.md"),
        buildGeminiInstructions({ skillNames }),
        "utf8",
      );
    },
  },
  {
    logName: "Pi",
    buildRootDir: path.join(pluginsDir, "pi"),
    pluginDir: path.join(pluginsDir, "pi"),
    legacyCleanupPaths: [],
    manifestFileName: "package.json",
    manifestContents: piPackageManifest,
    includeMcpConfig: false,
    includeTelemetry: false,
    surface: "pi",
    writeExtraFiles: async ({ pluginDir, skillNames }) => {
      await writeFile(
        path.join(pluginDir, "README.md"),
        buildPiReadme({ skillNames }),
        "utf8",
      );
    },
  },
  {
    logName: "Hermes",
    buildRootDir: hermesPluginDir,
    pluginDir: hermesPluginDir,
    legacyCleanupPaths: [],
    includeMcpConfig: false,
    surface: "hermes",
    writeExtraFiles: async ({ pluginDir, skillNames, telemetrySource }) => {
      await mkdir(path.join(pluginDir, ".hermes"), { recursive: true });
      await writeFile(
        path.join(pluginDir, "plugin.yaml"),
        buildHermesPluginYaml(),
        "utf8",
      );
      await writeFile(
        path.join(pluginDir, "__init__.py"),
        buildHermesPluginPython({ skillNames }),
        "utf8",
      );
      await writeFile(
        path.join(pluginDir, ".hermes", "config.yaml"),
        `${JSON.stringify(buildHermesConfig({ telemetrySource }), null, 2)}\n`,
        "utf8",
      );
      await writeFile(
        path.join(pluginDir, "README.md"),
        buildHermesReadme({ skillNames }),
        "utf8",
      );
    },
  },
  {
    logName: "Roo Code",
    buildRootDir: path.join(pluginsDir, "roo-code"),
    pluginDir: path.join(pluginsDir, "roo-code"),
    legacyCleanupPaths: [],
    readmeIntro: "",
    includeMcpConfig: false,
    surface: "roo-code",
    async writeExtraFiles({ pluginDir, skillNames, telemetrySource }) {
      await mkdir(path.join(pluginDir, ".roo", "rules"), { recursive: true });
      await mkdir(path.join(pluginDir, ".roo", "rules-code"), { recursive: true });
      await writeFile(
        path.join(pluginDir, ".roo", "rules", "wordpress-com.md"),
        buildRooWorkspaceRules(),
        "utf8",
      );
      await writeFile(
        path.join(pluginDir, ".roo", "rules-code", "wordpress-com-code.md"),
        buildRooCodeModeRules(),
        "utf8",
      );
      await writeFile(
        path.join(pluginDir, ".roo", "mcp.json"),
        `${JSON.stringify(
          createMcpConfig({
            surface: "roo-code",
            telemetrySource,
          }),
          null,
          2,
        )}\n`,
        "utf8",
      );
      await writeFile(
        path.join(pluginDir, "AGENTS.md"),
        buildRooAgentsRules(),
        "utf8",
      );
      await writeFile(
        path.join(pluginDir, "README.md"),
        buildRooReadme({ skillNames }),
        "utf8",
      );
    },
  },
  {
    logName: "Devin Desktop",
    buildRootDir: path.join(pluginsDir, "devin-desktop"),
    pluginDir: path.join(pluginsDir, "devin-desktop"),
    legacyCleanupPaths: [path.join(pluginsDir, "windsurf")],
    includeMcpConfig: true,
    mcpConfigPath: "mcp_config.json",
    surface: "devin-desktop",
    rules: windsurfRules,
    writeExtraFiles: async ({ pluginDir, skillNames }) => {
      await writeFile(
        path.join(pluginDir, "README.md"),
        buildDevinDesktopReadme({ skillNames }),
        "utf8",
      );
    },
  },
  {
    logName: "Cline",
    buildRootDir: path.join(pluginsDir, "cline"),
    pluginDir: path.join(pluginsDir, "cline"),
    legacyCleanupPaths: [],
    readmeIntro: "",
    includeMcpConfig: false,
    surface: "cline",
  },
  {
    logName: "Junie",
    buildRootDir: path.join(pluginsDir, "junie"),
    pluginDir: path.join(pluginsDir, "junie"),
    legacyCleanupPaths: [],
    includeMcpConfig: false,
    surface: "junie",
  },
  {
    logName: "OpenCode",
    buildRootDir: path.join(pluginsDir, "opencode"),
    pluginDir: path.join(pluginsDir, "opencode"),
    legacyCleanupPaths: [],
    manifestDir: ".opencode",
    includeMcpConfig: false,
    surface: "opencode",
  },
  {
    logName: "OpenClaw",
    buildRootDir: openClawPluginDir,
    pluginDir: openClawPluginDir,
    legacyCleanupPaths: [],
    manifestFileName: "package.json",
    manifestContents: openClawPackageManifest,
    includeMcpConfig: true,
    mcpConfigPath: "mcp.json",
    surface: "openclaw",
    writeExtraFiles: async ({ pluginDir, skillNames }) => {
      await writeFile(
        path.join(pluginDir, "AGENTS.md"),
        buildOpenClawAgentsMd({ skillNames }),
        "utf8",
      );
      await writeFile(
        path.join(pluginDir, "README.md"),
        buildOpenClawReadme({ skillNames }),
        "utf8",
      );
    },
  },
  {
    logName: "Kilo Code",
    buildRootDir: path.join(pluginsDir, "kilo-code"),
    pluginDir: path.join(pluginsDir, "kilo-code"),
    legacyCleanupPaths: [],
    includeMcpConfig: false,
    surface: "kilo-code",
  },
  {
    logName: "Qodo",
    buildRootDir: qodoPluginDir,
    pluginDir: qodoPluginDir,
    legacyCleanupPaths: [],
    readmeIntro: "",
    includeMcpConfig: false,
    surface: "qodo",
    async writeExtraFiles({ pluginDir, skillNames, telemetrySource }) {
      await writeFile(
        path.join(pluginDir, "AGENTS.md"),
        buildQodoAgentsMd({ skillNames }),
        "utf8",
      );
      await writeFile(
        path.join(pluginDir, "README.md"),
        buildQodoReadme({ skillNames, telemetrySource }),
        "utf8",
      );
    },
  },
  {
    logName: "Aider",
    buildRootDir: path.join(pluginsDir, "aider"),
    pluginDir: path.join(pluginsDir, "aider"),
    legacyCleanupPaths: [],
    includeSkills: true,
    includeReadme: false,
    includeAiderFiles: true,
    includeMcpConfig: false,
    includeTelemetry: false,
    surface: "aider",
  },
  {
    logName: "Factory Droid",
    displayName: pluginDisplayName,
    buildRootDir: factoryOutputDir,
    pluginDir: factoryPluginDir,
    legacyCleanupPaths: [],
    manifestDir: ".factory-plugin",
    manifestFileName: "plugin.json",
    manifestContents: factoryPluginManifest,
    marketplacePath: path.join(factoryOutputDir, ".factory-plugin", "marketplace.json"),
    marketplaceContents: factoryMarketplaceManifest,
    includeMcpConfig: true,
    mcpConfigPath: "mcp.json",
    surface: "factory-droid",
    extraFiles: async ({ pluginDir, skillNames }) => {
      await mkdir(path.join(pluginDir, "commands"), { recursive: true });
      await mkdir(path.join(pluginDir, "droids"), { recursive: true });
      await mkdir(path.join(pluginDir, "hooks"), { recursive: true });
      await writeFile(
        path.join(pluginDir, "commands", "wordpress.md"),
        buildFactoryCommand(),
        "utf8",
      );
      await writeFile(
        path.join(pluginDir, "droids", "wordpress-builder.md"),
        buildFactoryDroid(),
        "utf8",
      );
      await writeFile(
        path.join(pluginDir, "hooks", "hooks.json"),
        `${JSON.stringify(buildFactoryHooksJson(), null, 2)}\n`,
        "utf8",
      );
      await writeFile(
        path.join(pluginDir, "hooks", "session-context.sh"),
        buildFactorySessionContextHook(),
        "utf8",
      );
      await writeFile(
        path.join(pluginDir, "README.md"),
        buildFactoryReadme({ skillNames }),
        "utf8",
      );
    },
  },
  {
    logName: "Zed",
    buildRootDir: path.join(pluginsDir, "zed"),
    pluginDir: path.join(pluginsDir, "zed"),
    legacyCleanupPaths: [],
    includeMcpConfig: false,
    surface: "zed",
    async writeExtraFiles({ pluginDir, skillNames, telemetrySource }) {
      await mkdir(path.join(pluginDir, ".agents", "skills"), { recursive: true });
      await mkdir(path.join(pluginDir, ".zed"), { recursive: true });
      await rm(path.join(pluginDir, "skills"), {
        recursive: true,
        force: true,
      });
      await copySkillSet(
        sharedSkillsSourceDir,
        path.join(pluginDir, ".agents", "skills"),
      );
      await writeFile(
        path.join(pluginDir, "AGENTS.md"),
        buildZedAgentsMd(),
        "utf8",
      );
      await writeFile(
        path.join(pluginDir, ".zed", "settings.json"),
        `${JSON.stringify(
          createZedMcpConfig({
            surface: "zed",
            telemetrySource,
          }),
          null,
          2,
        )}\n`,
        "utf8",
      );
      await writeFile(
        path.join(pluginDir, "README.md"),
        buildZedReadme({ skillNames }),
        "utf8",
      );
    },
  },
  {
    logName: "Devin CLI",
    buildRootDir: path.join(pluginsDir, "devin"),
    pluginDir: path.join(pluginsDir, "devin"),
    legacyCleanupPaths: [],
    includeMcpConfig: false,
    surface: "devin",
  },
  {
    logName: "Amp",
    buildRootDir: path.join(pluginsDir, "amp"),
    pluginDir: path.join(pluginsDir, "amp"),
    legacyCleanupPaths: [],
    includeMcpConfig: false,
    surface: "amp",
  },
];

async function copySkillSet(sourceDir, targetDir) {
  const entries = await readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    await cp(
      path.join(sourceDir, entry.name),
      path.join(targetDir, entry.name),
      {
        recursive: true,
      },
    );
  }
}

async function getSharedSkillNames(sourceDir) {
  const entries = await readdir(sourceDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

async function buildPluginTarget(target, skillNames) {
  await rm(target.buildRootDir, { recursive: true, force: true });
  for (const cleanupPath of target.legacyCleanupPaths) {
    await rm(cleanupPath, { recursive: true, force: true });
  }

  if (target.manifestDir) {
    await mkdir(path.join(target.pluginDir, target.manifestDir), {
      recursive: true,
    });
  }
  if (target.includeSkills !== false) {
    await mkdir(path.join(target.pluginDir, "skills"), { recursive: true });
    await copySkillSet(
      sharedSkillsSourceDir,
      path.join(target.pluginDir, "skills"),
    );
  }

  let telemetrySource = "";
  if (target.includeTelemetry !== false) {
    telemetrySource = await readFile(telemetryMcpServerDistPath, "utf8");
  }

  if (target.surface === "opencode") {
    await mkdir(path.join(target.pluginDir, ".opencode", "agents"), {
      recursive: true,
    });
    await mkdir(path.join(target.pluginDir, ".opencode", "commands"), {
      recursive: true,
    });
    await mkdir(path.join(target.pluginDir, ".opencode", "plugins"), {
      recursive: true,
    });
    await mkdir(path.join(target.pluginDir, ".opencode", "skills"), {
      recursive: true,
    });
    await rm(path.join(target.pluginDir, "skills"), {
      recursive: true,
      force: true,
    });
    await copySkillSet(
      sharedSkillsSourceDir,
      path.join(target.pluginDir, ".opencode", "skills"),
    );
    await writeFile(
      path.join(target.pluginDir, "opencode.json"),
      `${JSON.stringify(buildOpenCodeConfig({ telemetrySource }), null, 2)}\n`,
      "utf8",
    );
    await writeFile(
      path.join(target.pluginDir, "AGENTS.md"),
      buildOpenCodeAgentsMd(),
      "utf8",
    );
    await writeFile(
      path.join(target.pluginDir, ".opencode", "agents", "wordpress-com.md"),
      buildOpenCodeAgent(),
      "utf8",
    );
    await writeFile(
      path.join(target.pluginDir, ".opencode", "commands", "wordpress.md"),
      buildOpenCodeCommand(),
      "utf8",
    );
    await writeFile(
      path.join(target.pluginDir, ".opencode", "plugins", "README.md"),
      buildOpenCodePluginsReadme(),
      "utf8",
    );
    await writeFile(
      path.join(target.pluginDir, "README.md"),
      buildOpenCodeReadme({ skillNames }),
      "utf8",
    );
    console.log(`Built ${target.logName} plugin at ${target.pluginDir}`);
    return;
  }

  if (target.surface === "kilo-code") {
    await mkdir(path.join(target.pluginDir, ".kilo", "agents"), {
      recursive: true,
    });
    await mkdir(path.join(target.pluginDir, ".kilo", "plugin"), {
      recursive: true,
    });
    await mkdir(path.join(target.pluginDir, ".kilo", "rules"), {
      recursive: true,
    });
    await mkdir(path.join(target.pluginDir, ".kilo", "skills"), {
      recursive: true,
    });
    await rm(path.join(target.pluginDir, "skills"), {
      recursive: true,
      force: true,
    });
    await copySkillSet(
      sharedSkillsSourceDir,
      path.join(target.pluginDir, ".kilo", "skills"),
    );
    await writeFile(
      path.join(target.pluginDir, "kilo.jsonc"),
      `${JSON.stringify(buildKiloConfig({ telemetrySource }), null, 2)}\n`,
      "utf8",
    );
    await writeFile(
      path.join(target.pluginDir, "AGENTS.md"),
      buildKiloAgentsMd(),
      "utf8",
    );
    await writeFile(
      path.join(target.pluginDir, ".kilo", "agents", "wordpress-com.md"),
      buildKiloAgent(),
      "utf8",
    );
    await writeFile(
      path.join(target.pluginDir, ".kilo", "rules", "wordpress-com.md"),
      buildKiloRule(),
      "utf8",
    );
    await writeFile(
      path.join(target.pluginDir, ".kilo", "plugin", "README.md"),
      buildKiloPluginsReadme(),
      "utf8",
    );
    await writeFile(
      path.join(target.pluginDir, "README.md"),
      buildKiloReadme({ skillNames }),
      "utf8",
    );
    console.log(`Built ${target.logName} plugin at ${target.pluginDir}`);
    return;
  }

  if (target.surface === "cline") {
    await mkdir(path.join(target.pluginDir, ".cline", "plugins"), {
      recursive: true,
    });
    await mkdir(path.join(target.pluginDir, ".cline", "skills"), {
      recursive: true,
    });
    await mkdir(path.join(target.pluginDir, ".clinerules"), {
      recursive: true,
    });
    await rm(path.join(target.pluginDir, "skills"), {
      recursive: true,
      force: true,
    });
    await copySkillSet(
      sharedSkillsSourceDir,
      path.join(target.pluginDir, ".cline", "skills"),
    );
    await writeFile(
      path.join(target.pluginDir, "mcp.json"),
      `${JSON.stringify(
        createMcpConfig({
          surface: "cline",
          telemetrySource,
        }),
        null,
        2,
      )}\n`,
      "utf8",
    );
    await writeFile(
      path.join(target.pluginDir, ".clinerules", "wordpress-com.md"),
      buildClineRules(),
      "utf8",
    );
    await writeFile(
      path.join(target.pluginDir, ".cline", "plugins", "README.md"),
      buildClinePluginsReadme(),
      "utf8",
    );
    await writeFile(
      path.join(target.pluginDir, "README.md"),
      buildClineReadme({ skillNames }),
      "utf8",
    );
    console.log(`Built ${target.logName} plugin at ${target.pluginDir}`);
    return;
  }

  if (target.surface === "devin") {
    await mkdir(path.join(target.pluginDir, ".devin", "skills"), {
      recursive: true,
    });
    await rm(path.join(target.pluginDir, "skills"), {
      recursive: true,
      force: true,
    });
    await copySkillSet(
      sharedSkillsSourceDir,
      path.join(target.pluginDir, ".devin", "skills"),
    );
    await writeFile(
      path.join(target.pluginDir, ".devin", "config.json"),
      `${JSON.stringify(buildDevinConfig({ telemetrySource }), null, 2)}\n`,
      "utf8",
    );
    await writeFile(
      path.join(target.pluginDir, "AGENTS.md"),
      buildDevinAgentsMd(),
      "utf8",
    );
    await writeFile(
      path.join(target.pluginDir, "README.md"),
      buildDevinReadme({ skillNames }),
      "utf8",
    );
    console.log(`Built ${target.logName} output at ${target.pluginDir}`);
    return;
  }

  if (target.surface === "amp") {
    await mkdir(path.join(target.pluginDir, ".agents", "skills"), {
      recursive: true,
    });
    await mkdir(path.join(target.pluginDir, ".amp", "plugins"), {
      recursive: true,
    });
    await rm(path.join(target.pluginDir, "skills"), {
      recursive: true,
      force: true,
    });
    await copySkillSet(
      sharedSkillsSourceDir,
      path.join(target.pluginDir, ".agents", "skills"),
    );
    await writeFile(
      path.join(target.pluginDir, ".amp", "settings.json"),
      `${JSON.stringify(buildAmpSettings({ telemetrySource }), null, 2)}\n`,
      "utf8",
    );
    await writeFile(
      path.join(target.pluginDir, ".amp", "plugins", "wordpress-studio.ts"),
      buildAmpPlugin(),
      "utf8",
    );
    await writeFile(
      path.join(target.pluginDir, "AGENTS.md"),
      buildAmpAgentsMd({ skillNames }),
      "utf8",
    );
    await writeFile(
      path.join(target.pluginDir, "README.md"),
      buildAmpReadme({ skillNames }),
      "utf8",
    );
    console.log(`Built ${target.logName} plugin at ${target.pluginDir}`);
    return;
  }

  if (target.surface === "junie") {
    await mkdir(path.join(target.pluginDir, ".junie", "mcp"), {
      recursive: true,
    });
    await mkdir(path.join(target.pluginDir, ".junie", "skills"), {
      recursive: true,
    });
    await rm(path.join(target.pluginDir, "skills"), {
      recursive: true,
      force: true,
    });
    await copySkillSet(
      sharedSkillsSourceDir,
      path.join(target.pluginDir, ".junie", "skills"),
    );
    await writeFile(
      path.join(target.pluginDir, ".junie", "AGENTS.md"),
      buildJunieAgentsMd(),
      "utf8",
    );
    await writeFile(
      path.join(target.pluginDir, ".junie", "mcp", "mcp.json"),
      `${JSON.stringify(
        createMcpConfig({
          surface: "junie",
          telemetrySource,
        }),
        null,
        2,
      )}\n`,
      "utf8",
    );
    await writeFile(
      path.join(target.pluginDir, "README.md"),
      buildJunieReadme({ skillNames }),
      "utf8",
    );
    console.log(`Built ${target.logName} plugin at ${target.pluginDir}`);
    return;
  }

  if (target.includeMcpConfig) {
    const mcpConfigPath = target.mcpConfigPath ?? ".mcp.json";
    const mcpConfigFactory = target.mcpConfigFactory ?? createMcpConfig;
    await mkdir(path.dirname(path.join(target.pluginDir, mcpConfigPath)), {
      recursive: true,
    });
    await writeFile(
      path.join(target.pluginDir, mcpConfigPath),
      `${JSON.stringify(
        mcpConfigFactory({
          surface: target.surface,
          telemetrySource,
        }),
        null,
        2,
      )}\n`,
      "utf8",
    );
  }

  if (target.manifestDir && target.manifestFileName && target.manifestContents) {
    await writeFile(
      path.join(target.pluginDir, target.manifestDir, target.manifestFileName),
      `${JSON.stringify(target.manifestContents, null, 2)}\n`,
      "utf8",
    );
  }

  if (!target.manifestDir && target.manifestFileName && target.manifestContents) {
    await writeFile(
      path.join(target.pluginDir, target.manifestFileName),
      `${JSON.stringify(target.manifestContents, null, 2)}\n`,
      "utf8",
    );
  }

  if (target.writeExtraFiles) {
    await target.writeExtraFiles({ pluginDir: target.pluginDir, skillNames, telemetrySource });
  } else if (target.includeReadme !== false) {
    await writeFile(
      path.join(target.pluginDir, "README.md"),
      buildReadme({
        surfaceName: target.logName,
        intro: target.readmeIntro,
        skillNames,
        displayName: target.displayName,
      }),
      "utf8",
    );
  }

  if (target.rules) {
    const rulesDir = path.join(target.pluginDir, ".devin", "rules");
    await mkdir(rulesDir, { recursive: true });
    for (const rule of target.rules) {
      await writeFile(path.join(rulesDir, rule.fileName), rule.contents, "utf8");
    }
  }

  if (target.includeAiderFiles) {
    await writeFile(
      path.join(target.pluginDir, "README.md"),
      buildAiderReadme({ skillNames }),
      "utf8",
    );
    await writeFile(
      path.join(target.pluginDir, "CONVENTIONS.md"),
      buildAiderConventions({ skillNames }),
      "utf8",
    );
    await writeFile(
      path.join(target.pluginDir, ".aider.conf.yml"),
      createAiderConfig({ skillNames }),
      "utf8",
    );
  }

  if (target.marketplacePath && target.marketplaceContents) {
    await mkdir(path.dirname(target.marketplacePath), { recursive: true });
    await writeFile(
      target.marketplacePath,
      `${JSON.stringify(target.marketplaceContents, null, 2)}\n`,
      "utf8",
    );
  }

  if (target.extraFiles) {
    await target.extraFiles({ pluginDir: target.pluginDir, skillNames });
  }

  console.log(`Built ${target.logName} plugin at ${target.pluginDir}`);
}

async function buildContinueOutput() {
  await rm(continueOutputDir, { recursive: true, force: true });
  await mkdir(path.join(continueOutputDir, ".continue", "rules"), {
    recursive: true,
  });
  await mkdir(path.join(continueOutputDir, ".continue", "prompts"), {
    recursive: true,
  });
  await mkdir(path.join(continueOutputDir, ".continue", "mcpServers"), {
    recursive: true,
  });

  await writeFile(
    path.join(continueOutputDir, "README.md"),
    buildContinueReadme(),
    "utf8",
  );
  await writeFile(
    path.join(continueOutputDir, "config.yaml"),
    buildContinueConfigSnippet(),
    "utf8",
  );
  await writeFile(
    path.join(continueOutputDir, ".continue", "rules", "wordpress-com.md"),
    buildContinueWordPressRule(),
    "utf8",
  );
  await writeFile(
    path.join(
      continueOutputDir,
      ".continue",
      "prompts",
      "create-wordpress-com-site.md",
    ),
    buildContinueCreateSitePrompt(),
    "utf8",
  );
  await writeFile(
    path.join(
      continueOutputDir,
      ".continue",
      "prompts",
      "audit-wordpress-com-project.md",
    ),
    buildContinueAuditPrompt(),
    "utf8",
  );
  await writeFile(
    path.join(
      continueOutputDir,
      ".continue",
      "mcpServers",
      "wordpress-com.yaml",
    ),
    buildContinueMcpServerBlock(),
    "utf8",
  );

  console.log(`Built Continue output at ${continueOutputDir}`);
}

async function buildConductorOutput() {
  await rm(conductorOutputDir, { recursive: true, force: true });
  await mkdir(path.join(conductorOutputDir, ".conductor"), {
    recursive: true,
  });

  await writeFile(
    path.join(conductorOutputDir, ".conductor", "settings.toml"),
    buildConductorSettings(),
    "utf8",
  );
  await writeFile(
    path.join(conductorOutputDir, "README.md"),
    buildConductorReadme(),
    "utf8",
  );

  console.log(`Built Conductor output at ${conductorOutputDir}`);
}

async function main() {
  await mkdir(pluginsDir, { recursive: true });
  await access(telemetryMcpServerDistPath);
  const skillNames = await getSharedSkillNames(sharedSkillsSourceDir);

  for (const target of pluginTargets) {
    await buildPluginTarget(target, skillNames);
  }

  await buildContinueOutput();
  await buildConductorOutput();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
