import { act, create } from "react-test-renderer";
// This proof file is listed by test/executed-scenarios.json; the workspace checker validates its cases against that registry.
import { Pressable, ScrollView } from "react-native";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmNativeProvider, Text } from "../src/index.js";
import { TransferList } from "../src/transfer-list.js";

export const transferListNativeActionCases = [{ componentId: "transfer-list" }] as const;

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

let renderer: ReturnType<typeof create> | undefined;

afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
});

it("exposes the two named Native lists and moves a row with the standard host press action", () => {
  const onMove = vi.fn();
  const longLabel = "An unusually long localized selection label with verylongunbrokenidentifierlikewordsthatmustwrap and the full sentence still available to assistive technology.";
  act(() => {
    renderer = create(
      <HjmNativeProvider>
        <TransferList
          items={[{ id: "one", label: longLabel, textValue: longLabel }]}
          labels={{
            source: "Available account permissions",
            target: "Selected account permissions",
            toTarget: "Add selected permissions to the account",
            toSource: "Remove selected permissions from the account",
            selectAll: "Select every available permission",
            empty: "No permissions remain in this list yet.",
          }}
          onMove={onMove}
        />
      </HjmNativeProvider>,
    );
  });

  const sourceList = renderer!.root.findAllByType(ScrollView)
    .find((node) => node.props.accessibilityLabel === "Available account permissions")!;
  const targetList = renderer!.root.findAllByType(ScrollView)
    .find((node) => node.props.accessibilityLabel === "Selected account permissions")!;
  expect(sourceList.props.accessibilityRole).toBe("list");
  expect(targetList.props.accessibilityRole).toBe("list");

  const sourceRow = renderer!.root.findAllByType(Pressable)
    .find((node) => node.props.accessibilityLabel === longLabel)!;
  expect(sourceRow.props.accessibilityRole).toBe("checkbox");
  expect(sourceRow.props.accessibilityState).toMatchObject({ checked: false, disabled: false });
  const renderedCopy = sourceRow.findByType(Text);
  expect((renderedCopy.props.children as string[]).join("")).toBe(longLabel);
  expect(renderedCopy.props.numberOfLines).toBeUndefined();
  expect(renderedCopy.props.allowFontScaling).not.toBe(false);

  const add = renderer!.root.findAllByType(Pressable)
    .find((node) => node.props.accessibilityLabel === "Add selected permissions to the account")!;
  act(() => sourceRow.props.onPress());
  act(() => add.props.onPress());

  expect(onMove).toHaveBeenCalledWith(["one"], "toTarget");
  expect(renderer!.root.findAllByType(Pressable)
    .filter((node) => node.props.accessibilityLabel === longLabel)).toHaveLength(1);
  expect(renderer!.root.findAllByType(ScrollView)
    .find((node) => node.props.accessibilityLabel === "Available account permissions")!
    .findAllByType(Pressable)
    .filter((node) => node.props.accessibilityLabel === longLabel)).toHaveLength(0);
  expect(renderer!.root.findAllByType(ScrollView)
    .find((node) => node.props.accessibilityLabel === "Selected account permissions")!
    .findAllByType(Pressable)
    .some((node) => node.props.accessibilityLabel === longLabel)).toBe(true);
});
