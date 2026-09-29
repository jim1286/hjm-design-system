import { act, useState } from "react";
// This proof file is listed by test/executed-scenarios.json; the workspace checker validates its cases against that registry.
import { createRoot, type Root } from "react-dom/client";
import { userEvent } from "vitest/browser";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { Anchor } from "../src/anchor.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
let host: HTMLDivElement; let root: Root; let originalUrl: string;
const items = [{ id: "anchor-one", label: "첫 부분" }, { id: "anchor-two", label: "두 번째" }, { id: "anchor-three", label: "마지막 부분" }];
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; originalUrl = location.href; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); history.replaceState(history.state, "", originalUrl); vi.restoreAllMocks(); });
const settle = async () => act(async () => { await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))); });
function Fixture({ historyMode = "none" as "none" | "push", missing = false }) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return <HjmProvider reducedMotion><Anchor label="이 문서의 목차" items={items} container={container} offset={24} historyMode={historyMode} />
    <div data-scroll ref={setContainer} style={{ height: 180, overflowY: "auto", border: "1px solid", position: "relative" }}>
      <section id="anchor-one" style={{ height: 220 }}>첫 부분</section>
      <section id="anchor-two" style={{ height: 220 }}>두 번째</section>
      {missing ? null : <section id="anchor-three" style={{ height: 100 }}>마지막 부분</section>}
    </div></HjmProvider>;
}
it("tracks custom-container scroll and recognizes a short final section at the bottom", async () => {
  await act(async () => root.render(<Fixture />)); await settle();
  const container = host.querySelector<HTMLElement>("[data-scroll]")!;
  expect(host.querySelector('[aria-current="location"]')?.getAttribute("href")).toBe("#anchor-one");
  await act(async () => { container.scrollTop = 220; container.dispatchEvent(new Event("scroll")); }); await settle();
  expect(host.querySelector('[aria-current="location"]')?.getAttribute("href")).toBe("#anchor-two");
  await act(async () => { container.scrollTop = container.scrollHeight; container.dispatchEvent(new Event("scroll")); }); await settle();
  expect(host.querySelectorAll('[aria-current="location"]')).toHaveLength(1);
  expect(host.querySelector('[aria-current="location"]')?.getAttribute("href")).toBe("#anchor-three");
});
it("jumps with the offset in reduced motion and restores temporary focusability on blur", async () => {
  await act(async () => root.render(<Fixture />)); const container = host.querySelector<HTMLElement>("[data-scroll]")!;
  const scroll = vi.spyOn(container, "scrollTo"); const target = document.getElementById("anchor-two")!;
  const link = host.querySelector<HTMLAnchorElement>('a[href="#anchor-two"]')!;
  await act(async () => link.click()); await settle();
  expect(scroll).toHaveBeenCalledWith({ top: 196, behavior: "instant" }); expect(document.activeElement).toBe(target);
  expect(target.getAttribute("tabindex")).toBe("-1");
  link.focus(); expect(target.hasAttribute("tabindex")).toBe(false);
});
it("restores a registered fragment on history traversal without leaving the custom container stale", async () => {
  await act(async () => root.render(<Fixture historyMode="push" />));
  await act(async () => host.querySelector<HTMLAnchorElement>('a[href="#anchor-three"]')!.click()); await settle();
  expect(location.hash).toBe("#anchor-three");
  await act(async () => { history.replaceState(history.state, "", "#anchor-one"); window.dispatchEvent(new PopStateEvent("popstate")); }); await settle();
  expect(host.querySelector<HTMLElement>("[data-scroll]")!.scrollTop).toBe(0);
  expect(host.querySelector('[aria-current="location"]')?.getAttribute("href")).toBe("#anchor-one");
});
it("reconciles missing and newly inserted targets", async () => {
  await act(async () => root.render(<Fixture missing />)); await settle();
  const container = host.querySelector<HTMLElement>("[data-scroll]")!;
  await act(async () => { container.scrollTop = container.scrollHeight; container.dispatchEvent(new Event("scroll")); }); await settle();
  expect(host.querySelector('[aria-current="location"]')?.getAttribute("href")).toBe("#anchor-two");
  await act(async () => root.render(<Fixture />)); await settle();
  await act(async () => { container.scrollTop = container.scrollHeight; container.dispatchEvent(new Event("scroll")); }); await settle();
  expect(host.querySelector('[aria-current="location"]')?.getAttribute("href")).toBe("#anchor-three");
});

export const anchorLongCopyCases = [{ componentId: "anchor" }] as const;
export const anchorKeyboardCases = [{ componentId: "anchor" }] as const;

it("wraps long link labels inside a narrow host without horizontal overflow", async () => {
  const label = "A deliberately long section label that must remain readable in a narrow table of contents";
  await act(async () => root.render(
    <div style={{ width: 144 }}>
      <Anchor label="Document contents" items={[{ id: "anchor-long-copy-target", label }]} />
      <section id="anchor-long-copy-target">Section</section>
    </div>,
  ));

  const link = host.querySelector<HTMLAnchorElement>(".hjm-anchor__link")!;
  expect(link.textContent).toBe(label);
  expect(link.scrollWidth).toBeLessThanOrEqual(link.clientWidth);
  expect(link.clientHeight).toBeGreaterThan(24);
});

it("uses native Tab and Enter activation, moves focus, and updates the document scroll root", async () => {
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <Anchor label="이 문서의 목차" items={items} offset={24} historyMode="push" />
      <section id="anchor-one">첫 부분</section>
      <section id="anchor-two">두 번째</section>
      <section id="anchor-three">마지막 부분</section>
    </HjmProvider>,
  ));

  const links = host.querySelectorAll<HTMLAnchorElement>(".hjm-anchor__link");
  const target = host.querySelector<HTMLElement>("#anchor-two")!;
  const scroll = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
    x: 0, y: 220, top: 220, left: 0, right: 400, bottom: 240, width: 400, height: 20,
    toJSON: () => ({}),
  });

  await act(async () => userEvent.tab());
  expect(document.activeElement).toBe(links[0]);
  await act(async () => userEvent.tab());
  expect(document.activeElement).toBe(links[1]);
  await act(async () => userEvent.keyboard("{Enter}"));

  expect(scroll).toHaveBeenCalledWith({ top: 196, behavior: "instant" });
  expect(document.activeElement).toBe(target);
  expect(location.hash).toBe("#anchor-two");
});
