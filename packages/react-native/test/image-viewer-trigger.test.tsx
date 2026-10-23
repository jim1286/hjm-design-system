import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, StyleSheet, View } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { imageViewerTriggerRecipe } from "@hjmds/design-contracts/components/image";
import { ImageViewerTrigger } from "../src/internal/image-viewer-trigger.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; });

it("names the media as an image button, opens on press and dims while pressed", () => {
  const open = vi.fn();
  act(() => { tree = create(<HjmNativeProvider><ImageViewerTrigger label="사진 크게 보기" onPress={open}><View testID="photo" /></ImageViewerTrigger></HjmNativeProvider>); });
  const pressable = tree!.root.findByType(Pressable);
  expect(pressable.props.accessibilityRole).toBe("imagebutton");
  expect(pressable.props.accessibilityLabel).toBe("사진 크게 보기");
  act(() => pressable.props.onPress());
  expect(open).toHaveBeenCalledTimes(1);
  expect(StyleSheet.flatten(pressable.props.style({ pressed: true })).opacity).toBe(imageViewerTriggerRecipe.pressedOpacity);
  expect(StyleSheet.flatten(pressable.props.style({ pressed: false })).opacity).toBe(1);
  expect(() => act(() => { tree!.update(<HjmNativeProvider><ImageViewerTrigger label="" onPress={open}><View /></ImageViewerTrigger></HjmNativeProvider>); })).toThrow(TypeError);
});
