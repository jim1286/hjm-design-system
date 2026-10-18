// Overlay inset, prominent center destination and app-icon slots (HJM 1.31.0 gap batch).
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { bottomNavigationRecipe } from "@hjmds/design-contracts/recipes";
import { BottomNavigation, BottomNavigationInsetProvider, HjmProvider, useBottomNavigationInset } from "../src/index.js";
import { ScreenLayout } from "../src/screens.js";
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

const items = [
  { id: "trail", label: "Trail", icon: { name: "home" } },
  { id: "write", label: "Write", icon: { name: "add" }, prominent: true },
  { id: "nest", label: "Nest", icon: { name: "person" } },
] as const;

it("publishes the fixed bar's covered height to screens and ScreenLayout's last region", async () => {
  let inset = -1;
  function Probe() { inset = useBottomNavigationInset(); return null; }
  await act(async () => root.render(
    <HjmProvider systemTheme="light">
      <BottomNavigationInsetProvider>
        <ScreenLayout title="Feed"><Probe /></ScreenLayout>
        <BottomNavigation descriptor={{ accessibilityLabel: "Main", selectedKey: "trail", items: [items[0], items[2]] }}
          getHref={(item) => `/${item.id}`} renderIcon={() => <svg width={24} height={24} />} />
      </BottomNavigationInsetProvider>
    </HjmProvider>,
  ));
  await act(async () => { await new Promise((resolve) => requestAnimationFrame(() => resolve(null))); });
  const nav = host.querySelector("nav.hjm-bottom-navigation")!;
  expect(inset).toBeCloseTo(nav.getBoundingClientRect().height, 0);
  expect(inset).toBeGreaterThan(0);
  const body = host.querySelector<HTMLElement>(".hjm-screen__body")!;
  expect(Number.parseFloat(getComputedStyle(body).paddingBottom)).toBeCloseTo(16 + inset, 0);
});

it("lifts a selectable prominent destination and sizes app-icon slots from the recipe", async () => {
  const sizes = new Map<string, number>();
  await act(async () => root.render(
    <HjmProvider systemTheme="light">
      <BottomNavigation configuration={{ iconSize: "large" }}
        descriptor={{ accessibilityLabel: "Main", selectedKey: "write", items: [...items] }}
        getHref={(item) => `/${item.id}`}
        renderIcon={({ item, size }) => { sizes.set(item.id, size); return <svg width={size} height={size} />; }} />
    </HjmProvider>,
  ));
  const prominent = host.querySelector<HTMLElement>('li[data-prominent="true"]')!;
  expect(prominent.querySelector("a")!.getAttribute("aria-current")).toBe("page");
  const circle = prominent.querySelector<HTMLElement>(".hjm-bottom-navigation__indicator")!;
  expect(circle.getBoundingClientRect().width).toBe(bottomNavigationRecipe.prominentDestination.diameter);
  expect(getComputedStyle(circle).borderRadius).not.toBe("0px");
  expect(sizes.get("trail")).toBe(bottomNavigationRecipe.iconSizes.large);
  expect(sizes.get("write")).toBe(28);
  // Labels stay on one line: the lift equals the extra circle height over a normal indicator.
  const labels = [...host.querySelectorAll<HTMLElement>(".hjm-bottom-navigation__label")].map((label) => Math.round(label.getBoundingClientRect().top));
  expect(new Set(labels).size).toBe(1);
});
