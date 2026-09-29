import { act } from "react";
// This proof file is listed by test/executed-scenarios.json; the workspace checker validates its cases against that registry.
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { page } from "vitest/browser";
import { HjmProvider } from "../src/provider.js";
import { Menu } from "../src/overlays.js";
import "../src/styles.css";

/** The Web Menu has a real DOM focus and keyboard model; Native proves host actions separately. */
export const menuKeyboardCases = [{ componentId: "menu" }] as const;
export const menuLongCopyCases = [{ componentId: "menu" }] as const;

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

async function render(ui: React.ReactNode) {
  await act(async () => root.render(ui));
}
async function flush() {
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 20)); });
}
function key(target: Element, value: string) {
  target.dispatchEvent(new KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true }));
}

it("opens from the trigger, moves among enabled items, typeaheads, dismisses, and restores focus", async () => {
  await render(
    <HjmProvider>
      <Menu
        label="문서 메뉴"
        trigger={<button type="button">문서</button>}
        items={[
          { id: "edit", label: "편집" },
          { id: "locked", label: "잠금", disabled: true },
          { id: "share", label: "공유" },
        ]}
      />
    </HjmProvider>,
  );
  const trigger = host.querySelector<HTMLButtonElement>("button")!;
  await act(async () => key(trigger, "ArrowDown"));
  await flush();
  const items = [...document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')];
  expect(document.activeElement).toBe(items[0]);

  await act(async () => key(items[0]!, "ArrowDown"));
  expect(document.activeElement).toBe(items[2]);
  await act(async () => key(items[2]!, "편"));
  expect(document.activeElement).toBe(items[0]);
  await act(async () => key(items[0]!, "Escape"));
  await flush();
  expect(document.querySelector('[role="menu"]')).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

it("wraps a long description inside the menu without widening the viewport", async () => {
  await page.viewport(320, 700);
  const longCopy = "A very long menu description that explains the account action and must wrap inside a narrow viewport without clipping or widening the menu.";
  await render(
    <HjmProvider>
      <Menu
        defaultOpen
        label="Account actions"
        trigger={<button type="button">Account</button>}
        items={[{ id: "details", label: "Account details", description: longCopy }]}
      />
    </HjmProvider>,
  );
  await flush();
  const menu = document.querySelector<HTMLElement>('[role="menu"]')!;
  const description = [...menu.querySelectorAll<HTMLElement>(".hjm-menu__description")]
    .find((node) => node.textContent === longCopy)!;
  const copy = description.parentElement!;
  expect(description).toBeDefined();
  expect(copy.scrollWidth).toBeLessThanOrEqual(copy.clientWidth + 2);
  expect(menu.getBoundingClientRect().width).toBeLessThanOrEqual(window.innerWidth + 1);
});
