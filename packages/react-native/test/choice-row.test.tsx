import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { expect, it, vi } from "vitest";
import { ChoiceRow } from "../src/choice-row.js";
import { ListRow } from "../src/data-display.js";
import { RadioGroup } from "../src/inputs.js";
import { Sheet } from "../src/overlays.js";
import { HjmNativeProvider } from "../src/provider.js";

const items = [{ value: "system", label: "기기 설정" }, { value: "ko", label: "한국어" }, { value: "en", label: "English" }];

it("keeps the sheet open with the error and the confirmed value when the save fails, and closes on success", async () => {
  let reject!: () => void;
  let resolve!: () => void;
  const change = vi.fn()
    .mockImplementationOnce(() => new Promise<void>((_, fail) => { reject = () => fail(new Error("offline")); }))
    .mockImplementationOnce(() => new Promise<void>((done) => { resolve = done; }));
  let tree!: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider><ChoiceRow title="언어" items={items} value="ko" onValueChange={change} closeLabel="닫기" errorLabel="저장하지 못했어요" /></HjmNativeProvider>); });
  expect(tree.root.findByType(ListRow).props.description).toBe("한국어");
  act(() => tree.root.findByType(ListRow).props.onPress());
  expect(tree.root.findByType(Sheet).props.open).toBe(true);
  expect(tree.root.findByType(ListRow).props.accessibilityState).toEqual({ expanded: true });

  act(() => tree.root.findByType(RadioGroup).props.onValueChange("en"));
  expect(change).toHaveBeenCalledWith("en");
  expect(tree.root.findByType(Sheet).props.busy).toBe(true);
  await act(async () => { reject(); });
  expect(tree.root.findByType(Sheet).props.open).toBe(true);
  expect(tree.root.findByType(RadioGroup).props.error).toBe("저장하지 못했어요");
  expect(tree.root.findByType(RadioGroup).props.value).toBe("ko");

  act(() => tree.root.findByType(RadioGroup).props.onValueChange("en"));
  expect(tree.root.findByType(RadioGroup).props.error).toBeUndefined();
  await act(async () => { resolve(); });
  expect(tree.root.findByType(Sheet).props.open).toBe(false);
  act(() => tree.unmount());
});

it("closes at once for a synchronous save and passes the row density through", () => {
  const change = vi.fn();
  let tree!: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider><ChoiceRow title="언어" items={items} value="ko" onValueChange={change} closeLabel="닫기" density="compact" /></HjmNativeProvider>); });
  expect(tree.root.findByType(ListRow).props.density).toBe("compact");
  act(() => tree.root.findByType(ListRow).props.onPress());
  act(() => tree.root.findByType(RadioGroup).props.onValueChange("en"));
  expect(change).toHaveBeenCalledWith("en");
  expect(tree.root.findByType(Sheet).props.open).toBe(false);
  act(() => tree.unmount());
});

it("shows the confirmed item's picture on the row and boxes every item's picture in the sheet", () => {
  const art = (name: string) => <ListRow title={name} />;
  const pictured = [{ value: "meadow", label: "들판", leading: art("meadow") }, { value: "night", label: "밤하늘", leading: art("night") }, { value: "plain", label: "기본" }];
  let tree!: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider><ChoiceRow title="셸 테마" items={pictured} value="night" onValueChange={() => {}} closeLabel="닫기" /></HjmNativeProvider>); });
  const row = tree.root.findAllByType(ListRow)[0]!;
  expect(row.props.leading.props.title).toBe("night");
  act(() => row.props.onPress());
  const sheetItems = tree.root.findByType(RadioGroup).props.items as readonly { leading: { props: { style: { width: number; height: number }; children: unknown } } }[];
  expect(sheetItems.map((item) => [item.leading.props.style.width, item.leading.props.style.height])).toEqual([[40, 40], [40, 40], [40, 40]]);
  expect(sheetItems.map((item) => (item.leading.props.children as { props?: { title: string } } | undefined)?.props?.title ?? null)).toEqual(["meadow", "night", null]);
  act(() => tree.unmount());
});

it("keeps the product row leading and leaves items unboxed without pictures", () => {
  let tree!: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider><ChoiceRow title="언어" leading="icon" items={items} value="ko" onValueChange={() => {}} closeLabel="닫기" /></HjmNativeProvider>); });
  expect(tree.root.findByType(ListRow).props.leading).toBe("icon");
  act(() => tree.root.findByType(ListRow).props.onPress());
  expect((tree.root.findByType(RadioGroup).props.items as readonly { leading?: unknown }[]).every((item) => item.leading === undefined)).toBe(true);
  act(() => tree.unmount());
});
