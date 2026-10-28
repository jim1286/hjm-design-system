import { act, createRef, type ComponentPropsWithRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { IconButton, IconButtonLink, type IconButtonLinkProps } from "../src/actions.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root, host: HTMLDivElement;
beforeEach(() => { host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

// IconButtonLinkProps excludes the forwarded ref; the adapter test passes one, so type the helper from the component.
async function render(props: Partial<ComponentPropsWithRef<typeof IconButtonLink>> = {}) {
  await act(async () => root.render(<HjmProvider systemTheme="light" reducedMotion>
    <IconButtonLink href="/ko/settings" label="설정" shape="circle" {...props}>⚙</IconButtonLink>
    <IconButton label="설정" shape="circle" selected>⚙</IconButton>
  </HjmProvider>));
  return host.querySelector("a")!;
}

it("server-renders an icon-only anchor named by its label", () => {
  const html = renderToStaticMarkup(<IconButtonLink href="/ko/settings" label="설정" current>⚙</IconButtonLink>);
  expect(html).toContain('href="/ko/settings"');
  expect(html).toContain('aria-label="설정"');
  expect(html).toContain('aria-current="page"');
  expect(html).not.toContain("<button");
});

it("preserves the IconButton background while marking the current page", async () => {
  const link = await render();
  const button = host.querySelector("button")!;
  expect(link.getBoundingClientRect().width).toBe(44);
  expect(link.getBoundingClientRect().height).toBe(44);
  expect(getComputedStyle(link).borderRadius).toBe(getComputedStyle(button).borderRadius);
  expect(getComputedStyle(link).textDecorationLine).toBe("none");
  const idleBackground = getComputedStyle(link).backgroundColor;
  expect(link.hasAttribute("aria-current")).toBe(false);
  await render({ current: true });
  expect(link.getAttribute("aria-current")).toBe("page");
  expect(getComputedStyle(link).backgroundColor).toBe(getComputedStyle(button).backgroundColor);
  expect(getComputedStyle(link).backgroundColor).toBe(idleBackground);
});

it("passes the anchor ref, name and current state through a router adapter and guards disabled navigation", async () => {
  const ref = createRef<HTMLAnchorElement>();
  const renderAnchor = vi.fn((props: Parameters<NonNullable<IconButtonLinkProps["renderAnchor"]>>[0]) => <a {...props} data-router="" />);
  const link = await render({ ref, current: true, renderAnchor });
  expect(ref.current).toBe(link);
  expect(link.dataset.router).toBe("");
  expect(link.getAttribute("aria-label")).toBe("설정");
  expect(link.getAttribute("aria-current")).toBe("page");
  const click = vi.fn();
  await render({ ref, disabled: true, renderAnchor, onClick: click });
  expect(renderAnchor.mock.lastCall?.[0].href).toBeUndefined();
  expect(link.tabIndex).toBe(-1);
  const event = new MouseEvent("click", { bubbles: true, cancelable: true });
  await act(async () => link.dispatchEvent(event));
  expect(event.defaultPrevented).toBe(true);
  expect(click).not.toHaveBeenCalled();
});
