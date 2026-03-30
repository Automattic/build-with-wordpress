import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist", "codex");
const sharedSkillsSourceDir = path.join(root, "skills");
const codexSkillsSourceDir = path.join(root, "codex-skills");
const mcpConfig = {
  "wordpress-studio": {
    command: "studio",
    args: ["mcp"]
  }
};

const pluginManifest = {
  name: "build-with-wordpress",
  version: "0.2.0",
  description:
    "Build WordPress sites and block plugins with shared workflows for Studio MCP, validation, screenshots, and Studio-backed block development.",
  author: {
    name: "Automattic"
  },
  homepage: "https://developer.wordpress.com/",
  repository: "https://github.com/Automattic/build-with-wordpress",
  license: "GPL-2.0-or-later",
  keywords: [
    "wordpress",
    "studio",
    "mcp",
    "wp-cli",
    "block-theme",
    "site-creator",
    "block-creator",
    "gutenberg",
    "codex"
  ],
  skills: "./skills/",
  mcpServers: "./.mcp.json",
  interface: {
    displayName: "Build with WordPress",
    shortDescription:
      "MCP-first WordPress site and block building with Studio, screenshots, validation, and Studio-backed block workflows",
    longDescription:
      "Use Build with WordPress to scaffold and iterate on WordPress sites with the WordPress Studio MCP server, generate block themes, run block validation, take screenshots, and create custom Gutenberg block plugins inside selected Studio sites.",
    developerName: "Automattic",
    category: "Coding",
    capabilities: ["Interactive", "Read", "Write"],
    websiteURL: "https://developer.wordpress.com/",
    defaultPrompt:
      "Build me a WordPress site with Studio MCP, or create a custom Gutenberg block plugin inside a selected Studio site"
  }
};

const pluginReadme = `# Build with WordPress Plugin

This Codex plugin packages shared WordPress skills from the \`build-with-wordpress\` source repo, plus Codex-only skills when the workflow depends on Codex-specific capabilities.

It is intentionally Studio-MCP-first:

- local site workflows use the WordPress Studio MCP server
- screenshots and block validation come from Studio MCP tools
- \`wp_cli\` is the flexible escape hatch for arbitrary WordPress operations
- custom Gutenberg blocks can be scaffolded inside a selected Studio site and reviewed there

## Included skills

Shared:
- \`studio\`
- \`theme-creator\`
- \`site-creator\`
- \`block-creator\`

Codex-only:
- \`site-image-builder\`
`;

async function copySkillSet(sourceDir, targetDir) {
  const entries = await readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    await cp(path.join(sourceDir, entry.name), path.join(targetDir, entry.name), {
      recursive: true
    });
  }
}

async function main() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(path.join(distDir, ".codex-plugin"), { recursive: true });
  await mkdir(path.join(distDir, "skills"), { recursive: true });
  await copySkillSet(sharedSkillsSourceDir, path.join(distDir, "skills"));
  await copySkillSet(codexSkillsSourceDir, path.join(distDir, "skills"));
  await writeFile(
    path.join(distDir, ".mcp.json"),
    `${JSON.stringify(mcpConfig, null, 2)}\n`,
    "utf8"
  );
  await writeFile(
    path.join(distDir, ".codex-plugin", "plugin.json"),
    `${JSON.stringify(pluginManifest, null, 2)}\n`,
    "utf8"
  );
  await writeFile(path.join(distDir, "README.md"), pluginReadme, "utf8");
  console.log(`Built Codex plugin at ${distDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
