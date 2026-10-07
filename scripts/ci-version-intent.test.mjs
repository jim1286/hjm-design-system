import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { assessVersionIntent, readVersionsAt, releaseManifestPaths } from "./ci-version-intent.mjs";

const train = (version) => [version, version, version];
const push = (before, after) => assessVersionIntent({ eventName: "push", beforeVersions: train(before), afterVersions: train(after) });

test("unchanged version skips quality work even when a manifest changes", () => {
  assert.deepEqual(push("1.14.0", "1.14.0"), { run: false, reason: "version-unchanged", before: "1.14.0", after: "1.14.0" });
});
for (const [before, after] of [["1.14.0", "1.14.1"], ["1.14.9", "1.15.0"], ["1.99.9", "2.0.0"], ["1.9.0", "1.10.0"]]) {
  test(`actual version increase ${before} -> ${after} runs checks`, () => {
    assert.equal(push(before, after).run, true);
  });
}
test("explicit manual diagnostics run without a previous commit", () => {
  assert.deepEqual(assessVersionIntent({ eventName: "workflow_dispatch", afterVersions: train("1.14.0") }), { run: true, reason: "manual", after: "1.14.0" });
});
for (const [name, input, expected] of [
  ["pull requests", { eventName: "pull_request", afterVersions: train("1.14.0") }, /Unsupported/],
  ["version downgrade", { eventName: "push", beforeVersions: train("1.14.1"), afterVersions: train("1.14.0") }, /decreased/],
  ["missing previous evidence", { eventName: "push", afterVersions: train("1.14.0") }, /Previous/],
  ["incomplete fixed train", { eventName: "push", beforeVersions: train("1.14.0"), afterVersions: ["1.14.1"] }, /all three/],
  ["mixed current versions", { eventName: "push", beforeVersions: train("1.14.0"), afterVersions: ["1.14.0", "1.14.1", "1.14.1"] }, /must agree/],
  ["mixed previous versions", { eventName: "push", beforeVersions: ["1.14.0", "1.13.0", "1.14.0"], afterVersions: train("1.14.1") }, /must agree/],
  ["invalid versions", { eventName: "push", beforeVersions: train("1.14.0"), afterVersions: train("1.014.1") }, /stable/],
  ["prerelease train", { eventName: "workflow_dispatch", afterVersions: train("1.15.0-beta.1") }, /stable/],
]) {
  test(`${name} fails without authorizing quality work`, () => assert.throws(() => assessVersionIntent(input), expected));
}

test("Git reads compare the push base across multiple commits and ignore dependency-only changes", () => {
  const directory = mkdtempSync(join(tmpdir(), "hjm-version-intent-"));
  const git = (...args) => execFileSync("git", args, { cwd: directory, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  const commit = (version, dependency) => {
    for (const path of releaseManifestPaths) {
      mkdirSync(dirname(join(directory, path)), { recursive: true });
      writeFileSync(join(directory, path), JSON.stringify({ version, dependencies: { example: dependency } }));
    }
    git("add", "packages");
    git("commit", "-m", `fixture ${version} ${dependency}`);
    return git("rev-parse", "HEAD");
  };
  try {
    git("init");
    git("config", "user.name", "Version intent fixture");
    git("config", "user.email", "fixture@example.invalid");
    const base = commit("1.14.0", "1");
    const config = commit("1.14.0", "2");
    const bumped = commit("1.14.1", "2");
    const head = commit("1.14.1", "3");
    const inspect = (before, after) => assessVersionIntent({ eventName: "push", beforeVersions: readVersionsAt(directory, before), afterVersions: readVersionsAt(directory, after) });
    assert.equal(inspect(base, config).run, false);
    assert.equal(inspect(bumped, head).run, false);
    assert.equal(inspect(base, head).run, true);
    assert.throws(() => readVersionsAt(directory, "0".repeat(40)), /real commit/);
    assert.throws(() => readVersionsAt(directory, "--help"), /real commit/);
    assert.throws(() => readVersionsAt(directory, "f".repeat(40)));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
