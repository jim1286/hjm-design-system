import { act, create, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";
import { Share, Text } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { ShareSheet, type ShareSheetProps } from "../src/share-sheet.js";

// 2026-10-26: BurnTok's share sheet behaviours, now owned by HJM (batch send once, partial retry, honest feedback).
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const labels = { close: "닫기", copyLink: "링크 복사", systemShare: "공유하기", linkCopied: "링크를 복사했어요", actionFailed: "공유하지 못했어요" };
const recipientLabels = {
  group: "보낼 사람", search: "이름 검색", clearSearch: "검색어 지우기", loading: "불러오는 중", loadFailed: "목록을 불러오지 못했어요", retry: "다시 시도",
  empty: "보낼 사람이 없어요", noResults: "검색 결과가 없어요", sent: "보냄", sendFailed: "보내지 못했어요", send: (count: number) => `${count}명에게 보내기`,
};
const items = [{ id: "a", label: "하나", image: <Text>A</Text> }, { id: "b", label: "두리", image: <Text>B</Text> }];
const icons = { copyLink: <Text>C</Text>, systemShare: <Text>S</Text> };
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; vi.restoreAllMocks(); });

function render(props: Partial<ShareSheetProps> = {}) {
  act(() => {
    tree = create(<HjmNativeProvider><ShareSheet open onOpenChange={() => {}} title="공유" labels={labels} link="https://example.test/c/1" icons={icons}
      copyLink={async () => {}} {...props} /></HjmNativeProvider>);
  });
  // react-test-renderer has no layout pass; give the picker its measured width so tiles render.
  for (const group of tree!.root.findAll(node => typeof node.props.onLayout === "function" && node.props.accessibilityLabel === recipientLabels.group)) {
    act(() => group.props.onLayout({ nativeEvent: { layout: { width: 360 } } }));
  }
  return tree!;
}
const pressables = (root: ReactTestRenderer) => root.root.findAll(node => typeof node.props.onPress === "function" && typeof node.type !== "string");
const tile = (root: ReactTestRenderer, name: string) => root.root.findAll(node => node.props.accessibilityRole === "checkbox" && node.props.accessibilityLabel === name && typeof node.props.onPress === "function")[0];
const textOf = (node: ReactTestInstance): string => node.children.map(child => typeof child === "string" ? child : textOf(child)).join("");
const action = (root: ReactTestRenderer, name: string) => pressables(root).find(node => node.props.accessibilityLabel === name || textOf(node) === name);

it("sends the selected batch once and keeps only failed recipients selected", async () => {
  const onSend = vi.fn().mockResolvedValueOnce({ sentIds: ["a"] }).mockResolvedValueOnce({ sentIds: ["b"] });
  const root = render({ recipients: { items, labels: recipientLabels, onSend } });
  act(() => tile(root, "하나")!.props.onPress());
  act(() => tile(root, "두리")!.props.onPress());
  const send = action(root, "2명에게 보내기")!;
  await act(async () => { send.props.onPress(); send.props.onPress(); });
  expect(onSend).toHaveBeenCalledExactlyOnceWith(["a", "b"]);
  expect(textOf(root.root)).toContain(recipientLabels.sendFailed);
  expect(tile(root, "하나")!.props.accessibilityState).toEqual({ checked: true, disabled: true });
  expect(tile(root, "하나")!.props.accessibilityHint).toBe(recipientLabels.sent);
  await act(async () => action(root, "1명에게 보내기")!.props.onPress());
  expect(onSend.mock.calls).toEqual([[["a", "b"]], [["b"]]]);
  expect(action(root, "1명에게 보내기")).toBeUndefined();
});

it("copies through the product clipboard and hides the action without one", async () => {
  const copyLink = vi.fn(async () => {});
  const root = render({ copyLink });
  await act(async () => action(root, labels.copyLink)!.props.onPress());
  expect(copyLink).toHaveBeenCalledWith("https://example.test/c/1");
  expect(textOf(root.root)).toContain(labels.linkCopied);
  act(() => tree!.unmount());
  const without = render({ copyLink: null });
  expect(action(without, labels.copyLink)).toBeUndefined();
  expect(action(without, labels.systemShare)).toBeDefined();
});

it("opens React Native Share with the link in the Android message and reports a dismissal", async () => {
  const share = vi.spyOn(Share, "share").mockResolvedValue({ action: Share.dismissedAction, activityType: undefined });
  const onSystemShare = vi.fn();
  const root = render({ shareTitle: "점심 룰렛", onSystemShare });
  await act(async () => action(root, labels.systemShare)!.props.onPress());
  expect(share).toHaveBeenCalledWith({ message: "점심 룰렛\nhttps://example.test/c/1", title: "점심 룰렛" }, { dialogTitle: "공유" });
  expect(onSystemShare).toHaveBeenCalledWith("dismissed");
  expect(textOf(root.root)).not.toContain(labels.actionFailed);
});

it("shows load failure with retry", () => {
  const onRetry = vi.fn();
  const root = render({ recipients: { items: [], labels: recipientLabels, status: "error", onRetry, onSend: async () => ({ sentIds: [] }) } });
  expect(textOf(root.root)).toContain(recipientLabels.loadFailed);
  act(() => action(root, recipientLabels.retry)!.props.onPress());
  expect(onRetry).toHaveBeenCalledOnce();
});
