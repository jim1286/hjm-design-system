import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// TypeScript already belongs to both renderers. Resolve their tool rather than
// introducing an orchestrator dependency/lockfile change just for this projection.
const require = createRequire(path.join(root, "packages/react/package.json"));
const ts = require("typescript");
// 2026-10-18: family membership (canonical rows, companions, optional extensions) comes from the catalog rows
// (catalog.ts `companions`/`extensions`) instead of maps kept only in this script, so registering a component
// no longer repeats its public names here. The built catalog is the input; run `pnpm --filter @hjmds/design-contracts build` first.
const { componentDefinitions } = await import(pathToFileURL(path.join(root, "packages/design-contracts/dist/component-definitions.js")).href);
const canonical = new Set(componentDefinitions.map((definition) => definition.name));
const companions = {};
const extensions = {};
for (const definition of componentDefinitions) {
  for (const symbol of definition.companions) companions[symbol] = definition.name;
  for (const symbol of definition.extensions) extensions[symbol] = definition.name;
}
// These APIs solve supplemental host/interaction problems rather than another
// canonical row. A null family is explicit; never silently grow the frozen catalog.
const supplemental = new Set([
  "Rating", "ImageComparison",
  // 2026-10-23: a settings choice row composed from ListRow, Sheet and RadioGroup; it owns its own story and guide.
  "ChoiceRow",
  // 2026-10-26: link sharing composed from Sheet, ImageChoiceGroup, SearchField and IconButton (BurnTok share sheet
  // generalized); no new state axis on Sheet, so it owns its own story and guide like ChoiceRow.
  "ShareSheet",
  // Controlled collection compositions reuse FieldGroup, ActionSession and DataTable; no new canonical rows.
  "ChatRoomInvite", "ChatRoomDetails", "ChatRoomProfile", "ChatRoomMembers", "ChatRoomCreate", "ChatRoomActions",
  "StreamingAnswer", "ExpandableSearch", "ReplyMessage", "ReplyComposer", "ToggleFeedbackButton",
  "TransferTask", "BezierEditor", "ShortcutRecorder", "FollowProfileCard", "EventAttendanceCard",
  "MediaTransport",
  "SplitAction", "AccountSwitcher", "PasswordRulesField", "PricingChoice",
  "ImportFieldMapping", "ConversionFunnel", "CohortRetentionTable", "CorrelationMatrix", "TargetSummary", "HistogramExplorer",
  "InlineEdit", "RepeatableFieldGroup", "SelectionActionBar", "FilterRecovery", "TableColumnSettings",
  "CodeBlock", "ActivityHeatmap",
  // 2026-10-17 screen compositions registered: the 22 screen compositions (ScreenLayout, SettingsScreen, ChatScreen, …) are canonical
  // rows now (catalog.ts). The remaining names here are screen helpers without a contract of their own.
  "ConversationRow", "ConversationListScreen", "SavedItemsScreen", "FollowListScreen",
  "OverviewScreen",
  // 2026-10-16: the context lets ScreenLayout/Sheet skip duplicate keyboard padding inside KeyboardAvoiding.
  // KeyboardAvoidanceContext is a companion of KeyboardAvoiding with no UI semantics of its own (stays supplemental).
  "KeyboardAvoiding", "KeyboardAvoidanceContext", "KeyboardMotionProvider", "KeyboardDock", "KeyboardFormScrollView",
  "SortableCollection", "SwipeActions", "ContentTransition", "TextTransition", "Celebration",
  "SharedTransitionScreen", "SharedTransitionElement", "EffectSurface", "ProgressiveBlur",
  // 2026-10-10: disclosure trigger for the panel Toast (composition activity-status). Not a Chip variant
  // (Chip carries selection roles; this carries expanded state) and not part of Toast's queue, so it keeps
  // its own usage unit instead of growing the frozen catalog.
  "ActivityChip",
]);
const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").toLowerCase();
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
const generatedEntries = {};
for (const pkg of ["react", "react-native"]) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "packages", pkg, "package.json"), "utf8"));
  const publicValues = new Map();
  const entryOrder = [];
  const entrySize = new Map();
  for (const [entry, config] of Object.entries(manifest.exports)) {
    const target = typeof config === "string" ? config : config.import ?? config.default;
    if (!target?.endsWith(".js")) continue;
    const base = path.join(root, "packages", pkg, "src", path.basename(target, ".js"));
    const source = program.getSourceFile(`${base}.ts`) ?? program.getSourceFile(`${base}.tsx`);
    if (!source) throw new Error(`Public entry has no source: ${manifest.name}${entry}`);
    entryOrder.push(entry);
    const module = checker.getSymbolAtLocation(source);
    let count = 0;
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
      count += 1;
    }
    entrySize.set(entry, count);
  }
  // Canonical granular entry for evidence claims: the entry named after the symbol's kebab id, else the largest
  // family entry (./actions over ./bottom-cta, ./navigation over ./top-bar), else package.json order. The root
  // entry re-exports everything and is never a claim subpath.
  const rank = (name) => (entry) => [entry === `./${kebab(name)}` ? 0 : 1, -(entrySize.get(entry) ?? 0), entryOrder.indexOf(entry)];
  const compare = (name) => (a, b) => { const ra = rank(name)(a), rb = rank(name)(b); for (let index = 0; index < ra.length; index += 1) if (ra[index] !== rb[index]) return ra[index] - rb[index]; return 0; };
  packages[manifest.name] = [...publicValues.values()].sort((a, b) => a.name.localeCompare(b.name, "en")).map(row => {
    const provider = row.name === "HjmProvider" || row.name === "HjmNativeProvider";
    const family = provider ? "DesignSystemProvider" : canonical.has(row.name) ? row.name : companions[row.name] ?? extensions[row.name] ?? null;
    if (family && !canonical.has(family)) throw new Error(`Unknown canonical family: ${row.name} -> ${family}`);
    if (!family && !supplemental.has(row.name)) throw new Error(`Unclassified public component: ${row.name}`);
    return { ...row, entries: row.entries.sort(), canonicalComponent: family,
      role: provider || canonical.has(row.name) ? "canonical" : companions[row.name] ? "companion-or-alternative" : extensions[row.name] ? "optional-extension" : "supplemental" };
  });
  generatedEntries[pkg] = Object.fromEntries(packages[manifest.name].map(row => [row.name, row.entries.filter(entry => entry !== ".").sort(compare(row.name))]));
}
const json = JSON.stringify({ schemaVersion: 1, packages }, null, 2) + "\n";
let markdown = "# HJM 공개 컴포넌트와 카탈로그 대응표\n\n카탈로그는 의미 계약, package exports는 실제 사용 가능한 API다. 2026-10-01 중복 조사에서 TextField와 Table 등 공개 이름이 카탈로그 밖이라 전체 범위를 놓칠 수 있음을 확인해 이 대응표를 추가했다. source와 manifest에서 생성하며 새로운 미분류 공개 이름은 검사에서 실패한다. 표의 역할은 stable 성숙도나 기기 검증을 뜻하지 않는다. 2026-10-18부터 companion·extension 분류는 catalog 행의 `companions`·`extensions`에서 읽는다.\n\n";
for (const [pkg, rows] of Object.entries(packages)) {
  markdown += `## ${pkg}\n\n고유 공개 컴포넌트 및 provider 이름 ${rows.length}개. 재노출된 이름은 한 번만 센다.\n\n| 공개 API | 계약 | 역할 | import 경로 |\n| --- | --- | --- | --- |\n`;
  for (const row of rows) markdown += `| ${row.name} | ${row.canonicalComponent ?? "별도 보조 기능"} | ${row.role} | ${row.entries.map(entry => entry === "." ? "root" : entry).join(", ")} |\n`;
  markdown += "\n";
}
markdown = markdown.trimEnd() + "\n";
// Per-renderer generated module: evidence.ts derives each claim's subpath and export names from it, so the
// export map is scanned once here instead of being retyped per component (2026-10-18 registration input).
const generatedModule = (pkg) => `// Generated by scripts/sync-public-component-map.mjs --write. Do not edit by hand.
// Public value exports per symbol, canonical granular entry first (the root entry is omitted).
export const publicExportEntries = ${JSON.stringify(generatedEntries[pkg], null, 2).replace(/^(\s+)"([A-Za-z0-9_]+)":/gm, '$1$2:')} as const satisfies Readonly<Record<string, readonly \`./\${string}\`[]>>;
`;
let drift = false;
const outputs = [
  ["docs/generated/public-component-map.json", json],
  ["docs/generated/public-component-map.md", markdown],
  ["packages/react/src/public-exports.generated.ts", generatedModule("react")],
  ["packages/react-native/src/public-exports.generated.ts", generatedModule("react-native")],
];
for (const [file, content] of outputs) {
  const absolute = path.join(root, file);
  if (process.argv.includes("--write")) { fs.mkdirSync(path.dirname(absolute), { recursive: true }); fs.writeFileSync(absolute, content); }
  else if (!fs.existsSync(absolute) || fs.readFileSync(absolute, "utf8") !== content) { process.stderr.write(`Public component map drift: ${file}\n`); drift = true; }
}
if (drift) process.exitCode = 1;
else process.stdout.write(`Public component map ready: ${Object.values(packages).reduce((sum, rows) => sum + rows.length, 0)} platform API names\n`);
