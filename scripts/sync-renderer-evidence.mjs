import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const writeMode = process.argv.includes("--write");
const workspaceRoot = fileURLToPath(new URL("../", import.meta.url));
const generatedDirectory = resolve(
  workspaceRoot,
  "packages/design-contracts/docs/generated",
);
const jsonPath = resolve(generatedDirectory, "renderer-evidence.json");
const markdownPath = resolve(generatedDirectory, "renderer-evidence.md");
const contractManifest = JSON.parse(
  await readFile(resolve(generatedDirectory, "showcase-manifest.json"), "utf8"),
);

const rendererSources = [
  {
    surface: "web",
    packageName: "@hjmds/react",
    modulePath: "packages/react/dist/evidence.js",
    exportName: "reactRendererEvidence",
  },
  {
    surface: "native",
    packageName: "@hjmds/react-native",
    modulePath: "packages/react-native/dist/evidence.js",
    exportName: "reactNativeRendererEvidence",
  },
];

function escapeCell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

async function readExisting(path) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

const surfaces = {};
for (const source of rendererSources) {
  const module = await import(
    pathToFileURL(resolve(workspaceRoot, source.modulePath)).href
  );
  const evidence = module[source.exportName];
  if (!evidence || evidence.packageName !== source.packageName) {
    throw new Error(`${source.modulePath} is missing ${source.exportName}`);
  }
  const claimById = new Map(
    evidence.components.map((claim) => [claim.componentId, claim]),
  );
  const components = contractManifest.components
    .filter(({ surfaces }) => ["stable", "beta"].includes(surfaces[source.surface]))
    .map((component) => {
      const claim = claimById.get(component.id);
      const requiredScenarios = component.requirements.find(
        ({ surface }) => surface === source.surface,
      )?.scenarios ?? [];
      const claimedScenarios = claim ? [...claim.scenarios] : [];
      return {
        componentId: component.id,
        name: component.name,
        status: component.surfaces[source.surface],
        claimed: claim !== undefined,
        subpath: claim?.subpath ?? null,
        exportNames: claim ? [...claim.exportNames] : [],
        proofs: claim
          ? claim.proofs.map((proof) => ({
              scenarios: [...proof.scenarios],
              file: proof.file,
              caseId: proof.caseId,
            }))
          : [],
        requiredScenarios,
        claimedScenarios,
        missingScenarios: requiredScenarios.filter(
          (scenario) => !claimedScenarios.includes(scenario),
        ),
      };
    });
  surfaces[source.surface] = {
    packageName: evidence.packageName,
    packageVersion: evidence.packageVersion,
    activeComponents: components.length,
    claimedComponents: components.filter(({ claimed }) => claimed).length,
    completeScenarioComponents: components.filter(
      ({ missingScenarios }) => missingScenarios.length === 0,
    ).length,
    components,
  };
}

const artifact = {
  schemaVersion: 1,
  designSystemVersion: contractManifest.designSystemVersion,
  source: "packages/design-contracts/docs/generated/showcase-manifest.json",
  surfaces,
};
const json = `${JSON.stringify(artifact, null, 2)}\n`;
const summaryLines = Object.entries(surfaces).map(
  ([surface, summary]) =>
    `- ${surface}: ${summary.claimedComponents}/${summary.activeComponents} active implementations; ` +
    `${summary.completeScenarioComponents}/${summary.activeComponents} full scenario sets`,
);
const rows = Object.entries(surfaces).flatMap(([surface, summary]) =>
  summary.components.map((component) =>
    `| ${escapeCell(component.name)} | ${surface} | ${component.status} | ` +
      `${escapeCell(summary.packageName)} | ${component.subpath ?? "unclaimed"} | ` +
      `${escapeCell(component.claimedScenarios.join(", ") || "none")} | ` +
      `${escapeCell(component.missingScenarios.join(", ") || "none")} | ` +
      `${escapeCell(component.proofs.map(({ file, caseId }) => `${file}#${caseId}`).join(", ") || "none")} |`,
  ),
);
const markdown = `${[
  "# Renderer evidence coverage",
  "",
  `> Generated for HJM ${contractManifest.designSystemVersion}. Do not edit directly; run \`pnpm evidence:sync\`.`,
  "",
  "This projection joins the canonical surface maturity manifest with first-party renderer claims. Missing scenarios are explicit beta promotion debt; stable surfaces are blocked by CI until none remain.",
  "",
  ...summaryLines,
  "",
  "| Component | Surface | Maturity | Renderer package | Export | Claimed scenarios | Missing required scenarios | Executable proofs |",
  "| --- | --- | --- | --- | --- | --- | --- | --- |",
  ...rows,
].join("\n")}\n`;

if (writeMode) {
  await mkdir(generatedDirectory, { recursive: true });
  await Promise.all([
    writeFile(jsonPath, json, "utf8"),
    writeFile(markdownPath, markdown, "utf8"),
  ]);
  console.log("Synchronized first-party renderer evidence coverage.");
} else {
  const [existingJson, existingMarkdown] = await Promise.all([
    readExisting(jsonPath),
    readExisting(markdownPath),
  ]);
  const stale = [];
  if (existingJson !== json) stale.push("renderer-evidence.json");
  if (existingMarkdown !== markdown) stale.push("renderer-evidence.md");
  if (stale.length > 0) {
    throw new Error(
      `Generated renderer evidence is missing or stale: ${stale.join(", ")}\n` +
        "Run pnpm evidence:sync and commit the result.",
    );
  }
  console.log("Verified synchronized first-party renderer evidence coverage.");
}
