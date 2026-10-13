import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { userEvent } from "vitest/browser";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { Menubar } from "../src/menubar.js";
import { Dialog } from "../src/overlays.js";
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
  await act(async () => file.focus());
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


it("closes the expanded menu before its containing dialog on Escape", async () => {
  await act(async () => root.render(<HjmProvider reducedMotion><Dialog defaultOpen trigger={<button>부모 열기</button>} title="부모" closeLabel="닫기"><Menubar descriptor={{ accessibilityLabel: "메뉴", menus }} onAction={() => {}} /></Dialog></HjmProvider>));
  await act(async () => document.querySelector<HTMLButtonElement>(".hjm-menubar__label")!.focus());
  await act(async () => userEvent.keyboard("{ArrowDown}{Escape}"));
  expect(document.querySelector('[role="menu"]')).toBeNull();
  expect(document.querySelector('.hjm-dialog')).not.toBeNull();
});

it("recovers focus and closes a removed menu while keeping the next menu usable", async () => {
  const action = vi.fn();
  const view = (removed: boolean) => <HjmProvider><Menubar descriptor={{ accessibilityLabel: "메뉴", menus: removed ? menus.filter(menu => menu.id !== "file") : menus }} onAction={action} /></HjmProvider>;
  await act(async () => root.render(view(false)));
  await act(async () => host.querySelector<HTMLButtonElement>(".hjm-menubar__label")!.focus());
  await act(async () => userEvent.keyboard("{ArrowDown}"));
  await act(async () => root.render(view(true)));
  const remaining = host.querySelector<HTMLButtonElement>('.hjm-menubar__label:not(:disabled)')!;
  expect(document.activeElement).toBe(remaining);
  expect(remaining.tabIndex).toBe(0);
  expect(document.querySelector('[role="menu"]')).toBeNull();
  await act(async () => userEvent.keyboard("{ArrowDown}{Enter}"));
  expect(action).toHaveBeenCalledExactlyOnceWith("zoom", "view");
});

it("keeps an enabled active item when the open menu items shrink", async () => {
  const action = vi.fn();
  const view = (shrunk: boolean) => <HjmProvider><Menubar descriptor={{ accessibilityLabel: "메뉴", menus: [{ ...menus[0], items: shrunk ? [menus[0].items[0]] : menus[0].items }] }} onAction={action} /></HjmProvider>;
  await act(async () => root.render(view(false)));
  await act(async () => host.querySelector<HTMLButtonElement>(".hjm-menubar__label")!.focus());
  await act(async () => userEvent.keyboard("{ArrowDown}{ArrowDown}"));
  await act(async () => root.render(view(true)));
  expect(document.querySelector('[role="menu"] [data-active]')?.textContent).toContain("새 문서");
  await act(async () => userEvent.keyboard("{Enter}"));
  expect(action).toHaveBeenCalledExactlyOnceWith("new", "file");
});


it("keeps focus outside while replacing a previously focused menu", async () => {
  const view = (removed: boolean) => <HjmProvider><button data-outside>외부</button><Menubar descriptor={{ accessibilityLabel: "메뉴", menus: removed ? menus.filter(menu => menu.id !== "file") : menus }} onAction={() => {}} /></HjmProvider>;
  await act(async () => root.render(view(false)));
  await act(async () => host.querySelector<HTMLButtonElement>(".hjm-menubar__label")!.focus());
  const outside = host.querySelector<HTMLButtonElement>("[data-outside]")!;
  await act(async () => outside.focus());
  await act(async () => root.render(view(true)));
  expect(document.activeElement).toBe(outside);
  expect(host.querySelector('.hjm-menubar__label:not(:disabled)')?.getAttribute("tabindex")).toBe("0");
});

it("recovers to the next enabled label when the open menu becomes disabled", async () => {
  const view = (disabled: boolean) => <HjmProvider><Menubar descriptor={{ accessibilityLabel: "메뉴", menus: menus.map(menu => menu.id === "file" ? { ...menu, disabled } : menu) }} onAction={() => {}} /></HjmProvider>;
  await act(async () => root.render(view(false)));
  await act(async () => host.querySelector<HTMLButtonElement>(".hjm-menubar__label")!.focus());
  await act(async () => userEvent.keyboard("{ArrowDown}"));
  await act(async () => root.render(view(true)));
  expect(document.activeElement?.textContent).toBe("보기");
  expect(document.querySelector('[role="menu"]')).toBeNull();
});

it("mirrors horizontal arrow navigation in RTL while Home and End keep logical endpoints", async () => {
  const rtlMenus = menus.map(menu => ({ ...menu, disabled: false }));
  await act(async () => root.render(<HjmProvider direction="rtl"><Menubar descriptor={{ accessibilityLabel: "RTL 메뉴", menus: rtlMenus }} onAction={() => {}} /></HjmProvider>));
  const labels = [...host.querySelectorAll<HTMLButtonElement>(".hjm-menubar__label")];
  await act(async () => labels[0]!.focus());
  await act(async () => userEvent.keyboard("{ArrowDown}{ArrowLeft}"));
  expect(document.activeElement).toBe(labels[1]);
  expect(labels[1]!.getAttribute("aria-expanded")).toBe("true");
  await act(async () => userEvent.keyboard("{ArrowRight}"));
  expect(document.activeElement).toBe(labels[0]);
  await act(async () => userEvent.keyboard("{End}"));
  expect(document.activeElement).toBe(labels[2]);
  await act(async () => userEvent.keyboard("{Home}"));
  expect(document.activeElement).toBe(labels[0]);
});
