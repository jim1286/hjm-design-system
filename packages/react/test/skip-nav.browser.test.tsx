import { act, type ReactNode } from "react";
// This proof file is listed by test/executed-scenarios.json; the workspace checker validates its cases against that registry.
import { createRoot, type Root } from "react-dom/client";
import { page, userEvent } from "vitest/browser";
import { afterEach, beforeEach, expect, it } from "vitest";
import { SkipNav } from "../src/skip-nav.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

export const skipNavLongCopyCases = [{ componentId: "skip-nav" }] as const;
export const skipNavKeyboardCases = [{ componentId: "skip-nav" }] as const;

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

function render(children: ReactNode) {
  return act(async () => root.render(<HjmProvider reducedMotion>{children}</HjmProvider>));
}

it("is the first Tab stop, stays visually hidden until focus, then becomes visible", async () => {
  await render(
    <>
      <SkipNav targetId="main" label="본문 바로가기" />
      <nav><a href="#section">내비게이션 링크</a></nav>
      <main id="main"><a id="section" href="#section">본문 링크</a></main>
    </>,
  );

  const link = host.querySelector<HTMLAnchorElement>(".hjm-skip-nav")!;
  expect(link.getAttribute("href")).toBe("#main");
  expect(link.getBoundingClientRect().bottom).toBeLessThanOrEqual(0);

  await act(async () => userEvent.tab());
  expect(document.activeElement).toBe(link);
  expect(link.getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
  expect(Math.round(link.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
});

it("activates with Enter and moves focus into the main target", async () => {
  await render(
    <>
      <SkipNav targetId="main" label="본문 바로가기" />
      <nav><a href="#section">내비게이션 링크</a></nav>
      <main id="main"><a id="section" href="#section">본문 링크</a></main>
    </>,
  );

  const target = host.querySelector<HTMLElement>("#main")!;
  await act(async () => userEvent.tab());
  await act(async () => userEvent.keyboard("{Enter}"));

  expect(document.activeElement).toBe(target);
  expect(target.getAttribute("tabindex")).toBe("-1");
  expect(location.hash).toBe("#main");
});

it("keeps a long localized label readable without overflowing a narrow viewport", async () => {
  const label = "매우 긴 현지화 건너뛰기 링크 문구입니다 ".repeat(8);
  await page.viewport(320, 720);
  await render(
    <>
      <SkipNav targetId="main" label={label} />
      <main id="main">본문</main>
    </>,
  );

  const link = host.querySelector<HTMLAnchorElement>(".hjm-skip-nav")!;
  await act(async () => link.focus());
  const rect = link.getBoundingClientRect();
  expect(link.textContent).toBe(label);
  expect(rect.left).toBeGreaterThanOrEqual(0);
  expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
  expect(link.scrollWidth).toBeLessThanOrEqual(link.clientWidth);
});
