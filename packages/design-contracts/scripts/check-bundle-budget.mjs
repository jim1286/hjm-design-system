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
    maxGzipBytes: 1_200,
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
    exportPath: "./recipes",
    // The public recipe facade fans out to deliberately small recipe modules;
    // byte budgets keep that split from becoming a size regression.
    maxModules: 14,
    maxRawBytes: 80_000,
    maxGzipBytes: 18_000,
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
    exportPath: "./recipes/all",
    maxModules: 46,
    maxRawBytes: 365_000,
    maxGzipBytes: 85_000,
  },
  {
    exportPath: "./behaviors",
    maxModules: 40,
    maxRawBytes: 330_000,
    maxGzipBytes: 76_000,
  },
  {
    exportPath: "./catalog",
    maxModules: 50,
    maxRawBytes: 390_000,
    maxGzipBytes: 92_000,
  },
  {
    exportPath: "./showcase",
    maxModules: 51,
    maxRawBytes: 390_000,
    maxGzipBytes: 92_000,
  },
  {
    exportPath: "./evidence",
    maxModules: 53,
    maxRawBytes: 400_000,
    maxGzipBytes: 95_000,
  },
  {
    exportPath: ".",
    // The compatibility root intentionally reaches every contract. Granular
    // consumers are guarded separately below, so module splitting may raise
    // this count without increasing the root byte graph.
    maxModules: 70,
    maxRawBytes: 460_000,
    maxGzipBytes: 110_000,
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
