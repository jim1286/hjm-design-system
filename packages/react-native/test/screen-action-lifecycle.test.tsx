import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { TextInput } from "react-native";
import { HjmNativeProvider } from "../src/provider.js";
import { Button, IconButton } from "../src/actions.js";
import { AlertDialog } from "../src/overlays.js";
import { EditorScreen, ModerationScreen, PermissionScreen, type EditorScreenProps } from "../src/screen-flows.js";
vi.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }) }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; });
const discard = { mode: "confirm", title: "초안을 버릴까요?", description: "입력이 사라집니다", confirmLabel: "버리기", cancelLabel: "계속 작성", fallbackErrorMessage: "실패" } as const;
// EditorScreen cancel renders as the header exit IconButton, named by its label.
const button = (label: string) => tree!.root.findAllByType(Button).find(node => node.props.children === label) ?? tree!.root.findAllByType(IconButton).find(node => node.props.label === label)!;
const render = (content: React.ReactNode) => act(() => {
  const element = <HjmNativeProvider reducedMotion>{content}</HjmNativeProvider>;
  if (tree) tree.update(element); else tree = create(element);
});
const renderEditor = (props: Partial<EditorScreenProps> = {}) => render(<EditorScreen title="작성" dirty submit={{ label: "저장", onAction: vi.fn() }} cancel={{ label: "닫기", onAction: vi.fn() }} discard={discard} {...props}><TextInput value="유지할 입력" /></EditorScreen>);
it("blocks native editor submit while content is unavailable at either action placement", () => {
  for (const submitPlacement of ["header", "footer"] as const) {
    for (const kind of ["loading", "error", "restricted", "empty"] as const) {
      renderEditor({ submitPlacement, state: { kind, title: "아직 편집할 수 없습니다" } });
      expect(button("저장").props.disabled).toBe(true); expect(button("닫기").props.disabled).toBe(false);
    }
    renderEditor({ submitPlacement }); expect(button("저장").props.disabled).toBe(false);
  }
});
it("retires native discard confirmation during save and preserves the mounted draft", () => {
  const leave = vi.fn();
  const props = (pending: boolean) => ({ cancel: { label: "닫기", onAction: leave }, submit: { label: "저장", pending, onAction: vi.fn() } });
  renderEditor(props(false)); const input = tree!.root.findByType(TextInput);
  act(() => button("닫기").props.onPress()); expect(tree!.root.findByType(AlertDialog).props.open).toBe(true);
  renderEditor(props(true)); expect(tree!.root.findByType(AlertDialog).props.open).toBe(false);
  renderEditor(props(false)); expect(tree!.root.findByType(AlertDialog).props.open).toBe(false);
  expect(tree!.root.findByType(TextInput)).toBe(input); expect(input.props.value).toBe("유지할 입력"); expect(leave).not.toHaveBeenCalled();
});
it("does not revive a withdrawn native block confirmation", () => {
  const blockUser = vi.fn();
  const block = { action: { label: "차단", onAction: vi.fn() }, confirmation: { ...discard, title: "대상을 차단할까요?", onConfirm: blockUser } };
  const show = (available: boolean) => render(<ModerationScreen title="신고" reasons={[{ value: "spam", label: "스팸" }]} reason="spam" reasonLabel="사유" onReasonChange={() => {}} submit={{ label: "신고하기", onAction: vi.fn() }} {...(available ? { block } : {})} />);
  show(true); act(() => button("차단").props.onPress()); expect(tree!.root.findByType(AlertDialog).props.open).toBe(true);
  show(false); show(true); expect(tree!.root.findByType(AlertDialog).props.open).toBe(false); expect(blockUser).not.toHaveBeenCalled();
});
it("routes each native permission status without requesting on render", () => {
  const request = vi.fn(), settings = vi.fn(), next = vi.fn(), skip = vi.fn();
  const cases = [["prompt", "허용", request], ["denied", "설정", settings], ["granted", "계속", next], ["unavailable", null, null]] as const;
  for (const [status, label, callback] of cases) {
    render(<PermissionScreen title="권한" status={status} explanation="사용 이유" request={{ label: "허용", onAction: request }} settings={{ label: "설정", onAction: settings }} continueAction={{ label: "계속", onAction: next }} skip={{ label: "나중에", onAction: skip }} />);
    expect(tree!.root.findAllByType(Button)).toHaveLength(label ? 2 : 1);
    if (label) { act(() => button(label).props.onPress()); expect(callback).toHaveBeenCalledOnce(); }
  }
  act(() => button("나중에").props.onPress()); expect(skip).toHaveBeenCalledOnce();
});

it("forwards native asynchronous discard failure to the confirmation lifecycle", async () => {
  const failure = Promise.reject(new Error("discard failed"));
  void failure.catch(() => {});
  const leave = vi.fn(() => failure);
  renderEditor({ cancel: { label: "닫기", onAction: leave } });
  act(() => button("닫기").props.onPress());
  const result = tree!.root.findByType(AlertDialog).props.request.onConfirm();
  expect(result).toBe(failure);
  await expect(result).rejects.toThrow("discard failed");
  expect(tree!.root.findByType(TextInput).props.value).toBe("유지할 입력");
});
