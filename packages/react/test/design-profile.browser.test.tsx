import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { page } from "vitest/browser";
import { HjmProvider } from "../src/provider.js";
import { OverviewScreen } from "../src/design-profile.js";
import { SegmentedControl } from "../src/selection.js";
import { ScreenLayout } from "../src/screens.js";
import { defineHjmDesignProfile, hjmDesignPresets, type HjmDesignPreset } from "@hjmds/design-contracts/design-profile";
import { heading } from "@hjmds/design-contracts/foundations";
import { Surface } from "../src/layout.js";
import { Card } from "../src/display.js";
import { Heading } from "../src/heading.js";
import { Dialog, Sheet } from "../src/overlays.js";
import { Toast } from "../src/toast.js";
import "../src/styles.css";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("preserves the stylesheet-only screen path without requiring a new Provider", async () => {
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host);
  try {
    await act(() => root.render(<ScreenLayout title="기록"><input aria-label="초안" defaultValue="draft" /></ScreenLayout>));
    expect(host.querySelector(".hjm-screen")!.hasAttribute("data-presentation")).toBe(false);
    expect(host.querySelector<HTMLInputElement>('[aria-label="초안"]')!.value).toBe("draft");
  } finally { await act(() => root.unmount()); host.remove(); }
});

it("changes every preset without replacing drafts, selected controls or focused collection inputs", async () => {
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host);
  const render = (preset: HjmDesignPreset) => act(() => root.render(
    <HjmProvider theme="dark" reducedMotion designProfile={hjmDesignPresets[preset]}>
      <HjmProvider textScale={1.5}>
        <OverviewScreen title="기록" toolbarLabel="도구" toolbar={<input aria-label="메모" defaultValue="initial" />}
          items={[{ id: "a", children: <input aria-label="기록" /> }]}
          footer={<SegmentedControl label="기간" items={[{ value: "day", label: "오늘" }, { value: "week", label: "이번 주" }]} />} />
      </HjmProvider>
    </HjmProvider>));
  try {
    await render("retro");
    const draft = host.querySelector<HTMLInputElement>('[aria-label="메모"]')!;
    const item = host.querySelector<HTMLInputElement>('[aria-label="기록"]')!;
    draft.value = "draft"; item.value = "entry"; item.focus();
    const week = host.querySelector<HTMLInputElement>('input[value="week"]')!;
    await act(() => week.click());
    for (const preset of Object.keys(hjmDesignPresets) as HjmDesignPreset[]) {
      await render(preset);
      expect(host.querySelector('[aria-label="메모"]')).toBe(draft);
      expect(host.querySelector('[aria-label="기록"]')).toBe(item);
      expect(draft.value).toBe("draft"); expect(item.value).toBe("entry");
      expect(document.activeElement).toBe(item); expect(week.checked).toBe(true);
      const inner = host.querySelectorAll<HTMLElement>('[data-hjm-provider]')[1]!;
      expect(inner.dataset.designProfile).toBe(preset);
      expect(inner.style.getPropertyValue("--hjm-radius-lg")).toBe(`${hjmDesignPresets[preset].tokens.radius.lg}px`);
      expect(inner.dataset.theme).toBe("dark");
    }
    await render("paper");
    const trigger = host.querySelector<HTMLButtonElement>(".hjm-collapsible__trigger")!;
    await act(() => trigger.click());
    expect(draft.isConnected).toBe(true);
    expect(getComputedStyle(draft.parentElement!).display).toBe("none");
    await render("minimal");
    expect(draft.value).toBe("draft");
    expect(getComputedStyle(trigger).display).toBe("none");
    expect(getComputedStyle(draft.parentElement!).display).not.toBe("none");
  } finally { await act(() => root.unmount()); host.remove(); }
});

it("uses profile selection motion but respects an explicit component override", async () => {
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host);
  const items = [{ value: "a", label: "A" }, { value: "b", label: "B" }];
  try {
    await act(() => root.render(<HjmProvider designProfile={hjmDesignPresets.forest} reducedMotion>
      <SegmentedControl label="자동" items={items} />
      <SegmentedControl label="고정" items={items} selectionMotion="none" />
    </HjmProvider>));
    const controls = host.querySelectorAll("fieldset");
    expect(controls[0]!.querySelector(".hjm-segmented__highlight")).not.toBeNull();
    expect(controls[1]!.querySelector(".hjm-segmented__highlight")).toBeNull();
  } finally { await act(() => root.unmount()); host.remove(); }
});

it("applies every heading level at the browser boundary while preserving semantic levels and text scaling", async () => {
  await page.viewport(390, 844);
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host);
  const custom = defineHjmDesignProfile({ extends: "paper", tokens: { heading: {
    level1: { fontSize: 56, lineHeight: 68 }, level2: { fontSize: 36, lineHeight: 46 },
    level3: { fontSize: 27, lineHeight: 36 }, level4: { fontSize: 22, lineHeight: 30 },
    level5: { fontSize: 19, lineHeight: 28, fontWeight: "500" },
  } } });
  const levels = Object.keys(heading) as (keyof typeof heading)[];
  try {
    for (const profile of [undefined, ...Object.values(hjmDesignPresets), custom]) {
      for (const theme of ["light", "dark"] as const) {
        await act(() => root.render(<HjmProvider theme={theme} textScale={2} direction="rtl" reducedMotion {...(profile ? { designProfile: profile } : {})}>
          <HjmProvider>{levels.map(level => <Heading key={level} level={level} semanticLevel={4}>긴 제목 {level}</Heading>)}</HjmProvider>
        </HjmProvider>));
        const nodes = host.querySelectorAll<HTMLElement>(".hjm-heading");
        levels.forEach((level, index) => {
          const expected = (profile?.tokens.heading ?? heading)[level];
          const node = nodes[index]!; const style = getComputedStyle(node);
          expect(node.tagName).toBe("H4"); expect(node.dataset.level).toBe(level);
          expect(Number.parseFloat(style.fontSize)).toBe(expected.fontSize * 2);
          expect(Number.parseFloat(style.lineHeight)).toBe(expected.lineHeight * 2);
          expect(style.fontWeight).toBe(expected.fontWeight);
          expect(node.scrollWidth).toBeLessThanOrEqual(node.clientWidth + 1);
        });
      }
    }
  } finally { await act(() => root.unmount()); host.remove(); await page.viewport(1280, 720); }
});

it("updates portal and toast shadows from the nearest profile without replacing the open draft", async () => {
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host);
  const custom = defineHjmDesignProfile({ extends: "clay", tokens: { shadow: { floating: { color: "#123456", radius: 19, offsetY: 7, opacity: 0.21 } } } });
  try {
    for (const kind of ["dialog", "sheet"] as const) {
      let original: HTMLInputElement | undefined;
      for (const profile of [hjmDesignPresets.clay, hjmDesignPresets.terminal, custom]) {
        const draft = <input aria-label="열린 초안" defaultValue="initial" />;
        await act(() => root.render(<HjmProvider theme="dark" reducedMotion textScale={2} direction="rtl" designProfile={profile}>
          {kind === "dialog" ? <Dialog open onOpenChange={() => {}} title="기록" closeLabel="닫기">{draft}</Dialog> : <Sheet open onOpenChange={() => {}} title="기록" closeLabel="닫기">{draft}</Sheet>}
          <Toast descriptor={{ id: "saved", description: "저장했어요", closeLabel: "닫기" }} onDismissRequest={() => {}} />
        </HjmProvider>));
        const input = document.querySelector<HTMLInputElement>('[aria-label="열린 초안"]')!;
        if (!original) { original = input; input.value = "kept draft"; input.focus(); }
        expect(input).toBe(original); expect(input.value).toBe("kept draft"); expect(document.activeElement).toBe(input);
        const overlay = document.querySelector<HTMLElement>(`.hjm-${kind}`)!;
        const toast = host.querySelector<HTMLElement>(".hjm-toast")!;
        const rgba = profile === custom ? "rgba(18, 52, 86, 0.21)" : "rgba(0, 0, 0, " + profile.tokens.shadow.floating.opacity + ")";
        for (const surface of [overlay, toast]) {
          const shadow = getComputedStyle(surface).boxShadow;
          expect(shadow).toContain(rgba);
          expect(shadow).toContain(`0px ${profile.tokens.shadow.floating.offsetY}px ${profile.tokens.shadow.floating.radius}px`);
        }
        expect(overlay.getAttribute("aria-modal")).toBe("true");
      }
    }
  } finally { await act(() => root.unmount()); host.remove(); }
});


it("uses real glass filtering and clay inset shadows without replacing focused card content", async () => {
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host);
  let draft!: HTMLInputElement;
  const render = (profile: typeof hjmDesignPresets.glass) => act(() => root.render(<HjmProvider theme="dark" designProfile={profile} reducedMotion>
    <Card title="질감 카드" tone="raised"><input aria-label="질감 초안" defaultValue="initial" /></Card>
    <HjmProvider designProfile={hjmDesignPresets.neutral}><Surface padding="md">중립 영역</Surface></HjmProvider>
  </HjmProvider>));
  try {
    await render(hjmDesignPresets.glass);
    draft = host.querySelector<HTMLInputElement>('[aria-label="질감 초안"]')!; draft.value = "retained"; draft.focus();
    let surface = host.querySelector<HTMLElement>(".hjm-card")!;
    expect(getComputedStyle(surface).backdropFilter).toMatch(/blur\([1-9]/);
    const alpha = Number(getComputedStyle(surface).backgroundColor.match(/\/\s*(0\.\d+)\)/)?.[1]);
    expect(alpha).toBeGreaterThanOrEqual(0.85); expect(alpha).toBeLessThan(1);
    expect(getComputedStyle(host.querySelector<HTMLElement>(".hjm-surface:not(.hjm-card)")!).backdropFilter).toBe("none");
    await render(hjmDesignPresets.clay);
    surface = host.querySelector<HTMLElement>(".hjm-card")!;
    const style = getComputedStyle(surface);
    expect(style.backdropFilter).toBe("none");
    expect(style.boxShadow.match(/inset/g)).toHaveLength(2);
    expect(style.boxShadow).toContain(`${hjmDesignPresets.clay.tokens.shadow.floating.radius}px`);
    expect(host.querySelector('[aria-label="질감 초안"]')).toBe(draft);
    expect(draft.value).toBe("retained"); expect(document.activeElement).toBe(draft);
    await render(hjmDesignPresets.neutral);
    expect(getComputedStyle(surface).boxShadow).not.toContain("inset");
    expect(getComputedStyle(surface).backdropFilter).toBe("none");
  } finally { await act(() => root.unmount()); host.remove(); }
});
