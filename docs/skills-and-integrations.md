# Skills and Integrations

Build with WordPress packages shared WordPress agent skills for many coding agents. The skills teach agents how to use WordPress Studio, WordPress project conventions, and generated package-specific setup files. The generator then places those skills into each surface's native extension points.

Use this page when changing skill content, adding a new skill, or updating Studio and MCP integration behavior.

## Skill source inventory

Each directory under `skills/` is a portable skill source. The build process copies or adapts these skills into generated packages.

| Skill | Purpose in the generated packages |
| --- | --- |
| `wordpress-creator` | Top-level routing guidance for WordPress creation requests. It helps an agent choose the right workflow for site, theme, block, plugin, audit, or Studio operations. |
| `site-creator` | Site-building workflow guidance for creating and editing WordPress sites with Studio support. |
| `theme-creator` | Block theme creation and theme-editing guidance. |
| `design-previews-creator` | Preview workflow that can generate three design directions before a site theme is built. |
| `block-creator` | Custom block creation workflow guidance. |
| `plugin-creator` | Custom plugin creation workflow guidance. |
| `auditing` | Performance, accessibility, and frontend audit workflow guidance. |
| `studio` | WordPress Studio CLI and MCP usage guidance, including fallback behavior when MCP is unavailable. |

## Core concepts for maintainers

### WordPress Studio is the runtime integration

Build with WordPress does not create or host WordPress sites itself. Generated packages instruct agents to use WordPress Studio as the runtime for:

- creating and managing local WordPress sites;
- inspecting screenshots;
- validating blocks;
- running WP-CLI through the MCP server;
- falling back to the Studio CLI when the MCP server is not available.

The read-only `studio` context evidence confirms that Studio owns a CLI MCP command surface at `apps/cli/commands/mcp.ts`, agent tool definitions under `apps/cli/ai/tools/**`, and prompt/evaluation configuration under `apps/cli/ai/system-prompt.ts` and `eval/promptfoo.config.yaml`. Build with WordPress should therefore document and generate the agent-facing integration layer without claiming ownership of Studio internals.

### Skills are portable source; generated placement is surface-specific

The same skill source may appear as:

- `skills/<skill>/SKILL.md`
- `.agents/skills/<skill>/SKILL.md`
- `.cline/skills/<skill>/SKILL.md`
- `.devin/skills/<skill>/SKILL.md`
- `.kilo/skills/<skill>/SKILL.md`
- `.junie/skills/<skill>/SKILL.md`
- package-specific plugin skill directories such as the Codex `wordpress-studio` plugin.

Do not encode behavior that only works in one surface unless the generator maps it to a surface-specific file or setup note. Keep portable WordPress behavior in `skills/`; keep placement and packaging details in `scripts/build-plugins.mjs`.

### MCP is preferred when supported

Generated packages prefer Studio MCP because it gives agents structured access to site operations instead of relying on filesystem guesses. MCP-enabled outputs should configure:

- `wordpress-studio` for `studio mcp`.
- `wordpress-telemetry` for local workflow telemetry.

Some agent surfaces cannot express repository-local MCP config. For those outputs, generate setup guidance using that surface's supported installation or provider settings path.

## Integration surfaces

The current generated surfaces are listed in the top-level README and [Generated outputs](generated-outputs.md). They fall into a few practical groups:

| Group | Examples | Integration style |
| --- | --- | --- |
| Plugin or marketplace packages | Codex, Claude Code, Cursor, Factory, Hermes, OpenClaw, Pi | Generated manifests, package metadata, marketplace entries, and skills. |
| Workspace instruction surfaces | Aider, Gemini, Qodo, Zed | Generated agent instructions plus skills or setup notes. |
| MCP-configurable workspaces | Amp, Cline, Continue, Copilot, Devin, Junie, Kilo Code, OpenCode, Roo Code, Windsurf | Generated MCP config in the agent's native location plus skills/instructions. |
| App/provider configured surfaces | Conductor and some Qodo use cases | Generated setup notes or settings where repository-local MCP config is not the supported path. |

When adding a surface, first identify which group the agent belongs to, then implement the native output shape and verification checks for that group.

## Skill packaging relationship to WordPress agent skills

The read-only `wordpress-agent-skills` context evidence shows a related packaging model with skill sources under `skills/**`, packaging documentation in `docs/packaging.md`, and maintenance automation in `.github/workflows/ai-skill-maintenance.yml`. Build with WordPress follows the same broad principle: author shared skill content once, then package it for downstream tools. This repository's implementation is specific to WordPress Studio and the coding-agent surfaces listed in `plugins/`.

## Public integration contracts

### Studio MCP contract

Generated MCP entries should expose a server named `wordpress-studio` that launches Studio's MCP command, typically equivalent to:

```json
{
  "wordpress-studio": {
    "command": "studio",
    "args": ["mcp"]
  }
}
```

Surface-specific files may encode that command differently. For example, verification expects OpenCode's `wordpress-studio` MCP entry to be local and to use command array syntax that joins to `studio mcp`.

### WP-CLI access contract

Generated guidance should treat WP-CLI as available through the Studio MCP server where Studio exposes it. Agents should use WP-CLI through MCP as the general-purpose WordPress escape hatch rather than assuming a direct shell path into the user's site.

### Telemetry MCP contract

Generated MCP entries should expose `wordpress-telemetry` alongside `wordpress-studio` where MCP is supported. The telemetry tool is documented in [Generated outputs](generated-outputs.md#telemetry-mcp-tool-reference).

### Design preview contract

The shared WordPress workflow can produce three design preview directions before implementation. Keep this as a first-class concept when updating site or theme creation guidance so agents do not jump straight to a single implementation without exploring alternatives when the workflow calls for previews.

## Common change patterns

### Add or update a skill

1. Edit the relevant `skills/<skill>/SKILL.md` file, or create a new skill directory with `SKILL.md`.
2. Update `scripts/build-plugins.mjs` if a surface needs a new placement rule or manifest reference.
3. Run `pnpm build`.
4. Run `pnpm verify`.
5. Inspect generated packages for each surface that should contain the skill.
6. Update docs when the public workflow or generated-output contract changes.

### Update Studio integration behavior

1. Confirm the behavior in the `studio` context source when it depends on Studio-owned CLI or MCP behavior.
2. Update shared guidance in `skills/studio/` or related workflow skills.
3. Update generated MCP config logic in `scripts/build-plugins.mjs` if server names, commands, or args change.
4. Update verification in `scripts/verify-plugins.mjs` so the new contract is executable.
5. Run `pnpm build && pnpm verify`.

### Add an agent surface

1. Decide the native integration style: plugin package, workspace instructions, MCP config, marketplace metadata, or setup guidance.
2. Add a generated output directory under `plugins/<surface>/` through `scripts/build-plugins.mjs`.
3. Include shared skills if the surface supports them.
4. Configure `wordpress-studio` and `wordpress-telemetry` if the surface supports MCP.
5. Add verification for the generated files users or marketplaces will consume.
6. Document the new surface in `README.md` and [Generated outputs](generated-outputs.md).

## Safe extension boundaries

- Add reusable WordPress behavior in `skills/`.
- Add output placement, manifests, package metadata, and setup files in `scripts/build-plugins.mjs`.
- Add executable checks in `scripts/verify-plugins.mjs`.
- Do not rely on generated package edits that are not reproduced by the generator.
- Do not move Studio-owned behavior into this repository; reference Studio capabilities through generated guidance and MCP configuration.

## Related documentation

- [Architecture](architecture.md)
- [Generated outputs](generated-outputs.md)
- [Contributor workflows](contributor-workflows.md)
