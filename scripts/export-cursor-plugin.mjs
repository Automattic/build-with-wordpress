import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const cursorPrefix = "plugins/cursor";
const defaultRemote = "https://github.com/Automattic/wordpress-cursor-plugin.git";
const defaultBranch = "sync/from-build-with-wordpress";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const remote = readOption("--remote") ?? defaultRemote;
const branch = readOption("--branch") ?? defaultBranch;
const splitBranch = `export-wordpress-cursor-plugin-${Date.now()}`;

if (!existsSync(cursorPrefix)) {
  throw new Error(`${cursorPrefix} does not exist. Run pnpm build first.`);
}

if (!dryRun) {
  const status = run("git", ["status", "--porcelain"], { capture: true });
  if (status.trim()) {
    throw new Error("Working tree must be clean before exporting the Cursor plugin.");
  }
}

runStep("Create subtree split", ["git", "subtree", "split", `--prefix=${cursorPrefix}`, "-b", splitBranch]);
runStep("Push split branch", ["git", "push", remote, `${splitBranch}:refs/heads/${branch}`]);
runStep("Remove local split branch", ["git", "branch", "-D", splitBranch]);

console.log(`Cursor plugin export branch: ${branch}`);
console.log("Open or update a PR in https://github.com/Automattic/wordpress-cursor-plugin");

function readOption(name) {
  const index = args.indexOf(name);
  if (index === -1) {
    return undefined;
  }
  return args[index + 1];
}

function runStep(label, command) {
  console.log(`${label}: ${command.join(" ")}`);
  if (dryRun) {
    return;
  }
  run(command[0], command.slice(1));
}

function run(command, commandArgs, options = {}) {
  return execFileSync(command, commandArgs, {
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "inherit"] : "inherit",
  });
}
