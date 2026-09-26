import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { resolveDesignSystemProviderValue } from "@hjmds/design-contracts/components/design-system-provider";
import { radius } from "@hjmds/design-contracts/foundations";
import { buttonRecipe, fieldRecipe } from "@hjmds/design-contracts/recipes/base";
import { dialogRecipe, sheetRecipe, toastRecipe } from "@hjmds/design-contracts/recipes";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Button, Dialog, HjmProvider, Sheet, TextField, ToastProvider, useToast } from "../src/index.js";
import "../src/styles.css";

/**
 * The Web stylesheet is written by hand, so recipe values used to be copied into
 * it and drifted: in 1.4.0 Sheet and Dialog painted `surface` with an lg radius
 * and a 28% shadow while the recipe (and Native) used `canvas`, xl and the
 * floating shadow. These checks compare real computed styles with the resolved
 * recipe so the next copy that drifts fails here instead of in a product.
 */
let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

function rgb(hex: string): string {
  const value = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((start) => Number.parseInt(value.slice(start, start + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
}

function shadow(token: Readonly<{ opacity: number; radius: number; offsetY: number }>): string {
  return `rgba(0, 0, 0, ${token.opacity}) 0px ${token.offsetY}px ${token.radius}px 0px`;
}

async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
}

describe.each(["light", "dark"] as const)("Web renderer follows the recipes in %s mode", (theme) => {
  const palette = resolveDesignSystemProviderValue({ theme }, { systemTheme: theme }).palette;

  it("paints Sheet chrome from sheetRecipe", async () => {
    await act(async () => root.render(
      <HjmProvider theme={theme} systemTheme={theme}>
        <Sheet open onOpenChange={() => {}} title="Filter" closeLabel="Close" />
      </HjmProvider>,
    ));
    await flush();
    const sheet = document.body.querySelector<HTMLElement>(".hjm-sheet")!;
    const style = getComputedStyle(sheet);
    expect(style.backgroundColor).toBe(rgb(resolveColorReference(sheetRecipe.content.background, palette)));
    expect(style.borderTopColor).toBe(rgb(resolveColorReference(sheetRecipe.content.border, palette)));
    expect(style.borderTopLeftRadius).toBe(`${radius[sheetRecipe.content.radius]}px`);
    expect(style.boxShadow).toBe(shadow(sheetRecipe.content.shadow));
  });

  it("paints Dialog chrome from dialogRecipe", async () => {
    await act(async () => root.render(
      <HjmProvider theme={theme} systemTheme={theme}>
        <Dialog open onOpenChange={() => {}} title="Confirm" closeLabel="Close" />
      </HjmProvider>,
    ));
    await flush();
    const dialog = document.body.querySelector<HTMLElement>(".hjm-dialog")!;
    const style = getComputedStyle(dialog);
    expect(style.backgroundColor).toBe(rgb(resolveColorReference(dialogRecipe.content.background, palette)));
    expect(style.borderTopLeftRadius).toBe(`${radius[dialogRecipe.content.radius]}px`);
    expect(style.boxShadow).toBe(shadow(dialogRecipe.content.shadow));
  });

  it("paints Toast surface from toastRecipe", async () => {
    function Publisher() {
      const toast = useToast();
      return (
        <button type="button" onClick={() => toast.publish({ id: "saved", title: "Saved", description: "Changes saved.", closeLabel: "Dismiss" })}>
          Publish
        </button>
      );
    }
    await act(async () => root.render(
      <HjmProvider theme={theme} systemTheme={theme}>
        <ToastProvider label="Notifications"><Publisher /></ToastProvider>
      </HjmProvider>,
    ));
    await act(async () => container.querySelector("button")!.click());
    await flush();
    const toast = document.body.querySelector<HTMLElement>(".hjm-toast")!;
    const style = getComputedStyle(toast);
    expect(style.backgroundColor).toBe(rgb(resolveColorReference(toastRecipe.surface.background, palette)));
    expect(style.borderTopColor).toBe(rgb(resolveColorReference(toastRecipe.surface.border, palette)));
    expect(style.borderTopLeftRadius).toBe(`${radius[toastRecipe.surface.radius]}px`);
    expect(style.boxShadow).toBe(shadow(toastRecipe.surface.shadow));
  });

  it("dims disabled Button and Field by the recipe opacities", async () => {
    await act(async () => root.render(
      <HjmProvider theme={theme} systemTheme={theme}>
        <Button disabled>Save</Button>
        <TextField label="Name" disabled defaultValue="" />
      </HjmProvider>,
    ));
    const button = container.querySelector<HTMLElement>(".hjm-button")!;
    const field = container.querySelector<HTMLElement>(".hjm-field")!;
    expect(Number(getComputedStyle(button).opacity)).toBeCloseTo(buttonRecipe.opacity.disabled);
    expect(Number(getComputedStyle(field).opacity)).toBeCloseTo(fieldRecipe.disabledOpacity);
    const provider = container.querySelector<HTMLElement>("[data-hjm-provider]")!;
    expect(Number(getComputedStyle(provider).getPropertyValue("--hjm-button-pressed-opacity")))
      .toBeCloseTo(buttonRecipe.opacity.pressed);
  });
});
