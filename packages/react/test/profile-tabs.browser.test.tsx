import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { hjmDesignPresets, type HjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import { HjmProvider } from "../src/provider.js";
import { Tabs, type TabsAppearance } from "../src/navigation.js";
import "../src/styles.css";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const items = [
  { id: "draft", label: "Draft", panel: <input aria-label="Draft text" defaultValue="initial" /> },
  { id: "disabled", label: "Disabled", disabled: true },
  { id: "history", label: "Long history label", panel: "History" },
  { id: "details", label: "Details", panel: "Details" },
];
const frame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

it("inherits all ten profiles without replacing visited drafts or explicit appearance", async () => {
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host);
  const render = (profile?: HjmDesignProfile, appearance?: TabsAppearance, vertical = false) => root.render(
    <HjmProvider {...(profile ? { designProfile: profile } : {})}>
      <Tabs label="Sections" items={items} mountPolicy="visited" {...(appearance ? { appearance } : {})} orientation={vertical ? "vertical" : "horizontal"} />
    </HjmProvider>,
  );
  try {
    await act(() => render()); const draft = host.querySelector<HTMLInputElement>("input")!; draft.value = "kept draft";
    const history = host.querySelectorAll<HTMLButtonElement>('[role="tab"]')[2]!;
    await act(() => history.click());
    for (const profile of Object.values(hjmDesignPresets)) {
      await act(() => render(profile));
      expect(host.querySelector(".hjm-tabs")?.getAttribute("data-appearance")).toBe(profile.interactions.selectionMotion === "slide" ? "slide" : "standard");
      expect(host.querySelector("input")).toBe(draft); expect(draft.value).toBe("kept draft");
      expect(history.getAttribute("aria-selected")).toBe("true");
      expect(host.querySelectorAll('[role="tabpanel"]')).toHaveLength(2);
    }
    await act(() => render(hjmDesignPresets.forest, "standard")); expect(host.querySelector(".hjm-tabs__indicator")).toBeNull();
    await act(() => render(hjmDesignPresets.paper, "gooey")); expect(host.querySelector(".hjm-tabs__gooey")).not.toBeNull();
    await act(() => render(hjmDesignPresets.forest, "slide", true)); expect(host.querySelector(".hjm-tabs__indicator")).toBeNull();
    await act(() => render()); expect(host.querySelector(".hjm-tabs")?.getAttribute("data-appearance")).toBe("standard");
    expect(host.querySelector("input")).toBe(draft);
  } finally { await act(() => root.unmount()); host.remove(); }
});

it("keeps keyboard semantics and continues rapid selection from its current visual position", async () => {
  const host = document.createElement("div"); host.style.width = "620px"; document.body.append(host); const root = createRoot(host);
  const render = (reducedMotion = false, direction: "ltr" | "rtl" = "ltr") => root.render(
    <HjmProvider designProfile={hjmDesignPresets.forest} reducedMotion={reducedMotion} direction={direction}>
      <Tabs label="Sections" items={items} mountPolicy="visited" layout="fitted" />
    </HjmProvider>,
  );
  try {
    await act(() => render()); await frame(); expect(host.getAnimations({ subtree: true })).toHaveLength(0);
    const tabs = host.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    await act(() => { tabs[0]!.focus(); tabs[0]!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })); });
    expect(document.activeElement).toBe(tabs[2]); expect(tabs[0]!.getAttribute("aria-selected")).toBe("true");
    await act(() => tabs[2]!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
    expect(tabs[2]!.getAttribute("aria-selected")).toBe("true"); expect(document.activeElement).toBe(tabs[2]);
    const animation = host.getAnimations({ subtree: true })[0]!; animation.pause(); animation.currentTime = 100; await frame();
    const indicator = host.querySelector<HTMLElement>(".hjm-tabs__indicator")!;
    const visible = { x: Number.parseFloat(getComputedStyle(indicator).left), width: Number.parseFloat(getComputedStyle(indicator).width) };
    await act(() => tabs[3]!.click());
    const next = host.getAnimations({ subtree: true })[0]!;
    const first = (next.effect as KeyframeEffect).getKeyframes()[0]!;
    expect(Number.parseFloat(String(first.left))).toBeCloseTo(visible.x, 1);
    expect(Number.parseFloat(String(first.width))).toBeCloseTo(visible.width, 1);
    expect(animation.playState).toBe("idle");
    await act(() => render(true, "rtl")); expect(host.getAnimations({ subtree: true })).toHaveLength(0);
    host.style.width = "820px"; await frame(); await frame();
    expect(Number.parseFloat(indicator.style.left)).toBe(tabs[3]!.offsetLeft);
    expect(indicator.getAttribute("aria-hidden")).toBe("true"); expect(tabs[3]!.getAttribute("aria-selected")).toBe("true");
  } finally { await act(() => root.unmount()); host.remove(); }
});
