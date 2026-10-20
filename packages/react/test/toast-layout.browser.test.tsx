import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page } from "vitest/browser";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { Toast } from "../src/toast.js";
import { Notice } from "../src/feedback.js";
import { Button } from "../src/actions.js";
import { toastRecipe } from "@hjmds/design-contracts/recipes";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };
import "../src/styles.css";

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  await page.viewport(1280, 720);
});

const evidence = { componentId: "toast" } as const;
const layoutScenarios = executedScenarioRegistry.executions.find(
  ({ proofFile }) => proofFile === "test/toast-layout.browser.test.tsx",
)!.scenarios;

describe("Notice action layout", () => {
  // Keep historical maximum-text cases registered without executing them (2026-10-07 user scope).
  for (const textScale of [1, 2]) {
    it.skipIf(textScale === 2)(`keeps a short retry label together at text scale ${textScale}`, async () => {
      await page.viewport(320, 844);
      await act(async () => root.render(
        <HjmProvider textScale={textScale}>
          <Notice title="편지를 불러오지 못했어요" description="연결을 확인한 뒤 다시 시도해 주세요." action={<Button>다시 시도</Button>} />
        </HjmProvider>,
      ));
      const label = container.querySelector<HTMLElement>(".hjm-button__label")!;
      expect(label.getBoundingClientRect().height).toBeLessThanOrEqual(parseFloat(getComputedStyle(label).lineHeight) + 1);
      const notice = container.querySelector<HTMLElement>(".hjm-notice")!;
      expect(notice.scrollWidth).toBeLessThanOrEqual(notice.clientWidth);
    });
  }
});

describe(`${evidence.componentId} compact layout`, () => {
  it.each([320, 390, 480])("keeps a short message and close on the same row at %ipx", async (width) => {
    await page.viewport(width, 844);
    await act(async () => root.render(
      <HjmProvider>
        <Toast descriptor={{ id: "saved", description: "저장했어요", closeLabel: "닫기" }} onDismissRequest={() => {}} />
      </HjmProvider>,
    ));
    const toast = container.querySelector<HTMLElement>(".hjm-toast")!;
    const content = toast.querySelector<HTMLElement>(".hjm-toast__content")!.getBoundingClientRect();
    const close = toast.querySelector<HTMLElement>(".hjm-toast__close")!.getBoundingClientRect();
    // BurnTok's 390px product workaround reported a close-only second row. Check
    // geometry rather than a CSS value so an equivalent layout remains valid.
    expect(close.top).toBeLessThan(content.bottom);
    expect(close.bottom).toBeGreaterThan(content.top);
    expect(close.width).toBeGreaterThanOrEqual(44);
    expect(close.height).toBeGreaterThanOrEqual(44);
    expect(toast.scrollWidth).toBeLessThanOrEqual(toast.clientWidth);
  });

  // 2026-10-17 user: "기본 토스트 좌우랑 글자 라인이 안맞는데" — badge 28 / copy 32-33 / close glyph 30 and 16 vs 22 insets.
  for (const direction of ["ltr", "rtl"] as const) {
    it.each([
      ["single line", { id: "saved", description: "저장했어요", closeLabel: "닫기" }],
      ["title over wrapped copy", { id: "review", title: "검토하고 있어요", description: "다 되면 알려 드릴게요. 그동안 써 보셔도 돼요. 다 되면 알려 드릴게요.", closeLabel: "닫기" }],
    ] as const)(`centres badge, first line and close glyph on one anchor with mirrored insets (${direction}, %s)`, async (_, descriptor) => {
      await page.viewport(402, 844);
      await act(async () => root.render(
        <HjmProvider direction={direction}>
          <Toast descriptor={descriptor} onDismissRequest={() => {}} />
        </HjmProvider>,
      ));
      const toast = container.querySelector<HTMLElement>(".hjm-toast")!;
      const style = getComputedStyle(toast);
      const box = toast.getBoundingClientRect();
      const top = box.top + parseFloat(style.borderTopWidth) + parseFloat(style.paddingTop);
      const centre = (rect: DOMRect) => rect.top + rect.height / 2 - top;
      const badge = toast.querySelector(".hjm-toast__icon")?.getBoundingClientRect();
      const first = toast.querySelector<HTMLElement>(".hjm-toast__title, .hjm-toast__description")!;
      const firstLine = first.getBoundingClientRect().top + parseFloat(getComputedStyle(first).lineHeight) / 2 - top;
      const glyph = toast.querySelector(".hjm-toast__close svg")!.getBoundingClientRect();
      const anchor = toastRecipe.anchor.blockSize / 2;
      if (badge) expect(centre(badge)).toBeCloseTo(anchor, 0);
      if (descriptor.id === "review") expect(badge).toBeUndefined();
      expect(firstLine).toBeCloseTo(anchor, 0);
      expect(centre(glyph)).toBeCloseTo(anchor, 0);
      const padStart = parseFloat(style.borderInlineStartWidth) + toastRecipe.surface.padding.inline;
      const leading = badge ?? first.getBoundingClientRect();
      const startInset = direction === "ltr" ? leading.left - box.left : box.right - leading.right;
      const endInset = direction === "ltr" ? box.right - glyph.right : glyph.left - box.left;
      expect(startInset).toBeCloseTo(padStart, 0);
      expect(endInset).toBeCloseTo(startInset, 0);
      if (descriptor.id === "saved") {
        expect(box.height - 2 * parseFloat(style.borderTopWidth)).toBeCloseTo(toastRecipe.surface.minHeight, 0);
      }
    });
  }

  // Keep historical maximum-text cases registered without executing them (2026-10-07 user scope).
  for (const scenario of layoutScenarios) {
    it.skipIf(scenario.id === "large-text" || scenario.textScale >= 2)(`keeps long copy and actions reachable for ${scenario.id}`, async () => {
      // The provider caps its card at 420px even on desktop: reflow must follow
      // the card's available space rather than only the window breakpoint.
      await page.viewport(scenario.id === "large-text" ? 1280 : 320, 844);
      container.style.maxWidth = "420px";
      const onAction = vi.fn();
      const onDismiss = vi.fn();
      await act(async () => root.render(
        <HjmProvider
          direction={scenario.direction as "ltr" | "rtl"}
          theme={scenario.theme as "light" | "dark"}
          textScale={scenario.textScale}
          reducedMotion={scenario.reducedMotion}
        >
            <Toast descriptor={{
              id: "retry",
              title: "연결을 확인해 주세요",
              description: "Your changes remain available. 연결이 복구되면 다시 시도할 수 있어요.",
              closeLabel: "알림 닫기",
              action: { label: "다시 시도하기 Try again", onAction, dismissOnAction: false },
            }} onDismissRequest={onDismiss} />
        </HjmProvider>,
      ));
      const toast = container.querySelector<HTMLElement>(".hjm-toast")!;
      const bounds = toast.getBoundingClientRect();
      const content = toast.querySelector<HTMLElement>(".hjm-toast__content")!.getBoundingClientRect();
      const action = toast.querySelector<HTMLButtonElement>(".hjm-toast__action")!;
      const close = toast.querySelector<HTMLButtonElement>(".hjm-toast__close")!;
      for (const button of [action, close]) {
        const rect = button.getBoundingClientRect();
        expect(rect.left).toBeGreaterThanOrEqual(bounds.left);
        expect(rect.right).toBeLessThanOrEqual(bounds.right);
        expect(rect.height).toBeGreaterThanOrEqual(44);
        expect(button.scrollWidth).toBeLessThanOrEqual(button.clientWidth);
      }
      expect(action.getBoundingClientRect().top).toBeGreaterThanOrEqual(content.bottom);
      expect(close.getBoundingClientRect().top).toBeLessThan(content.bottom);
      expect(toast.scrollWidth).toBeLessThanOrEqual(toast.clientWidth);
      await act(async () => { action.focus(); action.click(); action.click(); });
      expect(document.activeElement).toBe(action);
      expect(onAction).toHaveBeenCalledTimes(1);
      await act(async () => close.click());
      expect(onDismiss).toHaveBeenCalledWith("close-action");
    });
  }
});
