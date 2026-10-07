import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { defineHjmDesignProfile, hjmDesignPresets, type HjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import { toggleGroupRecipe } from "@hjmds/design-contracts/components/toggle-group";
import { HjmProvider } from "../src/provider.js";
import { ToggleGroup } from "../src/toggle-group.js";
import "../src/styles.css";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const descriptor = { accessibilityLabel: "글자 꾸미기", items: [
  { id: "bold", label: "굵게" }, { id: "italic", label: "기울임" }, { id: "locked", label: "잠김", disabled: true },
] } as const;

it("inherits every preset corner while retaining focused multiple selection and disabled semantics", async () => {
  await page.viewport(390, 420);
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host); const change = vi.fn();
  const render = (profile: HjmDesignProfile | undefined, theme: "light" | "dark") => act(async () => root.render(
    <HjmProvider theme={theme} textScale={1} reducedMotion {...(profile ? { designProfile: profile } : {})}>
      <HjmProvider><h1>{profile?.id ?? "기본"} · {theme}</h1><ToggleGroup descriptor={descriptor}
        defaultPressedIds={new Set(["bold"])} onPressedIdsChange={change} /></HjmProvider>
    </HjmProvider>));
  try {
    await render(undefined, "light");
    const buttons = Array.from(host.querySelectorAll<HTMLButtonElement>("button")); const [bold, italic, locked] = buttons;
    italic!.focus(); await act(async () => userEvent.keyboard("{Space}"));
    expect([...change.mock.calls.at(-1)![0]]).toEqual(["bold", "italic"]);
    const product = defineHjmDesignProfile({ id: "product", tokens: { radius: { md: 29 } } });
    for (const theme of ["light", "dark"] as const) for (const profile of [...Object.values(hjmDesignPresets), product, undefined]) {
      await render(profile, theme);
      expect(Array.from(host.querySelectorAll("button"))).toEqual(buttons);
      expect(document.activeElement).toBe(italic);
      expect(bold!.getAttribute("aria-pressed")).toBe("true"); expect(italic!.getAttribute("aria-pressed")).toBe("true");
      expect(locked!.disabled).toBe(true); expect(locked!.getAttribute("aria-pressed")).toBe("false");
      expect(getComputedStyle(bold!).borderRadius).toBe(`${profile?.tokens.radius.md ?? toggleGroupRecipe.radius}px`);
      expect(bold!.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(390);
      // Optional VQ output uses a task-owned path; the normal regression creates no captures.
      const evidence = (import.meta as ImportMeta & { env: { VITE_TOGGLE_EVIDENCE_DIR?: string } }).env.VITE_TOGGLE_EVIDENCE_DIR;
      if (evidence && profile && profile.id !== "neutral" && profile.id !== "product") await page.screenshot({ path: `${evidence}/${profile.id}-${theme}.png` });
    }
    await act(async () => locked!.click()); expect(change).toHaveBeenCalledTimes(1);
    await act(async () => userEvent.keyboard("{Space}"));
    expect([...change.mock.calls.at(-1)![0]]).toEqual(["bold"]);
  } finally { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); }
});

it("uses the closest explicit profile and resets to the neutral corner", async () => {
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host);
  try {
    for (const profile of [hjmDesignPresets.retro, undefined]) {
      await act(async () => root.render(<HjmProvider designProfile={hjmDesignPresets.forest} textScale={1}>
        <HjmProvider designProfile={profile ?? hjmDesignPresets.neutral}><ToggleGroup descriptor={descriptor} /></HjmProvider>
      </HjmProvider>));
      expect(getComputedStyle(host.querySelector("button")!).borderRadius).toBe(`${profile?.tokens.radius.md ?? toggleGroupRecipe.radius}px`);
    }
    await act(async () => root.render(<ToggleGroup descriptor={descriptor} />));
    expect(getComputedStyle(host.querySelector("button")!).borderRadius).toBe(`${toggleGroupRecipe.radius}px`);
  } finally { await act(async () => root.unmount()); host.remove(); }
});
