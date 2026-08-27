import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const workspaceRoot = fileURLToPath(new URL("../", import.meta.url));
const activeRendererStatuses = new Set(["stable", "beta"]);

const packageRecords = [
  { key: "contracts", path: "packages/design-contracts", name: "@hjm/design-contracts" },
  { key: "web", path: "packages/react", name: "@hjm/react" },
  { key: "native", path: "packages/react-native", name: "@hjm/react-native" },
];

const rendererRecords = [
  {
    key: "web",
    surface: "web",
    evidenceExport: "reactRendererEvidence",
    scenarioRegistry: "test/executed-scenarios.json",
  },
  {
    key: "native",
    surface: "native",
    evidenceExport: "reactNativeRendererEvidence",
    scenarioRegistry: "test/executed-scenarios.json",
  },
];

async function readJson(path) {
  return JSON.parse(await readFile(resolve(workspaceRoot, path), "utf8"));
}

function requireString(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value;
}

function parseStableVersion(version, label) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) throw new Error(`${label} is not a stable semver: ${version}`);
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

function assertContractsPeerTrain(rendererName, peerRange, fixedVersion) {
  const match = /^>=(\d+)\.(\d+)\.0 <(\d+)\.(\d+)\.0$/.exec(peerRange ?? "");
  if (!match) {
    throw new Error(
      `${rendererName} contracts peer must be one explicit minor train, for example >=0.6.0 <0.7.0; received ${String(peerRange)}`,
    );
  }
  const minimum = { major: Number(match[1]), minor: Number(match[2]) };
  const upper = { major: Number(match[3]), minor: Number(match[4]) };
  if (minimum.major !== upper.major || upper.minor !== minimum.minor + 1) {
    throw new Error(`${rendererName} contracts peer ${peerRange} spans more than one minor train`);
  }

  const current = parseStableVersion(fixedVersion, "fixed package version");
  const isCurrentTrain = minimum.major === current.major && minimum.minor === current.minor;
  // Before the first monorepo version PR, renderer code targets the authored
  // next-minor release while package.json still carries the previous Git tag.
  const isAuthoredNextTrain = current.major === 0
    && minimum.major === 0
    && minimum.minor === current.minor + 1;
  if (!isCurrentTrain && !isAuthoredNextTrain) {
    throw new Error(
      `${rendererName} contracts peer ${peerRange} is not aligned with ${fixedVersion} or its authored next minor`,
    );
  }
}

function runtimeTarget(exportsMap, subpath, surface) {
  const definition = exportsMap[subpath];
  if (typeof definition === "string") return definition;
  if (definition === null || typeof definition !== "object") return undefined;
  if (surface === "native" && typeof definition["react-native"] === "string") {
    return definition["react-native"];
  }
  if (typeof definition.import === "string") return definition.import;
  if (typeof definition.default === "string") return definition.default;
  return undefined;
}

async function readRuntimeExportNames(modulePath, visited = new Set()) {
  const normalizedPath = resolve(modulePath);
  if (visited.has(normalizedPath)) return new Set();
  visited.add(normalizedPath);
  const source = await readFile(normalizedPath, "utf8");
  const names = new Set();
  const declarations = /\bexport\s+(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)/g;
  for (const match of source.matchAll(declarations)) {
    if (match[1] !== undefined) names.add(match[1]);
  }
  const lists = /\bexport\s*\{([^}]+)\}/g;
  for (const match of source.matchAll(lists)) {
    for (const item of (match[1] ?? "").split(",")) {
      const normalized = item.trim().replace(/^type\s+/, "");
      if (normalized.length === 0) continue;
      const alias = normalized.split(/\s+as\s+/);
      const exported = alias.at(-1)?.trim();
      if (exported) names.add(exported);
    }
  }
  const stars = /\bexport\s*\*\s*from\s*["']([^"']+)["']/g;
  for (const match of source.matchAll(stars)) {
    const specifier = match[1];
    if (specifier?.startsWith(".")) {
      const nested = await readRuntimeExportNames(
        resolve(dirname(normalizedPath), specifier),
        visited,
      );
      for (const name of nested) names.add(name);
    }
  }
  return names;
}

async function assertExportFiles(packageRecord) {
  const exportsMap = packageRecord.packageJson.exports;
  if (exportsMap === null || typeof exportsMap !== "object") {
    throw new Error(`${packageRecord.name} must declare package exports`);
  }
  for (const [subpath, definition] of Object.entries(exportsMap)) {
    const targets = typeof definition === "string"
      ? [definition]
      : definition && typeof definition === "object"
        ? Object.values(definition).filter((target) => typeof target === "string")
        : [];
    if (targets.length === 0) throw new Error(`${packageRecord.name} ${subpath} has no file target`);
    for (const target of targets) {
      if (target.includes("*")) continue;
      try {
        await access(resolve(packageRecord.directory, target));
      } catch {
        throw new Error(`${packageRecord.name} ${subpath} references missing ${target}`);
      }
    }
  }
}

const packages = await Promise.all(
  packageRecords.map(async (record) => {
    const directory = resolve(workspaceRoot, record.path);
    const packageJson = await readJson(`${record.path}/package.json`);
    if (packageJson.name !== record.name) {
      throw new Error(`${record.path}/package.json is ${packageJson.name}, expected ${record.name}`);
    }
    requireString(packageJson.version, `${record.name} version`);
    return { ...record, directory, packageJson };
  }),
);
const packageByKey = new Map(packages.map((record) => [record.key, record]));
const versions = new Set(packages.map(({ packageJson }) => packageJson.version));
if (versions.size !== 1) {
  throw new Error(
    `HJM fixed release versions drifted:\n${packages
      .map(({ name, packageJson }) => `${name}: ${packageJson.version}`)
      .join("\n")}`,
  );
}
const fixedVersion = packages[0].packageJson.version;

for (const key of ["web", "native"]) {
  const renderer = packageByKey.get(key);
  const peerRange = renderer.packageJson.peerDependencies?.["@hjm/design-contracts"];
  assertContractsPeerTrain(renderer.name, peerRange, fixedVersion);
  const developmentRange = renderer.packageJson.devDependencies?.["@hjm/design-contracts"];
  if (typeof developmentRange !== "string" || !developmentRange.startsWith("workspace:")) {
    throw new Error(`${renderer.name} must develop against a workspace: contracts dependency`);
  }
}

await Promise.all(packages.map(assertExportFiles));

const catalogModule = await import(
  pathToFileURL(resolve(workspaceRoot, "packages/design-contracts/dist/catalog.js")).href
);
const { componentCatalog, getComponentSurfaceStatus } = catalogModule;
if (!Array.isArray(componentCatalog) || typeof getComponentSurfaceStatus !== "function") {
  throw new Error("contracts dist/catalog.js is missing the catalog surface API");
}
const generatedManifest = await readJson(
  "packages/design-contracts/docs/generated/showcase-manifest.json",
);
if (generatedManifest.schemaVersion !== 2) {
  throw new Error(
    `generated showcase manifest schema is ${generatedManifest.schemaVersion}, expected 2`,
  );
}
if (generatedManifest.packageName !== "@hjm/design-contracts") {
  throw new Error(`generated manifest package is ${generatedManifest.packageName}`);
}
if (generatedManifest.designSystemVersion !== fixedVersion) {
  throw new Error(
    `generated manifest version ${generatedManifest.designSystemVersion} != ${fixedVersion}`,
  );
}
if (!Array.isArray(generatedManifest.components)) {
  throw new Error("generated showcase manifest components must be an array");
}

const catalogByName = new Map(componentCatalog.map((entry) => [entry.name, entry]));
const docsById = new Map();
for (const component of generatedManifest.components) {
  requireString(component.id, "generated component id");
  requireString(component.name, `generated ${component.id} name`);
  if (docsById.has(component.id)) throw new Error(`duplicate generated component id: ${component.id}`);
  docsById.set(component.id, component);
  const catalogEntry = catalogByName.get(component.name);
  if (!catalogEntry) throw new Error(`generated ${component.id} has no catalog entry ${component.name}`);
  for (const surface of ["web", "native"]) {
    const catalogStatus = getComponentSurfaceStatus(catalogEntry, surface);
    if (component.surfaces?.[surface] !== catalogStatus) {
      throw new Error(
        `${component.id} ${surface} generated status ${component.surfaces?.[surface]} ` +
          `!= catalog ${catalogStatus}`,
      );
    }
  }
  const documentation = component.documentation;
  if (
    documentation === null ||
    typeof documentation !== "object" ||
    typeof documentation.generated !== "string" ||
    documentation.generated.trim().length === 0 ||
    !(documentation.authored === null || typeof documentation.authored === "string")
  ) {
    throw new Error(`generated ${component.id} has an invalid schema-v2 documentation record`);
  }
  for (const [kind, documentationPath] of Object.entries(documentation)) {
    if (documentationPath === null) continue;
    if (!documentationPath.startsWith("docs/") || documentationPath.includes("..")) {
      throw new Error(`generated ${component.id} has unsafe ${kind} documentation path`);
    }
    try {
      await access(resolve(packageByKey.get("contracts").directory, documentationPath));
    } catch {
      throw new Error(
        `generated ${component.id} references missing ${kind} documentation ${documentationPath}`,
      );
    }
  }
}
if (docsById.size !== componentCatalog.length) {
  throw new Error(
    `generated/catalog component count drift: ${docsById.size} != ${componentCatalog.length}`,
  );
}

for (const record of rendererRecords) {
  const renderer = packageByKey.get(record.key);
  const evidenceTarget = runtimeTarget(renderer.packageJson.exports, "./evidence", record.surface);
  if (typeof evidenceTarget !== "string") {
    throw new Error(`${renderer.name} does not export ./evidence`);
  }
  const evidenceModule = await import(
    pathToFileURL(resolve(renderer.directory, evidenceTarget)).href
  );
  const evidence = evidenceModule[record.evidenceExport];
  if (!evidence || typeof evidence !== "object") {
    throw new Error(`${renderer.name} ./evidence is missing ${record.evidenceExport}`);
  }
  if (!Number.isInteger(evidence.schemaVersion) || evidence.schemaVersion < 1) {
    throw new Error(`${renderer.name} evidence schemaVersion must be a positive integer`);
  }
  if (evidence.packageName !== renderer.name || evidence.packageVersion !== fixedVersion) {
    throw new Error(
      `${renderer.name} evidence package/version drift: ${evidence.packageName}@${evidence.packageVersion}`,
    );
  }
  if (evidence.surface !== record.surface) {
    throw new Error(`${renderer.name} evidence surface is ${evidence.surface}`);
  }
  if (!Array.isArray(evidence.components) || evidence.components.length === 0) {
    throw new Error(`${renderer.name} evidence must claim at least one component`);
  }

  const scenarioRegistry = await readJson(`${renderer.path}/${record.scenarioRegistry}`);
  if (scenarioRegistry.schemaVersion !== 1 || !Array.isArray(scenarioRegistry.executions)) {
    throw new Error(`${renderer.name} has an invalid executed-scenario registry`);
  }
  const executionByProofFile = new Map();
  for (const execution of scenarioRegistry.executions) {
    const proofFile = requireString(execution.proofFile, `${renderer.name} registry proofFile`);
    if (execution.coverageMode !== "all-cases") {
      throw new Error(`${renderer.name} ${proofFile} must declare all-cases coverage`);
    }
    if (!Array.isArray(execution.scenarios) || execution.scenarios.length === 0) {
      throw new Error(`${renderer.name} ${proofFile} registry has no scenarios`);
    }
    const scenarioIds = execution.scenarios.map(({ id }) => requireString(id, `${renderer.name} registry scenario`));
    if (new Set(scenarioIds).size !== scenarioIds.length) {
      throw new Error(`${renderer.name} ${proofFile} registry repeats a scenario`);
    }
    if (executionByProofFile.has(proofFile)) {
      throw new Error(`${renderer.name} registry repeats ${proofFile}`);
    }
    executionByProofFile.set(proofFile, new Set(scenarioIds));
  }

  const seenIds = new Set();
  const exportedNamesBySubpath = new Map();
  const proofSourcesByPath = new Map();
  for (const claim of evidence.components) {
    const componentId = requireString(claim.componentId, `${renderer.name} componentId`);
    if (seenIds.has(componentId)) {
      throw new Error(`${renderer.name} evidence repeats ${componentId}`);
    }
    seenIds.add(componentId);
    const documented = docsById.get(componentId);
    if (!documented) throw new Error(`${renderer.name} evidence has unknown id ${componentId}`);
    const status = documented.surfaces?.[record.surface];
    if (!activeRendererStatuses.has(status)) {
      throw new Error(
        `${renderer.name} evidence claims ${componentId}, but ${record.surface} is ${status}`,
      );
    }

    const requirement = documented.requirements?.find(
      ({ surface }) => surface === record.surface,
    );
    if (!requirement) {
      throw new Error(`${componentId} has no generated ${record.surface} evidence requirement`);
    }
    if (!Array.isArray(claim.scenarios) || claim.scenarios.length === 0) {
      throw new Error(`${renderer.name} ${componentId} must claim at least one scenario`);
    }
    if (new Set(claim.scenarios).size !== claim.scenarios.length) {
      throw new Error(`${renderer.name} ${componentId} repeats a scenario`);
    }
    for (const scenario of claim.scenarios) {
      if (!requirement.scenarios.includes(scenario)) {
        throw new Error(
          `${renderer.name} ${componentId} claims unsupported ${record.surface} scenario ${scenario}`,
        );
      }
    }
    if (!claim.scenarios.includes("default")) {
      throw new Error(`${renderer.name} ${componentId} beta/stable evidence must include default`);
    }
    if (!Array.isArray(claim.proofs) || claim.proofs.length === 0) {
      throw new Error(`${renderer.name} ${componentId} must attach executable scenario proofs`);
    }
    const provenScenarios = new Set();
    for (const proof of claim.proofs) {
      if (!Array.isArray(proof.scenarios) || proof.scenarios.length === 0) {
        throw new Error(`${renderer.name} ${componentId} proof has no scenarios`);
      }
      const proofFile = requireString(
        proof.file,
        `${renderer.name} ${componentId} proof file`,
      );
      const executableProofPattern = record.surface === "web"
        ? /^test\/.*\.(?:ssr|browser)\.test\.[cm]?[jt]sx?$/
        : /^test\/.*\.test\.[cm]?[jt]sx?$/;
      if (
        !proofFile.startsWith("test/") ||
        proofFile.includes("..") ||
        !executableProofPattern.test(proofFile)
      ) {
        throw new Error(
          `${renderer.name} ${componentId} proof is outside an executed test include: ${proofFile}`,
        );
      }
      const caseId = requireString(
        proof.caseId,
        `${renderer.name} ${componentId} proof caseId`,
      );
      if (proof.scenarios.includes("default")) {
        const canonicalDefaultProof = record.surface === "web"
          ? "test/default-render.ssr.test.tsx"
          : "test/default-render.test.tsx";
        if (proofFile !== canonicalDefaultProof || caseId !== componentId) {
          throw new Error(
            `${renderer.name} ${componentId} default proof must use ${canonicalDefaultProof} with caseId ${componentId}`,
          );
        }
      }
      let proofSource = proofSourcesByPath.get(proofFile);
      if (proofSource === undefined) {
        try {
          proofSource = await readFile(resolve(renderer.directory, proofFile), "utf8");
        } catch {
          throw new Error(`${renderer.name} ${componentId} proof file is missing: ${proofFile}`);
        }
        proofSourcesByPath.set(proofFile, proofSource);
      }
      if (!proofSource.includes(caseId)) {
        throw new Error(
          `${renderer.name} ${componentId} proof case ${caseId} is absent from ${proofFile}`,
        );
      }
      const registeredScenarios = executionByProofFile.get(proofFile);
      if (!registeredScenarios || !proofSource.includes(record.scenarioRegistry.split("/").at(-1))) {
        throw new Error(
          `${renderer.name} ${componentId} proof ${proofFile} is not joined to its executed-scenario registry`,
        );
      }
      for (const scenario of proof.scenarios) {
        if (!claim.scenarios.includes(scenario)) {
          throw new Error(
            `${renderer.name} ${componentId} proof covers unclaimed scenario ${scenario}`,
          );
        }
        if (!registeredScenarios.has(scenario)) {
          throw new Error(
            `${renderer.name} ${componentId} proof ${proofFile} has no registered ${scenario} execution`,
          );
        }
        provenScenarios.add(scenario);
      }
    }
    const unprovenScenarios = claim.scenarios.filter(
      (scenario) => !provenScenarios.has(scenario),
    );
    if (unprovenScenarios.length > 0) {
      throw new Error(
        `${renderer.name} ${componentId} has no executable proof for: ${unprovenScenarios.join(", ")}`,
      );
    }
    if (status === "stable") {
      const missingScenarios = requirement.scenarios.filter(
        (scenario) => !claim.scenarios.includes(scenario),
      );
      if (missingScenarios.length > 0) {
        throw new Error(
          `${renderer.name} stable ${componentId} is missing scenarios: ${missingScenarios.join(", ")}`,
        );
      }
    }

    const subpath = requireString(claim.subpath, `${renderer.name} ${componentId} subpath`);
    const target = runtimeTarget(renderer.packageJson.exports, subpath, record.surface);
    if (typeof target !== "string") {
      throw new Error(`${renderer.name} ${componentId} references missing export ${subpath}`);
    }
    let publicExportNames = exportedNamesBySubpath.get(subpath);
    if (!publicExportNames) {
      publicExportNames = await readRuntimeExportNames(resolve(renderer.directory, target));
      exportedNamesBySubpath.set(subpath, publicExportNames);
    }
    if (!Array.isArray(claim.exportNames) || claim.exportNames.length === 0) {
      throw new Error(`${renderer.name} ${componentId} has no exportNames`);
    }
    if (new Set(claim.exportNames).size !== claim.exportNames.length) {
      throw new Error(`${renderer.name} ${componentId} repeats an exportName`);
    }
    for (const exportName of claim.exportNames) {
      requireString(exportName, `${renderer.name} ${componentId} exportName`);
      if (!publicExportNames.has(exportName)) {
        throw new Error(`${renderer.name} ${subpath} does not export ${exportName}`);
      }
    }
  }

  const activeIds = generatedManifest.components
    .filter(({ surfaces }) => activeRendererStatuses.has(surfaces?.[record.surface]))
    .map(({ id }) => id);
  const unclaimed = activeIds.filter((id) => !seenIds.has(id));
  if (unclaimed.length > 0) {
    throw new Error(
      `${renderer.name} is missing first-party evidence for active ${record.surface} contracts: ${unclaimed.join(", ")}`,
    );
  }
  console.log(
    `${renderer.name}: ${seenIds.size}/${activeIds.length} active ${record.surface} contracts claimed.`,
  );
}

console.log(`Verified fixed ${fixedVersion} package, export, catalog, docs, and evidence sync.`);
