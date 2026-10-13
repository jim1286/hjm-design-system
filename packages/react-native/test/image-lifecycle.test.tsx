import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { View } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { Image, type ImageRenderProps } from "../src/data-display.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; });
it("retires replaced image reports and treats A to B to A as a new request", () => {
  let image!: ImageRenderProps; const changed = vi.fn(), failed = vi.fn();
  const view = (src: string) => <HjmNativeProvider><Image src={src} width={80} height={40} onLoadStatusChange={changed} onError={failed}
    renderImage={props => { image = props; return <View testID="asset" />; }} /></HjmNativeProvider>;
  act(() => { tree = create(view("a")); }); const oldA = image;
  act(() => tree!.update(view("b")));
  act(() => image.reportLoad());
  act(() => oldA.reportError());
  expect(changed.mock.calls).toEqual([["loaded"]]); expect(failed).not.toHaveBeenCalled();
  expect(image.status).toBe("loaded");
  act(() => tree!.update(view("a")));
  expect(image.status).toBe("loading");
  act(() => oldA.reportError());
  expect(tree!.root.findAllByProps({ testID: "asset" }).length).toBeGreaterThan(0);
  act(() => image.reportError());
  expect(tree!.root.findAllByProps({ testID: "asset" })).toHaveLength(0);
});
it("does not publish image status after its host unmounts", () => {
  let image!: ImageRenderProps; const changed = vi.fn();
  act(() => { tree = create(<HjmNativeProvider><Image src="a" width={80} height={40} onLoadStatusChange={changed}
    renderImage={props => { image = props; return <View />; }} /></HjmNativeProvider>); });
  act(() => { tree!.unmount(); tree = undefined; });
  act(() => image.reportLoad());
  expect(changed).not.toHaveBeenCalled();
});
