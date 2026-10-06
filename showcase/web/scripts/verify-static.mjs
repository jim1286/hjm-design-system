import { toId, storyNameFromExport } from "storybook/internal/csf";
import { readdir, readFile } from "node:fs/promises";
import { componentCatalog, getComponentSurfaceStatus } from "@hjmds/design-contracts";

const index = JSON.parse(await readFile(new URL("../storybook-static/index.json", import.meta.url), "utf8"));
const entries = Object.values(index.entries ?? {});
// Canonical fixtures live on the nine role overview pages (`배포/컴포넌트/개요/<역할> 모아 보기`, moved there on
// 2026-10-06 with their ids kept). Individual items (`배포/컴포넌트/<역할>/<항목>`) reuse the same previews and must not
// inflate the canonical count; the 4-segment title rule itself is scripts/check-storybook.mjs S1.
const referenceStories = entries.filter((entry) => /^배포\/컴포넌트\/개요\/.+ 모아 보기$/.test(entry.title ?? ""));
const expectedNames = componentCatalog.map(({ name }) => name);
// Display names are localized; stable export IDs retain canonical coverage across translations.
const canonicalName = (name) => toId(storyNameFromExport(name));
const actualNames = new Set(referenceStories.map((entry) => entry.id.split("--")[1]));
const missing = expectedNames.filter((name) => !actualNames.has(canonicalName(name)));
if (missing.length > 0 || referenceStories.length !== expectedNames.length) {
  throw new Error(`Static Storybook must contain every canonical component story. Missing: ${missing.join(", ") || "none"}; found: ${referenceStories.length}`);
}

const misplaced = entries.filter(entry => !/^(배포|실험)\/(토큰|컴포넌트|구성|화면)\//.test(entry.title));
if (misplaced.length) throw new Error(`Invalid Storybook hierarchy: ${misplaced.map(entry => entry.id).join(", ")}`);

const untranslated = entries.filter(entry => !/[가-힣]/.test(entry.name) || entry.title.split("/").some(part => !/[가-힣]/.test(part)));
if (untranslated.length) throw new Error(`Storybook labels must be Korean: ${untranslated.map(entry => entry.id).join(", ")}`);

const classificationFor = (component) => {
  const status = getComponentSurfaceStatus(component, "web");
  if (status === "unsupported") return "web-unsupported";
  if (status === "planned" || status === "deprecated") return "contract-only";
  return "web-renderer";
};
const storyByName = new Map(
  referenceStories.map((entry) => [entry.id.split("--")[1], entry]),
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
  ["배포/컴포넌트/개요/사용 안내", "개요"],
  ["배포/컴포넌트/개요/컴포넌트 찾기", "전체 탐색"],
  ["배포/컴포넌트/개요/컴포넌트 찾기", "글자와 아이콘"],
  ["배포/컴포넌트/개요/컴포넌트 찾기", "레이아웃"],
  ["배포/컴포넌트/개요/컴포넌트 찾기", "동작"],
  ["배포/컴포넌트/개요/컴포넌트 찾기", "입력"],
  ["배포/컴포넌트/개요/컴포넌트 찾기", "탐색"],
  ["배포/컴포넌트/개요/컴포넌트 찾기", "데이터 표시"],
  ["배포/컴포넌트/개요/컴포넌트 찾기", "상태와 알림"],
  ["배포/컴포넌트/개요/컴포넌트 찾기", "오버레이"],
  ["배포/컴포넌트/개요/컴포넌트 찾기", "제공자 설정"],
  ["배포/컴포넌트/개요/컴포넌트 찾기", "보조 기능"],
  ["배포/컴포넌트/개요/구현·검증 현황", "구현·검증 현황"],
];
const missingPages = requiredPages.filter(
  ([title, name]) => !entries.some((entry) => entry.title === title && entry.name === name),
);
if (missingPages.length > 0) {
  throw new Error(`Static Storybook is missing navigation pages: ${missingPages.map(([title, name]) => `${title}/${name}`).join(", ")}`);
}
const leakedComponentExports = entries.filter(
  ({ title, name }) =>
    (title === "배포/컴포넌트/개요/사용 안내" && name === "Introduction") ||
    (title === "배포/컴포넌트/개요/컴포넌트 찾기" && name === "Component Explorer"),
);
if (leakedComponentExports.length > 0) {
  throw new Error("Story components must not leak into the sidebar as duplicate stories");
}

console.log(`Verified ${referenceStories.length} canonical component stories (${classificationCounts["web-renderer"]} Web renderers, ${classificationCounts["contract-only"]} contract-only, ${classificationCounts["web-unsupported"]} Web unsupported) and ${requiredPages.length} navigation pages.`);
