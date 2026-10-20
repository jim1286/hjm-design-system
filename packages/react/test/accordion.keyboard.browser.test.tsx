import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { userEvent } from "vitest/browser";
import { afterEach, beforeEach, expect, it } from "vitest";

import { Accordion } from "../src/advanced-display.js";
import { HjmProvider } from "../src/provider.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };
import "../src/styles.css";

export const accordionKeyboardCases = [{ componentId: "accordion" }] as const;

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

it("expands and collapses Accordion panels with browser Tab and Enter", async () => {
  expect(executedScenarioRegistry.executions.find(({ proofFile }) => proofFile === "test/accordion.keyboard.browser.test.tsx")?.scenarios.map(({ id }) => id)).toContain("keyboard");
  await act(async () => root.render(
    <HjmProvider systemTheme="light">
      <Accordion items={[
        { id: "shipping", title: "배송 안내", panel: <p>주문 후 이틀 안에 도착합니다.</p> },
        { id: "returns", title: "반품 안내", panel: <p>수령 후 7일 이내 신청할 수 있습니다.</p> },
      ]} />
    </HjmProvider>,
  ));

  const triggers = host.querySelectorAll<HTMLButtonElement>(".hjm-accordion__trigger");
  const shippingPanel = host.querySelector<HTMLElement>('[role="region"][aria-labelledby="' + triggers[0]!.id + '"]')!;
  expect(triggers[0]!.getAttribute("aria-expanded")).toBe("false");
  expect(shippingPanel.hidden).toBe(true);

  await act(async () => userEvent.tab());
  expect(document.activeElement).toBe(triggers[0]);
  await act(async () => userEvent.keyboard("{Enter}"));
  expect(triggers[0]!.getAttribute("aria-expanded")).toBe("true");
  expect(shippingPanel.hidden).toBe(false);
  expect(shippingPanel.textContent).toContain("주문 후 이틀 안에 도착합니다.");

  await act(async () => userEvent.keyboard("{Enter}"));
  expect(triggers[0]!.getAttribute("aria-expanded")).toBe("false");
  expect(shippingPanel.hidden).toBe(true);
});

it("keeps a domain indicator decorative while naming and toggling its common trigger", async () => {
  await act(async () => root.render(<HjmProvider><Accordion items={[
    { id: "novelty", title: "새로움", accessibilityLabel: "새로움 평가 기준, 2/5", panel: <p>기준</p> },
    { id: "fun", title: "재미", accessibilityLabel: "재미 평가 기준, 4/5", panel: <p>예시</p> },
  ]} renderIndicator={({ value, expanded }) => <span data-indicator={value}>{expanded ? "open" : "closed"}</span>} /></HjmProvider>));
  const triggers = host.querySelectorAll<HTMLButtonElement>(".hjm-accordion__trigger");
  expect(triggers[0]!.getAttribute("aria-label")).toBe("새로움 평가 기준, 2/5");
  expect(host.querySelector('[data-indicator="novelty"]')!.parentElement!.getAttribute("aria-hidden")).toBe("true");
  await act(async () => triggers[0]!.click());
  expect(host.querySelector('[data-indicator="novelty"]')!.textContent).toBe("open");
  await act(async () => triggers[1]!.click());
  expect(triggers[0]!.getAttribute("aria-expanded")).toBe("false");
  expect(triggers[1]!.getAttribute("aria-expanded")).toBe("true");
  await act(async () => triggers[0]!.focus());
  await act(async () => userEvent.keyboard("{ArrowDown}"));
  expect(document.activeElement).toBe(triggers[1]);
});
