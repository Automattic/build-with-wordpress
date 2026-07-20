import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

const root = resolve(new URL("..", import.meta.url).pathname)
const docsAgentRevision = "f887e392ad93db11efb997ed3669171e67018403"
const docsAgentPackageRevision = "a39d9db230eb9e0b72ed84465f4d61bd8dda1bab"
const wpCodeboxProducerRevision = "a6fe2d208e990a8d04104aa74aacbb8d1539fbc1"
const wpCodeboxWorkflowRef = wpCodeboxProducerRevision
const wpCodeboxReleaseRef = "v0.12.29"
const docsAgentDir = process.env.DOCS_AGENT_DIR
const wpCodeboxDir = process.env.WP_CODEBOX_DIR

assert.ok(docsAgentDir, "DOCS_AGENT_DIR must point to the pinned Docs Agent checkout")
assert.ok(wpCodeboxDir, "WP_CODEBOX_DIR must point to the pinned WP Codebox checkout")

const revision = (directory) => execFileSync("git", ["-C", directory, "rev-parse", "HEAD"], { encoding: "utf8" }).trim()
const readJson = async (directory, path) => JSON.parse(await readFile(resolve(directory, path), "utf8"))

assert.equal(revision(docsAgentDir), docsAgentRevision, "Docs Agent checkout must match the declared producer revision")
assert.equal(revision(wpCodeboxDir), wpCodeboxProducerRevision, "WP Codebox checkout must match the immutable producer revision")

const docsAgentWorkflow = await readFile(resolve(docsAgentDir, ".github/workflows/maintain-docs.yml"), "utf8")
const wpCodeboxContract = await readJson(wpCodeboxDir, "contracts/run-agent-task-reusable-workflow-interface.v1.json")
assert.equal(wpCodeboxContract.schema, "wp-codebox/reusable-workflow-interface/v1")
assert.match(docsAgentWorkflow, new RegExp(`uses: Automattic/wp-codebox/.github/workflows/run-agent-task.yml@${wpCodeboxWorkflowRef}`))
assert.match(docsAgentWorkflow, new RegExp(`wp_codebox_release_ref: ${wpCodeboxReleaseRef}`))
assert.match(docsAgentWorkflow, new RegExp(`wp_codebox_workflow_ref: ${wpCodeboxProducerRevision}`))
assert.match(docsAgentWorkflow, new RegExp(`DOCS_AGENT_PACKAGE_REVISION: ${docsAgentPackageRevision}`))
assert.match(docsAgentWorkflow, /OPENAI_API_KEY: \$\{\{ secrets\.OPENAI_API_KEY \}\}/)
assert.match(docsAgentWorkflow, /ACCESS_TOKEN: \$\{\{ github\.token \}\}/)
assert.match(docsAgentWorkflow, /EXTERNAL_PACKAGE_SOURCE_POLICY: \$\{\{ secrets\.EXTERNAL_PACKAGE_SOURCE_POLICY \}\}/)

const docsAgentInputsBlock = docsAgentWorkflow.match(/    inputs:\n([\s\S]*?)    secrets:/)?.[1]
const docsAgentSecretsBlock = docsAgentWorkflow.match(/    secrets:\n([\s\S]*?)    outputs:/)?.[1]
assert.ok(docsAgentInputsBlock, "Docs Agent must declare reusable-workflow inputs")
assert.ok(docsAgentSecretsBlock, "Docs Agent must declare reusable-workflow secrets")
const docsAgentInputs = [...docsAgentInputsBlock.matchAll(/^      ([a-z_]+):/gm)].map((match) => match[1])
const docsAgentSecrets = [...docsAgentSecretsBlock.matchAll(/^      ([A-Z_]+):/gm)].map((match) => match[1])
const producerSecrets = Object.keys(wpCodeboxContract.secrets)
const requiredProducerSecrets = Object.entries(wpCodeboxContract.secrets)
  .filter(([, definition]) => definition.required)
  .map(([name]) => name)
const workflows = [
  {
    path: ".github/workflows/developer-docs-agent.yml",
    audience: "technical",
    runKind: true,
    revision: docsAgentRevision,
    writablePaths: "README.md,docs/**,plugins/**/README.md",
    driftCheck: "git diff --exit-code -- . ':(top,exclude)README.md' ':(top,glob,exclude)docs/**' ':(top,glob,exclude)plugins/**/README.md'",
    sourceDelta: /"id": "figma-studio-handoff-diagnostics"[\s\S]*"https:\/\/github\.com\/Automattic\/build-with-wordpress\/pull\/100"[\s\S]*"requires_documentation_change": true/,
    bootstrapContract: true,
  },
  {
    path: ".github/workflows/skills-agent.yml",
    audience: "skills",
    runKind: false,
    revision: docsAgentRevision,
    writablePaths: "skills/**,plugins/**/skills/**,plugins/**/README.md",
    driftCheck: "git diff --exit-code",
    sourceDelta: /"id":"skills-source".*"requires_documentation_change":false/,
    bootstrapContract: false,
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

  assert.match(source, new RegExp(`uses: Automattic/docs-agent/.github/workflows/maintain-docs.yml@${workflow.revision}`))
  assert.deepEqual(usedInputs, [...new Set(usedInputs)], `${workflow.path} must not declare an input twice`)
  assert.ok(usedInputs.every((input) => docsAgentInputs.includes(input) || input === "validation_dependencies"), `${workflow.path} uses an input absent from the Docs Agent schema`)
  assert.deepEqual(usedSecrets, ["OPENAI_API_KEY", "EXTERNAL_PACKAGE_SOURCE_POLICY"], `${workflow.path} must forward the Docs Agent secrets`)
  assert.ok(usedSecrets.every((secret) => docsAgentSecrets.includes(secret)), `${workflow.path} forwards a secret absent from the Docs Agent schema`)
  assert.ok(usedSecrets.every((secret) => producerSecrets.includes(secret) || secret === "EXTERNAL_PACKAGE_SOURCE_POLICY"), `${workflow.path} forwards a secret absent from the producer schema`)
  assert.ok(requiredProducerSecrets.includes("EXTERNAL_PACKAGE_SOURCE_POLICY"), "WP Codebox must require the external package policy")
  assert.match(source, new RegExp(`audience: ${workflow.audience}`))
  assert.match(source, new RegExp(`writable_paths: ${workflow.writablePaths.replaceAll("*", "\\*")}`))
  assert.match(source, /base_ref: trunk/)
  assert.match(source, /docs_branch: docs-agent\/build-with-wordpress-/)
  assert.match(source, /pnpm install --frozen-lockfile/)
  assert.match(source, /pnpm build/)
  assert.match(source, /pnpm verify/)
  assert.match(source, /validation_dependencies: npm install --global pnpm@10\.8\.1/)
  assert.ok(source.includes(`"command": "${workflow.driftCheck}"`), `${workflow.path} must use its scoped drift check`)
  assert.match(source, workflow.sourceDelta, `${workflow.path} must declare its bounded source delta`)
  assert.match(source, /permissions:\n  contents: write\n  pull-requests: write\n  issues: write/)
  assert.match(source, /OPENAI_API_KEY: \$\{\{ secrets\.OPENAI_API_KEY \}\}/)
  assert.match(source, /EXTERNAL_PACKAGE_SOURCE_POLICY: \$\{\{ secrets\.EXTERNAL_PACKAGE_SOURCE_POLICY \}\}/)
  assert.doesNotMatch(source, /ACCESS_TOKEN/)
  assert.doesNotMatch(source, /docs_agent_ref/)
  assert.doesNotMatch(source, /runtime-agent-full-run|runtime_(?:provider|profile|profiles|execution|dependencies|task|config)|datamachine|homeboy/i)

  if (workflow.runKind) {
    const dispatchInputs = source.match(/  workflow_dispatch:\n    inputs:\n([\s\S]*?)  push:/)?.[1]
    assert.ok(dispatchInputs, "Developer Docs workflow must offer a manual run mode")
    assert.match(dispatchInputs, /      run_kind:\n        description: Documentation run mode\n        required: false\n        default: maintenance\n        type: choice\n        options:\n          - maintenance\n          - bootstrap/)
    assert.match(source, /run_kind: \$\{\{ github\.event\.inputs\.run_kind \|\| 'maintenance' \}\}/)
    assert.match(source, /require_pr: \$\{\{ github\.event_name == 'workflow_dispatch' \}\}/)
    assert.match(source, /bootstrap_contract:[\s\S]*"required_paths": \["README\.md", "docs\/README\.md"\][\s\S]*"pattern": "docs\/\*\*\/\*\.md"[\s\S]*"path": "README\.md", "must_link_to": \["docs\/README\.md"\]/)
  } else {
    assert.doesNotMatch(source, /^      run_kind:/m)
    assert.doesNotMatch(source, /^      require_pr:/m)
    assert.doesNotMatch(source, /^      bootstrap_contract:/m)
  }
}

console.log("Docs Agent and WP Codebox producer contract validation passed")
