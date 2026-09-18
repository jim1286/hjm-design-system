import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page } from "vitest/browser";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { Toast } from "../src/toast.js";
import { Notice } from "../src/feedback.js";
import { Button } from "../src/actions.js";
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
  it.each([1, 2])("keeps a short retry label together at text scale %i", async (textScale) => {
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

  it.each(layoutScenarios)("keeps long copy and actions reachable for $id", async (scenario) => {
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
});
