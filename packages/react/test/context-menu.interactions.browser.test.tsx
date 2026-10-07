import { act } from "react";
// This proof file is listed by test/executed-scenarios.json; the workspace checker validates its cases against that registry.
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { ContextMenu } from "../src/context-menu.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
// The evidence registry points to this focused keyboard proof; the shared scenario fixture omits ContextMenu dismissal.
// componentId: "context-menu"

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
  await page.viewport(1280, 720);
});

const items = [
  { id: "rename", label: "이름 변경", textValue: "이름 변경" },
  { id: "remove", label: "삭제", textValue: "삭제", tone: "danger" as const },
];

it("opens at the pointer, wraps long labels, and keeps the menu inside the viewport", async () => {
  await page.viewport(390, 260);
  const longLabel = "매우긴메뉴항목이름이화면너비보다길어도잘리지않고읽을수있도록표시되어야합니다".repeat(3);
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <ContextMenu
        accessibilityLabel="기록 작업"
        items={[{ id: "rename", label: longLabel, textValue: longLabel }]}
        onAction={() => undefined}
      >
        <p>기록 한 줄</p>
      </ContextMenu>
    </HjmProvider>,
  ));

  const region = document.querySelector<HTMLElement>(".hjm-context-menu-host")!;
  const rect = region.getBoundingClientRect();
  const x = Math.min(rect.right - 2, 380);
  const y = Math.min(rect.bottom - 2, 250);
  // Chromium dispatches the browser's contextmenu event with real viewport coordinates.
  await act(async () => {
    region.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 2 }));
  });

  const menu = document.querySelector<HTMLElement>(".hjm-context-menu")!;
  const menuRect = menu.getBoundingClientRect();
  expect(menu.getAttribute("role")).toBe("menu");
  expect(menu.style.left).not.toBe(`${x}px`);
  expect(menuRect.right).toBeLessThanOrEqual(window.innerWidth);
  expect(menuRect.bottom).toBeLessThanOrEqual(window.innerHeight);
  expect(menu.scrollWidth).toBeLessThanOrEqual(menu.clientWidth);
  expect(menu.textContent).toContain(longLabel);
});

it("opens from the keyboard, tracks the active item, and restores focus after dismissal or action", async () => {
  const actions: string[] = [];
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <ContextMenu accessibilityLabel="기록 메뉴" items={items} onAction={(id) => actions.push(id)}>
        <button type="button">기록 열기</button>
      </ContextMenu>
    </HjmProvider>,
  ));

  const origin = document.querySelector<HTMLButtonElement>(".hjm-context-menu-host button")!;
  origin.focus();
  await act(async () => userEvent.keyboard("{Shift>}{F10}{/Shift}"));
  const menu = document.querySelector<HTMLElement>(".hjm-context-menu")!;
  expect(menu.getAttribute("role")).toBe("menu");
  expect(document.activeElement).toBe(menu);
  const activeId = menu.getAttribute("aria-activedescendant");
  expect(activeId).toBeTruthy();
  expect(document.getElementById(activeId!)?.textContent).toContain("이름 변경");

  await act(async () => userEvent.keyboard("{Escape}"));
  expect(document.querySelector(".hjm-context-menu")).toBeNull();
  expect(document.activeElement).toBe(origin);

  await act(async () => userEvent.keyboard("{Shift>}{F10}{/Shift}"));
  await act(async () => userEvent.keyboard("{ArrowDown}"));
  const secondActiveId = document.querySelector<HTMLElement>(".hjm-context-menu")?.getAttribute("aria-activedescendant");
  expect(document.getElementById(secondActiveId!)?.textContent).toContain("삭제");
  await act(async () => userEvent.keyboard("{Enter}"));
  expect(actions).toEqual(["remove"]);
  expect(document.querySelector(".hjm-context-menu")).toBeNull();
  expect(document.activeElement).toBe(origin);
});

it("keeps the keyboard item after a late mouse enter until the user moves the mouse", async () => {
  await act(async () => root.render(<HjmProvider reducedMotion><ContextMenu accessibilityLabel="기록 메뉴" items={items} onAction={() => undefined}><button type="button">기록 열기</button></ContextMenu></HjmProvider>));
  host.querySelector("button")!.focus();
  await act(async () => userEvent.keyboard("{Shift>}{F10}{/Shift}{ArrowDown}"));
  const menu = document.querySelector<HTMLElement>('.hjm-context-menu')!;
  const first = menu.querySelector<HTMLElement>('[role="menuitem"]')!;
  const activeLabel = () => document.getElementById(menu.getAttribute("aria-activedescendant")!)?.textContent;
  expect(activeLabel()).toContain("삭제");
  // Popup placement can generate mouseover without moving the pointer. Keep
  // the keyboard choice until mouse movement expresses a different intent.
  await act(async () => first.dispatchEvent(new MouseEvent("mouseover", { bubbles: true, relatedTarget: document.body })));
  expect(activeLabel()).toContain("삭제");
  await act(async () => userEvent.hover(first));
  expect(activeLabel()).toContain("이름 변경");
});
