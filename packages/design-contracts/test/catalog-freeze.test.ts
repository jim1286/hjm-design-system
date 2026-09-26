import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { componentCatalog } from "../src/catalog.js";

/**
 * 카탈로그 확장 동결(docs/catalog-freeze.json). 2026-09-26 점검에서 폭은 111개인데 여러 제품이 쓰는
 * 핵심이 beta에 묶여 있어, 핵심을 먼저 승격하기로 했다. 항목 삭제는 막지 않고 추가만 막는다.
 */
describe("catalog expansion freeze", () => {
  it("adds no catalog entry outside the frozen list or a recorded exception", async () => {
    const freeze = JSON.parse(await readFile(new URL("../docs/catalog-freeze.json", import.meta.url), "utf8")) as {
      names: string[];
      exceptions: { name: string; date: string; rationale: string }[];
    };
    for (const exception of freeze.exceptions) {
      expect(exception.rationale.trim(), exception.name).not.toBe("");
    }
    const allowed = new Set([...freeze.names, ...freeze.exceptions.map(({ name }) => name)]);
    const added = componentCatalog.map(({ name }) => name).filter((name) => !allowed.has(name));
    expect(added, "record the decision in docs/catalog-freeze.json exceptions before adding").toEqual([]);
  });
});
