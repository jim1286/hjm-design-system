import { access, readFile, readdir } from "node:fs/promises";
import { posix, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";

const repositoryRoot = new URL("../", import.meta.url);
const distDirectory = new URL("../dist/", import.meta.url);
const packageJsonUrl = new URL("../package.json", import.meta.url);

/**
 * These are import-graph budgets, not the size of a minified application
 * bundle. Metro follows ESM re-exports before an application bundler can
 * discard them, so module count is tracked alongside raw and gzip bytes.
 * Raising a budget requires an intentional review of the changed graph.
 */
const budgets = [
  {
    exportPath: "./tokens",
    maxModules: 5,
    maxRawBytes: 15_000,
    maxGzipBytes: 5_000,
    forbiddenModules: metadataModules,
  },
  {
    exportPath: "./foundations",
    maxModules: 1,
    maxRawBytes: 7_000,
    maxGzipBytes: 2_500,
    forbiddenModules: metadataModules,
  },
  {
    exportPath: "./colors",
    maxModules: 1,
    maxRawBytes: 3_000,
    // 1_200 -> 1_250: the `borderControl` semantic key (a control outline is a
    // border role, not `textSub`) adds one key per theme plus its rationale
    // comment. The module count and import edges are unchanged.
    // 1_250 -> 1_290: the dark theme moved onto light's neutral hue family, so
    // its hex values no longer repeat light's slate strings and compress worse
    // (docs/theme-palette.md). Values only — module count and import edges are
    // unchanged, and the long-form rationale stays out of dist on purpose.
    maxGzipBytes: 1_290,
    forbiddenModules: metadataModules,
  },
  {
    exportPath: "./color-references",
    maxModules: 2,
    maxRawBytes: 7_000,
    maxGzipBytes: 2_500,
    forbiddenModules: metadataModules,
  },
  {
    exportPath: "./responsive",
    maxModules: 2,
    maxRawBytes: 15_000,
    maxGzipBytes: 5_000,
    forbiddenModules: metadataModules,
  },
  {
    exportPath: "./grid",
    maxModules: 3,
    maxRawBytes: 25_000,
    maxGzipBytes: 8_000,
    forbiddenModules: metadataModules,
  },
  {
    exportPath: "./formatters",
    // Intl wrappers only: no recipe, no catalog, no other contract module.
    maxModules: 1,
    maxRawBytes: 9_000,
    maxGzipBytes: 3_000,
    forbiddenModules: metadataModules,
  },
  {
    exportPath: "./recipes",
    // The public recipe facade fans out to deliberately small recipe modules;
    // byte budgets keep that split from becoming a size regression.
    // P1에서 Heading·ToggleGroup·TagsInput recipe가 이 facade에 붙었다.
    // 측정 81.6 kB raw / 18.6 kB gzip, module 12 -> 15. 새 의존성은 없다.
    maxModules: 15,
    // 1.0.3: raw 80_000 -> 81_000, gzip 18_000 -> 18_200. `largeTextThreshold`를
    // foundations에 선언하고 두 레시피가 그 이름을 읽게 하면서(#20) raw 79.8 -> 80.3 kB,
    // gzip 17.9 -> 18.0 kB가 됐다. module 수는 12로 그대로 — 새 import 경로가 아니라
    // 선언과 근거 주석의 바이트다. 다시 올릴 때는 module 수부터 확인한다.
    maxRawBytes: 86_000,
    maxGzipBytes: 19_500,
    forbiddenModules: metadataModules,
  },
  {
    exportPath: "./recipes/base",
    maxModules: 4,
    maxRawBytes: 20_000,
    maxGzipBytes: 6_000,
    forbiddenModules: metadataModules,
  },
  {
    exportPath: "./contracts",
    maxModules: 5,
    maxRawBytes: 17_000,
    maxGzipBytes: 5_000,
    forbiddenModules: metadataModules,
  },
  {
    exportPath: "./version",
    maxModules: 1,
    maxRawBytes: 1_000,
    maxGzipBytes: 500,
    forbiddenModules: metadataModules,
  },
  {
    exportPath: "./components/toast",
    maxModules: 1,
    maxRawBytes: 22_000,
    maxGzipBytes: 4_500,
    forbiddenModules: metadataModules,
  },
  {
    exportPath: "./components/form",
    maxModules: 2,
    maxRawBytes: 17_000,
    maxGzipBytes: 6_000,
    forbiddenModules: metadataModules,
  },
  {
    // 토큰 계약만 있는 진입점이다 — 렌더러가 없으므로 그래프가 색 상수와 foundations뿐이다.
    exportPath: "./dataviz",
    maxModules: 4,
    maxRawBytes: 16_000,
    maxGzipBytes: 6_200,
    forbiddenModules: metadataModules,
  },
  {
    // 2026-09-19 AuthScreenLayout: 계약 모듈 한 개가 그래프에 들어왔다. 기존
    // helper(foundations·base-recipes·provider-button)만 재사용하고 외부 의존성은
    // 없다 — 증가분이 곧 새 계약 파일 하나와 catalog 문구다.
    exportPath: "./recipes/all",
    // Anchor adds one isolated contract module; no added library dependency.
    // 2026-09-18 P0: Agreement·Top·AuthProviderButton 세 계약 모듈이 그래프에 들어왔다.
    // 셋 다 기존 helper(selection-helpers·foundations·base-recipes)만 재사용하고 외부
    // 의존성은 없다. 모듈 증가분이 곧 새 계약 파일 수이고, 바이트 증가분은 그 파일들과
    // catalog 문구다.
    // 2026-09-18 P1: Heading·ToggleGroup·TagsInput 세 계약 모듈이 더해졌다. 셋 다
    // 기존 helper만 재사용하고 외부 의존성은 없다 — 증가분이 곧 새 파일 수다.
    // P1-c(SkipNav·BottomInfo·Sidebar) 세 모듈 추가. 외부 의존성 없음.
    // P2(text-formats) 한 모듈 추가.
    // P2-b(collapsible·context-menu·menubar) 세 모듈 추가. 셋 다 기존 helper만
    // 재사용하고 외부 의존성은 없다 — 증가분이 곧 새 계약 파일 수와 catalog 문구다.
    // P2-c(asset) 한 모듈, dataviz 한 모듈 추가. 외부 의존성 없이 기존 foundations·
    // semantic-colors만 재사용한다 — 증가분이 곧 두 계약 파일과 catalog 문구다.
    maxModules: 64,
    maxRawBytes: 339_000,
    maxGzipBytes: 84_000,
  },
  {
    // 2026-09-19 AuthScreenLayout: 계약 모듈 한 개가 그래프에 들어왔다. 기존
    // helper(foundations·base-recipes·provider-button)만 재사용하고 외부 의존성은
    // 없다 — 증가분이 곧 새 계약 파일 하나와 catalog 문구다.
    exportPath: "./behaviors",
    // Anchor adds one isolated contract module; no added library dependency.
    // 2026-09-18 P0: Agreement·Top·AuthProviderButton 세 계약 모듈이 그래프에 들어왔다.
    // 셋 다 기존 helper(selection-helpers·foundations·base-recipes)만 재사용하고 외부
    // 의존성은 없다. 모듈 증가분이 곧 새 계약 파일 수이고, 바이트 증가분은 그 파일들과
    // catalog 문구다.
    // 2026-09-18 P1: Heading·ToggleGroup·TagsInput 세 계약 모듈이 더해졌다. 셋 다
    // 기존 helper만 재사용하고 외부 의존성은 없다 — 증가분이 곧 새 파일 수다.
    // P1-c(SkipNav·BottomInfo·Sidebar) 세 모듈 추가. 외부 의존성 없음.
    // P1-d(native-platform·date-range) 두 모듈 추가. 측정 319.0/79.3 kB.
    // P2(text-formats) 한 모듈 추가.
    // P2-b(collapsible·context-menu·menubar) 세 모듈 추가. 셋 다 기존 helper만
    // 재사용하고 외부 의존성은 없다 — 증가분이 곧 새 계약 파일 수와 catalog 문구다.
    // P2-c(asset) 한 모듈, dataviz 한 모듈 추가. 외부 의존성 없이 기존 foundations·
    // semantic-colors만 재사용한다 — 증가분이 곧 두 계약 파일과 catalog 문구다.
    maxModules: 59,
    maxRawBytes: 339_000,
    maxGzipBytes: 86_000,
  },
  {
    // 2026-09-19 AuthScreenLayout: 계약 모듈 한 개가 그래프에 들어왔다. 기존
    // helper(foundations·base-recipes·provider-button)만 재사용하고 외부 의존성은
    // 없다 — 증가분이 곧 새 계약 파일 하나와 catalog 문구다.
    exportPath: "./catalog",
    // Anchor adds one isolated contract module; no added library dependency.
    // 2026-09-18 P0: Agreement·Top·AuthProviderButton 세 계약 모듈이 그래프에 들어왔다.
    // 셋 다 기존 helper(selection-helpers·foundations·base-recipes)만 재사용하고 외부
    // 의존성은 없다. 모듈 증가분이 곧 새 계약 파일 수이고, 바이트 증가분은 그 파일들과
    // catalog 문구다.
    // 2026-09-18 P1: Heading·ToggleGroup·TagsInput 세 계약 모듈이 더해졌다. 셋 다
    // 기존 helper만 재사용하고 외부 의존성은 없다 — 증가분이 곧 새 파일 수다.
    // P1-c(SkipNav·BottomInfo·Sidebar) 세 모듈 추가. 외부 의존성 없음.
    // P2(text-formats) 한 모듈 추가.
    // P2-b(collapsible·context-menu·menubar) 세 모듈 추가. 셋 다 기존 helper만
    // 재사용하고 외부 의존성은 없다 — 증가분이 곧 새 계약 파일 수와 catalog 문구다.
    // P2-c(asset) 한 모듈, dataviz 한 모듈 추가. 외부 의존성 없이 기존 foundations·
    // semantic-colors만 재사용한다 — 증가분이 곧 두 계약 파일과 catalog 문구다.
    maxModules: 68,
    maxRawBytes: 393_000,
    maxGzipBytes: 98_000,
  },
  {
    // 2026-09-19 AuthScreenLayout: 계약 모듈 한 개가 그래프에 들어왔다. 기존
    // helper(foundations·base-recipes·provider-button)만 재사용하고 외부 의존성은
    // 없다 — 증가분이 곧 새 계약 파일 하나와 catalog 문구다.
    exportPath: "./showcase",
    // Anchor adds one isolated contract module; no added library dependency.
    // 2026-09-18 P0: Agreement·Top·AuthProviderButton 세 계약 모듈이 그래프에 들어왔다.
    // 셋 다 기존 helper(selection-helpers·foundations·base-recipes)만 재사용하고 외부
    // 의존성은 없다. 모듈 증가분이 곧 새 계약 파일 수이고, 바이트 증가분은 그 파일들과
    // catalog 문구다.
    // 2026-09-18 P1: Heading·ToggleGroup·TagsInput 세 계약 모듈이 더해졌다. 셋 다
    // 기존 helper만 재사용하고 외부 의존성은 없다 — 증가분이 곧 새 파일 수다.
    // P1-c(SkipNav·BottomInfo·Sidebar) 세 모듈 추가. 외부 의존성 없음.
    // P2(text-formats) 한 모듈 추가.
    // P2-b(collapsible·context-menu·menubar) 세 모듈 추가. 셋 다 기존 helper만
    // 재사용하고 외부 의존성은 없다 — 증가분이 곧 새 계약 파일 수와 catalog 문구다.
    // P2-c(asset) 한 모듈, dataviz 한 모듈 추가. 외부 의존성 없이 기존 foundations·
    // semantic-colors만 재사용한다 — 증가분이 곧 두 계약 파일과 catalog 문구다.
    maxModules: 69,
    maxRawBytes: 401_000,
    maxGzipBytes: 100_000,
  },
  {
    // 2026-09-19 AuthScreenLayout: 계약 모듈 한 개가 그래프에 들어왔다. 기존
    // helper(foundations·base-recipes·provider-button)만 재사용하고 외부 의존성은
    // 없다 — 증가분이 곧 새 계약 파일 하나와 catalog 문구다.
    exportPath: "./evidence",
    // Anchor adds one isolated contract module; no added library dependency.
    // 2026-09-18 P0: Agreement·Top·AuthProviderButton 세 계약 모듈이 그래프에 들어왔다.
    // 셋 다 기존 helper(selection-helpers·foundations·base-recipes)만 재사용하고 외부
    // 의존성은 없다. 모듈 증가분이 곧 새 계약 파일 수이고, 바이트 증가분은 그 파일들과
    // catalog 문구다.
    // 2026-09-18 P1: Heading·ToggleGroup·TagsInput 세 계약 모듈이 더해졌다. 셋 다
    // 기존 helper만 재사용하고 외부 의존성은 없다 — 증가분이 곧 새 파일 수다.
    // P1-c(SkipNav·BottomInfo·Sidebar) 세 모듈 추가. 외부 의존성 없음.
    // P2(text-formats) 한 모듈 추가.
    // P2-b(collapsible·context-menu·menubar) 세 모듈 추가. 셋 다 기존 helper만
    // 재사용하고 외부 의존성은 없다 — 증가분이 곧 새 계약 파일 수와 catalog 문구다.
    // P2-c(asset) 한 모듈, dataviz 한 모듈 추가. 외부 의존성 없이 기존 foundations·
    // semantic-colors만 재사용한다 — 증가분이 곧 두 계약 파일과 catalog 문구다.
    maxModules: 71,
    maxRawBytes: 407_000,
    maxGzipBytes: 101_000,
  },
  {
    // 2026-09-19 AuthScreenLayout: 계약 모듈 한 개가 그래프에 들어왔다. 기존
    // helper(foundations·base-recipes·provider-button)만 재사용하고 외부 의존성은
    // 없다 — 증가분이 곧 새 계약 파일 하나와 catalog 문구다.
    exportPath: ".",
    // The compatibility root intentionally reaches every contract. Granular
    // consumers are guarded separately below, so module splitting may raise
    // this count without increasing the root byte graph.
    // Anchor adds one isolated contract module; no added library dependency.
    // P0 세 계약 모듈로 71 -> 74, P1 세 모듈로 77. 측정 506.4 kB raw / 121.2 kB gzip.
    // P1-c로 80, formatters로 81, P1-d로 83. 측정 530.2 kB raw / 128.4 kB gzip.
    // P2로 84. 측정 533.0 kB raw / 129.3 kB gzip.
    // P2-b(collapsible·context-menu·menubar)로 87. 측정 544.4 kB raw / 132.8 kB gzip —
    // gzip은 기존 한도(133 kB) 안이라 그대로 둔다.
    // P2-c(asset·dataviz)로 89. 측정 553.4 kB raw / 136.3 kB gzip.
    maxModules: 90,
    // 0.9.13에서 470_000/110_000을 올렸다. 증가분은 recipe의 근거 주석이며 tsc는
    // 주석을 dist에 그대로 싣는다. maxModules가 70으로 그대로라는 점이 import
    // 그래프가 늘지 않았다는 근거다. 이 한도를 다시 올릴 때는 module 수가 함께
    // 늘었는지 먼저 본다 — 그때는 주석이 아니라 새 의존 경로가 원인이다.
    // 1.0.3에서 472_000 -> 473_000. 위와 같은 선언·주석이고 maxModules는 70 그대로다.
    // 1.2 completion: Web screen-chrome maturity/rationale adds catalog text;
    // measured 473.1 kB with the same 70 modules. No new runtime dependency.
    // Anchor contract and navigation catalog updates: measured 476.4 kB raw / 111.8 kB gzip.
    maxRawBytes: 561_000,
    // Calendar/composition evidence adds catalog copy; the root remains 70 modules
    // (473.6 kB raw / 111.0 kB gzip). Keep granular runtime budgets unchanged.
    // Popover 묶음에서 111.8 -> 112.3 kB gzip. 모듈별로 재면 catalog.js +522 B(Popover·
    // ConfirmPopover maturity 문구), 나머지 190 B이고 maxModules는 Anchor 때의 71 그대로다.
    // 새 import 경로가 아니라 계약 데이터 문구 증가이므로 한도를 올린다(476.5 kB raw 측정).
    // 이후 SidePanel·Splitter·Tour·Tree·TransferList·Mentions·CommandPalette·DataTable의
    // maturity 문구가 더해져 113.1 kB gzip / 478.4 kB raw. 여전히 maxModules는 71이다 —
    // 계약 모듈은 전부 이미 그래프 안에 있었고 이번에 늘어난 것은 catalog 문구뿐이다.
    maxGzipBytes: 139_000,
  },
];

/**
 * Runtime exports may be exempted only when measuring their graph would be
 * misleading. Keep this empty unless an exception has a durable explanation;
 * static JSON exports are not executable and therefore need no exemption.
 */
export const budgetExemptions = Object.freeze({});

function metadataModules() {
  return [
    "catalog.js",
    "component-definitions.js",
    "component-references.js",
    "index.js",
    "showcase.js",
  ];
}

function componentBoundaryModules() {
  return [
    ...metadataModules(),
    "behaviors.js",
    "component-recipes.js",
    "recipes.js",
  ];
}

function toDisplayBytes(value) {
  return `${(value / 1_000).toFixed(1)} kB`;
}

function getExportTarget(packageJson, exportPath) {
  const definition = packageJson.exports[exportPath];
  if (typeof definition?.import !== "string") {
    throw new Error(`package.json is missing the ${JSON.stringify(exportPath)} import export`);
  }
  return definition.import;
}

function getExecutableTarget(definition) {
  if (typeof definition === "string") return definition.endsWith(".js") ? definition : undefined;
  if (definition === null || typeof definition !== "object") return undefined;

  for (const condition of ["react-native", "import", "default"]) {
    const target = definition[condition];
    if (typeof target === "string" && target.endsWith(".js")) return target;
  }
  return undefined;
}

function hasOwn(record, key) {
  return Object.prototype.hasOwnProperty.call(record, key);
}

/**
 * Makes budget coverage fail closed in both directions: every executable
 * package export is accounted for, and every declaration still points at an
 * executable export. An exemption must be exclusive and explain why it exists.
 */
export function getBudgetCoverageFailures(packageExports, budgetPaths, exemptions) {
  const failures = [];
  const executableExports = new Set(
    Object.entries(packageExports)
      .filter(([, definition]) => getExecutableTarget(definition) !== undefined)
      .map(([exportPath]) => exportPath),
  );
  const budgetCounts = new Map();
  for (const exportPath of budgetPaths) {
    budgetCounts.set(exportPath, (budgetCounts.get(exportPath) ?? 0) + 1);
  }

  for (const [exportPath, count] of budgetCounts) {
    if (count > 1) failures.push(`${exportPath}: duplicate budget declarations`);
  }

  for (const exportPath of executableExports) {
    const hasBudget = budgetCounts.has(exportPath);
    const hasExemption = hasOwn(exemptions, exportPath);
    if (!hasBudget && !hasExemption) {
      failures.push(`${exportPath}: missing explicit budget or justified exemption`);
    } else if (hasBudget && hasExemption) {
      failures.push(`${exportPath}: cannot have both a budget and an exemption`);
    }
  }

  for (const exportPath of budgetCounts.keys()) {
    if (!executableExports.has(exportPath)) {
      failures.push(`${exportPath}: budget has no executable package export`);
    }
  }

  for (const [exportPath, reason] of Object.entries(exemptions)) {
    if (!executableExports.has(exportPath)) {
      failures.push(`${exportPath}: exemption has no executable package export`);
    }
    if (typeof reason !== "string" || reason.trim().length === 0) {
      failures.push(`${exportPath}: exemption must include a justification`);
    }
  }

  return failures;
}

/** Builds the reviewed explicit and component-family budgets for one manifest. */
export function getCheckedBudgets(packageJson) {
  const explicitBudgetPaths = new Set(budgets.map(({ exportPath }) => exportPath));
  const componentBudgets = Object.keys(packageJson.exports)
    .filter(
      (exportPath) =>
        exportPath.startsWith("./components/") && !explicitBudgetPaths.has(exportPath),
    )
    .map((exportPath) => ({
      exportPath,
      // A component may compose foundations, semantic colors, and one or two
      // focused helpers. It must never reach the full behavior/recipe barrels.
      maxModules: 9,
      maxRawBytes: 50_000,
      maxGzipBytes: 12_000,
      forbiddenModules: componentBoundaryModules,
    }));
  const largeGraphBudgetIndex = budgets.findIndex(
    ({ exportPath }) => exportPath === "./recipes/all",
  );
  if (largeGraphBudgetIndex < 0) throw new Error("Missing ./recipes/all graph budget anchor");
  return [
    ...budgets.slice(0, largeGraphBudgetIndex),
    ...componentBudgets,
    ...budgets.slice(largeGraphBudgetIndex),
  ];
}

function getModuleDependencies(source) {
  const dependencies = [];
  const esmSpecifier =
    /\b(?:import|export)\s+(?:[^"'()]*?\s+from\s*)?["'](\.\.?\/[^"']+)["']/g;

  for (const match of source.matchAll(esmSpecifier)) {
    const specifier = match[1];
    if (specifier !== undefined) dependencies.push(specifier);
  }
  return dependencies;
}

async function measureGraph(entryFile, availableModules) {
  const visited = new Set();

  async function visit(moduleName) {
    if (visited.has(moduleName)) return;
    if (!availableModules.has(moduleName)) {
      throw new Error(`${entryFile} references missing dist module ${moduleName}`);
    }

    visited.add(moduleName);
    const moduleUrl = new URL(moduleName, distDirectory);
    const source = await readFile(moduleUrl, "utf8");

    for (const specifier of getModuleDependencies(source)) {
      const dependentUrl = new URL(specifier, moduleUrl);
      const dependentName = posix.normalize(
        relative(fileURLToPath(distDirectory), fileURLToPath(dependentUrl)),
      );
      await visit(dependentName);
    }
  }

  await visit(entryFile);
  const modules = [...visited].sort();
  const sources = await Promise.all(
    modules.map((moduleName) => readFile(new URL(moduleName, distDirectory))),
  );
  const graphBytes = Buffer.concat(sources);

  return {
    modules,
    rawBytes: graphBytes.byteLength,
    gzipBytes: gzipSync(graphBytes, { level: 9 }).byteLength,
  };
}

async function assertExportTargetsExist(packageJson) {
  for (const [exportPath, definition] of Object.entries(packageJson.exports)) {
    for (const [condition, target] of Object.entries(definition)) {
      if (typeof target !== "string" || target.includes("*")) continue;
      try {
        await access(new URL(target, repositoryRoot));
      } catch {
        throw new Error(
          `${exportPath} (${condition}) references missing package target ${target}`,
        );
      }
    }
  }
}

function checkBudget(budget, measurement) {
  const failures = [];
  if (measurement.modules.length > budget.maxModules) {
    failures.push(`${measurement.modules.length} modules > ${budget.maxModules}`);
  }
  if (measurement.rawBytes > budget.maxRawBytes) {
    failures.push(`${toDisplayBytes(measurement.rawBytes)} raw > ${toDisplayBytes(budget.maxRawBytes)}`);
  }
  if (measurement.gzipBytes > budget.maxGzipBytes) {
    failures.push(
      `${toDisplayBytes(measurement.gzipBytes)} gzip > ${toDisplayBytes(budget.maxGzipBytes)}`,
    );
  }

  const forbidden = typeof budget.forbiddenModules === "function"
    ? budget.forbiddenModules()
    : budget.forbiddenModules ?? [];
  const leaked = forbidden.filter((moduleName) => measurement.modules.includes(moduleName));
  if (leaked.length > 0) failures.push(`metadata leak: ${leaked.join(", ")}`);

  return failures;
}

async function main() {
  const packageJson = JSON.parse(await readFile(packageJsonUrl, "utf8"));
  await assertExportTargetsExist(packageJson);
  const distFiles = await readdir(distDirectory);
  const availableModules = new Set(distFiles.filter((fileName) => fileName.endsWith(".js")));
  const failures = [];
  const checkedBudgets = getCheckedBudgets(packageJson);
  const coverageFailures = getBudgetCoverageFailures(
    packageJson.exports,
    checkedBudgets.map(({ exportPath }) => exportPath),
    budgetExemptions,
  );
  if (coverageFailures.length > 0) {
    throw new Error(
      `Bundle budget configuration is incomplete:\n- ${coverageFailures.join("\n- ")}`,
    );
  }

  console.log("Metro/Web import-graph budgets");
  for (const budget of checkedBudgets) {
    const target = getExportTarget(packageJson, budget.exportPath);
    const entryFile = target.replace(/^\.\/dist\//, "");
    const measurement = await measureGraph(entryFile, availableModules);
    const budgetFailures = checkBudget(budget, measurement);
    const status = budgetFailures.length === 0 ? "PASS" : "FAIL";

    console.log(
      `${status.padEnd(4)} ${budget.exportPath.padEnd(20)} ` +
        `${String(measurement.modules.length).padStart(2)} modules  ` +
        `${toDisplayBytes(measurement.rawBytes).padStart(9)} raw  ` +
        `${toDisplayBytes(measurement.gzipBytes).padStart(8)} gzip`,
    );

    for (const failure of budgetFailures) {
      failures.push(`${budget.exportPath}: ${failure}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(
      `Bundle budget regression:\n- ${failures.join("\n- ")}\n` +
        `Inspect dist import edges before changing budgets (${fileURLToPath(repositoryRoot)}).`,
    );
  }
}

const isMainModule =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMainModule) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}
