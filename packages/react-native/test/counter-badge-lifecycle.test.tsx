import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { CounterBadge } from "../src/data-display.js";
import { HjmNativeProvider } from "../src/provider.js";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; vi.restoreAllMocks(); });
it("keeps hook order and visible count stable through zero transitions", () => {
  const errors = vi.spyOn(console, "error").mockImplementation(() => {});
  const ui = (count: number) => <HjmNativeProvider><CounterBadge count={count} accessibilityLabel={`Notifications ${count}`} /></HjmNativeProvider>;
  act(() => { tree = create(ui(0)); });
  expect(tree!.toJSON()).toBeNull();
  for (const count of [1, 0, 2, 0]) {
    act(() => tree!.update(ui(count)));
    if (count === 0) expect(tree!.toJSON()).toBeNull();
    else {
      expect(tree!.root.findAll(node => typeof node.type === "string" && node.props.accessibilityLabel === `Notifications ${count}`)).toHaveLength(1);
      expect(tree!.root.findAll(node => typeof node.type === "string" && node.children.includes(String(count)))).toHaveLength(1);
    }
  }
  expect(errors.mock.calls.filter(call => /order of Hooks|Rendered (more|fewer) hooks/i.test(call.join(" ")))).toEqual([]);
});
