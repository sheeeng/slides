// Renders a Marp deck with Git metadata in the footer.
// Usage: node scripts/marp-with-git-sha.mjs PITCHME.md [marp options]

import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const sourcePath = resolve(process.argv[2]);
const sourceDirectory = dirname(sourcePath);

function gitRevision(reference) {
  return execFileSync("git", ["rev-parse", reference], {
    cwd: sourceDirectory,
    encoding: "utf8",
  }).trim();
}

const fullRevision = process.env.GITHUB_SHA || process.env.GIT_REVISION || gitRevision("HEAD");
const shortRevision = process.env.GIT_SHA || process.env.BUILD_SHA || fullRevision.slice(0, 8);
const source = readFileSync(sourcePath, "utf8")
  .replaceAll("__GIT_SHA__", shortRevision)
  .replaceAll("__GIT_REVISION__", fullRevision);
const temporarySourcePath = resolve(sourceDirectory, `.marp-pitchme-${shortRevision}.md`);

writeFileSync(temporarySourcePath, source);
try {
  execFileSync(
    "npm",
    ["exec", "--", "marp", "--no-stdin", temporarySourcePath, ...process.argv.slice(3)],
    { cwd: sourceDirectory, stdio: "inherit" },
  );
} finally {
  rmSync(temporarySourcePath, { force: true });
}
