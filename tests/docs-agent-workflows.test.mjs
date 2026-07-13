import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

const root = resolve(new URL("..", import.meta.url).pathname)
const fixture = JSON.parse(await readFile(resolve(root, "tests/fixtures/docs-agent-maintain-docs-interface.v1.json"), "utf8"))
const workflows = [
  {
    path: ".github/workflows/developer-docs-agent.yml",
    audience: "technical",
    runKind: true,
    writablePaths: "README.md,docs/**,plugins/**/README.md",
  },
  {
    path: ".github/workflows/skills-agent.yml",
    audience: "skills",
    runKind: false,
    writablePaths: "skills/**,plugins/**/skills/**,plugins/**/README.md",
  },
]

for (const workflow of workflows) {
  const source = await readFile(resolve(root, workflow.path), "utf8")
  const withBlock = source.match(/    with:\n([\s\S]*?)    secrets:/)?.[1]
  const secretsBlock = source.match(/    secrets:\n([\s\S]*)$/)?.[1]
  assert.ok(withBlock, `${workflow.path} must call the producer with inputs`)
  assert.ok(secretsBlock, `${workflow.path} must forward producer secrets`)
  const usedInputs = [...withBlock.matchAll(/^      ([a-z_]+):/gm)].map((match) => match[1])
  const usedSecrets = [...secretsBlock.matchAll(/^      ([A-Z_]+):/gm)].map((match) => match[1])

  assert.match(source, new RegExp(`uses: ${fixture.producer}/${fixture.workflow}@${fixture.producer_ref}`))
  assert.deepEqual(usedInputs, [...new Set(usedInputs)], `${workflow.path} must not declare an input twice`)
  assert.ok(usedInputs.every((input) => fixture.inputs.includes(input)), `${workflow.path} uses an input absent from the producer schema`)
  assert.deepEqual(usedSecrets, fixture.secrets, `${workflow.path} must forward the producer secrets`)
  assert.match(source, new RegExp(`audience: ${workflow.audience}`))
  assert.match(source, new RegExp(`writable_paths: ${workflow.writablePaths.replaceAll("*", "\\*")}`))
  assert.match(source, /base_ref: trunk/)
  assert.match(source, /docs_branch: docs-agent\/build-with-wordpress-/)
  assert.match(source, /pnpm install --frozen-lockfile/)
  assert.match(source, /pnpm build/)
  assert.match(source, /pnpm verify/)
  assert.match(source, /git diff --exit-code/)
  assert.doesNotMatch(source, /docs_agent_ref/)
  assert.doesNotMatch(source, /runtime-agent-full-run|runtime_(?:provider|profile|profiles|execution|dependencies|task|config)|datamachine|homeboy/i)

  if (workflow.runKind) {
    assert.match(source, /run_kind: \$\{\{ github\.event_name == 'workflow_dispatch' && 'bootstrap' \|\| 'maintenance' \}\}/)
  } else {
    assert.doesNotMatch(source, /^      run_kind:/m)
  }
}

console.log("Docs Agent workflow producer contract test ok")
