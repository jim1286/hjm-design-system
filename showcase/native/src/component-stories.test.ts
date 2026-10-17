import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { join } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const sourceRoot = fileURLToPath(new URL(".", import.meta.url));
describe("individual native component navigation", () => {
  // Canonical coverage and navigation are checked against catalog surface support by check-storybook S9.
  // Do not maintain a second file allowlist or require retired maximum-text fixtures here.
  it("isolates individual renderers and preserves overlay opening actions", () => {
    // Dialog and AlertDialog examples live in dialog-examples.tsx since fde269f2 (2026-10-13); read both sources.
    const asts = ["component-examples.tsx", "dialog-examples.tsx"].map(file =>
      ts.createSourceFile(file, readFileSync(join(sourceRoot, file), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX));
    const fixture = (name: string) => asts.flatMap(ast => ast.statements
      .filter((node): node is ts.FunctionDeclaration => ts.isFunctionDeclaration(node) && node.name?.text === name)
      .map(node => node.getText(ast)))[0];
    expect(fixture("ButtonExample")).toContain('<Button disabled={variant === "disabled"} loading={variant === "loading"}');
    expect(fixture("ButtonExample")).not.toContain("<IconButton");
    expect(fixture("AvatarExample")).not.toContain("<Badge");
    expect(fixture("FieldExample")).toContain('variant === "error"');
    for (const [name, setter] of [["DialogExample", "setOpen"], ["AlertDialogExample", "setOpen"], ["SheetExample", "setSheetOpen"]]) {
      expect(fixture(name!)).toContain(`${setter}(true)`);
      expect(fixture(name!)).toMatch(new RegExp(`onOpenChange=\\{(${setter}|\\(next\\) => \\{ ${setter}\\(next\\); \\})\\}`));
    }
  });
});

it("keeps optional Liquid Toast as an enhanced fixture, not a Toast export", () => {
  // The menu position and the three required stories are scripts/check-storybook.mjs S1·S4·S6 (2026-10-06).
  const source = readFileSync(join(sourceRoot, "LiquidToast.stories.tsx"), "utf8");
  expect(source).toContain("enhanced: true");
  expect(readFileSync(join(sourceRoot, "components/Toast.stories.tsx"), "utf8")).not.toContain("export const Liquid:");
});

it("follows the Storybook navigation spec for every Native story file and the Native preview", async () => {
  // 2026-10-06: the per-item title assertions that used to live here pinned a list (search, onboarding, studios,
  // navigation bar, interaction flows) and broke on every promotion, so they guarded the list instead of the rule.
  // The rule checker (docs/STORYBOOK_NAVIGATION.md §1) replaces them. Only Native-scoped findings fail here; cross-platform
  // findings (S2 category counts, S3 unique names, S5 Web ids, S6 parity) need both trees and stay with
  // `pnpm storybook:check` at the repository root. The path is built at runtime because the checker is untyped .mjs.
  const checker = pathToFileURL(join(sourceRoot, "../../../scripts/check-storybook.mjs")).href;
  const { collectModel, checkModel } = await import(/* @vite-ignore */ checker);
  const model = await collectModel(fileURLToPath(new URL("../../../", import.meta.url)));
  const nativeFiles = model.files.filter((file: { platform: string }) => file.platform === "native");
  expect(nativeFiles.length).toBeGreaterThan(0);
  const { problems } = await checkModel(model);
  const nativeProblems = (problems as string[]).filter(problem => /showcase\/native\/|native preview|PLATFORM_ONLY\.native/.test(problem));
  expect(nativeProblems).toEqual([]);
});

it("documents every foundation token group", async () => {
  // An app screenshot exposed Web-only token documentation. Menu parity between Web and Native is now
  // scripts/check-storybook.mjs S6; this keeps the shared reference complete against the public foundations.
  const tokens = await import("@hjmds/design-contracts/foundations");
  const { foundationGroups } = await import("../../shared/token-reference");
  // Font resolvers are documented behavior, not token values to flatten into a
  // reference table. Keep exact coverage of every exported value, including future groups.
  const tokenKeys = Object.entries(tokens).filter(([, value]) => typeof value !== "function").map(([key]) => key);
  expect(Object.values(foundationGroups).flatMap(group => [...group.keys]).sort()).toEqual(tokenKeys.sort());
});

it("rejects Native includeStories because the pinned runtime drops default metadata", async () => {
  const checker = pathToFileURL(join(sourceRoot, "../../../scripts/check-storybook.mjs")).href;
  const { collectModel, checkModel, parseStoryFile } = await import(/* @vite-ignore */ checker);
  const model = await collectModel(fileURLToPath(new URL("../../../", import.meta.url)));
  const target = model.files.find((file: { platform: string }) => file.platform === "native");
  const bad = await parseStoryFile('const meta = { title: "실험/컴포넌트/시각 효과/가장자리 흐림", includeStories: ["Default"] }; export default meta; export const Default = {};', 'fixture.stories.tsx');
  const { problems } = await checkModel({ ...model, files: model.files.map((file: unknown) => file === target ? { ...target, ...bad } : file) });
  expect(problems.some((problem: string) => problem.includes("Native includeStories는 default metadata를 제거"))).toBe(true);
});
