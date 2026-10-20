import { type AlertDialogRequest } from "@hjmds/design-contracts/components/alert-dialog";
// This proof file is listed by test/executed-scenarios.json; the workspace checker validates its cases against that registry.
import { alertDialogRecipe } from "@hjmds/design-contracts/recipes";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, Text, View } from "react-native";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AlertDialog, HjmNativeProvider } from "../src/index.js";
import { __setWindowDimensions } from "./react-native.mock.js";

// The evidence registry points to this focused host-action test; generic fixtures omit the confirmation state transitions.
// componentId: "alert-dialog"
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const request: AlertDialogRequest = {
  mode: "confirm",
  title: "정리할까요?",
  description: "지금까지의 대화를 정리해요.",
  confirmLabel: "정리하기",
  cancelLabel: "취소",
};

function render(value: AlertDialogRequest = request): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <HjmNativeProvider reducedMotion theme="light">
        <AlertDialog open request={value} />
      </HjmNativeProvider>,
      { createNodeMock: () => ({}) },
    );
  });
  return renderer!;
}

function actions(renderer: ReactTestRenderer) {
  const buttons = renderer.root.findAllByType(Pressable);
  const labels = buttons.map((button) => button.props.accessibilityLabel);
  const container = renderer.root
    .findAllByType(View)
    .find((view) => view.findAllByType(Pressable).length === 2 && view.props.style?.flexDirection);
  return { labels, style: container!.props.style };
}

afterEach(() => {
  __setWindowDimensions({ width: 800, height: 600, scale: 2, fontScale: 1 });
});

describe("AlertDialog actions", () => {
  it("keeps [cancel][confirm] side by side on wide windows", () => {
    const { labels, style } = actions(render());
    expect(labels).toEqual(["취소", "정리하기"]);
    expect(style).toMatchObject({ flexDirection: "row", gap: alertDialogRecipe.actions.gap });
  });

  it("stacks confirm above cancel with the tighter gap on phones", () => {
    __setWindowDimensions({ width: 390, height: 844, scale: 3, fontScale: 1 });
    const { labels, style } = actions(render());
    expect(alertDialogRecipe.actions.stackedOrder).toBe("confirm-first");
    expect(labels).toEqual(["정리하기", "취소"]);
    expect(style).toMatchObject({
      flexDirection: "column",
      gap: alertDialogRecipe.actions.stackedGap,
    });
    expect(alertDialogRecipe.actions.stackedGap).toBeLessThan(alertDialogRecipe.actions.gap);
  });

  it("keeps long title and description copy readable without single-line truncation", () => {
    const longCopy = "A long confirmation sentence with an unbroken identifier abcdefghijklmnopqrstuvwxyz0123456789 that needs to wrap.";
    const renderer = render({ ...request, title: longCopy, description: longCopy });
    const labels = renderer.root.findAllByType(Text).map((node) => node.props.children);
    expect(labels.filter((label) => label === longCopy)).toHaveLength(2);
    expect(renderer.root.findAllByType(Text).every((node) => node.props.numberOfLines === undefined)).toBe(true);
  });

  it("exposes named button actions and disables them while confirmation is pending", async () => {
    let resolveConfirm!: () => void;
    const onConfirm = vi.fn(() => new Promise<void>((resolve) => { resolveConfirm = resolve; }));
    const renderer = render({ ...request, onConfirm, fallbackErrorMessage: "저장하지 못했습니다." });
    const buttons = renderer.root.findAllByType(Pressable);
    expect(buttons.map((button) => button.props.accessibilityRole)).toEqual(["button", "button"]);
    expect(buttons.map((button) => button.props.accessibilityLabel)).toEqual(["취소", "정리하기"]);

    await act(async () => {
      buttons[1]!.props.onPress();
      await Promise.resolve();
    });
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(renderer.root.findAllByType(Pressable).map((button) => button.props.disabled)).toEqual([true, true]);
    await act(async () => {
      resolveConfirm();
      await Promise.resolve();
    });
    renderer.unmount();
  });
});


it("preserves an open error session across external confirm locks and still permits cancellation", async () => {
  const run=vi.fn().mockRejectedValue(new Error('temporary failure')), close=vi.fn();
  const value:AlertDialogRequest={...request,onConfirm:run,fallbackErrorMessage:'Try again'};
  let tree!:ReactTestRenderer;
  const node=(locked:boolean)=><HjmNativeProvider reducedMotion><AlertDialog open request={value} confirmDisabled={locked} onOpenChange={close}/></HjmNativeProvider>;
  const button=(label:string)=>tree.root.findAllByType(Pressable).find(n=>n.props.accessibilityLabel===label)!;
  act(()=>{tree=create(node(true));});
  expect(button('정리하기').props.disabled).toBe(true);
  await act(async()=>{button('정리하기').props.onPress();});expect(run).not.toHaveBeenCalled();
  act(()=>tree.update(node(false)));
  await act(async()=>{button('정리하기').props.onPress();});expect(run).toHaveBeenCalledOnce();
  expect(JSON.stringify(tree.toJSON())).toContain('Try again');
  act(()=>tree.update(node(true)));
  expect(JSON.stringify(tree.toJSON())).toContain('Try again');
  expect(button('취소').props.disabled).toBe(false);
  act(()=>button('취소').props.onPress());expect(close).toHaveBeenCalledWith(false,expect.anything());
  act(()=>tree.unmount());
});
