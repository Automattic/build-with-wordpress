# Architecture

Build with WordPress is the source repository for WordPress-focused agent skills and the generated packages that adapt those skills to different coding-agent surfaces. The source of truth is intentionally small:

- `skills/` contains portable WordPress workflow guidance.
- `scripts/` contains the shared MCP setup contract, generators, and verification code.
- `plugins/` contains generated, agent-native output packages.
- `package.json` exposes the build, telemetry build, verification, and Cursor export commands.

The top-level `README.md` is the adoption entry point. This page explains how the repository is organized for maintainers who need to change the shared skills, generator logic, or generated output contracts.

## Product and package names

Repository-native names used across the source and generated outputs:

| Name | Where it appears | Responsibility |
| --- | --- | --- |
| Build with WordPress | Repository and docs | Canonical source for shared WordPress agent skills, Studio MCP setup, telemetry packaging, and generated agent packages. |
| WordPress Studio | Generated instructions and MCP configuration | Runtime used by agents for site management, screenshots, block validation, and WP-CLI access. Studio owns the `studio` CLI and `studio mcp` server. |
| `wordpress-studio` | MCP config and plugin manifests | Agent-facing MCP server entry that launches `studio mcp`. |
| `wordpress-telemetry` | MCP config and telemetry server source | Local MCP server bundled by this repo to record workflow milestones. |
| `record_workflow_event` | `scripts/wordpress-telemetry-mcp.mjs` | Telemetry tool that accepts a workflow slug and `started` or `completed` stage. |
| `agent-build-plugin` | Telemetry group | Pixel stat group used by the local telemetry server. |

## Source layout

```text
.
├── README.md
├── package.json
├── scripts/
│   ├── build-plugins.mjs
│   ├── build-telemetry-mcp.mjs
│   ├── export-cursor-plugin.mjs
│   ├── mcp-setup-contract.mjs
│   ├── verify-plugins.mjs
│   └── wordpress-telemetry-mcp.mjs
├── skills/
│   ├── auditing/
│   ├── block-creator/
│   ├── design-previews-creator/
│   ├── plugin-creator/
│   ├── site-creator/
│   ├── studio/
│   ├── theme-creator/
│   └── wordpress-creator/
└── plugins/
    ├── aider/
    ├── amp/
    ├── claude-code/
    ├── cline/
    ├── codex/
    ├── conductor/
    ├── continue/
    ├── copilot/
    ├── cursor/
    ├── devin/
    ├── factory/
    ├── gemini/
    ├── hermes/
    ├── junie/
    ├── kilo-code/
    ├── openclaw/
    ├── opencode/
    ├── pi/
    ├── qodo/
    ├── roo-code/
    ├── windsurf/
    └── zed/
```

## Architectural boundaries

### Portable skill source

`skills/` is the authoring boundary for reusable WordPress behavior. Each skill is a directory with a `SKILL.md` file that is copied or transformed into agent-specific locations by `scripts/build-plugins.mjs`. The current skill set covers:

- `wordpress-creator`: routing and high-level WordPress creation workflow guidance.
- `site-creator`: site-building workflow guidance.
- `theme-creator`: block theme creation and editing guidance.
- `design-previews-creator`: three-direction design preview workflow before theme implementation.
- `block-creator`: custom block creation workflow guidance.
- `plugin-creator`: custom plugin creation workflow guidance.
- `auditing`: performance, accessibility, and frontend audit guidance.
- `studio`: Studio CLI and Studio MCP usage guidance, including fallback behavior when MCP is unavailable.

### Generator boundary

`scripts/build-plugins.mjs` owns the mapping from shared skills and repository constants to files under `plugins/`. It packages the same WordPress behavior through each agent's native conventions instead of forcing one universal plugin shape.

The generator also wires MCP-enabled packages to the generated telemetry artifact and to the Studio MCP command through `scripts/mcp-setup-contract.mjs`. The contract owns shared server names, the `studio mcp` command, surface-specific config wrappers, and `createTelemetryBootstrapArgs()`, which compresses `dist/wordpress-telemetry-mcp.mjs` into an inline Node `--eval` bootstrap for each surface. Generated packages do not carry a copy of `scripts/wordpress-telemetry-mcp.mjs`. The build command in `package.json` always builds telemetry first and plugin outputs second:

```bash
pnpm build
# node scripts/build-telemetry-mcp.mjs && node scripts/build-plugins.mjs
```

### Verification boundary

`scripts/verify-plugins.mjs` is the executable contract for generated outputs. It checks that generated packages contain required files, copied skills, MCP server entries, manifests, marketplace metadata, and surface-specific conventions. Verification reads the shared skill directory and expects generated packages to contain the same skill names where that surface supports skills.

Important verification behaviors include:

- `verifySharedSkillSet()` checks that every shared skill has a generated `SKILL.md` in a surface's skill directory.
- `verifyMcpConfig()` checks that JSON MCP configs expose a server wrapper and both shared WordPress MCP entries from `scripts/mcp-setup-contract.mjs`.
- `verifyTelemetryScript()` prevents generated packages from copying `scripts/wordpress-telemetry-mcp.mjs` directly; MCP configs should embed the bootstrap generated from the shared built artifact instead.
- Surface-specific checks validate manifest names, display names, schema URLs, command shapes, package metadata, and expected setup files.

### Generated output boundary

`plugins/` is generated output. Maintainers should change source skills and generator code, run `pnpm build`, and then verify the resulting package tree. Direct edits inside generated packages are likely to be overwritten by the next build unless the generator is updated to reproduce them.

### Telemetry boundary

`scripts/wordpress-telemetry-mcp.mjs` is a local MCP server. It is bundled by `scripts/build-telemetry-mcp.mjs` into `dist/wordpress-telemetry-mcp.mjs` for generated MCP configurations. The server exposes one tool, `record_workflow_event`, and sends non-blocking pixel requests to `https://pixel.wp.com/g.gif` unless `WP_SITE_CREATOR_NO_TELEMETRY=1` is present.

Telemetry is deliberately non-critical: network failures are swallowed and should not break agent workflows.

## Runtime data flow

```text
Maintainer edits skills/ or scripts/
        │
        ▼
pnpm build
        │
        ├── scripts/build-telemetry-mcp.mjs bundles scripts/wordpress-telemetry-mcp.mjs
        │       into dist/wordpress-telemetry-mcp.mjs
        │
        └── scripts/build-plugins.mjs writes agent-native packages in plugins/
                using shared skills, Studio MCP entries, telemetry MCP entries,
                manifests, instructions, and setup files
        │
        ▼
pnpm verify
        │
        └── scripts/verify-plugins.mjs checks generated files, skill coverage,
            MCP configuration, manifests, and surface-specific contracts
```

At agent runtime, the generated package tells the selected coding agent how to perform WordPress work. Where the surface supports MCP, the package configures:

- `wordpress-studio`, usually launching `studio mcp` for Studio-owned site operations and WP-CLI access.
- `wordpress-telemetry`, launching the inline telemetry bootstrap with a surface identifier.

If Studio MCP is unavailable, shared Studio guidance directs agents to use the Studio CLI path instead of inventing file-only workflows.

## Permission, auth, and storage boundaries

Build with WordPress does not own WordPress site storage, Studio authentication, or WordPress.com authentication. Those responsibilities live in WordPress Studio and the user's environment. This repository owns generated files that point agents at Studio and explain how to use Studio safely.

Generated output packages are repository-local files. Some agents consume package metadata or marketplace manifests, while other agents consume workspace instructions, MCP config files, or setup notes. The verification script documents which boundary each surface currently supports.

## Failure modes and invariants

| Area | Failure mode | Invariant or recovery path |
| --- | --- | --- |
| Build order | Plugin outputs reference a telemetry artifact that has not been bundled. | Use `pnpm build`, which runs telemetry bundling before plugin generation. |
| Skill drift | A shared skill is added but not present in generated packages. | `pnpm verify` compares generated skill directories against `skills/`. |
| MCP drift | A generated MCP config omits `wordpress-studio` or `wordpress-telemetry`. | The verifier imports the shared MCP setup contract and fails the surface-specific check. |
| Telemetry copy drift | Generated packages copy source telemetry server code instead of using the built artifact. | `verifyTelemetryScript()` fails if `scripts/wordpress-telemetry-mcp.mjs` appears inside a plugin package. |
| Telemetry network failure | Pixel request fails or times out. | The telemetry server catches request errors and never blocks the workflow. |
| Telemetry opt-out | A user disables telemetry. | `WP_SITE_CREATOR_NO_TELEMETRY=1` returns a skipped message from `record_workflow_event`. |
| Surface limitations | An agent has no repository-local MCP mechanism. | The generated package uses that surface's supported setup path or documentation rather than inventing unsupported config. |

## Design principles for contributors

- Keep `skills/` as the portable behavior source and `plugins/` as generated output.
- Prefer native agent conventions for each surface over one generic package format.
- Treat `pnpm verify` as the authoritative generated-output contract.
- Keep Studio-owned behavior in Studio and agent-facing integration guidance in this repository.
- Make telemetry non-blocking and easy to opt out of.
- Document surface limitations explicitly when an agent cannot support the same MCP or plugin shape as another surface.

## Related documentation

- [Generated outputs](generated-outputs.md)
- [Skills and integrations](skills-and-integrations.md)
- [Contributor workflows](contributor-workflows.md)
