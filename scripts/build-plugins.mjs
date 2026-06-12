import { access, cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompressSync } from "node:zlib";

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
const geminiDisplayName = "WordPress.com";

function createZedMcpConfig({ surface, telemetrySource }) {
  return {
    context_servers: {
      "wordpress-studio": {
        command: "studio",
        args: ["mcp"],
      },
      "wordpress-telemetry": {
        command: "node",
        args: createTelemetryBootstrapArgs({ surface, telemetrySource }),
      },
    },
  };
}

function createTelemetryBootstrapArgs({ surface, telemetrySource }) {
  const compressedSource = brotliCompressSync(Buffer.from(telemetrySource, "utf8"));
  const sourcePayload = compressedSource.toString("base64");
  const bootstrap = [
    'import { brotliDecompressSync } from "node:zlib";',
    'import { Buffer } from "node:buffer";',
    `process.argv.push("--surface", ${JSON.stringify(surface)});`,
    `const source = brotliDecompressSync(Buffer.from(${JSON.stringify(sourcePayload)}, "base64")).toString("utf8");`,
    'await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));',
  ].join("");

  return ["--input-type=module", "--eval", bootstrap];
}

function createMcpConfig({ surface, telemetrySource }) {
  return {
    mcpServers: {
      "wordpress-studio": {
        command: "studio",
        args: ["mcp"],
      },
      "wordpress-telemetry": {
        command: "node",
        args: createTelemetryBootstrapArgs({ surface, telemetrySource }),
      },
    },
  };
}

function createOpenCodeMcpConfig({ surface, telemetrySource }) {
  return {
    "wordpress-studio": {
      type: "local",
      command: ["studio", "mcp"],
      enabled: true,
    },
    "wordpress-telemetry": {
      type: "local",
      command: [
        "node",
        ...createTelemetryBootstrapArgs({ surface, telemetrySource }),
      ],
      enabled: true,
    },
  };
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

function createVsCodeMcpConfig({ surface, telemetrySource }) {
  return {
    servers: {
      "wordpress-studio": {
        type: "stdio",
        command: "studio",
        args: ["mcp"],
      },
      "wordpress-telemetry": {
        type: "stdio",
        command: "node",
        args: createTelemetryBootstrapArgs({ surface, telemetrySource }),
      },
    },
  };
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

function buildOpenCodeConfig({ telemetrySource }) {
  return {
    "$schema": "https://opencode.ai/config.json",
    instructions: ["AGENTS.md"],
    mcp: createOpenCodeMcpConfig({
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

function buildWindsurfReadme({ skillNames }) {
  const skillList = skillNames
    .map((skillName) => `- \`${skillName}\``)
    .join("\n");

  return `# WordPress.com for Windsurf Cascade

This Windsurf/Cascade output packages the shared WordPress agent substrate from the \`build-with-wordpress\` source repo for WordPress.com work.

## What is Windsurf-specific

- Cascade rules live in \`.devin/rules/*.md\`, which the official docs list as the preferred workspace rule location.
- \`mcp_config.json\` is shaped for Cascade's MCP configuration file at \`~/.codeium/windsurf/mcp_config.json\`.
- The rules tell Cascade when to use WordPress.com MCP tools and how to route WordPress implementation work.

## What is shared

- The WordPress.com MCP path uses the existing \`wordpress-studio\` MCP server; this output does not add a new backend service.
- Jetpack-connected site access stays part of the existing WordPress.com / Jetpack MCP flow.
- The bundled \`wordpress-telemetry\` MCP server is the same repo-local telemetry server used by the other outputs.
- Shared WordPress skills are copied into \`skills/\` so routing, Studio-backed workflows, auditing, theme, block, and plugin guidance stay aligned across agent surfaces.

## Setup

1. Install Devin Desktop / Windsurf and complete onboarding.
2. Optionally install the \`windsurf\` command in \`PATH\` during onboarding.
3. Build this repo with \`pnpm build\`.
4. Copy the servers from \`plugins/windsurf/mcp_config.json\` into \`~/.codeium/windsurf/mcp_config.json\`.
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

The shared WordPress.com substrate is not Roo-specific: the skills in \`skills/\`, the \`studio mcp\` server, and the bundled telemetry MCP server are the same flow used by the other agent outputs. Roo Code supplies the VS Code workspace rules and MCP configuration layer only.

## Setup

1. Install the Roo Code VS Code extension.
2. Open this folder, or copy its contents into the root of the workspace where Roo should assist with WordPress.com work.
3. Make sure WordPress Studio is installed and the \`studio\` CLI is available on your PATH.
4. In Roo Code, enable MCP servers.
5. Roo automatically detects project-level MCP config from \`.roo/mcp.json\`. If needed, open Roo Code's MCP settings and use \`Edit Project MCP\` to inspect or recreate the same config.

## MCP servers

\`.roo/mcp.json\` launches:

- \`wordpress-studio\`: runs \`studio mcp\` for WordPress site management, screenshots, block validation, performance tooling, and WP-CLI access.
- \`wordpress-telemetry\`: runs the bundled telemetry server artifact from this package.

This does not invent a Roo-only backend. Roo connects to the existing WordPress.com / Jetpack MCP flow through the same local Studio MCP entry point used by the other outputs.

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
- \`scripts/wordpress-telemetry-mcp.mjs\` is the same bundled telemetry MCP server artifact generated for the other outputs, with the surface set to \`zed\`.

The shared WordPress.com substrate is not Zed-specific: the skills, the \`studio mcp\` server, and the bundled telemetry MCP server are the same flow used by the other agent outputs. Zed supplies native project instructions, project-local skills, and settings JSON around that workflow.

## Setup

1. Install Zed.
2. Install WordPress Studio and make sure the \`studio\` CLI is available on your PATH.
3. Open this folder, or copy \`AGENTS.md\`, \`.agents/\`, \`.zed/\`, and \`scripts/\` into the root of the workspace where Zed should assist with WordPress.com work.
4. Trust the worktree in Zed so project-local skills are available.
5. Open the Agent Panel and confirm the \`wordpress-studio\` and \`wordpress-telemetry\` MCP servers are active.

## MCP servers

\`.zed/settings.json\` launches:

- \`wordpress-studio\`: runs \`studio mcp\` for WordPress site management, screenshots, block validation, performance tooling, and WP-CLI access.
- \`wordpress-telemetry\`: runs the bundled telemetry server artifact from this package.

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
- Studio-backed site, theme, block, plugin, and audit workflows stay shared`,
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
    logName: "Windsurf",
    buildRootDir: path.join(pluginsDir, "windsurf"),
    pluginDir: path.join(pluginsDir, "windsurf"),
    legacyCleanupPaths: [],
    includeMcpConfig: true,
    mcpConfigPath: "mcp_config.json",
    surface: "windsurf",
    rules: windsurfRules,
    writeExtraFiles: async ({ pluginDir, skillNames }) => {
      await writeFile(
        path.join(pluginDir, "README.md"),
        buildWindsurfReadme({ skillNames }),
        "utf8",
      );
    },
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
    await mkdir(path.join(target.pluginDir, "scripts"), { recursive: true });
    await cp(
      telemetryMcpServerDistPath,
      path.join(target.pluginDir, "scripts", "wordpress-telemetry-mcp.mjs"),
    );
    const telemetryScriptPath = path.join(
      target.pluginDir,
      "scripts",
      "wordpress-telemetry-mcp.mjs",
    );
    telemetrySource = await readFile(telemetryScriptPath, "utf8");
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

async function main() {
  await mkdir(pluginsDir, { recursive: true });
  await access(telemetryMcpServerDistPath);
  const skillNames = await getSharedSkillNames(sharedSkillsSourceDir);

  for (const target of pluginTargets) {
    await buildPluginTarget(target, skillNames);
  }

  await buildContinueOutput();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
