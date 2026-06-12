# WordPress Studio for Pi

This Pi package shares the Build with WordPress skills with the official Pi coding-agent surface.

## Official Pi surface

Pi's official coding-agent package is `@earendil-works/pi-coding-agent`, documented at https://pi.dev/docs/latest and implemented in https://github.com/earendil-works/pi/tree/main/packages/coding-agent.

The official Pi documentation describes these compatible extension points:

- repo instructions through `AGENTS.md` or `CLAUDE.md`
- Agent Skills loaded from `skills/` directories or package manifests
- TypeScript extensions for custom tools, commands, events, providers, and UI
- prompt templates and themes
- Pi packages installed from npm, git, or local paths

## Install

From this repository after `pnpm build`:

```bash
pi install ./plugins/pi
```

For a project-local install, use:

```bash
pi install -l ./plugins/pi
```

## Compatibility path

This output is intentionally a skills-only Pi package. Pi's official docs state that Pi has no built-in MCP support; MCP support should be built as a TypeScript extension if we want Pi to call the WordPress Studio MCP server directly.

Until that extension exists, use these skills as Pi-readable WordPress workflows and use the Studio CLI fallback paths documented in the shared `studio` skill when MCP tools are unavailable.

## Included skills

- `auditing`
- `block-creator`
- `design-previews-creator`
- `plugin-creator`
- `site-creator`
- `studio`
- `theme-creator`
- `wordpress-creator`
