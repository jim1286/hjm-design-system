import { type AlertDialogRequest } from "@hjmds/design-contracts/components/alert-dialog";
import { alertDialogRecipe } from "@hjmds/design-contracts/recipes";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, View } from "react-native";
import { afterEach, describe, expect, it } from "vitest";

import { AlertDialog, HjmNativeProvider } from "../src/index.js";
import { __setWindowDimensions } from "./react-native.mock.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const request: AlertDialogRequest = {
  mode: "confirm",
  title: "정리할까요?",
  description: "지금까지의 대화를 정리해요.",
  confirmLabel: "정리하기",
  cancelLabel: "취소",
};

function render(): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <HjmNativeProvider reducedMotion theme="light">
        <AlertDialog open request={request} />
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
});
