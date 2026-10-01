import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import ts from "typescript";
import { toId } from "storybook/internal/csf";
import { reactNativeRendererEvidence } from "@hjmds/react-native/evidence";
import { describe, expect, it } from "vitest";

const sourceRoot = fileURLToPath(new URL(".", import.meta.url));
const files = [...readdirSync(join(sourceRoot, "components")).map(name => join(sourceRoot, "components", name)), ...["Calendar", "Carousel", "ThinkingOrb"].map(name => join(sourceRoot, `${name}.stories.tsx`))];

describe("individual native component navigation", () => {
  it("gives every supported renderer one unique component entry with default and accessibility fixtures", () => {
    const ids: string[] = [];
    const titles: string[] = [];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      const title = source.match(/title: "(배포\/컴포넌트\/[^\"]+)"/)?.[1];
      expect(title, file).toBeDefined();
      titles.push(title!);
      const id = source.match(/componentIds: \["([^\"]+)"\]/)?.[1];
      expect(id, file).toBeDefined();
      ids.push(id!);
      for (const state of ["Default", "Dark", "LargeText"]) expect(source, file).toContain(`export const ${state}:`);
      // Importing a CSF module as a fixture registers stories as a side effect and can duplicate entries.
      expect(source, file).not.toMatch(/from ["'][^"']*\.stories/);
    }
    expect(ids.sort()).toEqual(reactNativeRendererEvidence.components.map(component => component.componentId).sort());
    expect(new Set(titles).size).toBe(files.length);
  });

  it("isolates individual renderers and preserves overlay opening actions", () => {
    const source = readFileSync(join(sourceRoot, "component-examples.tsx"), "utf8");
    const ast = ts.createSourceFile("fixtures.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const fixture = (name: string) => ast.statements.find((node): node is ts.FunctionDeclaration => ts.isFunctionDeclaration(node) && node.name?.text === name)?.getText(ast);
    expect(fixture("ButtonExample")).toContain('<Button disabled={variant === "disabled"} loading={variant === "loading"}');
    expect(fixture("ButtonExample")).not.toContain("<IconButton");
    expect(fixture("AvatarExample")).not.toContain("<Badge");
    expect(fixture("FieldExample")).toContain('variant === "error"');
    for (const [name, setter] of [["DialogExample", "setDialogOpen"], ["AlertDialogExample", "setAlertOpen"], ["SheetExample", "setSheetOpen"]]) {
      expect(fixture(name!)).toContain(`${setter}(true)`);
      expect(fixture(name!)).toContain(`onOpenChange={${setter}}`);
    }
  });
});

it("keeps optional Liquid Toast discoverable with the same three state fixtures", () => {
  const source = readFileSync(join(sourceRoot, "LiquidToast.stories.tsx"), "utf8");
  expect(source).toContain('title: "배포/컴포넌트/상태와 알림/리퀴드 토스트"');
  expect(source).toContain('enhanced: true');
  for (const state of ["Default", "Dark", "LargeText"]) expect(source).toContain(`export const ${state}:`);
  expect(readFileSync(join(sourceRoot, "components/Toast.stories.tsx"), "utf8")).not.toContain('export const Liquid:');
});

it("registers the visual integration optional entries individually in all three states", () => {
  // Canonical evidence deliberately excludes optional entries. Audit these explicitly
  // after 2026-10-01 user feedback that grouped stories made them appear missing.
  const entries: Record<string, string> = {
    GooeyNavigation: "탐색/선택 표시가 이어지는 탭",
    GravityLetters: "시각 효과/중력 글자",
    GridReveal: "시각 효과/격자 등장 효과", VoiceNote: "데이터 표시/음성 메모",
    StepPlayer: "상태와 알림/단계별 진행 표시", AnimatedBlobatar: "데이터 표시/움직이는 블로바타 캐릭터",
    FolderPreview: "데이터 표시/폴더 미리보기", TaskList: "입력/할 일 목록",
    AnimatedStatistic: "데이터 표시/움직이는 수치", ActivityHeatmap: "데이터 표시/활동 히트맵",
    DurationField: "입력/소요 시간 입력", InlineConfirm: "동작/버튼 안에서 확인",
    ReactionPicker: "동작/반응 선택", NotificationBell: "상태와 알림/알림 벨",
    EffectSurface: "시각 효과/배경 시각 효과", LucideIcon: "글자와 아이콘/루시드 아이콘",
    BlobatarAvatar: "데이터 표시/블로바타 캐릭터", ContentTransition: "시각 효과/내용 전환",
    CodeBlock: "데이터 표시/코드 블록", ReadingProgress: "상태와 알림/읽기 진행 표시",
  };
  for (const [name, role] of Object.entries(entries)) {
    for (const directory of [sourceRoot, join(sourceRoot, "../../web/src/patterns")]) {
      const source = readFileSync(join(directory, `${name}.stories.tsx`), "utf8");
      expect(source.match(/title:\s*["']([^"']+)["']/)?.[1], name).toBe(`배포/컴포넌트/${role}`);
      for (const state of ["Default", "Dark", "LargeText"]) expect(source, name).toContain(`export const ${state}:`);
      expect(source, name).not.toMatch(/from ["'][^"']*\.stories/);
    }
  }
});


it("places ThinkingOrb and Family drawer in their semantic navigation sections on both platforms", () => {
  for (const [file, title] of [
    [join(sourceRoot, "ThinkingOrb.stories.tsx"), "배포/컴포넌트/상태와 알림/생각 중 표시"],
    [join(sourceRoot, "../../web/src/components/ThinkingOrb.stories.tsx"), "배포/컴포넌트/상태와 알림/생각 중 표시"],
    [join(sourceRoot, "FamilyDrawer.stories.tsx"), "배포/구성/단계별 드로어"],
    [join(sourceRoot, "../../web/src/patterns/FamilyDrawer.stories.tsx"), "배포/구성/단계별 드로어"],
  ]) {
    const source = readFileSync(file!, "utf8");
    expect(source).toContain(title!);
    for (const state of ["Default", "Dark", "LargeText"]) expect(source).toMatch(new RegExp(`export const ${state}:\\s*Story`));
  }
});


it("keeps search patterns discoverable in the three presentation states", () => {
  for (const file of [join(sourceRoot, "Search.stories.tsx"), join(sourceRoot, "../../web/src/patterns/Search.stories.tsx")]) {
    const source = readFileSync(file, "utf8");
    expect(source).toContain('title: "배포/화면/검색"');
    for (const state of ["Default", "Dark", "LargeText"]) expect(source).toContain(`export const ${state}:`);
  }
});


it("registers onboarding, dashboard and landing patterns on both surfaces", () => {
  for (const name of ["Onboarding", "Dashboard", "Landing"]) {
    for (const directory of [sourceRoot, join(sourceRoot, "../../web/src/patterns")]) {
      const source = readFileSync(join(directory, `${name}.stories.tsx`), "utf8");
      expect(source).toContain(`title: "배포/화면/${({ Onboarding: "온보딩", Dashboard: "대시보드", Landing: "랜딩 화면" } as Record<string, string>)[name]}"`);
      for (const state of ["Default", "Dark", "LargeText"]) expect(source).toContain(`export const ${state}:`);
    }
  }
});


it("places studios, profile compositions and comparison galleries by purpose", () => {
  const targets = [
    ["ProfileStudio", "배포/화면/프로필 편집", "patterns", true],
    ["ThemeStudio", "배포/토큰/테마 편집", "foundations", true],
    ["TypographyStudio", "배포/토큰/글꼴 편집", "foundations", true],
    ["VisualFoundations", "배포/구성/시각 효과", "patterns", false],
    ["CompoundControls", "배포/구성/복합 입력", "patterns", false],
  ] as const;
  for (const [name, title, webDirectory, threeStates] of targets) {
    for (const directory of [sourceRoot, join(sourceRoot, `../../web/src/${webDirectory}`)]) {
      const source = readFileSync(join(directory, `${name}.stories.tsx`), "utf8");
      expect(source.match(/title:\s*["']([^"']+)["']/)?.[1], name).toBe(title);
      if (threeStates) {
        for (const state of ["Default", "Dark", "LargeText"]) expect(source, name).toContain(`export const ${state}:`);
        expect(source, name).toMatch(/theme:\s*["']dark["']/);
        expect(source, name).toMatch(/textScale:\s*["']2["']/);
      }
    }
  }
});

it("registers the Web authoring studio in Screens with the three comparison states", () => {
  // The integration plan explicitly locates Scene authoring in Web showcase, outside Native runtime UI.
  const source = readFileSync(join(sourceRoot, "../../web/src/foundations/MockupStudio.stories.tsx"), "utf8");
  expect(source).toContain('title: "배포/화면/목업 편집"');
  for (const state of ["Default", "Dark", "LargeText"]) expect(source).toContain(`export const ${state}:`);
});

it("keeps shared navigation roles and ordering consistent without ambiguous duplicate entries", () => {
  // This guards the user-visible regression: optional entries previously created
  // Display beside Data Display and layout entries appeared under Foundations.
  const categories = new Set(["개요", "전체 목록", "글자와 아이콘", "레이아웃", "동작", "입력", "탐색", "데이터 표시", "상태와 알림", "오버레이", "시각 효과", "기반 기능"]);
  const walk = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? walk(join(directory, entry.name)) : entry.name.endsWith(".stories.tsx") ? [join(directory, entry.name)] : []);
  for (const directory of [sourceRoot, join(sourceRoot, "../../web/src")]) {
    const titles: string[] = [];
    const ids: string[] = [];
    for (const file of walk(directory)) {
      const source = readFileSync(file, "utf8");
      const title = source.match(/title:\s*["']((?:배포|실험)\/[^"']+)["']/)?.[1];
      expect(title, file).toBeDefined();
      if (!title) continue;
      titles.push(title);
      expect(["토큰", "컴포넌트", "구성", "화면"]).toContain(title.split("/")[1]);
      expect(title.split("/").every(part => /[가-힣]/.test(part)), file).toBe(true);
      const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      for (const statement of ast.statements) {
        if (!ts.isVariableStatement(statement) || !statement.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
        for (const declaration of statement.declarationList.declarations) {
          if (declaration.type?.getText(ast) !== "Story" || !declaration.initializer || !ts.isObjectLiteralExpression(declaration.initializer)) continue;
          const label = declaration.initializer.properties.find(property => ts.isPropertyAssignment(property) && property.name.getText(ast) === "name");
          expect(label && ts.isPropertyAssignment(label) && ts.isStringLiteral(label.initializer) && /[가-힣]/.test(label.initializer.text), `${file}: ${declaration.name.getText(ast)}`).toBe(true);
        }
      }
      if (title.startsWith("배포/컴포넌트/")) expect(categories.has(title.split("/")[2]!), title).toBe(true);
      const explicitId = source.match(/\bid:\s*["']([a-z][a-z0-9-]+)["'],\s*title:\s*["'](?:배포|실험)\//)?.[1];
      ids.push(explicitId ?? toId(title));
    }
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(ids).size).toBe(ids.length);
  }
  const orders = [join(sourceRoot, "../.rnstorybook/preview.tsx"), join(sourceRoot, "../../web/.storybook/preview.tsx")].map(file => {
    const source = readFileSync(file, "utf8");
    return JSON.parse(source.match(/order:\s*(\[[\s\S]*?"\*"\])/)! [1]!);
  });
  expect(orders[0]).toEqual(orders[1]);
  expect(orders[0][0]).toBe("배포");
  expect(orders[0][2]).toBe("실험");
  for (const layers of [orders[0][1], orders[0][3]]) expect(layers.filter((item: unknown) => typeof item === "string")).toEqual(["토큰", "컴포넌트", "구성", "화면"]);
});


it("releases approved navigation only and keeps interaction flows experimental", () => {
  // The user approved navigation on 2026-10-02, then explicitly kept behavior examples in experiments.
  const roots = [sourceRoot, join(sourceRoot, "../../web/src/patterns")];
  for (const root of roots) {
    for (const key of ["robot", "cycle", "finance", "project"]) {
      const source = readFileSync(join(root, `NavigationStudy-${key}.stories.tsx`), "utf8");
      expect(source).toContain('title: "배포/컴포넌트/탐색/내비게이션 바/');
    }
    const duplicateFiles = ["social", "commerce", "video", "energy", "shop", "car"].map(key => `NavigationStudy-${key}.stories.tsx`);
    const names = readdirSync(root);
    expect(names.filter(name => duplicateFiles.includes(name))).toEqual([]);
    expect(names).not.toContain("CapsuleNavigation.stories.tsx");
    for (const key of ["apply", "draft", "search"]) {
      const source = readFileSync(join(root, `InteractionFlow-${key}.stories.tsx`), "utf8");
      expect(source).toContain('title: "실험/구성/상호작용 예제/');
      for (const state of ["Default", "Dark", "LargeText"]) expect(source).toContain(`export const ${state}:`);
    }
  }
});


it("documents every foundation and matches token menus across Web and Native", async () => {
  // An app screenshot exposed Web-only token documentation; both menus must stay in sync.
  const tokens = await import("@hjmds/design-contracts/foundations");
  const { foundationGroups } = await import("../../shared/token-reference");
  expect(Object.values(foundationGroups).flatMap(group => [...group.keys]).sort()).toEqual(Object.keys(tokens).sort());
  const tokenTitles = (directory: string): string[] => readdirSync(directory, {withFileTypes:true}).flatMap(entry => {
    const path=join(directory,entry.name);
    if(entry.isDirectory()) return tokenTitles(path);
    if(!entry.name.endsWith(".stories.tsx")) return [];
    const title=readFileSync(path,"utf8").match(/title:\s*["'](배포\/토큰\/[^"']+)["']/)?.[1];
    return title ? [title] : [];
  }).sort();
  expect(tokenTitles(sourceRoot)).toEqual(tokenTitles(join(sourceRoot,"../../web/src")));
});
