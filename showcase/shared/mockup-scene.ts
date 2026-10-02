import { initialSceneTimeline, validateSceneTimeline, type SceneTimeline } from "./scene-timeline";
/** Internal authoring model, deliberately separate from shipped application UI APIs. */
export type MockupScene = Readonly<{
  version: 1;
  timeline: SceneTimeline;
  format: "portrait" | "square" | "landscape";
  frame: "phone" | "browser";
  background: "dawn" | "ink" | "mint";
  angle: number;
  padding: number;
  shadow: boolean;
  title: string;
  subtitle: string;
  seed: number;
  asset: Readonly<{ fileName: string; source: string; usage: string }>;
}>;
export const initialMockupScene: MockupScene = {
  version: 1, timeline: initialSceneTimeline, format: "portrait", frame: "phone", background: "dawn", angle: -6,
  padding: 90, shadow: true, title: "작은 순간을 오래도록", subtitle: "나만의 기록을 소개하세요", seed: 17,
  asset: { fileName: "", source: "", usage: "" },
};
export function sceneDimensions(format: MockupScene["format"]) {
  switch (format) {
    case "portrait": return { width: 1080, height: 1440 };
    case "square": return { width: 1080, height: 1080 };
    case "landscape": return { width: 1440, height: 900 };
  }
}
export function validateMockupScene(scene: MockupScene) {
  if (scene.version !== 1 || !["portrait", "square", "landscape"].includes(scene.format)
    || !["phone", "browser"].includes(scene.frame) || !["dawn", "ink", "mint"].includes(scene.background)
    || !Number.isFinite(scene.angle) || Math.abs(scene.angle) > 15
    || !Number.isFinite(scene.padding) || scene.padding < 40 || scene.padding > 160
    || !Number.isInteger(scene.seed) || scene.seed < 0 || scene.seed > 65535
    || scene.title.length > 80 || scene.subtitle.length > 120) throw new RangeError("Invalid mockup scene");
  validateSceneTimeline(scene.timeline);
  return scene;
}
export function resolveMockupLayout(scene: MockupScene) {
  validateMockupScene(scene);
  const { width, height } = sceneDimensions(scene.format);
  const availableWidth = width - scene.padding * 2;
  const availableHeight = height - scene.padding * 2 - 300;
  const ratio = scene.frame === "phone" ? 0.49 : 1.55;
  // Fit the rotated bounding box, not merely its unrotated frame, inside output margins.
  const radians = Math.abs(scene.angle) * Math.PI / 180;
  const frameHeight = Math.min(availableWidth / (ratio * Math.cos(radians) + Math.sin(radians)), availableHeight / (Math.cos(radians) + ratio * Math.sin(radians)));
  const frameWidth = frameHeight * ratio;
  return { width, height, frameWidth, frameHeight, centerX: width / 2, centerY: 300 + scene.padding + availableHeight / 2 };
}
export function serializeMockupScene(scene: MockupScene) {
  validateMockupScene(scene);
  // Image pixels stay in the selected local file; metadata makes later exports attributable.
  return JSON.stringify({ ...scene, output: sceneDimensions(scene.format), assetInput: "reselect-local-image", frameSource: "HJM original generic frame", font: "system-ui, sans-serif" }, null, 2);
}
export function parseMockupScene(json: string): MockupScene {
  const value: unknown = JSON.parse(json);
  if (!value || typeof value !== "object") throw new TypeError("Expected a scene object");
  const item = value as Record<string, unknown>; const asset = item.asset as Record<string, unknown> | undefined;
  if (typeof item.title !== "string" || typeof item.subtitle !== "string" || typeof item.shadow !== "boolean"
    || !asset || typeof asset.fileName !== "string" || typeof asset.source !== "string" || typeof asset.usage !== "string") throw new TypeError("Invalid scene fields");
  const scene: MockupScene = {
    // Older still-only scenes acquire the initial timeline without changing their image metadata.
    timeline: item.timeline === undefined ? initialSceneTimeline : item.timeline as SceneTimeline,
    version: item.version as 1, format: item.format as MockupScene["format"], frame: item.frame as MockupScene["frame"], background: item.background as MockupScene["background"],
    angle: item.angle as number, padding: item.padding as number, seed: item.seed as number, shadow: item.shadow,
    title: item.title, subtitle: item.subtitle, asset: { fileName: asset.fileName, source: asset.source, usage: asset.usage },
  };
  return validateMockupScene(scene);
}
