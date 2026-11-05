import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, StyleSheet, Text as NativeText } from "react-native";
import Check from "lucide-react-native/icons/check";
import Minus from "lucide-react-native/icons/minus";
import { expect, it, vi } from "vitest";
import { Checkbox, Chip } from "../src/inputs.js";
import { HjmNativeProvider } from "../src/provider.js";
import { LucideGlyph } from "../src/internal/lucide-glyph.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it.each(["checked", "mixed", "chip"] as const)("keeps %s artwork within its slot while its label scales", kind => {
  const change = vi.fn();
  const sizes: number[] = [];
  const labels: number[] = [];
  for (const scale of [1.3, 1.5] as const) {
    let renderer!: ReactTestRenderer;
    act(() => { renderer = create(<HjmNativeProvider reducedMotion textScale={scale}>
      {kind === "chip"
        ? <Chip label="선택 항목" selectionMode="multiple" selected onPress={change} />
        : <Checkbox label="선택 항목" checked={kind === "mixed" ? "mixed" : true} onCheckedChange={change} />}
    </HjmNativeProvider>); });
    const texts = renderer.root.findAllByType(NativeText);
    const label = texts.find(node => node.props.children === "선택 항목")!;
    // Chip and Checkbox draw their check/dash as fixed-size Lucide artwork, so no text glyph can scale out of the box.
    expect(texts.some(node => node.props.children === "✓" || node.props.children === "−")).toBe(false);
    const mark = renderer.root.findAllByType(LucideGlyph).find(node => node.props.icon === (kind === "mixed" ? Minus : Check))!;
    sizes.push(mark.props.size as number);
    labels.push(StyleSheet.flatten(label.props.style).fontSize);
    const control = renderer.root.findAllByType(Pressable).find(node => node.props.accessibilityLabel === "선택 항목")!;
    expect(control.props.accessibilityRole).toBe("checkbox");
    act(() => control.props.onPress({ nativeEvent: {} }));
    expect(change.mock.calls.at(-1)?.[0]).toBe(kind === "mixed");
    act(() => renderer.unmount());
  }
  expect(sizes[1]).toBe(sizes[0]);
  expect(labels[1]! / labels[0]!).toBeCloseTo(1.5 / 1.3);
});
