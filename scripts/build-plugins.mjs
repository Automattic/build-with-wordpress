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

function buildReadme({ surfaceName, intro, skillNames }) {
  const skillList = skillNames
    .map((skillName) => `- \`${skillName}\``)
    .join("\n");

  return `# ${pluginDisplayName} Plugin

This ${surfaceName} plugin packages shared WordPress skills from the \`build-with-wordpress\` source repo as ${pluginDisplayName}.

${intro}

It currently ships the same shared skills as the Codex plugin so both surfaces stay aligned while we iterate on any Claude-specific additions later.

## Included skills

${skillList}
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

- The WordPress.com site-building workflows are the same shared skills used by Codex and Claude Code.
- The Studio MCP server remains the shared substrate for local site management, screenshots, block validation, \`wp_cli\`, and WordPress.com / Jetpack-connected workflows.
- The telemetry MCP server is the same bundled server generated for the other outputs, with the surface set to \`opencode\`.

## Included skills

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

The WordPress.com MCP and agent substrate is shared across OpenCode, Codex, and Claude Code. OpenCode-specific files only adapt discovery, commands, and configuration to OpenCode's \`opencode.json\` and \`.opencode/\` conventions.
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
    logName: "OpenCode",
    buildRootDir: path.join(pluginsDir, "opencode"),
    pluginDir: path.join(pluginsDir, "opencode"),
    legacyCleanupPaths: [],
    manifestDir: ".opencode",
    includeMcpConfig: false,
    surface: "opencode",
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
    await writeFile(
      path.join(target.pluginDir, ".mcp.json"),
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
