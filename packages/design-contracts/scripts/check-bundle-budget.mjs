import { access, readFile, readdir } from "node:fs/promises";
import { posix, relative } from "node:path";
import { fileURLToPath } from "node:url";
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
    exportPath: ".",
    // The compatibility root intentionally reaches every contract. Granular
    // consumers are guarded separately below, so module splitting may raise
    // this count without increasing the root byte graph.
    maxModules: 70,
    maxRawBytes: 460_000,
    maxGzipBytes: 110_000,
  },
];

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
  const checkedBudgets = [
    ...budgets.slice(0, 11),
    ...componentBudgets,
    ...budgets.slice(11),
  ];

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

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
