import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const pluginsDir = path.join(root, "plugins");
const pluginDir = path.join(pluginsDir, "build-with-wordpress");
const legacyPluginDir = path.join(pluginsDir, "codex", "build-with-wordpress");
const sharedSkillsSourceDir = path.join(root, "skills");
const mcpConfig = {
  mcpServers: {
    "wordpress-studio": {
      command: "studio",
      args: ["mcp"],
    },
  },
};

const pluginManifest = {
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

const pluginReadme = `# Build with WordPress Plugin

This Codex plugin packages shared WordPress skills from the \`build-with-wordpress\` source repo.

It is intentionally Studio-MCP-first:

- local site workflows use the WordPress Studio MCP server
- screenshots and block validation come from Studio MCP tools
- \`wp_cli\` is the flexible escape hatch for arbitrary WordPress operations
- \`wordpress-creator\` routes requests to the right WordPress implementation path
- custom WordPress plugins can be scaffolded inside a selected Studio site and reviewed there
- custom Gutenberg blocks can be scaffolded inside a selected Studio site and reviewed there

## Included skills

Shared:
- \`wordpress-creator\`
- \`studio\`
- \`plugin-creator\`
- \`theme-creator\`
- \`site-creator\`
- \`design-previews-creator\`
- \`block-creator\`
`;

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

async function main() {
  await mkdir(pluginsDir, { recursive: true });
  await rm(pluginDir, { recursive: true, force: true });
  await rm(legacyPluginDir, { recursive: true, force: true });
  await mkdir(path.join(pluginDir, ".codex-plugin"), { recursive: true });
  await mkdir(path.join(pluginDir, "skills"), { recursive: true });
  await copySkillSet(sharedSkillsSourceDir, path.join(pluginDir, "skills"));
  await writeFile(
    path.join(pluginDir, ".mcp.json"),
    `${JSON.stringify(mcpConfig, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    path.join(pluginDir, ".codex-plugin", "plugin.json"),
    `${JSON.stringify(pluginManifest, null, 2)}\n`,
    "utf8",
  );
  await writeFile(path.join(pluginDir, "README.md"), pluginReadme, "utf8");
  console.log(`Built Codex plugin at ${pluginDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
