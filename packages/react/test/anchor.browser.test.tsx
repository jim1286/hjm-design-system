import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
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
