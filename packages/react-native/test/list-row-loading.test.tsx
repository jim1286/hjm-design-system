import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { ListRow } from "../src/data-display.js";
import { Button } from "../src/actions.js";
import { SearchScreen } from "../src/screen-flows.js";
import { Text } from "../src/primitives.js";
import { listRowRecipe } from "@hjmds/design-contracts/recipes";
import { searchScreenRecipe } from "@hjmds/design-contracts/screen-patterns";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
const flatten = (style: unknown): Record<string, unknown> => Object.assign({}, ...[typeof style === "function" ? style({ pressed: false }) : style].flat(Infinity).filter(Boolean));
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; });

it.each(["compact", "comfortable", "relaxed", "spacious"] as const)("retains %s row geometry and removes placeholder commands", density => {
  const activate = vi.fn();
  const view = (loading: boolean) => <HjmNativeProvider reducedMotion><ListRow testID="row" density={density} title="Title" description="Description" loading={loading} loadingLabel="Loading" onPress={activate} trailingAction={<Button onPress={activate}>Remove</Button>} /></HjmNativeProvider>;
  act(() => { tree = create(view(true)); });
  const host = tree!.root.findAll(node => typeof node.type === "string" && node.props.testID === "row")[0]!;
  expect(flatten(host.props.style)).toMatchObject({ minHeight: listRowRecipe.density[density].twoLineMinHeight, paddingVertical: listRowRecipe.density[density].paddingVertical });
  expect(host.props.accessibilityState).toEqual({ busy: true });
  expect(host.props.onPress).toBeUndefined();
  expect(tree!.root.findAllByType(Button)).toHaveLength(0);
  act(() => tree!.update(view(false)));
  const command = tree!.root.findAll(node => typeof node.type === "string" && node.props.testID === "row")[0]!;
  expect(flatten(command.props.style).minHeight).toBe(listRowRecipe.density[density].twoLineMinHeight);
  act(() => command.props.onPress());
  expect(activate).toHaveBeenCalledOnce();
  expect(tree!.root.findAllByType(Button)).toHaveLength(1);
});

it("search uses two-line loading rows with one named status and then mounts results", () => {
  const view = (count: number | null) => <HjmNativeProvider reducedMotion><SearchScreen title="Search" query="one" queryLabel="Query" queryField={<Text>Query</Text>} onQueryChange={() => {}} onSearch={() => {}} resultSummary={{ count, countLabel: value => `${value} results`, loadingLabel: "Loading results" }}><ListRow title="Result" description="Ready" /></SearchScreen></HjmNativeProvider>;
  act(() => { tree = create(view(null)); });
  const rows = tree!.root.findAllByType(ListRow);
  expect(rows).toHaveLength(searchScreenRecipe.loadingRows);
  expect(rows.every(row => row.props.loading && row.props.description)).toBe(true);
  expect(rows.filter(row => row.props.loadingLabel)).toHaveLength(1);
  expect(tree!.root.findAll(node => typeof node.type === "string" && node.props.accessibilityLabel === "Loading results")).toHaveLength(1);
  act(() => tree!.update(view(1)));
  expect(tree!.root.findAllByType(ListRow).map(row => row.props.title)).toEqual(["Result"]);
});
