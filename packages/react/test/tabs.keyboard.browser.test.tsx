import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { userEvent } from "vitest/browser";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { Tabs } from "../src/navigation.js";
import { HjmProvider } from "../src/provider.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };
import "../src/styles.css";

export const tabsKeyboardCases = [{ componentId: "tabs" }] as const;

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div");
  host.style.width = "320px";
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

it("keeps manual selection while moving focus, skips disabled tabs, and activates the long label with Enter", async () => {
  expect(executedScenarioRegistry.executions.find(({ proofFile }) => proofFile === "test/tabs.keyboard.browser.test.tsx")?.scenarios.map(({ id }) => id)).toEqual(expect.arrayContaining(["keyboard", "long-copy"]));
  const longLabel = "결제 및 배송에 관한 상세 정보와 주문 이후 변경할 수 있는 내용 전체 보기";
  await act(async () => root.render(
    <HjmProvider systemTheme="light">
      <Tabs label="계정 정보" items={[
        { id: "profile", label: "프로필", panel: <p>프로필 패널</p> },
        { id: "disabled", label: "비공개", panel: <p>비공개 패널</p>, disabled: true },
        { id: "details", label: longLabel, panel: <p>상세 정보 패널</p> },
      ]} />
    </HjmProvider>,
  ));

  const tabs = [...host.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const list = host.querySelector<HTMLElement>('[role="tablist"]')!;
  expect(tabs[2]!.textContent).toBe(longLabel);
  expect(getComputedStyle(list).overflowX).toBe("auto");
  expect(tabs[2]!.scrollWidth).toBeGreaterThan(0);

  await act(async () => userEvent.tab());
  expect(document.activeElement).toBe(tabs[0]);
  await act(async () => userEvent.keyboard("{ArrowRight}"));
  expect(document.activeElement).toBe(tabs[2]);
  expect(tabs[0]!.getAttribute("aria-selected")).toBe("true");
  expect(tabs[2]!.getAttribute("aria-selected")).toBe("false");
  expect(list.scrollLeft).toBeGreaterThan(0);

  await act(async () => userEvent.keyboard("{Enter}"));
  expect(tabs[2]!.getAttribute("aria-selected")).toBe("true");
  expect(host.querySelector('[role="tabpanel"]')?.textContent).toBe("상세 정보 패널");
});

it("uses an instant roving-focus scroll when reduced motion is requested", async () => {
  await act(async () => root.render(
    <HjmProvider reducedMotion systemTheme="light">
      <Tabs label="계정 정보" items={[
        { id: "profile", label: "프로필", panel: <p>프로필 패널</p> },
        { id: "details", label: "상세 정보", panel: <p>상세 정보 패널</p> },
      ]} />
    </HjmProvider>,
  ));
  const tabs = [...host.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const scrollIntoView = vi.spyOn(tabs[1]!, "scrollIntoView");

  await act(async () => userEvent.tab());
  await act(async () => userEvent.keyboard("{ArrowRight}"));

  expect(scrollIntoView).toHaveBeenCalledWith({
    behavior: "instant",
    block: "nearest",
    inline: "nearest",
  });
});
