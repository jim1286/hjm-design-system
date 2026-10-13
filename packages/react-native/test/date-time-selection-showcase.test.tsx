import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { Button } from "@hjmds/react-native/actions";
import { DatePicker } from "@hjmds/react-native/date-picker";
import { Select } from "@hjmds/react-native/forms";
import { Notice } from "@hjmds/react-native/feedback";
import { DateTimeSelectionPreview } from "../../../showcase/native/src/date-time-selection-preview";
import { dateTimeCopy as copy } from "../../../showcase/shared/date-time-selection";
vi.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; });
const render = (initialStatus: "failed" | "pending" = "failed") => act(() => { tree = create(<DateTimeSelectionPreview initialStatus={initialStatus} />, { createNodeMock: () => ({}) }); });
const button = (label: string) => tree!.root.findAllByType(Button).find(node => node.props.children === label)!;
const press = (label: string) => act(() => button(label).props.onPress());

it("retains the chosen civil values through failure, retry and reset in the actual Native preview", () => {
  render(); press(copy.fail); press(copy.retry);
  expect(button(copy.pending).props.loading).toBe(true);
  expect(tree!.root.findByType(DatePicker).props.descriptor.disabled).toBe(true);
  press(copy.respond);
  expect(tree!.root.findByType(Notice).props.title).toBe(copy.failed);
  expect(tree!.root.findByType(DatePicker).props.descriptor.selectedDate).toBe("2026-09-16");
  expect(tree!.root.findAllByType(Select).map(node => node.props.selectedKey)).toEqual(["09", "30"]);
  press(copy.retry); press(copy.respond);
  expect(tree!.root.findByType(Notice).props.description).toBe("\u20662026-09-16 09:30\u2069");
  press(copy.reset);
  expect(tree!.root.findByType(DatePicker).props.descriptor.selectedDate).toBeNull();
  expect(tree!.root.findAllByType(Select).map(node => node.props.selectedKey)).toEqual([null, null]);
  expect(button(copy.confirm).props.disabled).toBe(true);
});

it("rejects queued field edits and duplicate actions while the selected snapshot is pending", () => {
  render();
  const dateChange = tree!.root.findByType(DatePicker).props.descriptor.onSelectionChange;
  const hourChange = tree!.root.findAllByType(Select)[0]!.props.onSelectionChange;
  const reset = button(copy.reset).props.onPress;
  const confirm = button(copy.retry).props.onPress;
  act(() => { confirm(); dateChange("2026-10-01"); hourChange("18"); reset(); confirm(); });
  expect(tree!.root.findByType(DatePicker).props.descriptor.selectedDate).toBe("2026-09-16");
  expect(tree!.root.findAllByType(Select)[0]!.props.selectedKey).toBe("09");
  press(copy.respond);
  expect(tree!.root.findByType(Notice).props.description).toBe("\u20662026-09-16 09:30\u2069");
});
