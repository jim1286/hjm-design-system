import { act, create, type ReactTestRenderer, type ReactTestRendererJSON } from "react-test-renderer";
import { expect, it, vi } from "vitest";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { Tabs } from "@hjmds/react-native/navigation";
import story from "../../../showcase/native/src/components/FollowListScreen.stories";
vi.mock("react-native-svg", async () => {
  const { View } = await import("react-native");
  return { default: View, Path: View };
});
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
function assertTextHosts(node: ReactTestRendererJSON | ReactTestRendererJSON[] | null) {
  for (const item of Array.isArray(node) ? node : node ? [node] : []) {
    for (const child of item.children ?? []) {
      if (typeof child === "string") expect(item.type, `Raw text ${JSON.stringify(child)} under ${item.type}`).toBe("Text");
      else assertTextHosts(child);
    }
  }
}
it("renders follower removal and following overflow with native glyphs instead of raw text under Views", async () => {
  const Preview = story.component;
  let tree!: ReactTestRenderer;
  await act(async () => { tree = create(<HjmNativeProvider><Preview /></HjmNativeProvider>); });
  try {
    assertTextHosts(tree.toJSON());
    await act(async () => tree.root.findByType(Tabs).props.onValueChange("following"));
    assertTextHosts(tree.toJSON());
  } finally { await act(async () => tree.unmount()); }
});
