import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable } from "react-native";
import { useState } from "react";
import { afterEach, expect, it } from "vitest";
import { Timeline } from "../src/data-display.js";
import { HjmNativeProvider } from "../src/provider.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; });
function flat(style: unknown): Record<string, unknown> {
  return Array.isArray(style) ? Object.assign({}, ...style.map(flat)) : style && typeof style === "object" ? style as Record<string, unknown> : {};
}
const items = [{ id: "a", label: "출발" }, { id: "b", label: "도착", timestamp: "9:00" }] as const;

it("renders each record as a selected-state button that reports the chosen id", () => {
  const changes: string[] = [];
  act(() => { tree = create(<HjmNativeProvider>
    <Timeline variant="record" items={items} composeAccessibleName={({ position, label }) => `${position}단계 ${label}`} selectedId="a" onSelectedIdChange={id => changes.push(id)} />
  </HjmNativeProvider>); });
  const records = tree!.root.findAllByType(Pressable);
  expect(records).toHaveLength(2);
  expect(records.map(record => record.props.accessibilityState)).toEqual([{ selected: true }, { selected: false }]);
  expect(records.map(record => record.props.accessibilityRole)).toEqual(["button", "button"]);
  expect(records[1]!.props.accessibilityLabel).toBe("2단계 도착, 9:00");
  const [selected, idle] = records.map(record => flat(record.props.style));
  // Same 1pt ring on both records so selecting never shifts the text; only the selected one is painted.
  expect(selected!.borderWidth).toBe(1);
  expect(idle!.borderWidth).toBe(1);
  expect(idle!.borderColor).toBe("transparent");
  expect(selected!.backgroundColor).toBeTruthy();
  expect(selected!.borderColor).not.toBe("transparent");
  act(() => records[1]!.props.onPress());
  act(() => records[0]!.props.onPress());
  expect(changes).toEqual(["b"]);
});

it("journal collapses details without clearing selection and opens the next selected record", () => {
  const journalItems = [{id: "a", label: "출발", description: "서울"}, {id: "b", label: "바다", description: "거북이"}];
  function Journal() {
    const [selected, setSelected] = useState("a");
    return <HjmNativeProvider><Timeline items={journalItems} composeAccessibleName={({label}) => label}
      selectedId={selected} onSelectedIdChange={setSelected} /></HjmNativeProvider>;
  }
  act(() => {tree = create(<Journal />);});
  const records = () => tree!.root.findAllByType(Pressable);
  expect(records()[0]!.props.accessibilityState).toEqual({selected: true, expanded: true});
  expect(flat(records()[0]!.props.style).backgroundColor).toBeUndefined();
  expect(flat(records()[0]!.props.style).borderWidth).toBeUndefined();
  act(() => records()[0]!.props.onPress());
  expect(records()[0]!.props.accessibilityState).toEqual({selected: true, expanded: false});
  expect(records()[0]!.props.accessibilityLabel).not.toContain("서울");
  act(() => records()[1]!.props.onPress());
  expect(records()[1]!.props.accessibilityState).toEqual({selected: true, expanded: true});
  act(() => records()[0]!.props.onPress());
  expect(records()[0]!.props.accessibilityLabel).toContain("서울");
  expect(records()[0]!.props.accessibilityState.expanded).toBe(true);
});

it("stays a passive record without selection and rejects actions on selectable records", () => {
  act(() => { tree = create(<HjmNativeProvider><Timeline variant="record" items={items} composeAccessibleName={({ label }) => label} /></HjmNativeProvider>); });
  expect(tree!.root.findAllByType(Pressable)).toHaveLength(0);
  expect(() => act(() => tree!.update(<HjmNativeProvider>
    <Timeline variant="record" items={items} composeAccessibleName={({ label }) => label} selectedId={null} onSelectedIdChange={() => {}} renderActions={() => null} />
  </HjmNativeProvider>))).toThrow(/cannot render per-record actions/);
});
