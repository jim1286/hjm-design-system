import { readFile } from "node:fs/promises";

const registryUrl =
  process.env.ANTD_REGISTRY_URL ?? "https://registry.npmjs.org/antd/latest";
const referenceSourceUrl = new URL("../src/component-references.ts", import.meta.url);

function readPinnedVersion(source) {
  const systemBlock = source.match(
    /export const antDesignReferenceSystem = \{[\s\S]*?\n\} as const;/,
  )?.[0];
  const version = systemBlock?.match(/\bversion:\s*"([^"]+)"/)?.[1];
  if (version === undefined) {
    throw new Error(
      "Could not read antDesignReferenceSystem.version from src/component-references.ts",
    );
  }
  return version;
}

async function fetchLatestVersion(url) {
  const response = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`npm registry returned ${response.status} ${response.statusText}`);
  }
  const metadata = await response.json();
  if (
    typeof metadata !== "object" ||
    metadata === null ||
    !("version" in metadata) ||
    typeof metadata.version !== "string" ||
    metadata.version.trim().length === 0
  ) {
    throw new Error("npm registry response did not contain a version string");
  }
  return metadata.version;
}

try {
  const source = await readFile(referenceSourceUrl, "utf8");
  const pinnedVersion = readPinnedVersion(source);
  const latestVersion = await fetchLatestVersion(registryUrl);

  if (pinnedVersion !== latestVersion) {
    console.error(
      `Ant Design reference drift detected: pinned ${pinnedVersion}, npm latest ${latestVersion}.`,
    );
    console.error(
      "Review the official Components Overview, then update the pin, inventory, lifecycle, docs, and tests together.",
    );
    process.exitCode = 1;
  } else {
    console.log(`Ant Design reference is current: ${pinnedVersion}.`);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Unable to verify the Ant Design reference: ${message}`);
  process.exitCode = 1;
}
