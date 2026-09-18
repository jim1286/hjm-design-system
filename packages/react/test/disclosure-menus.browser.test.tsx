import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { page } from "vitest/browser";
import { Collapsible } from "../src/collapsible.js";
import { ContextMenu } from "../src/context-menu.js";
import { Menubar } from "../src/menubar.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });

it("removes collapsed content from the tree instead of only hiding it", async () => {
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <Collapsible trigger="배송 정보"><p id="body">우편번호를 입력해 주세요</p></Collapsible>
    </HjmProvider>,
  ));
  const trigger = document.querySelector<HTMLButtonElement>(".hjm-collapsible__trigger")!;
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(document.querySelector("#body")).toBeNull();
  await act(async () => trigger.click());
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  const region = document.querySelector<HTMLElement>(".hjm-collapsible__content")!;
  expect(region.getAttribute("role")).toBe("region");
  expect(trigger.getAttribute("aria-controls")).toBe(region.id);
});

const contextItems = [
  { id: "edit", label: "수정", textValue: "수정" },
  { id: "duplicate", label: "복제", textValue: "복제", disabled: true },
  { id: "delete", label: "삭제", textValue: "삭제", tone: "danger" as const },
];

it("opens a context menu from the keyboard and anchors it to the focused box", async () => {
  const actions: string[] = [];
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <ContextMenu accessibilityLabel="기록 메뉴" items={contextItems} onAction={(id) => actions.push(id)}>
        <p>기록 한 줄</p>
      </ContextMenu>
    </HjmProvider>,
  ));
  const region = document.querySelector<HTMLElement>(".hjm-context-menu-host")!;
  region.focus();
  const rect = region.getBoundingClientRect();
  // Shift+F10 is the keyboard path; without it the feature needs a mouse.
  await act(async () => { region.dispatchEvent(new KeyboardEvent("keydown", { key: "F10", shiftKey: true, bubbles: true })); });
  const menu = document.querySelector<HTMLElement>(".hjm-context-menu")!;
  expect(menu.getAttribute("role")).toBe("menu");
  expect(menu.style.insetInlineStart).toBe(`${rect.left}px`);

  // Arrow navigation skips the disabled item; the second stop is 삭제, not 복제.
  await act(async () => { document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })); });
  await act(async () => { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })); });
  expect(actions).toEqual(["delete"]);
  expect(document.querySelector(".hjm-context-menu")).toBeNull();
  expect(document.activeElement).toBe(region);
});

const menus = [
  { id: "file", label: "파일", items: [{ id: "new", label: "새로 만들기", textValue: "새로 만들기" }] },
  { id: "view", label: "보기", items: [{ id: "zoom", label: "확대", textValue: "확대" }] },
  { id: "help", label: "도움말", disabled: true, items: [{ id: "about", label: "정보", textValue: "정보" }] },
];

it("moves between open menubar menus with the arrow keys and keeps exactly one open", async () => {
  const actions: string[] = [];
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <Menubar
        descriptor={{ accessibilityLabel: "주 메뉴", menus }}
        onAction={(id, menuId) => actions.push(`${menuId}:${id}`)}
      />
    </HjmProvider>,
  ));
  const labels = [...document.querySelectorAll<HTMLButtonElement>(".hjm-menubar__label")];
  // The bar is a single tab stop: exactly one label is tabbable.
  expect(labels.filter((label) => label.tabIndex === 0)).toHaveLength(1);
  await act(async () => labels[0]!.click());
  expect(document.querySelectorAll(".hjm-menubar__panel")).toHaveLength(1);
  await act(async () => { labels[0]!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })); });
  // Still exactly one panel, and it belongs to the neighbour now.
  expect(document.querySelectorAll(".hjm-menubar__panel")).toHaveLength(1);
  expect(labels[1]!.getAttribute("aria-expanded")).toBe("true");
  // The disabled menu is skipped, so the next step wraps back to the first.
  await act(async () => { labels[1]!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })); });
  expect(labels[0]!.getAttribute("aria-expanded")).toBe("true");
  await act(async () => { labels[0]!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })); });
  expect(actions).toEqual(["file:new"]);
  // Activating runs an action and leaves nothing selected, unlike Tabs.
  expect(document.querySelectorAll(".hjm-menubar__panel")).toHaveLength(0);
  expect(labels.filter((label) => label.getAttribute("aria-expanded") === "true")).toHaveLength(0);
});
