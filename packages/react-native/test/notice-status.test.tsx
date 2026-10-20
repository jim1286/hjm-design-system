import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { AccessibilityInfo, Platform, View, StyleSheet } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { Badge } from "../src/data-display.js";
import { Notice } from "../src/feedback.js";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); vi.restoreAllMocks(); });
it("announces each saved result once and keeps it in a reusable badge without panel chrome", () => {
  const originalOS = Platform.OS;
  Platform.OS = "ios";
  const announce = vi.spyOn(AccessibilityInfo, "announceForAccessibilityWithOptions");
  const view = (description: string) => <HjmNativeProvider><Notice testID="saved" appearance="status" tone="success"
    announcement="polite" title="저장됨" description={description} /></HjmNativeProvider>;
  try {
    act(() => { tree = create(view("KE123")); });
    expect(tree!.root.findByType(Badge).props.label).toBe("저장됨");
    const host = tree!.root.findAllByType(View).find(node => node.props.testID === "saved")!;
    expect(StyleSheet.flatten(host.props.style)).toMatchObject({ backgroundColor: "transparent", padding: 0, borderWidth: 0 });
    expect(host.props.accessibilityLiveRegion).toBe("polite");
    expect(announce).toHaveBeenCalledTimes(1);
    act(() => tree!.update(view("KE123")));
    expect(announce).toHaveBeenCalledTimes(1);
    act(() => tree!.update(view("KE456")));
    expect(announce).toHaveBeenLastCalledWith("저장됨. KE456", { queue: true });
  } finally { Platform.OS = originalOS; }
});
