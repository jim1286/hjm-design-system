import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { expect, it } from "vitest";
import { AuthScreenLayout } from "../src/auth-screen.js";
import { HjmNativeProvider } from "../src/provider.js";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("preserves mounted actions while hiding them from touch and accessibility and restores them after cancellation", () => {
  let tree!: ReactTestRenderer;
  const screen = (pending: boolean) => <HjmNativeProvider><AuthScreenLayout mainCard
    {...(pending ? { pendingLabel: "로그인 중" } : {})} hero={null}
    main={<Pressable accessibilityLabel="Google" />} footer={null} /></HjmNativeProvider>;
  act(() => { tree = create(screen(false)); });
  try {
    const button = tree.root.findByType(Pressable);
    act(() => tree.update(screen(true)));
    expect(tree.root.findByType(Pressable)).toBe(button);
    const hidden = tree.root.findAllByType(View).find(node => node.props.importantForAccessibility === "no-hide-descendants")!;
    expect(hidden.props).toMatchObject({ pointerEvents: "none", accessibilityElementsHidden: true, style: { opacity: 0 } });
    expect(tree.root.findAllByType(ActivityIndicator)).toHaveLength(1);
    expect(tree.root.findAllByType(Text)).toHaveLength(0);
    const loading = tree.root.findAllByType(View).find(node => node.props.accessibilityRole === "progressbar")!;
    expect(loading.props).toMatchObject({ accessibilityLabel: "로그인 중", accessibilityState: { busy: true },
      style: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", justifyContent: "center" } });
    act(() => tree.update(screen(false)));
    expect(tree.root.findByType(Pressable)).toBe(button);
    expect(tree.root.findAllByType(ActivityIndicator)).toHaveLength(0);
    expect(tree.root.findAllByType(View).some(node => node.props.importantForAccessibility === "no-hide-descendants")).toBe(false);
  } finally { act(() => tree.unmount()); }
});
