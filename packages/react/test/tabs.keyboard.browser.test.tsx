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

const dynamicItems = ["a", "b", "c"].map(id => ({ id, label: id, panel: <p>{id} panel</p> }));
const key = (value: string) => document.activeElement?.dispatchEvent(new KeyboardEvent("keydown", { key: value, bubbles: true }));

it.each(["remove", "disable"])("restores focus after the focused tab is %s", async (change) => {
  const render = (items = dynamicItems) => root.render(<HjmProvider><Tabs label="Dynamic" items={items} /></HjmProvider>);
  await act(async () => render());
  await act(async () => { host.querySelectorAll<HTMLButtonElement>('[role="tab"]')[0]!.focus(); key("ArrowRight"); });
  expect(document.activeElement?.textContent).toBe("b");
  await act(async () => render(change === "remove" ? dynamicItems.filter(item => item.id !== "b") : dynamicItems.map(item => ({ ...item, disabled: item.id === "b" }))));
  expect(document.activeElement?.getAttribute("role")).toBe("tab");
  expect(document.activeElement?.textContent).toBe("a");
  await act(async () => key("ArrowRight"));
  expect(document.activeElement?.textContent).toBe("c");
});

it("recovers removed selection without stealing external focus", async () => {
  const change = vi.fn();
  const render = (items = dynamicItems) => root.render(<HjmProvider><button>Outside</button><Tabs label="Dynamic" defaultValue="b" items={items} onValueChange={change} /></HjmProvider>);
  await act(async () => render());
  const outside = host.querySelector("button")!;
  outside.focus();
  await act(async () => render(dynamicItems.filter(item => item.id !== "b")));
  expect(document.activeElement).toBe(outside);
  expect(host.querySelector('[aria-selected="true"]')?.textContent).toBe("a");
  expect(change).toHaveBeenCalledExactlyOnceWith("a");
});

it("keeps controlled selection until accepted while RTL arrows and endpoints move focus", async () => {
  const change = vi.fn();
  const render = (value = "a") => root.render(<HjmProvider direction="rtl"><Tabs label="Controlled" value={value} onValueChange={change} items={dynamicItems} /></HjmProvider>);
  await act(async () => render());
  host.querySelector<HTMLButtonElement>('[role="tab"]')!.focus();
  await act(async () => key("ArrowLeft"));
  expect(document.activeElement?.textContent).toBe("b");
  await act(async () => key("Enter"));
  expect(change).toHaveBeenLastCalledWith("b");
  expect(host.querySelector('[aria-selected="true"]')?.textContent).toBe("a");
  await act(async () => render("b"));
  expect(host.querySelector('[aria-selected="true"]')?.textContent).toBe("b");
  await act(async () => key("ArrowRight"));
  expect(document.activeElement?.textContent).toBe("a");
  await act(async () => key("End"));
  expect(document.activeElement?.textContent).toBe("c");
  await act(async () => key("Home"));
  expect(document.activeElement?.textContent).toBe("a");
});

it("paints the filled indicator as a pill behind the selected tab without the list divider", async () => {
  await act(async () => root.render(
    <HjmProvider systemTheme="light">
      <Tabs label="Sent" indicator="filled" appearance="standard" layout="fitted" defaultValue="people"
        items={[{ id: "travelling", label: "Travelling" }, { id: "people", label: "People" }]} />
    </HjmProvider>,
  ));
  const tabs = [...host.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  expect(host.querySelector(".hjm-tabs")!.getAttribute("data-indicator")).toBe("filled");
  expect(getComputedStyle(tabs[1]!).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(getComputedStyle(tabs[0]!).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect(getComputedStyle(tabs[1]!, "::after").display).toBe("none");
  expect(getComputedStyle(host.querySelector(".hjm-tabs__list")!).borderBottomWidth).toBe("0px");
  await act(async () => tabs[0]!.click());
  expect(getComputedStyle(tabs[0]!).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
});

it("moves the filled pill behind the labels when the indicator slides", async () => {
  await act(async () => root.render(
    <HjmProvider systemTheme="light">
      <Tabs label="Sent" indicator="filled" appearance="slide" items={[{ id: "a", label: "A" }, { id: "b", label: "B" }]} />
    </HjmProvider>,
  ));
  const indicator = host.querySelector<HTMLElement>(".hjm-tabs__indicator")!;
  const tab = host.querySelector<HTMLElement>('[role="tab"]')!;
  expect(indicator.getBoundingClientRect().height).toBeCloseTo(tab.getBoundingClientRect().height, 0);
  expect(getComputedStyle(tab).backgroundColor).toBe("rgba(0, 0, 0, 0)");
});
