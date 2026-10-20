import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { TextInput, View, ActivityIndicator } from "react-native";
import { expect, it } from "vitest";
import { PendingContent } from "../src/feedback.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const flatten = (style: unknown): Record<string, unknown> => Array.isArray(style) ? Object.assign({}, ...style.map(flatten)) : (style ?? {}) as Record<string, unknown>;
it("preserves the measured region and mounted draft while excluding busy controls", () => {
  let tree!: ReactTestRenderer;
  const render = (pending: boolean) => <HjmNativeProvider><PendingContent pending={pending} label="Connecting"><TextInput defaultValue="draft" /></PendingContent></HjmNativeProvider>;
  try {
    act(() => { tree = create(render(false)); });
    const field = tree.root.findByType(TextInput);
    const content = tree.root.findAllByType(View).find(n => n.props.onLayout)!;
    act(() => content.props.onLayout({ nativeEvent: { layout: { height: 160 } } }));
    act(() => tree.update(render(true)));
    expect(tree.root.findByType(TextInput)).toBe(field);
    expect(content.props).toMatchObject({ pointerEvents: "none", accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" });
    const frame = tree.root.findAllByType(View).find(n => flatten(n.props.style).position === "relative")!;
    expect(flatten(frame.props.style).height).toBe(160);
    act(() => content.props.onLayout({ nativeEvent: { layout: { height: 30 } } }));
    expect(flatten(frame.props.style).height).toBe(160);
    expect(tree.root.findAllByType(ActivityIndicator)).toHaveLength(1);
    expect(tree.root.findAllByType(View).some(n => n.props.accessibilityLabel === "Connecting" && n.props.accessibilityState?.busy)).toBe(true);
    act(() => tree.update(render(false)));
    expect(tree.root.findByType(TextInput)).toBe(field);
    expect(content.props.pointerEvents).toBe("auto");
    expect(tree.root.findAllByType(ActivityIndicator)).toHaveLength(0);
  } finally { if (tree) act(() => tree.unmount()); }
});
