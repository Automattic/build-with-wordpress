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
      path.join(target.pluginDir, target.mcpConfigFileName ?? ".mcp.json"),
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

  if (target.manifestDir && target.manifestFileName && target.manifestContents) {
    await writeFile(
      path.join(target.pluginDir, target.manifestDir, target.manifestFileName),
      `${JSON.stringify(target.manifestContents, null, 2)}\n`,
      "utf8",
    );
  }
  if (target.writeExtraFiles) {
    await target.writeExtraFiles({ pluginDir: target.pluginDir, skillNames, telemetrySource });
  } else {
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

async function main() {
  await mkdir(pluginsDir, { recursive: true });
  await access(telemetryMcpServerDistPath);
  const skillNames = await getSharedSkillNames(sharedSkillsSourceDir);

  for (const target of pluginTargets) {
    await buildPluginTarget(target, skillNames);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
