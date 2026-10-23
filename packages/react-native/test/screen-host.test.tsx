import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it } from "vitest";
import { View } from "react-native";
import { ScreenHost, ScreenLayout } from "../src/screens.js";
import { HjmNativeProvider, useHjmNativeTheme } from "../src/provider.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; });

const insets = { top: 47, right: 10, bottom: 34, left: 12 };
const hostStyle = () => tree!.root.findByProps({ testID: "host" }).findByType(View).props.style as Record<string, unknown>;

it("pads the provider's top and side insets by default, leaves the bottom to the screen and paints the canvas", () => {
  let canvas = "";
  function Canvas() { canvas = useHjmNativeTheme().colors.bg; return null; }
  act(() => { tree = create(<HjmNativeProvider theme="dark" safeAreaInsets={insets}><ScreenHost testID="host"><Canvas /><ScreenLayout title="설정" safeAreaBottom={insets.bottom} /></ScreenHost></HjmNativeProvider>); });
  expect(hostStyle()).toMatchObject({ flex: 1, paddingTop: 47, paddingRight: 10, paddingBottom: 0, paddingLeft: 12, backgroundColor: canvas });
});

it("pads only the listed edges and keeps an outer wallpaper with surface=\"transparent\"", () => {
  act(() => { tree = create(<HjmNativeProvider safeAreaInsets={insets}><ScreenHost testID="host" edges={["left", "right", "bottom"]} surface="transparent" /></HjmNativeProvider>); });
  expect(hostStyle()).toMatchObject({ paddingTop: 0, paddingRight: 10, paddingBottom: 34, paddingLeft: 12, backgroundColor: "transparent" });
});

it("rejects unknown or repeated edges", () => {
  const render = (edges: readonly string[]) => act(() => { tree = create(<HjmNativeProvider safeAreaInsets={insets}><ScreenHost edges={edges as never} /></HjmNativeProvider>); });
  expect(() => render(["top", "top"])).toThrow(TypeError);
  expect(() => render(["start"])).toThrow(TypeError);
});
