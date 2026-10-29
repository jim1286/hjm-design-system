import { act, create } from "react-test-renderer";
import { beforeEach, expect, it } from "vitest";
import { profileSummaryRecipe } from "@hjmds/design-contracts/screen-patterns";
import { ProfileSummary } from "../src/screen-flows.js";
import { HjmNativeProvider } from "../src/provider.js";

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

// 2026-10-28 다에리 둥지: 일곱 수치는 네 칸씩 두 줄로, 마지막 줄도 같은 칸 폭을 지킨다.
it("wraps stats into rows of the recipe width and pads the last row", () => {
  const stats = Array.from({ length: 7 }, (_, index) => ({ id: `s${index}`, value: String(index), label: `label ${index}`, onPress: () => {} }));
  let renderer: ReturnType<typeof create>;
  act(() => {
    renderer = create(<HjmNativeProvider><ProfileSummary name="이름" avatar={null} stats={stats} /></HjmNativeProvider>);
  });
  const labels = renderer!.root.findAll((node) => typeof node.props.accessibilityLabel === "string" && /^\d label \d$/.test(node.props.accessibilityLabel) && node.props.onPress !== undefined);
  expect(new Set(labels.map((node) => node.props.accessibilityLabel)).size).toBe(7);
  const spacers = renderer!.root.findAll((node) => node.props.importantForAccessibility === "no-hide-descendants" && node.props.style?.flex === 1 && node.children.length === 0);
  expect(spacers.length).toBeGreaterThanOrEqual(2 * profileSummaryRecipe.stats.maxPerRow - 7);
});

// 2026-10-29 user rule: another member's profile photo opens large; the avatar frame becomes one image button.
it("makes the avatar an image button that opens the product viewer", () => {
  const opened: string[] = [];
  let renderer: ReturnType<typeof create>;
  act(() => {
    renderer = create(<HjmNativeProvider><ProfileSummary name="바람" avatar={null} avatarView={{ label: "사진 크게 보기", onPress: () => opened.push("view") }} /></HjmNativeProvider>);
  });
  const trigger = renderer!.root.findAll((node) => node.props.accessibilityRole === "imagebutton" && node.props.accessibilityLabel === "사진 크게 보기")[0]!;
  act(() => trigger.props.onPress());
  expect(opened).toEqual(["view"]);
  act(() => { renderer.update(<HjmNativeProvider><ProfileSummary name="바람" avatar={null} /></HjmNativeProvider>); });
  expect(renderer!.root.findAll((node) => node.props.accessibilityRole === "imagebutton")).toHaveLength(0);
});
