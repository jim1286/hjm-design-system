import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { defineHjmDesignProfile, hjmDesignPresets, type HjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import { HjmProvider } from "../src/provider.js";
import { Top } from "../src/top.js";
import { topRecipe } from "@hjmds/design-contracts/components/top";
import { Sidebar } from "../src/sidebar.js";
import { SkipNav } from "../src/skip-nav.js";
import { Menubar } from "../src/menubar.js";
import "../src/styles.css";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("inherits nearest navigation corners while preserving focus, open menu and disabled semantics", async () => {
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host); const run = vi.fn();
  const content = <>
    <SkipNav targetId="profile-corner-main" label="Skip" />
    <Sidebar descriptor={{ accessibilityLabel: "Navigation", currentId: "home", groups: [{ id: "main", items: [
      { id: "home", label: "Home", destination: { kind: "internal", href: "#home" } },
      { id: "locked", label: "Locked", destination: { kind: "internal", href: "#locked" }, disabled: true },
    ] }] }} />
    <Menubar descriptor={{ accessibilityLabel: "Editor", menus: [{ id: "file", label: "File", items: [{ id: "save", label: "Save", textValue: "Save" }] }, { id: "locked", label: "Locked menu", disabled: true, items: [{ id: "locked-action", label: "Locked", textValue: "Locked" }] }] }} onAction={run} />
    <main id="profile-corner-main">Content</main>
  </>;
  const render = (profile: HjmDesignProfile | undefined, theme: "light" | "dark") => act(async () => root.render(<HjmProvider designProfile={hjmDesignPresets.forest} theme={theme} textScale={1} reducedMotion>
    <HjmProvider designProfile={profile ?? hjmDesignPresets.neutral}><HjmProvider>{content}</HjmProvider></HjmProvider>
  </HjmProvider>));
  try {
    await render(undefined, "light");
    const menu = host.querySelector<HTMLButtonElement>(".hjm-menubar__label")!;
    await act(async () => menu.click()); menu.focus();
    const product = defineHjmDesignProfile({ id: "product-corners", tokens: { radius: { md: 29, sm: 3 } } });
    for (const theme of ["light", "dark"] as const) for (const profile of [...Object.values(hjmDesignPresets), product, undefined]) {
      await render(profile, theme);
      expect(host.querySelector(".hjm-menubar__label")).toBe(menu); expect(document.activeElement).toBe(menu);
      expect(menu.getAttribute("aria-expanded")).toBe("true");
      expect(getComputedStyle(menu).borderRadius).toBe(`${profile?.tokens.radius.sm ?? 8}px`);
      expect(getComputedStyle(host.querySelector(".hjm-sidebar__item")!).borderRadius).toBe(`${profile?.tokens.radius.md ?? 12}px`);
      expect(getComputedStyle(host.querySelector(".hjm-skip-nav")!).borderRadius).toBe(`${profile?.tokens.radius.md ?? 12}px`);
      expect(host.querySelector('[aria-current="page"]')?.textContent).toContain("Home");
      expect(host.querySelector('.hjm-sidebar__item[aria-disabled="true"]')).not.toBeNull();
      expect(host.querySelector<HTMLButtonElement>('.hjm-menubar__label[disabled]')?.disabled).toBe(true);
    }
    await act(async () => menu.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })));
    expect(document.activeElement).toBe(menu); // the disabled neighbour stays outside the roving focus set
    const save = document.querySelector<HTMLElement>('.hjm-menubar__item')!;
    await act(async () => save.click()); expect(run).toHaveBeenCalledWith("save", "file");
    const skip = host.querySelector<HTMLAnchorElement>(".hjm-skip-nav")!;
    await act(async () => skip.click()); expect(document.activeElement).toBe(host.querySelector("main"));
    await act(async () => root.render(content));
    expect(getComputedStyle(host.querySelector(".hjm-menubar__label")!).borderRadius).toBe("8px");
    expect(getComputedStyle(host.querySelector(".hjm-sidebar__item")!).borderRadius).toBe("12px");
    expect(getComputedStyle(host.querySelector(".hjm-skip-nav")!).borderRadius).toBe("12px");
  } finally { await act(async () => root.unmount()); host.remove(); }
});

it("resolves Top visual metrics separately from explicit semantic level and keeps action focus", async () => {
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host); const action = vi.fn();
  const product = defineHjmDesignProfile({ id: "top-product", tokens: { heading: { level2: { fontSize: 35, lineHeight: 45, fontWeight: "500" } }, typography: { titleLarge: { fontSize: 23, lineHeight: 33, fontWeight: "600" } }, fontFamily: { display: ["Georgia"] } } });
  const content = <><Top descriptor={{ title: "Large title", size: "large", headingLevel: 3 }} trailing={<button onClick={action}>Title action</button>} /><Top descriptor={{ title: "Medium title", size: "medium", headingLevel: 2 }} /></>;
  try {
    let focused: HTMLButtonElement | undefined;
    for (const theme of ["light", "dark"] as const) for (const profile of [product, hjmDesignPresets.editorial, hjmDesignPresets.neutral, undefined]) {
      await act(async () => root.render(<HjmProvider theme={theme} textScale={1} {...(profile ? { designProfile: profile } : {})}><HjmProvider>{content}</HjmProvider></HjmProvider>));
      const button = host.querySelector<HTMLButtonElement>("button")!;
      if (!focused) { focused = button; button.focus(); }
      expect(button).toBe(focused); expect(document.activeElement).toBe(focused);
      const titles = Array.from(host.querySelectorAll<HTMLElement>(".hjm-top__title"));
      expect(titles.map(title => title.tagName)).toEqual(["H3", "H2"]);
      for (const [index, size] of ["large", "medium"].entries()) {
        const metrics = profile ? size === "large" ? profile.tokens.heading.level2 : profile.tokens.typography.titleLarge : topRecipe.sizes[size as "large" | "medium"].title;
        const computed = getComputedStyle(titles[index]!);
        expect(computed.fontSize).toBe(`${metrics.fontSize}px`); expect(computed.lineHeight).toBe(`${metrics.lineHeight}px`); expect(computed.fontWeight).toBe(metrics.fontWeight);
        if (profile?.tokens.fontFamily.display) expect(computed.fontFamily).toContain("Georgia");
      }
    }
    await act(async () => focused!.click()); expect(action).toHaveBeenCalledOnce();
    await act(async () => root.render(content));
    expect(getComputedStyle(host.querySelector(".hjm-top__title")!).fontSize).toBe(`${topRecipe.sizes.large.title.fontSize}px`);
  } finally { await act(async () => root.unmount()); host.remove(); }
});
