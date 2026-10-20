import { act, createRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { userEvent } from "vitest/browser";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { defineHjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import { HjmProvider } from "../src/provider.js";
import { Button, ButtonLink, type ButtonLinkProps } from "../src/actions.js";
import "../src/styles.css";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root, host: HTMLDivElement;
const profile = defineHjmDesignProfile({ controls: { button: { appearance: "raised", shape: "pill" } } });
beforeEach(() => { host = document.createElement("div"); host.style.width = "360px"; document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
async function render(props: Partial<ButtonLinkProps> = {}) {
  await act(async () => root.render(<HjmProvider minimumVisualTarget designProfile={profile}><ButtonLink href="#destination" {...props}>Read guide</ButtonLink><Button>Read guide</Button></HjmProvider>));
  return host.querySelector("a")!;
}
it("keeps server-rendered anchor destination, target and public copy", () => {
  const html = renderToStaticMarkup(<ButtonLink href="/login?from=create" target="_blank" rel="noopener">Start creating</ButtonLink>);
  expect(html).toContain('href="/login?from=create"'); expect(html).toContain('target="_blank"');
  expect(html).toContain('rel="noopener"'); expect(html).toContain("Start creating"); expect(html).not.toContain("<button");
});
it("shares actual dimensions and raised profile with Button without an underline", async () => {
  const link = await render(); const button = host.querySelector("button")!;
  expect(link.dataset.shape).toBe("pill"); expect(link.dataset.appearance).toBe("raised");
  expect(link.getBoundingClientRect().height).toBeCloseTo(button.getBoundingClientRect().height);
  expect(link.getBoundingClientRect().width).toBeCloseTo(button.getBoundingClientRect().width);
  expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  expect(getComputedStyle(link).textDecorationLine).toBe("none");
  link.focus(); expect(document.activeElement).toBe(link);
  expect(link.getAttribute("href")).toBe("#destination"); expect(link.getAttribute("role")).toBeNull();
});
it("removes every navigable destination while disabled and restores the same anchor", async () => {
  const click = vi.fn(), aux = vi.fn();
  const link = await render({ disabled: true, onClick: click, onAuxClick: aux });
  expect(link.hasAttribute("href")).toBe(false); expect(link.tabIndex).toBe(-1); expect(link.getAttribute("role")).toBe("link");
  expect(link.getAttribute("aria-disabled")).toBe("true");
  const primary = new MouseEvent("click", { bubbles: true, cancelable: true });
  const middle = new MouseEvent("auxclick", { bubbles: true, cancelable: true, button: 1 });
  await act(async () => { link.dispatchEvent(primary); link.dispatchEvent(middle); });
  expect(primary.defaultPrevented).toBe(true); expect(middle.defaultPrevented).toBe(true);
  expect(click).not.toHaveBeenCalled(); expect(aux).not.toHaveBeenCalled();
  const enabled = await render({ onClick: event => { event.preventDefault(); click(); } });
  expect(enabled).toBe(link); expect(enabled.tabIndex).toBe(0); expect(enabled.getAttribute("href")).toBe("#destination");
  await act(async () => enabled.click()); expect(click).toHaveBeenCalledOnce();
  await render({ "aria-disabled": "true" }); expect(link.hasAttribute("href")).toBe(false);
});

it("activates by Enter as a link and preserves modified clicks for the browser", async () => {
  const click = vi.fn((event: React.MouseEvent<HTMLAnchorElement>) => event.preventDefault());
  const link = await render({ onClick: click }); link.focus();
  await act(async () => userEvent.keyboard("{Enter}")); expect(click).toHaveBeenCalledOnce();
  const modified = new MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true });
  await render(); await act(async () => link.dispatchEvent(modified));
  expect(modified.defaultPrevented).toBe(false);
});

it("passes the real anchor ref and disabled navigation guards through a framework adapter", async () => {
  const ref = createRef<HTMLAnchorElement>();
  const click = vi.fn();
  const adapter: NonNullable<ButtonLinkProps["renderAnchor"]> = props => <a {...props} data-framework-adapter="true" />;
  async function draw(disabled: boolean) {
    await act(async () => root.render(<HjmProvider minimumVisualTarget designProfile={profile}>
      <ButtonLink ref={ref} href="/trail?place=one" disabled={disabled} target="_blank" rel="noopener" onClick={click} renderAnchor={adapter}>Show on map</ButtonLink>
    </HjmProvider>));
  }
  await draw(false);
  const link = host.querySelector("a")!;
  expect(ref.current).toBe(link);
  expect(link.dataset.frameworkAdapter).toBe("true");
  expect(link.getAttribute("href")).toBe("/trail?place=one");
  expect(link.getAttribute("target")).toBe("_blank");
  expect(link.getAttribute("rel")).toBe("noopener");
  await draw(true);
  expect(link.hasAttribute("href")).toBe(false);
  expect(link.tabIndex).toBe(-1);
  const event = new MouseEvent("click", { bubbles: true, cancelable: true });
  await act(async () => link.dispatchEvent(event));
  expect(event.defaultPrevented).toBe(true);
  expect(click).not.toHaveBeenCalled();
});
