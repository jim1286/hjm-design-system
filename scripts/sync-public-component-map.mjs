import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// TypeScript already belongs to both renderers. Resolve their tool rather than
// introducing an orchestrator dependency/lockfile change just for this projection.
const require = createRequire(path.join(root, "packages/react/package.json"));
const ts = require("typescript");
const catalogSource = fs.readFileSync(path.join(root, "packages/design-contracts/src/catalog.ts"), "utf8");
const canonical = new Set([...catalogSource.matchAll(/\{ name: "([^"]+)", category:/g)].map(match => match[1]));
const companions = {
  NavigationBar: "TopBar",
  TextField: "Field", NativeSelect: "Select", Table: "DataTable", TabPanel: "Tabs",
  AvatarGroup: "Avatar", StatisticGroup: "Statistic", ToastProvider: "Toast", ToastRegion: "Toast",
  ClipboardButton: "Button", OverlayStackProvider: "Dialog", AssetGroup: "Asset", TopBarAction: "TopBar",
};
const extensions = {
  GravityLetters: "Text",
  GridReveal: "Image",
  VoiceNote: "Asset",
  StepPlayer: "Steps",
  FolderPreview: "Collapsible",
  TaskList: "List",
  ScrollProgress: "Progress",
  ReactionPicker: "Button", NotificationBell: "IconButton",
  DocumentResource: "Card", FieldGroup: "Field", DateEntry: "Field", DurationField: "NumberField", InlineConfirm: "Button",
  AnimatedStatistic: "Statistic", MorphingMenu: "Menu", CarouselMotion: "Carousel",
  ImageViewer: "Image", GestureSheet: "Sheet", GestureSheetProvider: "Sheet", GestureSheetInput: "Field",
  NativeContextMenu: "ContextMenu",
};
// These APIs solve supplemental host/interaction problems rather than another
// canonical row. A null family is explicit; never silently grow the frozen catalog.
const supplemental = new Set([
  "Rating", "ImageComparison",
  "CodeBlock", "ActivityHeatmap",
  // Screen compositions reuse canonical primitives; they do not expand the frozen catalog.
  "SavedItemsScreen", "CommentThreadScreen", "ListDetailScreen", "EditorScreen", "ProfileScreen", "ModerationScreen", "MediaSelectionScreen", "PhotoSourceSheet", "SearchScreen", "PermissionScreen", "OnboardingScreen",
  "OverviewScreen", "ScreenLayout", "SettingsScreen", "NotificationInboxScreen", "NotificationItem", "ChatScreen", "MessageComposer", "ChatMessage",
  "KeyboardAvoiding", "KeyboardMotionProvider", "KeyboardDock", "KeyboardFormScrollView",
  "SortableCollection", "SwipeActions", "ContentTransition", "TextTransition", "Celebration",
  "SharedTransitionScreen", "SharedTransitionElement", "EffectSurface", "ProgressiveBlur",
]);
const files = ["react", "react-native"].flatMap(pkg => {
  const sourceRoot = path.join(root, "packages", pkg, "src");
  return fs.readdirSync(sourceRoot, { recursive: true }).filter(file => /\.tsx?$/.test(file)).map(file => path.join(sourceRoot, file));
});
const program = ts.createProgram(files, {
  target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext, jsx: ts.JsxEmit.ReactJSX, skipLibCheck: true,
});
const checker = program.getTypeChecker();
const packages = {};
for (const pkg of ["react", "react-native"]) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "packages", pkg, "package.json"), "utf8"));
  const publicValues = new Map();
  for (const [entry, config] of Object.entries(manifest.exports)) {
    const target = typeof config === "string" ? config : config.import ?? config.default;
    if (!target?.endsWith(".js")) continue;
    const base = path.join(root, "packages", pkg, "src", path.basename(target, ".js"));
    const source = program.getSourceFile(`${base}.ts`) ?? program.getSourceFile(`${base}.tsx`);
    if (!source) throw new Error(`Public entry has no source: ${manifest.name}${entry}`);
    const module = checker.getSymbolAtLocation(source);
    for (const symbol of checker.getExportsOfModule(module)) {
      if (!/^[A-Z]/.test(symbol.name)) continue;
      const resolved = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
      if (!(resolved.flags & ts.SymbolFlags.Value)) continue;
      const declaration = resolved.valueDeclaration ?? resolved.declarations?.[0];
      if (!declaration) throw new Error(`Unresolved public component: ${symbol.name}`);
      const origin = path.relative(root, declaration.getSourceFile().fileName);
      const existing = publicValues.get(symbol.name);
      if (existing && existing.source !== origin) throw new Error(`Conflicting public definitions: ${symbol.name}`);
      const row = existing ?? { name: symbol.name, source: origin, entries: [] };
      row.entries.push(entry);
      publicValues.set(symbol.name, row);
    }
  }
  packages[manifest.name] = [...publicValues.values()].sort((a, b) => a.name.localeCompare(b.name, "en")).map(row => {
    const provider = row.name === "HjmProvider" || row.name === "HjmNativeProvider";
    const family = provider ? "DesignSystemProvider" : canonical.has(row.name) ? row.name : companions[row.name] ?? extensions[row.name] ?? null;
    if (family && !canonical.has(family)) throw new Error(`Unknown canonical family: ${row.name} -> ${family}`);
    if (!family && !supplemental.has(row.name)) throw new Error(`Unclassified public component: ${row.name}`);
    return { ...row, entries: row.entries.sort(), canonicalComponent: family,
      role: provider || canonical.has(row.name) ? "canonical" : companions[row.name] ? "companion-or-alternative" : extensions[row.name] ? "optional-extension" : "supplemental" };
  });
}
const json = JSON.stringify({ schemaVersion: 1, packages }, null, 2) + "\n";
let markdown = "# HJM 공개 컴포넌트와 카탈로그 대응표\n\n카탈로그는 의미 계약, package exports는 실제 사용 가능한 API다. 2026-10-01 중복 조사에서 TextField와 Table 등 공개 이름이 카탈로그 밖이라 전체 범위를 놓칠 수 있음을 확인해 이 대응표를 추가했다. source와 manifest에서 생성하며 새로운 미분류 공개 이름은 검사에서 실패한다. 표의 역할은 stable 성숙도나 기기 검증을 뜻하지 않는다.\n\n";
for (const [pkg, rows] of Object.entries(packages)) {
  markdown += `## ${pkg}\n\n고유 공개 컴포넌트 및 provider 이름 ${rows.length}개. 재노출된 이름은 한 번만 센다.\n\n| 공개 API | 계약 | 역할 | import 경로 |\n| --- | --- | --- | --- |\n`;
  for (const row of rows) markdown += `| ${row.name} | ${row.canonicalComponent ?? "별도 보조 기능"} | ${row.role} | ${row.entries.map(entry => entry === "." ? "root" : entry).join(", ")} |\n`;
  markdown += "\n";
}
markdown = markdown.trimEnd() + "\n";
let drift = false;
for (const [file, content] of [["docs/generated/public-component-map.json", json], ["docs/generated/public-component-map.md", markdown]]) {
  const absolute = path.join(root, file);
  if (process.argv.includes("--write")) { fs.mkdirSync(path.dirname(absolute), { recursive: true }); fs.writeFileSync(absolute, content); }
  else if (!fs.existsSync(absolute) || fs.readFileSync(absolute, "utf8") !== content) { process.stderr.write(`Public component map drift: ${file}\n`); drift = true; }
}
if (drift) process.exitCode = 1;
else process.stdout.write(`Public component map ready: ${Object.values(packages).reduce((sum, rows) => sum + rows.length, 0)} platform API names\n`);
