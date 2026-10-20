import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { ScrollView, View } from "react-native";
import { expect, it } from "vitest";
import { ListDetailScreen } from "../src/screen-flows.js";
import { ScreenLayout } from "../src/screens.js";
import { HjmNativeProvider } from "../src/provider.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("isolates the detail's header and fixed footer while retaining the list and shared bottom inset", () => {
  let tree!: ReactTestRenderer;
  const frame = (open: boolean) => <HjmNativeProvider><ListDetailScreen title="List" safeAreaBottom={24}
    actions={<View testID="list-tool" />} list={<View testID="retained-list" />} back={{ label: "Back", onAction() {} }}
    {...(open ? { detail: { title: "Detail", actions: <View testID="detail-tool" />,
      footer: <View testID="detail-cta" />, content: <View testID="detail-content" /> } } : {})} /></HjmNativeProvider>;
  try {
    act(() => { tree = create(frame(false)); });
    const retained = tree.root.findByProps({ testID: "retained-list" });
    act(() => tree.update(frame(true)));
    const screens = tree.root.findAllByType(ScreenLayout);
    expect(screens).toHaveLength(2); expect(screens[1]!.props.safeAreaBottom).toBe(24);
    const detail = screens[1]!;
    expect(detail.findAllByProps({ testID: "list-tool" })).toHaveLength(0);
    for (const scroll of detail.findAllByType(ScrollView)) {
      expect(scroll.findAllByProps({ testID: "detail-tool" })).toHaveLength(0);
      expect(scroll.findAllByProps({ testID: "detail-cta" })).toHaveLength(0);
    }
    expect(detail.findAllByProps({ testID: "detail-tool" }).length).toBeGreaterThan(0);
    expect(detail.findAllByProps({ testID: "detail-cta" }).length).toBeGreaterThan(0);
    act(() => tree.update(frame(false)));
    expect(tree.root.findByProps({ testID: "retained-list" })).toBe(retained);
    expect(tree.root.findAllByProps({ testID: "detail-cta" })).toHaveLength(0);
  } finally { act(() => tree.unmount()); }
});
