import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const script = "scripts/check-usage-docs.mjs";

test("selected guide audit accepts shared executable examples without rewriting the index", () => {
  const index = new URL("../packages/design-contracts/docs/usage/README.md", import.meta.url);
  const before = readFileSync(index, "utf8");
  const output = execFileSync(process.execPath, [script, "--files",
    "packages/design-contracts/docs/usage/components/settings-screen.md",
    "packages/design-contracts/docs/usage/screens/common-settings.md",
  ], { cwd: root, encoding: "utf8" });
  assert.match(output, /선택 지침 2개/);
  assert.equal(readFileSync(index, "utf8"), before);
});

test("a missing selected document fails instead of reporting an empty success", () => {
  const result = spawnSync(process.execPath, [script, "--files", "packages/design-contracts/docs/usage/screens/missing-guide.md"], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /검사 대상 지침 없음/);
});

test("an empty selection cannot silently run the full audit", () => {
  const result = spawnSync(process.execPath, [script, "--files"], { cwd: root, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /--files requires usage document paths/);
});
