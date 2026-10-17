import { act, createRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page } from "vitest/browser";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { Button, IconButton, Link } from "../src/actions.js";
import { TopBar } from "../src/top-bar.js";
import { BottomCTA } from "../src/bottom-cta.js";
import { ScreenLayout } from "../src/screens.js";
import { bottomCtaRecipe } from "@hjmds/design-contracts/recipes";
import { screenPatternRecipe } from "@hjmds/design-contracts/screen-patterns";
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
  // Historical maximum-text regression is excluded by the 2026-10-07 user scope.
  it.skip("restores the compact title after a live text-scale round trip", async () => {
    await page.viewport(390, 844);
    const titleAction = vi.fn();
    const renderChrome = (textScale: number) => (
      <HjmProvider textScale={textScale} theme="dark" minimumVisualTarget>
        <TopBar title="QA1005 수신계정" onTitleClick={titleAction}
          leading={<IconButton label="뒤로">←</IconButton>}
          actions={<Button tone="ghost">차단</Button>} />
      </HjmProvider>
    );
    await act(async () => root.render(renderChrome(1)));
    const title = host.querySelector<HTMLButtonElement>("h1 button")!;
    const before = title.getBoundingClientRect();
    await act(async () => root.render(renderChrome(2)));
    expect(host.querySelector(".hjm-top-bar")?.getAttribute("data-large-text")).toBe("true");
    await act(async () => root.render(renderChrome(1)));
    const after = title.getBoundingClientRect();
    expect(host.querySelector("h1 button")).toBe(title);
    expect(after.width).toBeCloseTo(before.width, 1);
    expect(after.left).toBeCloseTo(before.left, 1);
    expect(after.height).toBeCloseTo(before.height, 1);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(390);
    await act(async () => title.click());
    expect(titleAction).toHaveBeenCalledOnce();
  });
  it.each(["ltr", "rtl"] as const)("aligns indented-list titles and keeps compact switches named in %s", async (direction) => {
    await page.viewport(320, 844);
    const change = vi.fn();
    // Rows bleed their surface into the host inset (listRowRecipe.surfaceBleed), so they are rendered in a real screen
    // body: the titles sit on the 16 gutter and the switches end on it (2026-10-17 alignment decision).
    await act(async () => root.render(<HjmProvider direction={direction} textScale={1}>
      <ScreenLayout title="알림 설정">
        <List label="받을 알림" separator="indented">
          <ListRow title="내 활동" trailing={<Switch label="내 활동 알림" labelVisibility="hidden" onCheckedChange={change} />} />
          <ListRow title="주간 모아보기" trailing={<Switch label="주간 모아보기 알림" labelVisibility="hidden" />} />
        </List>
      </ScreenLayout>
    </HjmProvider>));
    const titles = [...host.querySelectorAll(".hjm-list-row__title")].map((node) => node.getBoundingClientRect());
    expect(titles[0]!.left).toBe(titles[1]!.left);
    expect(titles[0]!.right).toBe(titles[1]!.right);
    const width = document.documentElement.clientWidth;
    const gutter = screenPatternRecipe.padding;
    const track = host.querySelector(".hjm-switch__track")!.getBoundingClientRect();
    if (direction === "ltr") { expect(titles[0]!.left).toBe(gutter); expect(width - track.right).toBe(gutter); }
    else { expect(width - titles[0]!.right).toBe(gutter); expect(track.left).toBe(gutter); }
    const toggle = host.querySelector<HTMLButtonElement>('[role="switch"]')!;
    expect(toggle.textContent).toBe("내 활동 알림");
    expect(toggle.querySelector(".hjm-visually-hidden")).not.toBeNull();
    expect(toggle.getBoundingClientRect().width).toBeLessThan(80);
    await act(async () => toggle.click());
    expect(change).toHaveBeenCalledWith(true);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
  });
  // Keep historical maximum-text cases registered without executing them (2026-10-07 user scope).
  for (const [width, textScale, direction, theme] of [[320, 1, "ltr", "light"], [390, 1, "rtl", "dark"], [320, 2, "ltr", "dark"], [320, 2, "rtl", "light"]] as const) {
    it.skipIf(textScale === 2)(`fits controls at ${width}px, text ${textScale}x, ${direction}, ${theme}`, async () => {
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
  }

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

  it("keeps BottomCTA's own bar when contentInset is none and the host owns the insets", async () => {
    await page.viewport(402, 844);
    await act(async () => root.render(<HjmProvider><div style={{ height: 600 }}>
      <ScreenLayout title="도구" contentInset="none" footer={<BottomCTA primaryAction={{ label: "저장", onClick: () => {} }} />}><p>본문</p></ScreenLayout>
    </div></HjmProvider>));
    expect(getComputedStyle(host.querySelector<HTMLElement>(".hjm-screen__footer")!).borderTopWidth).toBe("0px");
    const cta = host.querySelector<HTMLElement>(".hjm-bottom-cta")!;
    expect(cta.dataset.placement).not.toBe("screen-footer");
    expect(getComputedStyle(cta).borderTopWidth).not.toBe("0px");
  });
  it("draws BottomCTA bare inside ScreenLayout footer, which owns the bar border and padding", async () => {
    await page.viewport(402, 844);
    await act(async () => root.render(<HjmProvider><div style={{ height: 600 }}>
      <ScreenLayout title="설정" footer={<BottomCTA primaryAction={{ label: "저장", onClick: () => {} }} />}><p>본문</p></ScreenLayout>
    </div></HjmProvider>));
    const footer = host.querySelector<HTMLElement>(".hjm-screen__footer")!;
    const cta = host.querySelector<HTMLElement>(".hjm-bottom-cta")!;
    const style = getComputedStyle(cta);
    expect(style.borderTopWidth).toBe("0px");
    expect(style.paddingLeft).toBe("0px");
    expect(style.boxShadow).toBe("none");
    // The primary button spans the footer content box: one inset (the footer's), not two.
    const inner = footer.getBoundingClientRect().width - 2 * parseFloat(getComputedStyle(footer).paddingLeft);
    expect(cta.querySelector<HTMLElement>(".hjm-button")!.getBoundingClientRect().width).toBeCloseTo(inner, 0);
  });

  // max(footer padding, inset), not footer padding + inset (2026-10-17 "버튼 아래 여백이 많아").
  it("keeps one bottom inset under a footer BottomCTA: max(16, safeAreaBottom)", async () => {
    await page.viewport(402, 844);
    const gap = async (safeAreaBottom: number) => {
      await act(async () => root.render(<HjmProvider><div style={{ height: 600 }}>
        <ScreenLayout title="설정" footer={<BottomCTA safeAreaBottom={safeAreaBottom} primaryAction={{ label: "저장", onClick: () => {} }} />}><p>본문</p></ScreenLayout>
      </div></HjmProvider>));
      const footer = host.querySelector<HTMLElement>(".hjm-screen__footer")!;
      return footer.getBoundingClientRect().bottom - footer.querySelector<HTMLElement>(".hjm-button")!.getBoundingClientRect().bottom;
    };
    expect(await gap(0)).toBeCloseTo(16, 0);
    expect(await gap(34)).toBeCloseTo(34, 0);
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
