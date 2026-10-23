import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { Button } from "../src/actions.js";
import { Card } from "../src/display.js";
import { Tabs } from "../src/navigation.js";
import { BottomNavigation } from "../src/bottom-navigation.js";
import { ReactionPicker } from "../src/reaction-picker.js";
import { ToggleGroup } from "../src/toggle-group.js";
import { Combobox } from "../src/advanced-forms.js";
import "../src/styles.css";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const destinations = { accessibilityLabel: "Capsule", selectedKey: "home", items: [
  { id: "home", label: "Home", icon: { name: "home" } }, { id: "search", label: "Search", icon: { name: "search" } },
] } as const;

it.each(["light", "dark"] as const)("shares selected surfaces across components while preserving explicit brand emphasis in %s", async theme => {
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host);
  const render = (surfaceSelected?: string) => <HjmProvider theme={theme} reducedMotion {...(surfaceSelected ? { brandPalette: { [theme]: { surfaceSelected } } } : {})}>
    <Button selected tone="ghost">Toggle</Button>
    <Button>Save</Button>
    <Card selected title="Card" />
    <Tabs label="Filled" indicator="filled" items={[{ id: "a", label: "One" }, { id: "b", label: "Two" }]} defaultValue="a" />
    <Tabs label="Moving" appearance="slide" indicator="filled" items={[{ id: "a", label: "One" }, { id: "b", label: "Two" }]} defaultValue="a" />
    <Tabs label="Solid" indicator="solid" items={[{ id: "a", label: "One" }, { id: "b", label: "Two" }]} defaultValue="a" />
    <BottomNavigation configuration={{ presentation: "capsule" }} descriptor={destinations} getHref={item => `/${item.id}`} renderIcon={() => null} />
    <ReactionPicker label="Reactions" options={[{ id: "like", label: "Like", emoji: "👍" }]} value="like" onValueChange={() => {}} />
    <ToggleGroup descriptor={{ accessibilityLabel: "Format", items: [{ id: "bold", label: "Bold" }] }} pressedIds={new Set(["bold"])} />
  </HjmProvider>;
  try {
    for (const override of [undefined, theme === "light" ? "#f8f8fa" : "#24282f"]) {
      await act(async () => root.render(render(override)));
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const rgb = override ? theme === "light" ? "rgb(248, 248, 250)" : "rgb(36, 40, 47)" : theme === "light" ? "rgb(240, 241, 243)" : "rgb(48, 52, 59)";
      for (const selector of [
        '.hjm-button[data-selected="true"]', '.hjm-card[data-state="selected"]',
        '.hjm-tabs[data-indicator="filled"] [data-state="selected"]',
        '.hjm-bottom-navigation[data-presentation="capsule"] [data-state="selected"]',
        '.hjm-reaction-picker__chip[data-selected]', '.hjm-toggle-group__item[aria-pressed="true"]',
        '.hjm-tabs[data-appearance="slide"] .hjm-tabs__indicator',
      ]) expect(getComputedStyle(host.querySelector(selector)!).backgroundColor, selector).toBe(rgb);
      const primary = getComputedStyle(host.querySelector('.hjm-button[data-tone="primary"]')!).backgroundColor;
      expect(getComputedStyle(host.querySelector('.hjm-tabs[data-indicator="solid"] [data-state="selected"]')!).backgroundColor).toBe(primary);
      expect(primary).not.toBe(rgb);
      expect(host.querySelector('.hjm-reaction-picker__chip')!.getAttribute('aria-pressed')).toBe('true');
    }
  } finally { await act(async () => root.unmount()); host.remove(); }
});

it("keeps committed combobox selection distinct from the keyboard's active candidate", async () => {
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host);
  try {
    await act(async () => root.render(<HjmProvider><Combobox label="City" defaultOpen defaultValue="seoul" defaultInputValue=""
      items={[{ value: "seoul", label: "Seoul" }, { value: "busan", label: "Busan" }]}
      emptyMessage="Empty" loadingMessage="Loading" selectionRequiredMessage="Choose" /></HjmProvider>));
    const input = host.querySelector("input")!;
    const down = () => act(async () => { input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })); });
    await down();
    const chosen = document.querySelector('.hjm-combobox__option[aria-selected="true"]')!;
    expect(getComputedStyle(chosen).backgroundColor).toBe("rgb(240, 241, 243)");
    await down();
    const active = document.querySelector('.hjm-combobox__option[data-state="active"]')!;
    expect(active.getAttribute("aria-selected")).toBe("false");
    expect(getComputedStyle(active).backgroundColor).toBe("rgb(255, 255, 255)");
    expect(getComputedStyle(chosen).backgroundColor).toBe("rgb(240, 241, 243)");
  } finally { await act(async () => root.unmount()); host.remove(); }
});
