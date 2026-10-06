import { act, create, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";
// This proof file is listed by test/executed-scenarios.json; the workspace checker validates its cases against that registry.
import { Modal, Pressable, View } from "react-native";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Dialog, HjmNativeProvider, Text } from "../src/index.js";

// The evidence registry points to this focused host-action test; generic fixtures do not exercise modal dismissal.
// componentId: "dialog"
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function render(node: React.ReactNode): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<HjmNativeProvider reducedMotion theme="light">{node}</HjmNativeProvider>, {
      createNodeMock: () => ({}),
    });
  });
  return renderer!;
}

function boundary(renderer: ReactTestRenderer): ReactTestInstance {
  return renderer.root.find((node) => node.props.role === "dialog");
}

afterEach(() => vi.restoreAllMocks());

describe("Dialog native actions", () => {
  it("exposes the named modal boundary and closes after a named primary action", () => {
    const onOpenChange = vi.fn();
    const onPress = vi.fn();
    const renderer = render(
      <Dialog
        accessibilityTitle="삭제 확인"
        closeLabel="대화상자 닫기"
        defaultOpen
        description="삭제하면 복구할 수 없습니다. 계속하려면 삭제를 선택하세요."
        onOpenChange={onOpenChange}
        primaryAction={{ label: "삭제", onPress }}
        title={<Text>기록을 삭제할까요?</Text>}
      >
        <Text>이 작업은 되돌릴 수 없습니다.</Text>
      </Dialog>,
    );

    expect(renderer.root.findByType(Modal).props.visible).toBe(true);
    expect(boundary(renderer).props).toMatchObject({
      accessibilityLabel: "삭제 확인, 삭제하면 복구할 수 없습니다. 계속하려면 삭제를 선택하세요.",
      accessibilityState: { busy: false },
      accessibilityViewIsModal: true,
      importantForAccessibility: "yes",
      role: "dialog",
    });

    const close = renderer.root.find((node) => node.props.accessibilityLabel === "대화상자 닫기");
    expect(close.props.accessibilityRole).toBe("button");
    const remove = renderer.root.find((node) => node.props.accessibilityLabel === "삭제");
    act(() => remove.props.onPress());
    expect(onPress).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false, { reason: "close-action" });
    expect(renderer.root.findByType(Modal).props.visible).toBe(false);
    act(() => renderer.unmount());
  });

  it("reports back and outside dismissal separately and blocks both while busy", () => {
    const onOpenChange = vi.fn();
    const renderer = render(
      <Dialog
        busy
        closeLabel="닫기"
        open
        onOpenChange={onOpenChange}
        primaryAction={{ label: "저장", onPress: vi.fn() }}
        title="편집"
      />,
    );
    const modal = renderer.root.findByType(Modal);
    const overlay = renderer.root.findAllByType(View).find((node) => node.props.accessibilityViewIsModal);
    const close = renderer.root.find((node) => node.props.accessibilityLabel === "닫기");
    const action = renderer.root.find((node) => node.props.accessibilityLabel === "저장");
    const outside = renderer.root.findAllByType(Pressable).find((node) => node.props.accessible === false);

    expect(boundary(renderer).props.accessibilityState).toEqual({ busy: true });
    expect(close.props.disabled).toBe(true);
    expect(action.props.accessibilityState.disabled).toBe(true);
    act(() => {
      modal.props.onRequestClose();
      outside?.props.onPress();
      action.props.onPress();
      close.props.onPress();
    });
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(overlay).toBeDefined();
    act(() => renderer.unmount());
  });

  it("keeps outside presses inert when dismissible is false", () => {
    const onOpenChange = vi.fn();
    const renderer = render(
      <Dialog closeLabel="닫기" dismissible={false} open onOpenChange={onOpenChange} title="고정 모달" />,
    );
    expect(renderer.root.findAllByType(Pressable).some((node) => node.props.accessible === false)).toBe(false);
    act(() => renderer.root.findByType(Modal).props.onRequestClose());
    expect(onOpenChange).not.toHaveBeenCalled();
    act(() => renderer.unmount());
  });
  it("waits for async actions, blocks repeat/back, and keeps rejected input available for retry", async () => {
    let resolve!: () => void;
    let reject!: (error: Error) => void;
    const onOpenChange = vi.fn(), onActionError = vi.fn();
    const onPress = vi.fn(() => new Promise<void>((yes, no) => { resolve = yes; reject = no; }));
    const renderer = render(<Dialog defaultOpen title="편집" closeLabel="닫기"
      onOpenChange={onOpenChange} onActionError={onActionError}
      primaryAction={{label:"저장", onPress}}><Text>보존할 초안</Text></Dialog>);
    const button = () => renderer.root.find(node => node.props.accessibilityLabel === "저장");
    act(() => { button().props.onPress(); button().props.onPress(); renderer.root.findByType(Modal).props.onRequestClose(); });
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(boundary(renderer).props.accessibilityState.busy).toBe(true);
    const error = new Error("offline");
    await act(async () => reject(error));
    expect(onActionError).toHaveBeenCalledWith(error);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(boundary(renderer).props.accessibilityState.busy).toBe(false);
    act(() => button().props.onPress());
    await act(async () => resolve());
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false, {reason:"close-action"});
    act(() => renderer.unmount());
  });

  it("ignores completion from a closed and reopened controlled session", async () => {
    let resolve!: () => void;
    const onOpenChange = vi.fn();
    const props = {title:"편집", closeLabel:"닫기", onOpenChange,
      primaryAction:{label:"저장", onPress:() => new Promise<void>(yes => {resolve = yes;})}};
    const fixture = (open: boolean) => <HjmNativeProvider reducedMotion><Dialog {...props} open={open}/></HjmNativeProvider>;
    const renderer = render(<Dialog {...props} open/>);
    act(() => renderer.root.find(node => node.props.accessibilityLabel === "저장").props.onPress());
    await act(async () => { renderer.update(fixture(false)); });
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 10)); });
    act(() => renderer.update(fixture(true)));
    await act(async () => resolve());
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(boundary(renderer).props.accessibilityState.busy).toBe(false);
    act(() => renderer.unmount());
  });

});
