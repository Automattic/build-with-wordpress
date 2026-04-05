import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const pluginsDir = path.join(root, "plugins");
const sharedSkillsSourceDir = path.join(root, "skills");
const mcpConfig = {
  mcpServers: {
    "wordpress-studio": {
      command: "studio",
      args: ["mcp"],
    },
  },
};

const codexPluginManifest = {
  name: "build-with-wordpress",
  version: "0.3.0",
  description:
    "Route and build WordPress sites, themes, custom blocks, and plugins with WordPress Studio backed workflows for MCP, validation, screenshots, and site iteration.",
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
    displayName: "Build with WordPress",
    shortDescription:
      "MCP-first WordPress site, theme, block, and plugin building with Studio backed routing and review",
    longDescription:
      "Use Build with WordPress to choose the right WordPress implementation path, scaffold and iterate on Studio-backed sites, generate block themes, create custom Gutenberg blocks and plugins, run block validation, and review changes with screenshots.",
    developerName: "Automattic",
    category: "Coding",
    capabilities: ["Interactive", "Read", "Write"],
    websiteURL: "https://developer.wordpress.com/",
    defaultPrompt:
      "Help me choose the right WordPress approach for this task, then build it with Studio MCP",
  },
};

const claudePluginManifest = {
  name: "build-with-wordpress",
  version: "0.3.0",
  description:
    "Use shared Build with WordPress skills to route and build WordPress sites, themes, custom blocks, and plugins with WordPress Studio backed workflows.",
  author: {
    name: "Automattic",
  },
};

function buildReadme({ surfaceName, intro, skillNames }) {
  const skillList = skillNames.map((skillName) => `- \`${skillName}\``).join("\n");

  return `# Build with WordPress Plugin

This ${surfaceName} plugin packages shared WordPress skills from the \`build-with-wordpress\` source repo.

${intro}

It currently ships the same shared skills as the Codex plugin so both surfaces stay aligned while we iterate on any Claude-specific additions later.

## Included skills

${skillList}
`;
}

const pluginTargets = [
  {
    logName: "Codex",
    pluginDir: path.join(pluginsDir, "build-with-wordpress"),
    legacyDirs: [path.join(pluginsDir, "codex", "build-with-wordpress")],
    manifestDir: ".codex-plugin",
    manifestFileName: "plugin.json",
    manifestContents: codexPluginManifest,
    readmeIntro: `It is intentionally Studio-MCP-first:

- local site workflows use the WordPress Studio MCP server
- screenshots and block validation come from Studio MCP tools
- \`wp_cli\` is the flexible escape hatch for arbitrary WordPress operations
- \`wordpress-creator\` routes requests to the right WordPress implementation path
- custom WordPress plugins can be scaffolded inside a selected Studio site and reviewed there
- custom Gutenberg blocks can be scaffolded inside a selected Studio site and reviewed there`,
    includeMcpConfig: true,
  },
  {
    logName: "Claude Code",
    pluginDir: path.join(pluginsDir, "claude-code"),
    legacyDirs: [],
    manifestDir: ".claude-plugin",
    manifestFileName: "plugin.json",
    manifestContents: claudePluginManifest,
    readmeIntro: `It is a first-pass Claude Code package built from the same shared skills as the Codex plugin.

- WordPress request routing stays shared across surfaces
- Studio-backed site, theme, block, and plugin workflows stay shared
- the plugin output is intentionally minimal while we add Claude-specific packaging details later`,
    includeMcpConfig: true,
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
  await rm(target.pluginDir, { recursive: true, force: true });
  for (const legacyDir of target.legacyDirs) {
    await rm(legacyDir, { recursive: true, force: true });
  }

  await mkdir(path.join(target.pluginDir, target.manifestDir), { recursive: true });
  await mkdir(path.join(target.pluginDir, "skills"), { recursive: true });
  await copySkillSet(sharedSkillsSourceDir, path.join(target.pluginDir, "skills"));

  if (target.includeMcpConfig) {
    await writeFile(
      path.join(target.pluginDir, ".mcp.json"),
      `${JSON.stringify(mcpConfig, null, 2)}\n`,
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

  console.log(`Built ${target.logName} plugin at ${target.pluginDir}`);
}

async function main() {
  await mkdir(pluginsDir, { recursive: true });
  const skillNames = await getSharedSkillNames(sharedSkillsSourceDir);

  for (const target of pluginTargets) {
    await buildPluginTarget(target, skillNames);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
