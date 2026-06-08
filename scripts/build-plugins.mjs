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

function buildReadme({ surfaceName, intro, skillNames }) {
  const skillList = skillNames
    .map((skillName) => `- \`${skillName}\``)
    .join("\n");

  return `# ${pluginDisplayName} Plugin

This ${surfaceName} plugin packages shared WordPress skills from the \`build-with-wordpress\` source repo as ${pluginDisplayName}.

${intro}

It currently ships the same shared skills as the other plugin outputs so supported surfaces stay aligned while we iterate on any surface-specific additions later.

## Included skills

${skillList}
`;
}

function buildCopilotInstructions({ skillNames }) {
  const skillList = skillNames.map((skillName) => `- ${skillName}`).join("\n");

  return `# Build with WordPress for GitHub Copilot

Use these instructions when helping build, debug, review, or explain WordPress projects.

## Operating model

- Prefer WordPress Studio MCP tools for local site management, screenshots, block validation, and WordPress operations when they are available.
- Use \`wp_cli\` through the Studio MCP server as the general-purpose WordPress escape hatch.
- Route implementation requests through the matching WordPress path: site/theme work, custom blocks, custom plugins, design previews, or auditing.
- Keep generated code production-oriented: accessible, performant, responsive, secure, and aligned with WordPress coding conventions.
- Preserve existing project conventions before introducing new patterns.
- For Gutenberg work, prefer native block APIs and validate block markup in a running Studio site when possible.
- For theme work, prefer block themes and WordPress-supported configuration in \`theme.json\`.
- For plugin work, keep behavior in plugins instead of themes unless the behavior is presentation-only.

## Shared WordPress skills

This Copilot output packages the same shared skill source as the Codex and Claude Code outputs. The skills live in \`skills/\` and provide deeper task-specific guidance:

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
- \`wordpress-telemetry\` for workflow telemetry emitted by the Build with WordPress skill flows.

Use MCP evidence for behavior claims when a site can be run locally. If MCP is unavailable, explain the limitation and use repository evidence instead.
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
  await writeFile(
    path.join(target.pluginDir, "README.md"),
    buildReadme({
      surfaceName: target.logName,
      intro: target.readmeIntro,
      skillNames,
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

  if (target.extraFiles) {
    await target.extraFiles({ pluginDir: target.pluginDir, skillNames });
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
