import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it } from "vitest";
import { Progress } from "../src/feedback.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; });
it.each([[0, []], [25, ["-90deg"]], [50, ["0deg"]], [75, ["0deg", "-90deg"]], [100, ["0deg", "0deg"]]] as const)("draws %s percent as growing half arcs", (value, rotations) => {
  act(() => { tree = create(<HjmNativeProvider reducedMotion><Progress shape="circular" label="Upload" value={value} /></HjmNativeProvider>); });
  const hosts = tree!.root.findAll(node => typeof node.type === "string");
  expect(hosts.filter(node => node.props.style?.transform).map(node => node.props.style.transform[0].rotate)).toEqual(rotations);
  expect(hosts.find(node => node.props.accessibilityRole === "progressbar")?.props.accessibilityValue.now).toBe(value);
});
