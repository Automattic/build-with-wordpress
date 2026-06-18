# Antigravity Connector Research

This note records the official Antigravity integration surface checked for adding Build with WordPress support. It is intentionally conservative: generate Antigravity output only after the native install/update path can be verified from first-party documentation or direct product behavior.

## Sources Checked

Official Google Antigravity documentation and assets:

- `https://antigravity.google/`
- `https://antigravity.google/download`
- `https://antigravity.google/assets/docs/antigravity-2-0/getting-started.md`
- `https://antigravity.google/assets/docs/antigravity-2-0/settings.md`
- `https://antigravity.google/assets/docs/antigravity-2-0/features.md`
- `https://antigravity.google/assets/docs/antigravity-2-0/build-with-google.md`
- `https://antigravity.google/assets/docs/antigravity-2-0/mcp.md`
- `https://antigravity.google/assets/docs/antigravity-2-0/skills.md`
- `https://antigravity.google/assets/docs/antigravity-2-0/rules-workflows.md`
- `https://antigravity.google/assets/docs/antigravity-2-0/plugins.md`
- `https://antigravity.google/assets/docs/editor/ide-plugins.md`
- `https://antigravity.google/assets/docs/migration/firebase-studio-migration.md`
- `https://antigravity.google/assets/docs/cli/cli-install.md`

The public site is a client-rendered application. The documentation route index in the first-party JavaScript bundle points at Markdown files under `assets/docs/**`, which are the sources summarized here.

## Verified Surface

### MCP

Antigravity supports MCP through its MCP Store and custom `mcp_config.json`.

The custom MCP config path is:

```text
~/.gemini/config/mcp_config.json
```

The documented shape is:

```json
{
  "mcpServers": {
    "serverName": {
      "command": "path/to/executable",
      "args": ["--arg1", "value1"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

Documented server properties include `command`, `serverUrl`, `args`, `env`, `cwd`, `headers`, `authProviderType`, `oauth`, `disabled`, and `disabledTools`. Antigravity also documents OAuth token storage at:

```text
~/.gemini/antigravity/mcp_oauth_tokens.json
```

This is enough to describe how a user can manually add `wordpress-studio` and `wordpress-telemetry` MCP entries, but it is not enough to generate or install a complete Build with WordPress package automatically.

### Skills

Antigravity supports agent skills using the `SKILL.md` convention.

Documented skill locations:

```text
<workspace-root>/.agents/skills/<skill-folder>/
~/.gemini/config/skills/<skill-folder>/
```

Antigravity notes that `.agents/skills` is the default and `.agent/skills` remains backward-compatible. Each skill folder contains a `SKILL.md` file with YAML frontmatter. `description` is required; `name` is optional and defaults to the folder name.

### Rules and Workflows

Antigravity rules are Markdown files.

Documented rule locations:

```text
~/.gemini/GEMINI.md
<workspace-root>/.agents/rules/
```

Antigravity notes that `.agents/rules` is the default and `.agent/rules` remains backward-compatible. Rule activation modes are Manual, Always On, Model Decision, and Glob.

Workflows are Markdown files invoked by slash command, but the documentation checked here does not provide enough filesystem detail to define a generated workflow package contract.

### Plugins

Antigravity plugins are namespaced bundles that can group skills, rules, MCP servers, and hooks.

Documented plugin structure:

```text
plugins/<plugin-name>/
├── plugin.json
├── mcp_config.json
├── hooks.json
├── skills/
│   └── <skill-name>/
│       └── SKILL.md
└── rules/
    └── <rule-name>.md
```

`plugin.json` is required. Its `name` field is optional and defaults to the directory name.

Documented plugin locations:

```text
<workspace-root>/.agents/plugins/
<workspace-root>/_agents/plugins/
~/.gemini/config/plugins/
```

This is the strongest candidate for generated Build with WordPress output once the install behavior is verified.

### Build with Google Bundles

Antigravity's Build with Google page describes curated bundles that include skills, MCP servers, and editor extensions. The documented UI path is:

```text
Settings > Customizations > Build with Google Plugins
```

This confirms that Antigravity has a first-party bundled plugin concept. It does not define a third-party marketplace submission, update, or distribution contract for Build with WordPress.

## Unknowns Blocking Generated Output

The official documentation checked here does not establish these items clearly enough for generated output support:

- Whether Antigravity supports arbitrary VS Code extensions, and if so which VS Code APIs are compatible.
- Whether extension installation uses the Visual Studio Marketplace, Open VSX, manual VSIX installation, Antigravity-specific editor extensions, or only first-party bundled editor extensions.
- Whether third-party Antigravity plugins can be distributed as a publishable package, marketplace entry, GitHub repository, local folder copy, or manual global/workspace directory install.
- Whether generated workspace-level plugins under `.agents/plugins/wordpress-studio/` are loaded automatically in all project modes, including multi-folder projects and worktrees.
- Whether plugin-level `mcp_config.json` supports the same `mcpServers` shape and telemetry command behavior as the global `~/.gemini/config/mcp_config.json` file.
- Whether hooks are required, optional, or desirable for Build with WordPress telemetry or setup, and what hook events are stable enough to target.

## Recommended Plan

Do not add generated Antigravity output yet.

Safe next step:

1. Add an issue comment summarizing the verified MCP, skills, rules, and plugin locations above.
2. Ask for product verification of plugin loading from a workspace path using a minimal local plugin:

```text
.agents/plugins/wordpress-studio/
├── plugin.json
├── mcp_config.json
└── skills/
    └── studio/
        └── SKILL.md
```

3. Verify that `mcp_config.json` inside the plugin can launch both `studio mcp` and an inline Node telemetry MCP server.
4. If verified, add generator support for `plugins/antigravity/` with:
   - `.agents/plugins/wordpress-studio/plugin.json`
   - `.agents/plugins/wordpress-studio/mcp_config.json`
   - `.agents/plugins/wordpress-studio/skills/**/SKILL.md`
   - `README.md` explaining workspace copy and optional global install to `~/.gemini/config/plugins/wordpress-studio/`
5. Add verifier coverage for the generated plugin manifest, skill copies, and MCP config before committing generated output.
