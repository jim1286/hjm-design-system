// Floating frame shapes and the lift icon emphasis (HJM 1.32.0, Utilverse home shells).
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { bottomNavigationRecipe } from "@hjmds/design-contracts/recipes";
import { BottomNavigation, HjmProvider } from "../src/index.js";
import "../src/styles.css";

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
});

const descriptor = {
  accessibilityLabel: "Dock",
  selectedKey: "home",
  items: [
    { id: "home", label: "Home", icon: { name: "home" } },
    { id: "search", label: "Search", icon: { name: "search" }, badge: { count: 2, accessibilityLabel: "2 new" } },
  ],
} as const;

it("applies each recipe shape's radius token and inner padding to the floating frame", async () => {
  for (const [shape, recipe] of Object.entries(bottomNavigationRecipe.shapes)) {
    await act(async () => root.render(
      <HjmProvider systemTheme="light">
        <BottomNavigation configuration={{ presentation: "floating", shape: shape as keyof typeof bottomNavigationRecipe.shapes }}
          descriptor={descriptor} getHref={(item) => `/${item.id}`} renderIcon={() => <svg width={24} height={24} />} />
      </HjmProvider>,
    ));
    const surface = host.querySelector<HTMLElement>(".hjm-bottom-navigation__surface")!;
    const list = host.querySelector<HTMLElement>(".hjm-bottom-navigation__list")!;
    const radiusToken = getComputedStyle(surface).getPropertyValue(`--hjm-radius-${recipe.radius}`).trim();
    expect(getComputedStyle(surface).borderTopLeftRadius).toBe(radiusToken);
    expect(getComputedStyle(list).paddingTop).toBe(`${recipe.surfacePadding}px`);
  }
});

it("lifts the selected icon and dims only idle icons, never the badge", async () => {
  await act(async () => root.render(
    <HjmProvider systemTheme="light" reducedMotion>
      <BottomNavigation configuration={{ presentation: "floating", iconEmphasis: "lift" }}
        descriptor={descriptor} getHref={(item) => `/${item.id}`}
        renderIcon={({ item }) => <svg data-icon={item.id} width={24} height={24} />} />
    </HjmProvider>,
  ));
  const lift = bottomNavigationRecipe.icon.liftEmphasis;
  const selected = host.querySelector<SVGElement>('[data-icon="home"]')!;
  const idle = host.querySelector<SVGElement>('[data-icon="search"]')!;
  const badge = host.querySelector<HTMLElement>(".hjm-bottom-navigation__badge")!;
  const matrix = new DOMMatrixReadOnly(getComputedStyle(selected).transform);
  expect(matrix.f).toBeCloseTo(lift.translateY, 1);
  expect(matrix.a).toBeCloseTo(bottomNavigationRecipe.icon.selectedEmphasis.scale.selected, 2);
  expect(Number(getComputedStyle(selected).opacity)).toBe(1);
  expect(Number(getComputedStyle(idle).opacity)).toBeCloseTo(lift.idleOpacity, 2);
  expect(Number(getComputedStyle(badge).opacity)).toBe(1);
});


it("uses theme surfaces for neutral tiles while preserving brand selection", async () => {
  for (const theme of ["light", "dark"] as const) {
    for (const tone of ["neutral", "brand"] as const) {
      await act(async () => root.render(
        <HjmProvider systemTheme={theme}>
          <BottomNavigation configuration={{ presentation: "floating", selection: "tile", tone }}
            descriptor={descriptor} getHref={(item) => `/${item.id}`} renderIcon={() => <svg />} />
        </HjmProvider>,
      ));
      const surface = host.querySelector<HTMLElement>(".hjm-bottom-navigation__surface")!;
      const selected = host.querySelector<HTMLElement>('[data-state="selected"]')!;
      const probe = document.createElement("span");
      surface.append(probe);
      probe.style.backgroundColor = tone === "neutral" ? "var(--hjm-color-surface)" : "var(--hjm-color-surface-accent)";
      expect(getComputedStyle(surface).backgroundColor).toBe(getComputedStyle(probe).backgroundColor);
      probe.style.backgroundColor = "var(--hjm-color-primary)";
      expect(getComputedStyle(selected).backgroundColor).toBe(getComputedStyle(probe).backgroundColor);
      probe.remove();
    }
  }
});
