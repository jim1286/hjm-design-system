import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it } from "vitest";
import { CompositionLayout } from "../src/screens.js";
import { HjmNativeProvider } from "../src/provider.js";
import { Text } from "../src/primitives.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; });
function flat(style: unknown): Record<string, unknown> {
  return Array.isArray(style) ? Object.assign({}, ...style.map(flat)) : style && typeof style === "object" ? style as Record<string, unknown> : {};
}
const byTestId = (id: string) => tree!.root.findAll(node => node.props.testID === id && typeof node.type !== "string");

it("reserves the state region height in place and leaves ready content alone", () => {
  const view = (ready: boolean) => <HjmNativeProvider><CompositionLayout title="박스스코어" stateHeight="regular"
    state={ready ? { kind: "ready" } : { kind: "empty", title: "기록 없음" }}><Text>표</Text></CompositionLayout></HjmNativeProvider>;
  act(() => { tree = create(view(false)); });
  expect(flat(byTestId("hjm-composition-state-region")[0]!.props.style)).toMatchObject({ flex: 1, minHeight: 160 });
  act(() => tree!.update(view(true)));
  expect(byTestId("hjm-composition-state-region")).toHaveLength(0);
  act(() => tree!.update(<HjmNativeProvider><CompositionLayout state={{ kind: "loading", title: "불러오는 중" }} /></HjmNativeProvider>));
  expect(byTestId("hjm-composition-state-region")).toHaveLength(0);
});
