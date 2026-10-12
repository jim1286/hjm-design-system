import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, Text as NativeText, View } from "react-native";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { activityChipRecipe, toastRecipe } from "@hjmds/design-contracts";
import { ActivityChip } from "../src/activity-chip.js";
import { Toast } from "../src/feedback.js";
import { HjmNativeProvider } from "../src/provider.js";

let renderer: ReactTestRenderer | undefined;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  renderer = undefined;
});
afterEach(() => { if (renderer) { const active = renderer; act(() => active.unmount()); } });
type Style = Record<string, unknown>;
function flatten(style: unknown): Style {
  const value = typeof style === "function" ? style({ pressed: false }) : style;
  if (Array.isArray(value)) return Object.assign({}, ...value.map(flatten)) as Style;
  return (value ?? {}) as Style;
}

describe("Native ActivityChip", () => {
  it("is a disclosure button with hidden media, recipe geometry and emphasis colours", async () => {
    const onPress = vi.fn();
    await act(async () => {
      renderer = create(<HjmNativeProvider reducedMotion>
        <ActivityChip label="다듬는 중" accessibilityLabel="똑쟁이가 앱을 다듬는 중, 자세히 보기" expanded media={<NativeText>M</NativeText>} onPress={onPress} />
      </HjmNativeProvider>);
    });
    const chip = renderer!.root.findByType(Pressable);
    expect(chip.props.accessibilityRole).toBe("button");
    expect(chip.props.accessibilityLabel).toBe("똑쟁이가 앱을 다듬는 중, 자세히 보기");
    expect(chip.props.accessibilityState).toMatchObject({ expanded: true });
    const style = flatten(chip.props.style);
    expect(style).toMatchObject({ minHeight: activityChipRecipe.root.minHeight, maxWidth: activityChipRecipe.root.maxWidth, paddingStart: activityChipRecipe.root.paddingStart });
    const media = renderer!.root.findAllByType(View).find(node => node.props.importantForAccessibility === "no-hide-descendants")!;
    expect(flatten(media.props.style)).toMatchObject({ width: activityChipRecipe.media.size, height: activityChipRecipe.media.size });
    act(() => chip.props.onPress());
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("switches to the brand pair for emphasis and rejects empty copy", async () => {
    await act(async () => {
      renderer = create(<HjmNativeProvider><ActivityChip label="완료" emphasis="emphasis" onPress={() => {}} /></HjmNativeProvider>);
    });
    const resting = flatten(renderer!.root.findByType(Pressable).props.style);
    expect(resting.paddingStart).toBe(activityChipRecipe.root.paddingEnd);
    expect(resting.backgroundColor).not.toBe("transparent");
    expect(renderer!.root.findByType(Pressable).props.accessibilityState).toMatchObject({ expanded: false });
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => act(() => { renderer!.update(<HjmNativeProvider><ActivityChip label=" " onPress={() => {}} /></HjmNativeProvider>); })).toThrow();
    error.mockRestore();
  });
});

describe("Native panel toast", () => {
  it("puts media in the leading column, renders step progress and keeps the action under the copy", async () => {
    await act(async () => {
      renderer = create(<HjmNativeProvider reducedMotion>
        <Toast
          descriptor={{
            id: "review",
            title: "똑쟁이",
            description: "앱을 다듬는 중이에요",
            durationMs: null,
            media: <NativeText testID="mascot">M</NativeText>,
            progress: { steps: ["읽기", "다듬기", "확인"], current: 1 },
            action: { label: "결과 보기", onAction() {} },
            closeLabel: "닫기",
          }}
          renderToneIcon={() => <NativeText testID="tone">!</NativeText>}
        />
      </HjmNativeProvider>);
    });
    expect(renderer!.root.findAllByProps({ testID: "mascot" }).length).toBeGreaterThan(0);
    // Media replaces the tone badge instead of sitting beside it.
    expect(renderer!.root.findAllByProps({ testID: "tone" })).toHaveLength(0);
    const mediaColumn = renderer!.root.findAllByType(View).find(node => flatten(node.props.style)?.width === toastRecipe.media.size)!;
    expect(mediaColumn.props.importantForAccessibility).toBe("no-hide-descendants");
    const labels = renderer!.root.findAllByType(NativeText).map(node => node.props.children);
    expect(labels).toEqual(expect.arrayContaining(["읽기", "다듬기", "확인"]));
    const action = renderer!.root.findAllByType(Pressable).find(node => node.props.accessibilityLabel === "결과 보기")!;
    expect(flatten(action.props.style)).toMatchObject({ alignSelf: "flex-start" });
  });
});
