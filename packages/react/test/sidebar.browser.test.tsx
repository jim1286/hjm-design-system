import { act } from "react";
// This proof file is listed by test/executed-scenarios.json; the workspace checker validates its cases against that registry.
import { createRoot, type Root } from "react-dom/client";
import { userEvent } from "vitest/browser";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Sidebar } from "../src/sidebar.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

export const sidebarKeyboardCases = [{ componentId: "sidebar" }] as const;
export const sidebarLongCopyCases = [{ componentId: "sidebar" }] as const;

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

it("keeps sidebar navigation in document-order Tab stops and exposes the collapse toggle", async () => {
  const onNavigate = vi.fn();
  await act(async () => root.render(
    <HjmProvider systemTheme="light">
      <Sidebar
        collapseLabels={{ collapse: "메뉴 접기", expand: "메뉴 펼치기" }}
        onNavigate={onNavigate}
        descriptor={{
          accessibilityLabel: "주요 메뉴",
          currentId: "home",
          groups: [{ id: "main", label: "주요 화면", items: [
            { id: "home", label: "홈", destination: { kind: "internal", href: "/home" } },
            { id: "reports", label: "보고서", destination: { kind: "internal", href: "/reports" } },
            { id: "locked", label: "권한 필요", disabled: true, destination: { kind: "internal", href: "/locked" } },
          ] }],
        }}
      />
    </HjmProvider>,
  ));

  const toggle = host.querySelector<HTMLButtonElement>(".hjm-sidebar__toggle")!;
  const links = [...host.querySelectorAll<HTMLAnchorElement>(".hjm-sidebar__item")];
  await act(async () => userEvent.tab());
  expect(document.activeElement).toBe(toggle);
  await act(async () => userEvent.tab());
  expect(document.activeElement).toBe(links[0]);
  await act(async () => userEvent.tab());
  expect(document.activeElement).toBe(links[1]);
  await act(async () => userEvent.tab());
  expect(document.activeElement).not.toBe(links[2]);

  await act(async () => toggle.focus());
  await act(async () => userEvent.keyboard("{Enter}"));
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  expect(onNavigate).not.toHaveBeenCalled();
  expect(links[0]!.getAttribute("aria-label")).toBe("홈");
});

it("wraps long group and item names inside the fixed-width rail without horizontal overflow", async () => {
  const groupLabel = "관리자설정및권한별분석메뉴매우긴그룹이름".repeat(3);
  const itemLabel = "verylongunbrokennavigationidentifierthatmustwrapwithoutclipping";
  await act(async () => root.render(
    <HjmProvider systemTheme="light">
      <Sidebar descriptor={{
        accessibilityLabel: "주요 메뉴",
        currentId: "long-item",
        groups: [{ id: "long", label: groupLabel, items: [{ id: "long-item", label: itemLabel, destination: { kind: "internal", href: "/long" } }] }],
      }} />
    </HjmProvider>,
  ));

  const sidebar = host.querySelector<HTMLElement>(".hjm-sidebar")!;
  const group = host.querySelector<HTMLElement>(".hjm-sidebar__group-label")!;
  const item = host.querySelector<HTMLAnchorElement>(".hjm-sidebar__item")!;
  const groupText = group.firstChild!;
  const itemText = item.querySelector<HTMLElement>(".hjm-sidebar__label")!.firstChild!;
  expect(group.getBoundingClientRect().right).toBeLessThanOrEqual(sidebar.getBoundingClientRect().right + 1);
  expect(item.getBoundingClientRect().right).toBeLessThanOrEqual(sidebar.getBoundingClientRect().right + 1);
  const groupRange = document.createRange();
  groupRange.selectNodeContents(groupText);
  const itemRange = document.createRange();
  itemRange.selectNodeContents(itemText);
  expect(groupRange.getClientRects().length).toBeGreaterThan(1);
  expect(itemRange.getClientRects().length).toBeGreaterThan(1);
  expect(sidebar.scrollWidth).toBeLessThanOrEqual(sidebar.clientWidth);
  expect(item.getAttribute("aria-label")).toBeNull();
  expect(item.textContent).toContain(itemLabel);
});
