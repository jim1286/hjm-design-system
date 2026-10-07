import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { userEvent } from "vitest/browser";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { Menubar } from "../src/menubar.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement;
let root: Root;

export const menubarKeyboardCases = [{ componentId: "menubar" }] as const;

const menus = [
  {
    id: "file",
    label: "파일",
    items: [
      { id: "new", label: "새 문서", textValue: "새 문서" },
      { id: "save", label: "저장", textValue: "저장", disabled: true },
      { id: "quit", label: "종료", textValue: "종료" },
    ],
  },
  {
    id: "edit",
    label: "편집",
    disabled: true,
    items: [{ id: "copy", label: "복사", textValue: "복사" }],
  },
  {
    id: "view",
    label: "보기",
    items: [{ id: "zoom", label: "확대", textValue: "확대" }],
  },
] as const;

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

it("supports browser keyboard focus, menu navigation, disabled state, and action activation", async () => {
  expect(executedScenarioRegistry.executions.find(({ proofFile }) => proofFile === "test/menubar.keyboard.browser.test.tsx")?.scenarios.map(({ id }) => id)).toContain("keyboard");
  const onAction = vi.fn();
  await act(async () => root.render(
    <HjmProvider>
      <Menubar
        descriptor={{ accessibilityLabel: "주 메뉴", menus }}
        onAction={onAction}
      />
    </HjmProvider>,
  ));

  const menubar = host.querySelector<HTMLElement>('[role="menubar"]')!;
  const file = host.querySelector<HTMLButtonElement>('[role="menubar"] button[aria-haspopup="menu"]:nth-of-type(1)')!;
  const view = [...host.querySelectorAll<HTMLButtonElement>('[role="menubar"] button[aria-haspopup="menu"]')][2]!;

  expect(menubar.getAttribute("aria-label")).toBe("주 메뉴");
  await act(async () => userEvent.tab());
  expect(document.activeElement).toBe(file);
  expect(file.tabIndex).toBe(0);
  expect(view.tabIndex).toBe(-1);

  // Arrow navigation skips the disabled menu and wraps in the enabled set.
  await act(async () => userEvent.keyboard("{ArrowRight}"));
  expect(document.activeElement).toBe(view);
  expect(view.tabIndex).toBe(0);
  await act(async () => userEvent.keyboard("{ArrowRight}"));
  expect(document.activeElement).toBe(file);

  // ArrowDown opens the focused menu; aria-expanded and the named menu expose its state.
  await act(async () => userEvent.keyboard("{ArrowDown}"));
  expect(file.getAttribute("aria-expanded")).toBe("true");
  const panel = document.querySelector<HTMLElement>('[role="menu"]')!;
  expect(panel.getAttribute("aria-label")).toBe("파일");
  expect(panel.querySelector('[role="menuitem"][aria-disabled="true"]')?.textContent).toContain("저장");

  // The disabled entry is skipped by arrow navigation; the next keyboard activation runs 종료.
  await act(async () => userEvent.keyboard("{ArrowDown}"));
  expect(panel.querySelector('[data-active=""]')?.textContent).toContain("종료");
  await act(async () => userEvent.keyboard("{Enter}"));
  expect(onAction).toHaveBeenCalledOnce();
  expect(onAction).toHaveBeenCalledWith("quit", "file");
  expect(file.getAttribute("aria-expanded")).toBe("false");
  expect(document.querySelector('[role="menu"]')).toBeNull();
  expect(document.activeElement).toBe(file);
});

it("keeps the keyboard item when layout causes a late mouse enter, then follows actual mouse movement", async () => {
  await act(async () => root.render(<HjmProvider><Menubar descriptor={{ accessibilityLabel: "주 메뉴", menus }} onAction={() => undefined} /></HjmProvider>));
  const file = host.querySelector<HTMLButtonElement>('[aria-haspopup="menu"]')!;
  file.focus();
  await act(async () => userEvent.keyboard("{ArrowDown}{ArrowDown}"));
  const panel = document.querySelector<HTMLElement>('[role="menu"]')!;
  const first = panel.querySelector<HTMLElement>('[role="menuitem"]')!;
  expect(panel.querySelector('[data-active=""]')?.textContent).toContain("종료");
  // Browsers can enter a newly positioned popup under a stationary cursor;
  // that boundary event is not a user's request to undo keyboard navigation.
  await act(async () => first.dispatchEvent(new MouseEvent("mouseover", { bubbles: true, relatedTarget: document.body })));
  expect(panel.querySelector('[data-active=""]')?.textContent).toContain("종료");
  await act(async () => userEvent.hover(first));
  expect(panel.querySelector('[data-active=""]')?.textContent).toContain("새 문서");
});
