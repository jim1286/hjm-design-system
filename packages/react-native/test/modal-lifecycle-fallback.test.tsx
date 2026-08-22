import { type AlertDialogRequest } from "@hjm/design-contracts/components/alert-dialog";
import {
  alertDialogRecipe,
  dialogRecipe,
  sheetRecipe,
} from "@hjm/design-contracts/recipes";
import { type ReactNode } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { AccessibilityInfo, Animated, Modal, Platform, View } from "react-native";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AlertDialog, Dialog, HjmNativeProvider, Sheet } from "../src/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const alertRequest: AlertDialogRequest = {
  mode: "alert",
  title: "알림",
  description: "작업이 완료되었습니다.",
  confirmLabel: "확인",
};

function tree(node: ReactNode) {
  return (
    <HjmNativeProvider reducedMotion theme="light">
      {node}
    </HjmNativeProvider>
  );
}

function render(node: ReactNode): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(tree(node), { createNodeMock: () => ({}) });
  });
  return renderer!;
}

afterEach(() => {
  Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("cross-platform native Modal completion", () => {
  it("keeps the permitted opacity enter while reduced motion removes spatial exit", () => {
    const timing = vi.spyOn(Animated, "timing");
    const overlays = [
      [
        <Dialog closeLabel="닫기" open title="설정" />,
        <Dialog closeLabel="닫기" open={false} title="설정" />,
        dialogRecipe.transition.enter.duration,
      ],
      [
        <AlertDialog open request={alertRequest} />,
        <AlertDialog open={false} request={alertRequest} />,
        alertDialogRecipe.transition.enter.duration,
      ],
      [
        <Sheet closeLabel="닫기" open title="필터" />,
        <Sheet closeLabel="닫기" open={false} title="필터" />,
        sheetRecipe.transition.enter.duration,
      ],
    ] as const;

    for (const [overlay, closedOverlay, enterDuration] of overlays) {
      const renderer = render(overlay);
      act(() => renderer.root.findByType(Modal).props.onShow({}));
      expect(timing.mock.calls.at(-1)?.[1]).toMatchObject({
        duration: enterDuration,
        toValue: 1,
      });
      act(() => renderer.update(tree(closedOverlay)));
      expect(timing.mock.calls.at(-1)?.[1]).toMatchObject({
        duration: 0,
        toValue: 0,
      });
      renderer.unmount();
    }
  });

  it("restores Dialog focus only after Android host teardown", () => {
    vi.useFakeTimers();
    const focus = vi.spyOn(AccessibilityInfo, "setAccessibilityFocus");
    const returnFocusRef = { current: {} as View };
    const renderer = render(
      <Dialog closeLabel="닫기" open returnFocusRef={returnFocusRef} title="설정" />,
    );
    act(() => {
      renderer.update(
        tree(
          <Dialog
            closeLabel="닫기"
            open={false}
            returnFocusRef={returnFocusRef}
            title="설정"
          />,
        ),
      );
    });
    expect(focus).not.toHaveBeenCalled();
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(focus).toHaveBeenCalledWith(1);
    renderer.unmount();
  });

  it("suppresses stale Dialog focus restoration during a rapid reopen", () => {
    vi.useFakeTimers();
    const focus = vi.spyOn(AccessibilityInfo, "setAccessibilityFocus");
    const returnFocusRef = { current: {} as View };
    const renderer = render(
      <Dialog closeLabel="닫기" open returnFocusRef={returnFocusRef} title="설정" />,
    );
    act(() => {
      renderer.update(
        tree(
          <Dialog
            closeLabel="닫기"
            open={false}
            returnFocusRef={returnFocusRef}
            title="설정"
          />,
        ),
      );
    });
    act(() => {
      renderer.update(
        tree(
          <Dialog closeLabel="닫기" open returnFocusRef={returnFocusRef} title="설정" />,
        ),
      );
    });
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(renderer.root.findByType(Modal).props.visible).toBe(true);
    expect(focus).not.toHaveBeenCalled();
    renderer.unmount();
  });

  it("settles AlertDialog after Android interaction teardown without onDismiss", async () => {
    vi.useFakeTimers();
    const onResult = vi.fn();
    const renderer = render(
      <AlertDialog onResult={onResult} open request={alertRequest} />,
    );

    act(() => {
      renderer.update(
        tree(<AlertDialog onResult={onResult} open={false} request={alertRequest} />),
      );
    });
    expect(renderer.root.findByType(Modal).props.visible).toBe(false);
    expect(onResult).not.toHaveBeenCalled();

    await act(async () => {
      vi.runOnlyPendingTimers();
      await Promise.resolve();
    });
    expect(onResult).toHaveBeenCalledWith({
      outcome: "cancelled",
      reason: "programmatic",
    });
    renderer.unmount();
  });

  it("settles the prior AlertDialog before presenting a rapid controlled reopen", async () => {
    vi.useFakeTimers();
    const onResult = vi.fn();
    const renderer = render(
      <AlertDialog onResult={onResult} open request={alertRequest} />,
    );
    act(() => {
      renderer.update(
        tree(<AlertDialog onResult={onResult} open={false} request={alertRequest} />),
      );
    });
    act(() => {
      renderer.update(
        tree(<AlertDialog onResult={onResult} open request={alertRequest} />),
      );
    });
    expect(renderer.root.findByType(Modal).props.visible).toBe(false);

    await act(async () => {
      vi.runOnlyPendingTimers();
      await Promise.resolve();
    });
    expect(renderer.root.findByType(Modal).props.visible).toBe(true);
    expect(onResult).toHaveBeenCalledWith({
      outcome: "cancelled",
      reason: "programmatic",
    });
    renderer.unmount();
  });

  it("reports Sheet completion after Android interaction teardown", () => {
    vi.useFakeTimers();
    const onDismissComplete = vi.fn();
    const renderer = render(
      <Sheet closeLabel="닫기" onDismissComplete={onDismissComplete} open title="필터" />,
    );

    act(() => {
      renderer.update(
        tree(
          <Sheet
            closeLabel="닫기"
            onDismissComplete={onDismissComplete}
            open={false}
            title="필터"
          />,
        ),
      );
    });
    expect(onDismissComplete).not.toHaveBeenCalled();
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(onDismissComplete).toHaveBeenCalledWith({ reason: "programmatic" });
    renderer.unmount();
  });

  it("waits for the real iOS onDismiss after a presented Modal", () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });
    vi.useFakeTimers();
    const onDismissComplete = vi.fn();
    const renderer = render(
      <Sheet closeLabel="닫기" onDismissComplete={onDismissComplete} open title="필터" />,
    );
    const modal = renderer.root.findByType(Modal);
    act(() => modal.props.onShow({}));
    act(() => {
      renderer.update(
        tree(
          <Sheet
            closeLabel="닫기"
            onDismissComplete={onDismissComplete}
            open={false}
            title="필터"
          />,
        ),
      );
    });
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(onDismissComplete).not.toHaveBeenCalled();

    act(() => renderer.root.findByType(Modal).props.onDismiss());
    expect(onDismissComplete).toHaveBeenCalledWith({ reason: "programmatic" });
    renderer.unmount();
  });

  it("defers a rapid Sheet reopen until the previous native host tears down", () => {
    vi.useFakeTimers();
    const onDismissComplete = vi.fn();
    const renderer = render(
      <Sheet closeLabel="닫기" onDismissComplete={onDismissComplete} open title="필터" />,
    );

    act(() => {
      renderer.update(
        tree(
          <Sheet
            closeLabel="닫기"
            onDismissComplete={onDismissComplete}
            open={false}
            title="필터"
          />,
        ),
      );
    });
    act(() => {
      renderer.update(
        tree(
          <Sheet closeLabel="닫기" onDismissComplete={onDismissComplete} open title="필터" />,
        ),
      );
    });
    expect(renderer.root.findByType(Modal).props.visible).toBe(false);

    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(renderer.root.findByType(Modal).props.visible).toBe(true);
    expect(onDismissComplete).not.toHaveBeenCalled();
    renderer.unmount();
  });
});
