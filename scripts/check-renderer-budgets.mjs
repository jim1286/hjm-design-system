import { access, readFile, readdir } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const workspaceRoot = fileURLToPath(new URL("../", import.meta.url));

// Baselines are the 0.6 renderer graphs with roughly 20-30% byte headroom.
// Module limits are deliberately tighter: adding an import edge must be an
// explicit review instead of being hidden inside gzip variance.
const rendererBudgets = [
  {
    packageName: "@hjm/react",
    directory: "packages/react",
    surface: "web",
    budgets: {
      ".": { modules: 21, raw: 210_000, gzip: 40_500 },
      "./provider": { modules: 3, raw: 9_500, gzip: 2_800 },
      "./layout": { modules: 2, raw: 7_500, gzip: 2_300 },
      "./actions": { modules: 2, raw: 6_500, gzip: 2_000 },
      "./forms": { modules: 7, raw: 70_000, gzip: 13_500 },
      "./number-field": { modules: 2, raw: 12_000, gzip: 3_600 },
      "./slider": { modules: 2, raw: 12_000, gzip: 3_300 },
      "./selection": { modules: 2, raw: 21_000, gzip: 4_100 },
      "./navigation": { modules: 7, raw: 31_000, gzip: 7_500 },
      "./display": { modules: 8, raw: 42_000, gzip: 11_000 },
      "./overlays": { modules: 5, raw: 60_000, gzip: 12_200 },
      "./feedback": { modules: 2, raw: 8_000, gzip: 2_300 },
      "./toast": { modules: 4, raw: 22_000, gzip: 5_800 },
      "./evidence": { modules: 1, raw: 7_000, gzip: 1_300 },
    },
    cssBudgets: {
      "./styles.css": { raw: 65_000, gzip: 12_000 },
    },
  },
  {
    packageName: "@hjm/react-native",
    directory: "packages/react-native",
    surface: "native",
    budgets: {
      ".": { modules: 14, raw: 205_000, gzip: 35_500 },
      "./provider": { modules: 1, raw: 4_000, gzip: 1_300 },
      "./primitives": { modules: 3, raw: 13_000, gzip: 3_600 },
      "./actions": { modules: 4, raw: 22_500, gzip: 5_200 },
      "./inputs": { modules: 8, raw: 65_000, gzip: 12_000 },
      "./number-field": { modules: 4, raw: 18_000, gzip: 4_500 },
      "./slider": { modules: 4, raw: 18_000, gzip: 4_400 },
      "./forms": { modules: 6, raw: 52_500, gzip: 10_500 },
      "./navigation": { modules: 7, raw: 72_500, gzip: 14_600 },
      "./data-display": { modules: 5, raw: 36_000, gzip: 8_000 },
      "./feedback": { modules: 5, raw: 42_000, gzip: 9_100 },
      "./overlays": { modules: 5, raw: 47_500, gzip: 9_200 },
      "./evidence": { modules: 1, raw: 8_000, gzip: 1_300 },
    },
    cssBudgets: {},
  },
];

function formatBytes(value) {
  return `${(value / 1_000).toFixed(1)} kB`;
}

function getRuntimeTarget(definition, surface) {
  if (typeof definition === "string") return definition;
  if (definition === null || typeof definition !== "object") return undefined;
  if (surface === "native" && typeof definition["react-native"] === "string") {
    return definition["react-native"];
  }
  if (typeof definition.import === "string") return definition.import;
  if (typeof definition.default === "string") return definition.default;
  return undefined;
}

function getModuleSpecifiers(source) {
  const specifiers = [];
  const staticEsm = /\b(?:import|export)\s+(?:[^"'()]*?\s+from\s*)?["']([^"']+)["']/g;
  const dynamicEsm = /\bimport\(\s*["']([^"']+)["']\s*\)/g;
  for (const expression of [staticEsm, dynamicEsm]) {
    for (const match of source.matchAll(expression)) {
      if (match[1] !== undefined) specifiers.push(match[1]);
    }
  }
  return specifiers;
}

function forbiddenReason(specifier, surface) {
  if (specifier === "@hjm/design-contracts") {
    return "imports the contracts root barrel; use a granular contracts subpath";
  }
  if (specifier.includes("/src/") || specifier.includes("/dist/")) {
    return "reaches through a package's private src/dist boundary";
  }
  if (surface === "web") {
    if (
      specifier === "react-native" ||
      specifier.startsWith("react-native/") ||
      specifier.startsWith("react-native-") ||
      specifier.startsWith("@react-native/") ||
      specifier === "@hjm/react-native" ||
      specifier.startsWith("@hjm/react-native/")
    ) {
      return "pulls React Native code into the Web renderer";
    }
  } else if (
    specifier === "react-dom" ||
    specifier.startsWith("react-dom/") ||
    specifier === "react-native-web" ||
    specifier.startsWith("react-native-web/") ||
    specifier === "@hjm/react" ||
    specifier.startsWith("@hjm/react/")
  ) {
    return "pulls Web renderer code into the Native renderer";
  }
  if (
    specifier === "expo" ||
    specifier.startsWith("expo/") ||
    specifier.startsWith("expo-") ||
    specifier.startsWith("@expo/")
  ) {
    return "introduces an Expo runtime dependency into an Expo-independent renderer";
  }
  return undefined;
}

async function readJavaScriptFiles(distDirectory) {
  const files = await readdir(distDirectory, { recursive: true });
  return files
    .filter((file) => typeof file === "string" && file.endsWith(".js"))
    .map((file) => resolve(distDirectory, file));
}

async function measureGraph(entryFile, distDirectory, availableFiles) {
  const visited = new Set();
  const externals = new Set();

  async function visit(modulePath) {
    const normalized = resolve(modulePath);
    const relativePath = relative(distDirectory, normalized);
    if (relativePath.startsWith(`..${sep}`) || relativePath === "..") {
      throw new Error(`${entryFile} escapes its renderer dist boundary via ${modulePath}`);
    }
    if (!availableFiles.has(normalized)) {
      throw new Error(`${entryFile} references missing dist module ${relativePath}`);
    }
    if (visited.has(normalized)) return;
    visited.add(normalized);
    const source = await readFile(normalized, "utf8");
    for (const specifier of getModuleSpecifiers(source)) {
      if (specifier.startsWith(".")) {
        await visit(resolve(dirname(normalized), specifier));
      } else {
        externals.add(specifier);
      }
    }
  }

  await visit(entryFile);
  const sources = await Promise.all([...visited].sort().map((file) => readFile(file)));
  const bytes = Buffer.concat(sources);
  return {
    modules: visited.size,
    raw: bytes.byteLength,
    gzip: gzipSync(bytes, { level: 9 }).byteLength,
    externals: [...externals].sort(),
  };
}

async function checkRenderer(renderer) {
  const packageDirectory = resolve(workspaceRoot, renderer.directory);
  const packageJsonPath = resolve(packageDirectory, "package.json");
  const distDirectory = resolve(packageDirectory, "dist");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
  if (packageJson.name !== renderer.packageName) {
    throw new Error(`${renderer.directory} is ${packageJson.name}, expected ${renderer.packageName}`);
  }

  const javaScriptFiles = await readJavaScriptFiles(distDirectory);
  const availableFiles = new Set(javaScriptFiles.map((file) => resolve(file)));
  const failures = [];

  for (const modulePath of javaScriptFiles) {
    const source = await readFile(modulePath, "utf8");
    for (const specifier of getModuleSpecifiers(source)) {
      if (specifier.startsWith(".")) continue;
      const reason = forbiddenReason(specifier, renderer.surface);
      if (reason) {
        failures.push(`${relative(packageDirectory, modulePath)} imports ${specifier}: ${reason}`);
      }
    }
  }

  const executableExports = Object.entries(packageJson.exports)
    .map(([exportPath, definition]) => [
      exportPath,
      getRuntimeTarget(definition, renderer.surface),
    ])
    .filter(([, target]) => typeof target === "string" && target.endsWith(".js"));
  const executableExportNames = new Set(executableExports.map(([exportPath]) => exportPath));
  for (const exportPath of executableExportNames) {
    if (!(exportPath in renderer.budgets)) failures.push(`${exportPath}: missing explicit budget`);
  }
  for (const exportPath of Object.keys(renderer.budgets)) {
    if (!executableExportNames.has(exportPath)) failures.push(`${exportPath}: budget has no package export`);
  }

  const cssExports = Object.entries(packageJson.exports)
    .map(([exportPath, definition]) => [
      exportPath,
      getRuntimeTarget(definition, renderer.surface),
    ])
    .filter(([, target]) => typeof target === "string" && target.endsWith(".css"));
  const cssExportNames = new Set(cssExports.map(([exportPath]) => exportPath));
  for (const exportPath of cssExportNames) {
    if (!(exportPath in renderer.cssBudgets)) failures.push(`${exportPath}: missing explicit CSS budget`);
  }
  for (const exportPath of Object.keys(renderer.cssBudgets)) {
    if (!cssExportNames.has(exportPath)) failures.push(`${exportPath}: CSS budget has no package export`);
  }

  console.log(`\n${renderer.packageName} import-graph budgets`);
  for (const [exportPath, target] of executableExports) {
    const budget = renderer.budgets[exportPath];
    if (!budget || typeof target !== "string") continue;
    const entryFile = resolve(packageDirectory, target);
    await access(entryFile);
    const measured = await measureGraph(entryFile, distDirectory, availableFiles);
    const regressions = [];
    if (measured.modules > budget.modules) {
      regressions.push(`${measured.modules} modules > ${budget.modules}`);
    }
    if (measured.raw > budget.raw) {
      regressions.push(`${formatBytes(measured.raw)} raw > ${formatBytes(budget.raw)}`);
    }
    if (measured.gzip > budget.gzip) {
      regressions.push(`${formatBytes(measured.gzip)} gzip > ${formatBytes(budget.gzip)}`);
    }
    const status = regressions.length === 0 ? "PASS" : "FAIL";
    console.log(
      `${status.padEnd(4)} ${exportPath.padEnd(20)} ` +
        `${String(measured.modules).padStart(2)} modules  ` +
        `${formatBytes(measured.raw).padStart(9)} raw  ` +
        `${formatBytes(measured.gzip).padStart(8)} gzip`,
    );
    for (const regression of regressions) failures.push(`${exportPath}: ${regression}`);
  }

  for (const [exportPath, target] of cssExports) {
    const budget = renderer.cssBudgets[exportPath];
    if (!budget || typeof target !== "string") continue;
    const bytes = await readFile(resolve(packageDirectory, target));
    const measured = { raw: bytes.byteLength, gzip: gzipSync(bytes, { level: 9 }).byteLength };
    const regressions = [];
    if (measured.raw > budget.raw) {
      regressions.push(`${formatBytes(measured.raw)} raw > ${formatBytes(budget.raw)}`);
    }
    if (measured.gzip > budget.gzip) {
      regressions.push(`${formatBytes(measured.gzip)} gzip > ${formatBytes(budget.gzip)}`);
    }
    const status = regressions.length === 0 ? "PASS" : "FAIL";
    console.log(
      `${status.padEnd(4)} ${exportPath.padEnd(20)} ` +
        `${formatBytes(measured.raw).padStart(9)} raw  ` +
        `${formatBytes(measured.gzip).padStart(8)} gzip`,
    );
    for (const regression of regressions) failures.push(`${exportPath}: ${regression}`);
  }

  if (failures.length > 0) {
    throw new Error(`${renderer.packageName} renderer budget regression:\n- ${failures.join("\n- ")}`);
  }
}

for (const renderer of rendererBudgets) await checkRenderer(renderer);
console.log("\nVerified renderer graph budgets and platform boundaries.");
