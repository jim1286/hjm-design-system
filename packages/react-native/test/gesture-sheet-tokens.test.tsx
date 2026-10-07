import { act, create } from "react-test-renderer";
import { TextInput } from "react-native";
import { expect, it, vi } from "vitest";
import { defineHjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import { HjmNativeProvider } from "../src/provider.js";
import { GestureSheetInput } from "../src/sheet-gesture.js";

// Only optional library drawing hosts are replaced. This proves field-token
// translation; it does not claim a real keyboard/gesture/runtime installation.
vi.mock("@gorhom/bottom-sheet", async () => {
  const { TextInput, View } = await import("react-native");
  return { BottomSheetTextInput: TextInput, BottomSheetModal: View, BottomSheetModalProvider: View,
    BottomSheetScrollView: View, BottomSheetBackdrop: View, BottomSheetHandle: View };
});
vi.mock("react-native-reanimated", () => ({ ReduceMotion: { Always: "always", Never: "never", System: "system" } }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const flatten = (style: unknown): Record<string, unknown> => Array.isArray(style) ? Object.assign({}, ...style.map(flatten)) : (style ?? {}) as Record<string, unknown>;

it("themes the optional keyboard-tracking editor without scaling twice or replacing its controlled draft", () => {
  const profile = defineHjmDesignProfile({ extends: "paper", tokens: { radius: { md: 29 }, typography: { body: { fontSize: 21, lineHeight: 32 } }, fontFamily: { ui: ["ProductUI"] } } });
  const ui = (themed: boolean) => <HjmNativeProvider reducedMotion textScale={2} {...(themed ? { designProfile: profile } : {})}><GestureSheetInput value="입력 중" /></HjmNativeProvider>;
  let tree!: ReturnType<typeof create>;
  try {
    act(() => { tree = create(ui(true)); });
    const input = tree.root.findByType(TextInput);
    expect(flatten(input.props.style)).toMatchObject({ fontSize: 42, lineHeight: 64, borderRadius: 29, fontFamily: "ProductUI" });
    expect(input.props.allowFontScaling).toBe(false);
    act(() => tree.update(ui(false)));
    expect(tree.root.findByType(TextInput)).toBe(input);
    expect(input.props.value).toBe("입력 중");
    expect(flatten(input.props.style)).toMatchObject({ fontSize: 28, lineHeight: 40, borderRadius: 12 });
    expect(flatten(input.props.style).fontFamily).toBeUndefined();
  } finally { if (tree) act(() => tree.unmount()); }
});
