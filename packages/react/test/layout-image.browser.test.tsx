import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Layout } from "../src/layout.js";
import { Image } from "../src/supplemental-display.js";

let container: HTMLDivElement;
let root: Root;

async function render(ui: React.ReactNode) {
  await act(async () => root.render(ui));
}

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

describe("Layout bypass navigation", () => {
  it("preserves location state, moves focus, and scrolls the main landmark", async () => {
    window.history.replaceState({ retained: true }, "", "/?tab=following");
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });

    await render(
      <Layout
        mainId="main-content"
        skipLinkLabel="본문으로 건너뛰기"
        header={<button type="button">메뉴</button>}
      >
        본문
      </Layout>,
    );
    const link = container.querySelector<HTMLAnchorElement>(
      ".hjm-layout__skip-link",
    )!;
    const main = container.querySelector<HTMLElement>("main")!;

    await act(async () => link.click());

    expect(document.activeElement).toBe(main);
    expect(window.location.pathname + window.location.search + window.location.hash)
      .toBe("/?tab=following#main-content");
    expect(window.history.state).toEqual({ retained: true });
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "start" });
  });

  it("honors a product handler that cancels skip navigation", async () => {
    await render(
      <Layout
        mainId="cancelled-main"
        skipLinkLabel="건너뛰기"
        header="헤더"
        skipLinkProps={{ onClick: (event) => event.preventDefault() }}
      >
        본문
      </Layout>,
    );
    const link = container.querySelector<HTMLAnchorElement>("a")!;
    const main = container.querySelector<HTMLElement>("main")!;

    await act(async () => link.click());

    expect(document.activeElement).not.toBe(main);
  });
});

describe("Image load lifecycle", () => {
  it("replaces a failed informative asset while preserving its name", async () => {
    const onError = vi.fn();
    const onLoadStatusChange = vi.fn();
    await render(
      <Image
        src="/missing-chart.png"
        width={800}
        height={400}
        decorative={false}
        accessibilityLabel="등급별 보상 규정 표"
        onError={onError}
        onLoadStatusChange={onLoadStatusChange}
      />,
    );
    const image = container.querySelector<HTMLImageElement>("img")!;

    await act(async () => image.dispatchEvent(new Event("error")));

    const rootElement = container.querySelector<HTMLElement>(".hjm-image")!;
    const fallback = container.querySelector<HTMLElement>(
      ".hjm-image__fallback",
    )!;
    expect(rootElement.dataset.status).toBe("error");
    expect(container.querySelector("img")).toBeNull();
    expect(fallback.getAttribute("role")).toBe("img");
    expect(fallback.getAttribute("aria-label")).toBe("등급별 보상 규정 표");
    expect(fallback.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(onError).toHaveBeenCalledOnce();
    expect(onLoadStatusChange).toHaveBeenLastCalledWith("error");
  });

  it("keeps a decorative fallback hidden and resets when src changes", async () => {
    await render(
      <Image src="/first.png" width={64} height={64} fallback="대체 모양" />,
    );
    const firstImage = container.querySelector<HTMLImageElement>("img")!;
    await act(async () => firstImage.dispatchEvent(new Event("error")));

    const fallback = container.querySelector<HTMLElement>(
      ".hjm-image__fallback",
    )!;
    expect(fallback.getAttribute("aria-hidden")).toBe("true");
    expect(fallback.hasAttribute("role")).toBe(false);

    await render(
      <Image src="/second.png" width={64} height={64} fallback="대체 모양" />,
    );
    expect(container.querySelector("img")?.getAttribute("src")).toBe("/second.png");
    expect(container.querySelector<HTMLElement>(".hjm-image")?.dataset.status)
      .toBe("loading");
  });

  it("uses the same error path through a framework image adapter", async () => {
    await render(
      <Image
        src="/adapter.png"
        width={320}
        height={180}
        decorative={false}
        accessibilityLabel="어댑터 이미지"
        renderImage={(adapterProps) => {
          const { ref, ...imageProps } = adapterProps;
          return <img {...imageProps} ref={ref} data-adapter="next" />;
        }}
      />,
    );
    const adapter = container.querySelector<HTMLImageElement>(
      '[data-adapter="next"]',
    )!;
    await act(async () => adapter.dispatchEvent(new Event("error")));

    expect(container.querySelector('[data-adapter="next"]')).toBeNull();
    expect(container.querySelector('[role="img"]')?.getAttribute("aria-label"))
      .toBe("어댑터 이미지");
  });
});
