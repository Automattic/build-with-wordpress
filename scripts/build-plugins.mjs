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
<<<<<<< HEAD
const geminiDisplayName = "WordPress.com";
=======
const cursorPluginName = pluginName;
const cursorPluginDisplayName = pluginDisplayName;
>>>>>>> origin/trunk

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

<<<<<<< HEAD
function buildReadme({
  surfaceName,
  intro,
  skillNames,
  iterationLabel = surfaceName,
  displayName = pluginDisplayName,
}) {
=======
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
>>>>>>> origin/trunk
  const skillList = skillNames
    .map((skillName) => `- \`${skillName}\``)
    .join("\n");

  return `# ${displayName} Plugin

This ${surfaceName} plugin packages shared WordPress skills from the \`build-with-wordpress\` source repo as ${displayName}.

${intro}

<<<<<<< HEAD
It currently ships the same shared skills as the Codex plugin so these surfaces stay aligned while we iterate on any ${iterationLabel}-specific additions later.
=======
It ships the shared skills from this repo so all supported surfaces stay aligned while we iterate on surface-specific packaging details.
>>>>>>> origin/trunk

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
<<<<<<< HEAD
    logName: "Gemini",
    displayName: geminiDisplayName,
    buildRootDir: path.join(pluginsDir, "gemini"),
    pluginDir: path.join(pluginsDir, "gemini"),
    legacyCleanupPaths: [],
    readmeIntro: `It is a Gemini CLI and Gemini Code Assist package built from the same shared skills as the Codex and Claude Code plugins.

- \`GEMINI.md\` provides project-level WordPress guidance for Gemini
- \`.gemini/settings.json\` configures the Studio and telemetry MCP servers for Gemini CLI
- WordPress request routing stays shared across surfaces
- Studio-backed site, theme, block, and plugin workflows stay shared
- frontend auditing stays shared across surfaces`,
    includeMcpConfig: true,
    mcpConfigPath: path.join(".gemini", "settings.json"),
    surface: "gemini",
    extraFiles: ({ skillNames }) => [
      {
        relativePath: "GEMINI.md",
        contents: buildGeminiInstructions({ skillNames }),
      },
    ],
=======
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
>>>>>>> origin/trunk
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
    const mcpConfigPath = target.mcpConfigPath ?? ".mcp.json";
    await mkdir(path.dirname(path.join(target.pluginDir, mcpConfigPath)), {
      recursive: true,
    });
    await writeFile(
<<<<<<< HEAD
      path.join(target.pluginDir, mcpConfigPath),
=======
      path.join(target.pluginDir, target.mcpConfigFileName),
>>>>>>> origin/trunk
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

<<<<<<< HEAD
  if (target.manifestDir && target.manifestFileName && target.manifestContents) {
    await writeFile(
      path.join(target.pluginDir, target.manifestDir, target.manifestFileName),
      `${JSON.stringify(target.manifestContents, null, 2)}\n`,
      "utf8",
    );
  }
  await writeFile(
    path.join(target.pluginDir, "README.md"),
    buildReadme({
      surfaceName: target.logName,
      intro: target.readmeIntro,
      skillNames,
      iterationLabel: target.iterationLabel,
      displayName: target.displayName,
    }),
=======
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
>>>>>>> origin/trunk
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

  for (const extraFile of target.extraFiles?.({ skillNames }) ?? []) {
    const extraPath = path.join(target.pluginDir, extraFile.relativePath);
    await mkdir(path.dirname(extraPath), { recursive: true });
    await writeFile(extraPath, extraFile.contents, "utf8");
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
