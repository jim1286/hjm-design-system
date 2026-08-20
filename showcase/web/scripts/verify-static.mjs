import { readFile } from "node:fs/promises";
import { componentCatalog } from "@hjm/design-system";

const index = JSON.parse(await readFile(new URL("../storybook-static/index.json", import.meta.url), "utf8"));
const entries = Object.values(index.entries ?? {});
const referenceStories = entries.filter((entry) => entry.title === "Components/Reference Gallery");
const expectedNames = componentCatalog.map(({ name }) => name);
const canonicalName = (name) => name.replaceAll(" ", "");
const actualNames = new Set(referenceStories.map((entry) => canonicalName(entry.name)));
const missing = expectedNames.filter((name) => !actualNames.has(canonicalName(name)));
if (missing.length > 0 || referenceStories.length !== expectedNames.length) {
  throw new Error(`Static Storybook must contain every canonical component story. Missing: ${missing.join(", ") || "none"}; found: ${referenceStories.length}`);
}
const requiredPages = [
  ["Home/Overview", "Overview"],
  ["Components/Overview", "Explorer"],
  ["Components/Catalog", "Evidence Matrix"],
];
const missingPages = requiredPages.filter(
  ([title, name]) => !entries.some((entry) => entry.title === title && entry.name === name),
);
if (missingPages.length > 0) {
  throw new Error(`Static Storybook is missing navigation pages: ${missingPages.map(([title, name]) => `${title}/${name}`).join(", ")}`);
}

console.log(`Verified ${referenceStories.length} canonical component stories and ${requiredPages.length} navigation pages.`);
