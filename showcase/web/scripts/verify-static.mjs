import { readdir, readFile } from "node:fs/promises";
import { componentCatalog, getComponentSurfaceStatus } from "@hjm/design-contracts";

const index = JSON.parse(await readFile(new URL("../storybook-static/index.json", import.meta.url), "utf8"));
const entries = Object.values(index.entries ?? {});
const navigationTitles = new Set(["Components/Overview", "Components/Catalog"]);
const referenceStories = entries.filter(
  (entry) => entry.title?.startsWith("Components/") && !navigationTitles.has(entry.title),
);
const expectedNames = componentCatalog.map(({ name }) => name);
const canonicalName = (name) => name.replaceAll(" ", "");
const actualNames = new Set(referenceStories.map((entry) => canonicalName(entry.name)));
const missing = expectedNames.filter((name) => !actualNames.has(canonicalName(name)));
if (missing.length > 0 || referenceStories.length !== expectedNames.length) {
  throw new Error(`Static Storybook must contain every canonical component story. Missing: ${missing.join(", ") || "none"}; found: ${referenceStories.length}`);
}

const classificationFor = (component) => {
  const status = getComponentSurfaceStatus(component, "web");
  if (status === "unsupported") return "web-unsupported";
  if (status === "planned" || status === "deprecated") return "contract-only";
  return "web-renderer";
};
const storyByName = new Map(
  referenceStories.map((entry) => [canonicalName(entry.name), entry]),
);
const storiesWithIndexedClassification = referenceStories.filter((story) =>
  (story.tags ?? []).some((tag) => tag.startsWith("hjm-")),
);
if (storiesWithIndexedClassification.length > 0) {
  const classificationErrors = componentCatalog.flatMap((component) => {
    const expected = `hjm-${classificationFor(component)}`;
    const story = storyByName.get(canonicalName(component.name));
    if (!story) return [`${component.name}: story missing`];
    const classificationTags = (story.tags ?? []).filter((tag) => tag.startsWith("hjm-"));
    return classificationTags.length === 1 && classificationTags[0] === expected
      ? []
      : [`${component.name}: expected ${expected}, found ${classificationTags.join(", ") || "none"}`];
  });
  if (classificationErrors.length > 0) {
    throw new Error(`Static Storybook classification mismatch:\n${classificationErrors.join("\n")}`);
  }
} else {
  // Storybook's static indexer does not evaluate componentStory(), so helper-
  // produced tags are present in the runtime bundle rather than index.json.
  const assetNames = await readdir(new URL("../storybook-static/assets/", import.meta.url));
  const factoryAsset = assetNames.find((name) => name.startsWith("story-factory-") && name.endsWith(".js"));
  if (!factoryAsset) throw new Error("Static Storybook is missing the componentStory runtime bundle");
  const factorySource = await readFile(
    new URL(`../storybook-static/assets/${factoryAsset}`, import.meta.url),
    "utf8",
  );
  const requiredRuntimeMarkers = ["web-renderer", "contract-only", "web-unsupported", "tags:"];
  const missingRuntimeMarkers = requiredRuntimeMarkers.filter((marker) => !factorySource.includes(marker));
  if (missingRuntimeMarkers.length > 0) {
    throw new Error(`Static componentStory classification metadata is missing: ${missingRuntimeMarkers.join(", ")}`);
  }
}

const classificationCounts = componentCatalog.reduce(
  (counts, component) => {
    counts[classificationFor(component)] += 1;
    return counts;
  },
  { "web-renderer": 0, "contract-only": 0, "web-unsupported": 0 },
);
const classifiedTotal = Object.values(classificationCounts).reduce((sum, count) => sum + count, 0);
if (classifiedTotal !== componentCatalog.length) {
  throw new Error(`Unexpected Showcase classification counts: ${JSON.stringify(classificationCounts)}`);
}
const requiredPages = [
  ["Home/Overview", "Overview"],
  ["Components/Overview", "Explorer"],
  ["Components/Overview", "Foundations"],
  ["Components/Overview", "Layout"],
  ["Components/Overview", "Actions"],
  ["Components/Overview", "Inputs"],
  ["Components/Overview", "Navigation"],
  ["Components/Overview", "Data display"],
  ["Components/Overview", "Feedback"],
  ["Components/Overview", "Overlays"],
  ["Components/Overview", "Providers"],
  ["Components/Overview", "Utilities"],
  ["Components/Catalog", "Evidence Matrix"],
];
const missingPages = requiredPages.filter(
  ([title, name]) => !entries.some((entry) => entry.title === title && entry.name === name),
);
if (missingPages.length > 0) {
  throw new Error(`Static Storybook is missing navigation pages: ${missingPages.map(([title, name]) => `${title}/${name}`).join(", ")}`);
}
const leakedComponentExports = entries.filter(
  ({ title, name }) =>
    (title === "Home/Overview" && name === "Introduction") ||
    (title === "Components/Overview" && name === "Component Explorer"),
);
if (leakedComponentExports.length > 0) {
  throw new Error("Story components must not leak into the sidebar as duplicate stories");
}

console.log(`Verified ${referenceStories.length} canonical component stories (${classificationCounts["web-renderer"]} Web renderers, ${classificationCounts["contract-only"]} contract-only, ${classificationCounts["web-unsupported"]} Web unsupported) and ${requiredPages.length} navigation pages.`);
