# Skills and Integrations

Build with WordPress packages shared WordPress agent skills for many coding-agent surfaces and wires those surfaces to WordPress Studio. The integration model is skill-first: a single `skills/` source tree describes WordPress workflows, and generated packages adapt that guidance into native agent conventions.

Source evidence: `skills/**`, `scripts/build-plugins.mjs`, `scripts/wordpress-telemetry-mcp.mjs`, `plugins/**`, `README.md`, and the read-only context aliases `studio` and `wordpress-agent-skills` supplied to this documentation run.

## Canonical skill set

The repository currently ships these shared skill directories:

| Skill | Purpose in generated packages |
| --- | --- |
| `wordpress-creator` | Entry routing skill for choosing whether a request should be handled as site work, theme work, custom block work, plugin work, design previews, or an audit. Generated instructions commonly tell agents to start here unless the user clearly names a narrower path. |
| `studio` | Studio-specific operating guidance, including MCP-first workflows and CLI fallback behavior. |
| `site-creator` | Site-building workflow guidance for creating or updating a WordPress site. |
| `theme-creator` | Theme and block-theme implementation guidance. |
| `block-creator` | Custom Gutenberg block creation guidance. |
| `plugin-creator` | Custom plugin creation guidance for reusable behavior, admin/settings UI, REST endpoints, scheduled tasks, integrations, and backend behavior. |
| `design-previews-creator` | Design preview workflow used when an agent should propose multiple visual directions before implementation. |
| `auditing` | Review workflow for implementation quality, accessibility, performance, responsive behavior, editing experience, and WordPress conventions. |

`getSharedSkillNames()` in `scripts/build-plugins.mjs` discovers skill directories and sorts them. `copySkillSet()` copies each skill directory into generated outputs unless a surface has a custom skill destination such as `.opencode/skills/`, `.kilo/skills/`, `.cline/skills/`, `.agents/skills/`, `.devin/skills/`, `.junie/skills/`, or `.agents/skills/` for Zed.

## Skill packaging contract

A generated package should preserve each skill's directory as an agent-readable unit. Most surfaces receive:

```text
plugins/<surface>/skills/<skill-name>/SKILL.md
```

Some surfaces use their own conventions:

```text
plugins/opencode/.opencode/skills/<skill-name>/SKILL.md
plugins/kilo-code/.kilo/skills/<skill-name>/SKILL.md
plugins/cline/.cline/skills/<skill-name>/SKILL.md
plugins/zed/.agents/skills/<skill-name>/SKILL.md
plugins/amp/.agents/skills/<skill-name>/SKILL.md
plugins/devin/.devin/skills/<skill-name>/SKILL.md
plugins/junie/.junie/skills/<skill-name>/SKILL.md
```

The generator templates add surface-specific instructions that tell the agent when and how to load those skills. For example, several outputs instruct the agent to load `wordpress-creator` first, then route to a narrower skill based on the task.

## Studio integration points

Generated packages use WordPress Studio as the operational runtime for WordPress work. The shared behavior documented in `README.md` and encoded in generated instructions is:

- prefer the WordPress Studio MCP server for local site management;
- use Studio screenshots and block validation for visual and block correctness checks;
- use Studio performance tooling for frontend audits where available;
- use `wp_cli` through the Studio MCP server for arbitrary WordPress operations; and
- fall back to the `studio` CLI through the shared `studio` skill when MCP tools are unavailable.

The read-only `studio` context alias supplied to this run confirms the relevant integration surface: Studio owns CLI and MCP behavior, including `apps/cli/commands/mcp.ts`, MCP tools under `apps/cli/ai/tools/**`, and system prompt wiring in `apps/cli/ai/system-prompt.ts`. Build with WordPress depends on those public Studio behaviors but does not implement them.

## Telemetry MCP integration

Build with WordPress also ships a plugin-local telemetry MCP server. The generator reads the built `dist/wordpress-telemetry-mcp.mjs` artifact and embeds it through compressed Node bootstrap arguments in MCP-capable outputs.

The contract for generated telemetry entries is:

- server name: `wordpress-telemetry`;
- command: `node`;
- arguments: generated bootstrap code that receives a `--surface` value for the current agent output;
- purpose: workflow telemetry emitted by this package, independent of whether Studio itself ships telemetry support.

The telemetry server is generated once per build and embedded per surface so generated packages can expose workflow telemetry without requiring a separate published runtime package.

## Agent Skills packaging context

The read-only `wordpress-agent-skills` context alias supplied to this run includes `skills/**`, `docs/packaging.md`, and skill-maintenance workflow evidence. Treat that repository as packaging guidance for portable skills: Build with WordPress follows the same broad pattern of keeping reusable skill source under `skills/**` and adapting it for consumers. Build with WordPress extends that model with generated agent-plugin artifacts and Studio MCP wiring.

## Integration examples

### MCP-capable surface

A surface with project-local MCP support usually gets both Studio and telemetry entries:

```json
{
  "mcpServers": {
    "wordpress-studio": {
      "command": "studio",
      "args": ["mcp"]
    },
    "wordpress-telemetry": {
      "command": "node",
      "args": ["<generated bootstrap>"]
    }
  }
}
```

The generator serializes this shape differently for VS Code, Zed, OpenCode, Continue, and other native formats, but the integration boundary stays stable.

### Skills-only or setup-guidance surface

Some surfaces do not expose the same project-local MCP extension point. For example, the root README documents Pi as a skills-only package and Qodo as an output whose MCP setup is documented through Agentic Tools or enterprise allow-lists. In those cases the generated package still carries shared skills and setup instructions, while the Studio MCP connection remains a user or administrator configuration step.

## Public extension points for contributors

Build with WordPress extension points are repository conventions rather than exported library APIs:

| Extension point | Where to change it | What to keep aligned |
| --- | --- | --- |
| Add or update a shared workflow | `skills/<skill-name>/SKILL.md` and related skill files | Generated skill copies across `plugins/**`; verification expectations if a new skill is added. |
| Add a new agent surface | `scripts/build-plugins.mjs` target table and templates | Output README, native config files, MCP behavior, copied skill layout, and `scripts/verify-plugins.mjs`. |
| Change MCP wiring | Shared MCP helpers or surface-specific serializers in `scripts/build-plugins.mjs` | `wordpress-studio` command, telemetry bootstrap, target README, and verification checks. |
| Change telemetry behavior | `scripts/wordpress-telemetry-mcp.mjs` and `scripts/build-telemetry-mcp.mjs` | Built `dist/` artifact, generated bootstrap snippets, and verification checks. |
| Publish Cursor output | `plugins/cursor/` generated output and `scripts/export-cursor-plugin.mjs` | Standalone Cursor repository branch and PR process. |

## Related docs

- [Architecture](architecture.md)
- [Generated outputs](generated-outputs.md)
- [Contributor workflows](contributor-workflows.md)
