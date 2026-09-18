import { act, createRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page } from "vitest/browser";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { Button, IconButton, Link } from "../src/actions.js";
import { TopBar } from "../src/top-bar.js";
import { BottomCTA } from "../src/bottom-cta.js";
import { bottomCtaRecipe } from "@hjmds/design-contracts/recipes";
import { List } from "../src/advanced-display.js";
import { ListRow } from "../src/display.js";
import { Switch } from "../src/selection.js";
import "../src/styles.css";

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });

describe("screen chrome layout", () => {
  it.each(["ltr", "rtl"] as const)("aligns indented-list titles and keeps compact switches named in %s", async (direction) => {
    await page.viewport(320, 844);
    const change = vi.fn();
    await act(async () => root.render(<HjmProvider direction={direction} textScale={2}>
      <List label="받을 알림" separator="indented">
        <ListRow title="내 활동" trailing={<Switch label="내 활동 알림" labelVisibility="hidden" onCheckedChange={change} />} />
        <ListRow title="주간 모아보기" trailing={<Switch label="주간 모아보기 알림" labelVisibility="hidden" />} />
      </List>
    </HjmProvider>));
    const titles = [...host.querySelectorAll(".hjm-list-row__title")].map((node) => node.getBoundingClientRect());
    expect(titles[0]!.left).toBe(titles[1]!.left);
    expect(titles[0]!.right).toBe(titles[1]!.right);
    const toggle = host.querySelector<HTMLButtonElement>('[role="switch"]')!;
    expect(toggle.textContent).toBe("내 활동 알림");
    expect(toggle.querySelector(".hjm-visually-hidden")).not.toBeNull();
    expect(toggle.getBoundingClientRect().width).toBeLessThan(80);
    await act(async () => toggle.click());
    expect(change).toHaveBeenCalledWith(true);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
  });
  it.each([
    [320, 1, "ltr", "light"], [390, 1, "rtl", "dark"],
    [320, 2, "ltr", "dark"], [320, 2, "rtl", "light"],
  ] as const)("fits controls at %ipx, text %ix, %s, %s", async (width, textScale, direction, theme) => {
    await page.viewport(width, 844);
    await act(async () => root.render(<HjmProvider textScale={textScale} direction={direction} theme={theme} minimumVisualTarget>
      <TopBar title="알림을 내 방식대로 설정해요" leading={<IconButton label="뒤로">←</IconButton>}
        actions={<Button size="small" tone="ghost">도움말</Button>} />
      <BottomCTA safeAreaBottom={34} description="필요한 소식만 받을 수 있어요. You can change this later."
        primaryAction={{ label: "이 설정으로 계속하기", onClick: () => {} }} secondaryAction={{ label: "나중에", onClick: () => {} }} />
    </HjmProvider>));
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
    for (const button of host.querySelectorAll<HTMLButtonElement>("button")) {
      const bounds = button.getBoundingClientRect();
      expect(bounds.width).toBeGreaterThanOrEqual(44);
      expect(bounds.height).toBeGreaterThanOrEqual(44);
      expect(bounds.left).toBeGreaterThanOrEqual(0);
      expect(bounds.right).toBeLessThanOrEqual(width);
      // Small buttons deliberately expand their hit target with ::after. Check
      // the text itself, not the pseudo-element's larger scroll rectangle.
      const label = button.querySelector<HTMLElement>(".hjm-button__label");
      if (label) {
        expect(label.getBoundingClientRect().left).toBeGreaterThanOrEqual(bounds.left);
        expect(label.getBoundingClientRect().right).toBeLessThanOrEqual(bounds.right);
        expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth);
      }
    }
    const title = host.querySelector<HTMLElement>("h1")!.getBoundingClientRect();
    const actions = host.querySelector<HTMLElement>(".hjm-top-bar__trailing")!.getBoundingClientRect();
    const help = host.querySelector<HTMLElement>(".hjm-top-bar__trailing .hjm-button__label")!;
    expect(help.getBoundingClientRect().height).toBeLessThanOrEqual(parseFloat(getComputedStyle(help).lineHeight));
    if (textScale === 2) expect(title.top).toBeGreaterThanOrEqual(actions.bottom);
    expect(parseFloat(getComputedStyle(host.querySelector(".hjm-bottom-cta")!).paddingBottom)).toBe(34);
    if (textScale === 2) {
      const primary = host.querySelector<HTMLElement>(".hjm-bottom-cta__primary")!.getBoundingClientRect();
      const secondary = host.querySelector<HTMLElement>(".hjm-bottom-cta__secondary")!.getBoundingClientRect();
      expect(secondary.top - primary.bottom).toBe(bottomCtaRecipe.gap);
    }
  });

  it("keeps heading, links, refs and busy action behavior", async () => {
    const topRef = createRef<HTMLDivElement>(); const ctaRef = createRef<HTMLDivElement>();
    const submit = vi.fn(); const title = vi.fn();
    const render = (loading: boolean) => <HjmProvider>
      <TopBar ref={topRef} title="내 공간" onTitleClick={title} headingLevel={2}
        actions={<Link href="#help">도움말 보기</Link>} />
      <BottomCTA ref={ctaRef} primaryAction={{ label: "저장", onClick: submit, loading, loadingLabel: "저장 중" }} />
    </HjmProvider>;
    await act(async () => root.render(render(false)));
    expect(topRef.current).toBe(host.querySelector(".hjm-top-bar"));
    expect(ctaRef.current).toBe(host.querySelector(".hjm-bottom-cta"));
    expect(host.querySelector("h2 button")?.textContent).toBe("내 공간");
    expect(host.querySelector("a")?.getAttribute("href")).toBe("#help");
    const save = ctaRef.current!.querySelector("button")!; const before = save.getBoundingClientRect().width;
    await act(async () => { host.querySelector<HTMLButtonElement>("h2 button")!.click(); save.click(); });
    expect(title).toHaveBeenCalledTimes(1); expect(submit).toHaveBeenCalledTimes(1);
    await act(async () => root.render(render(true)));
    await act(async () => { save.click(); save.focus(); });
    expect(save.getAttribute("aria-label")).toBe("저장 중");
    expect(save.getAttribute("aria-busy")).toBe("true");
    expect(submit).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(save);
    expect(save.getBoundingClientRect().width).toBe(before);
  });

  it("leaves the last content reachable above a sticky footer", async () => {
    await page.viewport(320, 844);
    await act(async () => root.render(<HjmProvider>
      <div data-scroll style={{ height: 260, overflowY: "auto" }}>
        <div style={{ height: 520 }} />
        <Button data-last>본문 마지막 행동</Button>
        <BottomCTA position="sticky" safeAreaBottom={34} primaryAction={{ label: "확인", onClick: () => {} }} />
      </div>
    </HjmProvider>));
    const scroll = host.querySelector<HTMLElement>("[data-scroll]")!;
    scroll.scrollTop = scroll.scrollHeight;
    const last = host.querySelector<HTMLElement>("[data-last]")!.getBoundingClientRect();
    const footer = host.querySelector<HTMLElement>(".hjm-bottom-cta")!.getBoundingClientRect();
    expect(last.bottom).toBeLessThanOrEqual(footer.top);
    expect(last.top).toBeGreaterThanOrEqual(scroll.getBoundingClientRect().top);
    expect(footer.bottom).toBeLessThanOrEqual(scroll.getBoundingClientRect().bottom);
  });
});
