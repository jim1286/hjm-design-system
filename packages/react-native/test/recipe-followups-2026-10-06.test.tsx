// Regression proofs for the 2026-10-06 follow-up list (review + usage-guide findings). Each case failed
// before its fix; the comment names the drift it pins.
import { createElement, type ReactElement, type ReactNode } from "react";
import { act, create, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";
import { AccessibilityInfo, Animated, Image, Platform, TextInput } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { control } from "@hjmds/design-contracts/foundations";
import { sliderRecipe } from "@hjmds/design-contracts/components/slider";
import { uploadItemRecipe } from "@hjmds/design-contracts/components/upload-item";
import { Agreement } from "../src/agreement.js";
import { Collapsible } from "../src/collapsible.js";
import { Avatar } from "../src/data-display.js";
import { DurationField } from "../src/duration-field.js";
import { Result } from "../src/feedback.js";
import { ImageViewer } from "../src/image-viewer.js";
import { RadioGroup } from "../src/inputs.js";
import { Slider } from "../src/slider.js";
import { Sheet } from "../src/overlays.js";
import { HjmNativeProvider } from "../src/provider.js";
import { QRCode } from "../src/qr-code.js";
import { TagsInput } from "../src/tags-input.js";
import { Text } from "../src/primitives.js";
import { UploadItem } from "../src/upload-item.js";

vi.mock("react-native-gesture-handler", () => ({ GestureHandlerRootView: "GestureRoot" }));
vi.mock("react-native-reanimated", () => ({ ReduceMotion: { Always: "always", System: "system" } }));
vi.mock("react-native-svg", async () => { const { View } = await import("react-native"); return { default: View, Rect: View, Path: View }; });
vi.mock("react-native-zoom-toolkit", () => ({ Gallery: (props: { data: unknown[]; renderItem: (item: unknown, index: number) => ReactNode; initialIndex: number }) => createElement("Gallery", props, props.renderItem(props.data[props.initialIndex], props.initialIndex)) }));

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => {
  if (tree) act(() => tree!.unmount());
  tree = undefined;
  vi.restoreAllMocks();
});
function render(node: ReactElement) {
  act(() => { tree = create(<HjmNativeProvider reducedMotion>{node}</HjmNativeProvider>); });
  return tree!;
}
function flat(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flat));
  return style && typeof style === "object" ? style as Record<string, unknown> : {};
}
const pressables = (root: ReactTestInstance) => root.findAll((node) => String(node.type) === "Pressable");

it("Sheet size=full fills the safe-area viewport instead of stopping at maxHeightRatio", () => {
  render(<Sheet open size="full" title="필터" closeLabel="닫기" safeAreaInsets={{ top: 40, bottom: 0 }}><Text>본문</Text></Sheet>);
  const positioner = tree!.root.findAllByType(Animated.View).find((node) => typeof node.props.onLayout === "function")!;
  act(() => positioner.props.onLayout({ nativeEvent: { layout: { height: 800 } } }));
  const dialog = tree!.root.findAllByType(Animated.View).find((node) => node.props.role === "dialog")!;
  // 800 − top inset 40. Before: maxHeight min(760, 800 × 0.9) = 720 clipped the full sheet.
  expect(flat(dialog.props.style)).toMatchObject({ height: 760, maxHeight: 760 });
});

it("Avatar initials use the shared first+last code-point rule", () => {
  render(<Avatar name="𝒜da Min 𝒵oe" accessibilityLabel="𝒜da Min 𝒵oe" />);
  // Before: UTF-16 indexing returned half a surrogate pair for each word.
  expect(JSON.stringify(tree!.toJSON())).toContain("𝒜𝒵");
});

it("Agreement reports the initial state so default consent can enable submit", () => {
  const onStateChange = vi.fn();
  render(<Agreement descriptor={{ accessibilityLabel: "약관", allLabel: "전체 동의", items: [{ id: "terms", label: "이용약관", required: true }] }}
    defaultCheckedIds={new Set(["terms"])} onStateChange={onStateChange} requiredLabel="(필수)" optionalLabel="(선택)" />);
  expect(onStateChange).toHaveBeenCalledTimes(1);
  expect(onStateChange.mock.calls[0]![0]).toMatchObject({ satisfied: true });
});

it("DurationField and QRCode accept layoutStyle on their root", () => {
  render(<DurationField value={60} max={3600} onValueChange={() => undefined} layoutStyle={{ marginTop: 7 }}
    labels={{ label: "시간", hours: "시", minutes: "분", seconds: "초", increment: (u) => `${u}+`, decrement: (u) => `${u}-` }} />);
  expect(flat((tree!.toJSON() as unknown as { props: { style: unknown } }).props.style).marginTop).toBe(7);
  act(() => tree!.unmount()); tree = undefined;
  render(<QRCode value="https://example.com" label="공유 코드" fallback={<Text>링크 열기</Text>} layoutStyle={{ marginTop: 9 }} />);
  expect(flat((tree!.toJSON() as unknown as { props: { style: unknown } }).props.style).marginTop).toBe(9);
});

it("TagsInput suggestion rows and the Collapsible trigger keep the 44 touch target", () => {
  render(<TagsInput label="관심사" composeRemoveLabel={(tag) => `${tag} 지우기`} suggestions={[{ id: "walk", label: "산책" }]} suggestionsLabel="추천" />);
  act(() => tree!.root.findByType(TextInput).props.onChangeText("산"));
  const suggestion = pressables(tree!.root).find((node) => node.props.accessibilityRole === "button" && node.props.accessibilityLabel === undefined)!;
  // Before: tag.minHeight 28.
  expect(flat(suggestion.props.style).minHeight).toBe(control.minTouchTarget);
  act(() => tree!.unmount()); tree = undefined;
  render(<Collapsible trigger="배송 안내"><Text>내용</Text></Collapsible>);
  expect(flat(pressables(tree!.root)[0]!.props.style).minHeight).toBe(control.minTouchTarget);
});

it("Result orders secondary before primary like every other action row", () => {
  render(<Result status="failure" title="저장하지 못했어요" actions={[
    { label: "다시 시도", onAction: () => undefined },
    { label: "나중에", onAction: () => undefined },
  ]} />);
  const labels = JSON.stringify(tree!.toJSON());
  expect(labels.indexOf("나중에")).toBeLessThan(labels.indexOf("다시 시도"));
});

it("ImageViewer announces the load failure, not only the loading copy", () => {
  const os = Platform.OS;
  (Platform as { OS: string }).OS = "ios";
  const announce = vi.spyOn(AccessibilityInfo, "announceForAccessibility");
  try {
    render(<ImageViewer open onClose={() => undefined} safeAreaInsets={{ top: 0, bottom: 0 }} items={[{ id: "one", uri: "https://example.test/a.png", label: "사진" }]}
      closeLabel="닫기" previousLabel="이전" nextLabel="다음" loadingLabel="불러오는 중" errorLabel="사진을 불러오지 못했어요" retryLabel="다시 시도" />);
    act(() => tree!.root.findByType(Image).props.onError());
    expect(tree!.root.find((node) => node.props.children === "사진을 불러오지 못했어요" && node.props.accessibilityLiveRegion === "assertive")).toBeDefined();
    expect(announce).toHaveBeenCalledWith("사진을 불러오지 못했어요");
  } finally {
    (Platform as { OS: string }).OS = os;
  }
});

it("RadioGroup puts its description above the options (selectionGroupRecipe slot order)", () => {
  render(<RadioGroup label="배송" description="도착 시간이 달라요" items={[{ value: "standard", label: "일반" }]} />);
  const json = JSON.stringify(tree!.toJSON());
  expect(json.indexOf("도착 시간이 달라요")).toBeLessThan(json.indexOf("일반"));
});

it("Slider header and UploadItem row read their spacing from the recipe", () => {
  render(<Slider decrementLabel="감소" incrementLabel="증가" label="음량" min={0} max={10} />);
  const header = tree!.root.findAll((node) => flat(node.props.style).justifyContent === "space-between" && flat(node.props.style).flexDirection === "row")[0]!;
  expect(flat(header.props.style).gap).toBe(sliderRecipe.header.gap);
  act(() => tree!.unmount()); tree = undefined;
  render(<UploadItem descriptor={{ id: "photo", name: "photo.png", state: { status: "pending" } }}
    labels={{ pending: "대기", uploading: "올리는 중", success: "완료", cancel: "취소", retry: "다시" }} />);
  expect(flat((tree!.toJSON() as unknown as { props: { style: unknown } }).props.style).paddingVertical).toBe(uploadItemRecipe.row.paddingVertical);
});
