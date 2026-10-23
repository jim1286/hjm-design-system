import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { sidebarRecipe } from "@hjmds/design-contracts/components/sidebar";
import { Sidebar, type SidebarLinkRenderProps } from "../src/sidebar.js";
import "../src/styles.css";

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div");
  host.style.width = "480px";
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

const descriptor = {
  accessibilityLabel: "제품 메뉴",
  currentId: "echo",
  groups: [{ id: "main", items: [
    { id: "trail", label: "발자국", destination: { kind: "internal", href: "/ko/trail" } },
    { id: "echo", label: "메아리", destination: { kind: "internal", href: "/ko/echo" } },
    { id: "nest", label: "둥지", destination: { kind: "internal", href: "/ko/nest" }, disabled: true },
    { id: "local", label: "로컬" },
  ] }],
} as const;

it("lets a client router draw enabled item links and navigate without a document load", async () => {
  const navigations: string[] = [];
  const onNavigate = vi.fn();
  const adapted: SidebarLinkRenderProps[] = [];
  // Stands in for Next.js Link: spreads HJM's props, runs their onClick, then navigates in-app unless prevented.
  const renderLink = (props: SidebarLinkRenderProps) => {
    adapted.push(props);
    return (
      <a
        {...props}
        data-router-link=""
        onClick={(event) => {
          props.onClick?.(event);
          if (event.defaultPrevented) return;
          event.preventDefault();
          navigations.push(props.href);
        }}
      />
    );
  };
  await act(async () => root.render(
    <Sidebar descriptor={descriptor} collapsed onNavigate={onNavigate} renderLink={renderLink} renderIcon={() => "•"} />,
  ));
  expect(adapted.map((props) => props.href)).toEqual(["/ko/trail", "/ko/echo"]);
  const links = [...host.querySelectorAll<HTMLAnchorElement>(".hjm-sidebar__item")];
  expect(links.map((link) => link.hasAttribute("data-router-link"))).toEqual([true, true, false, false]);
  // HJM keeps current-page and the collapsed accessible name on the adapter's anchor.
  expect(links[1]?.getAttribute("aria-current")).toBe("page");
  expect(links[0]?.getAttribute("aria-label")).toBe("발자국");

  const click = new MouseEvent("click", { bubbles: true, cancelable: true });
  await act(async () => links[0]?.dispatchEvent(click));
  expect(click.defaultPrevented).toBe(true);
  expect(navigations).toEqual(["/ko/trail"]);
  expect(onNavigate).toHaveBeenCalledWith("trail");

  // A disabled item never reaches the adapter, so no router can navigate it.
  const disabledClick = new MouseEvent("click", { bubbles: true, cancelable: true });
  await act(async () => links[2]?.dispatchEvent(disabledClick));
  expect(disabledClick.defaultPrevented).toBe(true);
  expect(navigations).toEqual(["/ko/trail"]);
  expect(onNavigate).toHaveBeenCalledTimes(1);
});

it("opens at the regular or compact recipe width and keeps the collapsed rail", async () => {
  const render = (props: Partial<Parameters<typeof Sidebar>[0]>) => act(async () => root.render(
    <Sidebar descriptor={descriptor} renderIcon={() => "•"} {...props} />,
  ));
  await render({});
  const nav = host.querySelector<HTMLElement>(".hjm-sidebar")!;
  expect(nav.dataset.size).toBe("regular");
  expect(nav.getBoundingClientRect().width).toBe(sidebarRecipe.sizes.regular);
  await render({ size: "compact" });
  expect(nav.dataset.size).toBe("compact");
  expect(nav.getBoundingClientRect().width).toBe(220);
  await render({ size: "compact", collapsed: true });
  expect(nav.getBoundingClientRect().width).toBe(sidebarRecipe.widths.collapsed);
});
