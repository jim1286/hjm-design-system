import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { OverviewScreen } from "../src/design-profile.js";
import { SegmentedControl } from "../src/selection.js";
import { ScreenLayout } from "../src/screens.js";
import { hjmDesignPresets, type HjmDesignPreset } from "@hjmds/design-contracts/design-profile";
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
