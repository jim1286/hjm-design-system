import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Image, View } from "react-native";
import { expect, it, vi } from "vitest";
vi.mock("react-native-svg", async () => { const { View } = await import("react-native"); return { default: View, Circle: View, Path: View, G: View }; });
import { Avatar } from "../src/data-display.js";
import { HjmNativeProvider } from "../src/provider.js";
import { createBlobatarFallback } from "../src/avatar-blobatar.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("renders actual generated paths and recovers after changing a failed photo source", () => {
  let tree!: ReactTestRenderer;
  const fallback = createBlobatarFallback({ seed: "public-id-24" });
  const render = (uri?: string) => <HjmNativeProvider><Avatar name="지민" accessibilityLabel="지민" {...(uri ? { source: { uri } } : {})} renderFallback={fallback} /></HjmNativeProvider>;
  try {
    act(() => { tree = create(render()); });
    const paths = () => tree.root.findAllByType(View).filter(n => n.props.d).map(n => n.props.d);
    expect(paths().length).toBeGreaterThan(0);
    const first = paths();
    act(() => tree.update(render("old-photo")));
    act(() => tree.root.findByType(Image).props.onError());
    expect(paths()).toEqual(first);
    // An equivalent freshly allocated source must not erase the error on rerender.
    act(() => tree.update(render("old-photo")));
    expect(tree.root.findAllByType(Image)).toHaveLength(0);
    act(() => tree.update(render("new-photo")));
    expect(tree.root.findByType(Image).props.source).toEqual({ uri: "new-photo" });
  } finally { act(() => tree.unmount()); }
});
