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

it.each(["info", "success", "warning", "attention", "danger"] as const)("keeps %s panels opaque over content, including title-only notices", tone => {
  act(() => { tree = create(<HjmNativeProvider><Notice testID="panel" tone={tone} title="현재 위치를 확인하지 못했어요." /></HjmNativeProvider>); });
  const host = tree!.root.findAllByType(View).find(node => node.props.testID === "panel")!;
  expect(StyleSheet.flatten(host.props.style).backgroundColor).toMatch(/^#[0-9a-f]{6}$/i);
  const tint = host.findAllByType(View).find(node => node.props.pointerEvents === "none")!;
  expect(tint).toBeDefined();
  expect(StyleSheet.flatten(tint.props.style)).toMatchObject({ position: "absolute", top: 0, bottom: 0 });
  expect(JSON.stringify(tree!.toJSON())).toContain("현재 위치를 확인하지 못했어요.");
});

it("keeps the content's own width as its basis so a centered status Notice does not collapse", () => {
  // 2026-10-23 BurnTok welcome: `flex: 1` (basis 0) shrank a centered, content-width status Notice to an empty pill.
  act(() => { tree = create(<HjmNativeProvider><Notice appearance="status" tone="success" title="프로필 사진을 변경했어요" /></HjmNativeProvider>); });
  const badge = tree!.root.findByType(Badge);
  let column = badge.parent;
  while (column && StyleSheet.flatten(column.props.style)?.minWidth !== 0) column = column.parent;
  const style = StyleSheet.flatten(column!.props.style);
  expect(style).toMatchObject({ flexGrow: 1, flexShrink: 1 });
  expect(style.flex).toBeUndefined();
  expect(style.flexBasis === undefined || style.flexBasis === "auto").toBe(true);
});
