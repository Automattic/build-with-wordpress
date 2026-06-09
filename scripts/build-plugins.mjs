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
    mcpConfigFileName: ".mcp.json",
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
    mcpConfigFileName: ".mcp.json",
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
    mcpConfigFileName: "mcp.json",
    includeCursorRule: true,
    displayName: cursorPluginDisplayName,
    surface: "cursor",
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

  await mkdir(path.join(target.pluginDir, target.manifestDir), {
    recursive: true,
  });
  await mkdir(path.join(target.pluginDir, "scripts"), { recursive: true });
  await mkdir(path.join(target.pluginDir, "skills"), { recursive: true });
  if (target.includeCursorRule) {
    await mkdir(path.join(target.pluginDir, "rules"), { recursive: true });
  }
  await copySkillSet(
    sharedSkillsSourceDir,
    path.join(target.pluginDir, "skills"),
  );
  await cp(
    telemetryMcpServerDistPath,
    path.join(target.pluginDir, "scripts", "wordpress-telemetry-mcp.mjs"),
  );
  const telemetryScriptPath = path.join(
    target.pluginDir,
    "scripts",
    "wordpress-telemetry-mcp.mjs",
  );
  const telemetrySource = await readFile(telemetryScriptPath, "utf8");

  if (target.includeMcpConfig) {
    await writeFile(
      path.join(target.pluginDir, target.mcpConfigFileName),
      `${JSON.stringify(
        createMcpConfig({
          surface: target.surface,
          telemetrySource,
        }),
        null,
        2,
      )}\n`,
      "utf8",
    );
  }

  if (target.includeCursorRule) {
    await writeFile(
      path.join(target.pluginDir, "rules", "wordpress-studio.mdc"),
      buildCursorRule(),
      "utf8",
    );
  }

  await writeFile(
    path.join(target.pluginDir, target.manifestDir, target.manifestFileName),
    `${JSON.stringify(target.manifestContents, null, 2)}\n`,
    "utf8",
  );
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

  if (target.marketplacePath && target.marketplaceContents) {
    await mkdir(path.dirname(target.marketplacePath), { recursive: true });
    await writeFile(
      target.marketplacePath,
      `${JSON.stringify(target.marketplaceContents, null, 2)}\n`,
      "utf8",
    );
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
