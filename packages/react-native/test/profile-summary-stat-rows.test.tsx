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
