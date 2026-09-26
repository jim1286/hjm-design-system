import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { resolveDesignSystemProviderValue } from "@hjmds/design-contracts/components/design-system-provider";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { HjmProvider } from "../src/index.js";
import { reactRendererEvidence, type ReactRendererEvidenceScenario } from "../src/evidence.js";
import { defaultRenderFixtures, type DefaultRenderFixture } from "./default-render-fixtures.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };
import "../src/styles.css";

/**
 * Environment scenario proof for every renderer evidence claim.
 *
 * Until 1.5.0 these scenarios were "proven" by server-rendering each component
 * inside a provider and checking the provider's own data-theme/dir attributes,
 * which passes for a component that hardcodes every color. Each scenario here
 * inspects the component's computed styles in a real browser instead, and a
 * component may only claim a scenario (src/evidence.ts) that passes below.
 * Scenarios a component cannot pass stay unclaimed and show up as explicit
 * promotion debt in the generated evidence projection.
 */
type Environment = Readonly<{
  id: ReactRendererEvidenceScenario;
  theme: "light" | "dark";
  direction: "ltr" | "rtl";
  textScale: number;
  reducedMotion: boolean;
}>;

const proofFile = "test/scenario-matrix.browser.test.tsx";
const environments = executedScenarioRegistry.executions.find(
  (execution) => execution.proofFile === proofFile,
)!.scenarios as readonly Environment[];
const baseline: Environment = { id: "default", theme: "light", direction: "ltr", textScale: 1, reducedMotion: false };
const longCopy = "An unusually long product sentence with verylongunbrokenidentifierlikewordsthatmustwrap and a second clause that keeps going past one line.";
const containerWidth = 320;

/**
 * Components whose own colors are fixed on purpose and therefore stay the same
 * across themes. Each needs a reason; anything else must repaint in dark mode.
 */
const themeInvariantPaint: Readonly<Record<string, string>> = {
  "auth-provider-button": "Provider buttons use the provider's brand colors in both themes (brand guidelines).",
};

/**
 * Elements that deliberately keep left-to-right order in an RTL page. Each
 * needs a reason; everything else must inherit the provider direction.
 */
const ltrIsolates: Readonly<Record<string, string>> = {
  "hjm-otp-field__slots": "One-time codes are entered and read left to right in RTL locales too.",
};

function rgbOf(hex: string): string {
  const value = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((start) => Number.parseInt(value.slice(start, start + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
}

function paletteColors(theme: "light" | "dark"): Set<string> {
  const { palette } = resolveDesignSystemProviderValue({ theme }, { systemTheme: theme });
  return new Set([...Object.values(palette.theme), ...Object.values(palette.statusAccents)].map(rgbOf));
}

/** Colors that exist only in the light palette; seeing one in dark mode means a leaked light value. */
const lightOnlyColors = (() => {
  const dark = paletteColors("dark");
  return new Set([...paletteColors("light")].filter((color) => !dark.has(color)));
})();

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  container.style.width = `${containerWidth}px`;
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

/**
 * Always mounts into a fresh root. Re-rendering the same tree with a new theme
 * starts the components' own CSS transitions (background, color), and
 * getComputedStyle then reports the light starting value mid-transition.
 */
async function mount(environment: Environment, node: ReactNode): Promise<void> {
  await act(async () => root.unmount());
  root = createRoot(container);
  await act(async () => root.render(
    <HjmProvider
      direction={environment.direction}
      reducedMotion={environment.reducedMotion}
      systemTheme={environment.theme}
      textScale={environment.textScale}
      theme={environment.theme}
    >
      {node}
    </HjmProvider>,
  ));
  await settle();
}

/**
 * Waits until images have finished loading or failing and the element count
 * stops changing. Image swaps to its error fallback when the (missing) fixture
 * source responds, and that timing differed between runs on the CI image,
 * so two renders compared mid-swap had different structures.
 */
async function settle(): Promise<void> {
  let previous = -1;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 25)); });
    const images = Array.from(document.body.querySelectorAll("img"));
    const count = document.body.querySelectorAll("*").length;
    if (count === previous && images.every((image) => image.complete)) return;
    previous = count;
  }
}

function isProvider(element: Element): boolean {
  return element.hasAttribute("data-hjm-provider");
}

/** Finds the component's own root: the first element carrying the marker. */
function findMarker(marker: string): HTMLElement {
  const scopes = [container, document.body];
  for (const scope of scopes) {
    for (const element of scope.querySelectorAll<HTMLElement>("*")) {
      if (isProvider(element) && marker !== "data-hjm-provider") continue;
      if (element.classList.contains(marker) || element.tagName.toLowerCase() === marker) return element;
      const attributes = Array.from(element.attributes)
        .map(({ name, value }) => (value === "" ? name : `${name}="${value}"`))
        .join(" ");
      if (attributes.includes(marker)) return element;
    }
  }
  throw new Error(`marker ${marker} not rendered`);
}

function subtree(element: HTMLElement): HTMLElement[] {
  return [element, ...element.querySelectorAll<HTMLElement>("*")];
}

/**
 * Fixtures pass plain HTML triggers (for example a bare <button>) into some
 * components. Those are product content, not the renderer, so the style checks
 * only look at elements that carry an HJM class or data attribute.
 */
function isOwned(element: HTMLElement): boolean {
  return Array.from(element.classList).some((name) => name.startsWith("hjm-")) ||
    Array.from(element.attributes).some(({ name }) => name.startsWith("data-hjm"));
}

function isVisuallyHidden(element: HTMLElement): boolean {
  if (element.closest(".hjm-visually-hidden")) return true;
  const rect = element.getBoundingClientRect();
  return rect.width <= 1 && rect.height <= 1;
}

function isRendered(element: HTMLElement): boolean {
  if (element.closest("[hidden]")) return false;
  const style = getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden";
}

function ownText(element: Element): string {
  return Array.from(element.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? "")
    .join("")
    .trim();
}

const transparent = "rgba(0, 0, 0, 0)";

type Paint = Readonly<{ background: string | null; border: string | null; color: string }>;

function paint(element: HTMLElement): Paint {
  const style = getComputedStyle(element);
  const hasBorder = style.borderTopStyle !== "none" && style.borderTopWidth !== "0px";
  return {
    background: style.backgroundColor === transparent ? null : style.backgroundColor,
    border: hasBorder && style.borderTopColor !== transparent ? style.borderTopColor : null,
    color: style.color,
  };
}

async function snapshot(fixture: DefaultRenderFixture, environment: Environment) {
  await mount(environment, fixture.render());
  const element = findMarker(fixture.marker);
  return subtree(element);
}

function durations(value: string): number[] {
  return value.split(",").map((part) => Number.parseFloat(part) * (part.trim().endsWith("ms") ? 1 : 1000));
}

/**
 * motionPreset.enter/context declare reducedMotion "opacity": under reduced
 * motion a fade may remain, movement may not. So a running animation passes
 * only if its keyframes touch opacity alone.
 */
function keyframesAnimateOnlyOpacity(name: string): boolean {
  for (const sheet of Array.from(document.styleSheets)) {
    for (const rule of Array.from(sheet.cssRules)) {
      if (rule instanceof CSSKeyframesRule && rule.name === name) {
        return Array.from(rule.cssRules).every((frame) => {
          const style = (frame as CSSKeyframeRule).style;
          return Array.from({ length: style.length }, (_, index) => style.item(index)).every((property) => property === "opacity");
        });
      }
    }
  }
  return false;
}

function accessibleName(element: HTMLElement): string {
  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    return labelledBy.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? "").join(" ").trim();
  }
  const label = element.getAttribute("aria-label");
  if (label) return label.trim();
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
    const fromLabels = Array.from(element.labels ?? []).map((node) => node.textContent ?? "").join(" ").trim();
    if (fromLabels) return fromLabels;
  }
  const title = element.getAttribute("title");
  if (title) return title.trim();
  const imageAlt = Array.from(element.querySelectorAll("img[alt]")).map((image) => image.getAttribute("alt")).join(" ");
  return `${element.textContent ?? ""} ${imageAlt}`.trim();
}

const interactiveSelector = [
  "button", "a[href]", "input:not([type=hidden])", "select", "textarea",
  "[role=button]", "[role=link]", "[role=checkbox]", "[role=radio]", "[role=switch]", "[role=tab]",
  "[role=menuitem]", "[role=option]", "[role=combobox]", "[role=slider]", "[role=spinbutton]",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

type Check = (fixture: DefaultRenderFixture, environment: Environment) => Promise<void>;

const checks: Readonly<Record<Exclude<ReactRendererEvidenceScenario, "default" | "keyboard" | "platform-parity">, Check>> = {
  async dark(fixture, environment) {
    const lightElements = await snapshot(fixture, baseline);
    const light = lightElements.map(paint);
    const darkElements = await snapshot(fixture, environment);
    const dark = darkElements.map(paint);
    expect(dark.length, "dark mode must render the same structure").toBe(light.length);
    if (fixture.componentId in themeInvariantPaint) return;
    const darkPalette = paletteColors("dark");
    const changed = dark.some((value, index) => JSON.stringify(value) !== JSON.stringify(light[index]));
    if (!changed) {
      // Components painted only with colors both palettes share (for example a
      // danger badge) legitimately look the same; anything else must repaint.
      darkElements.forEach((element, index) => {
        if (!isOwned(element) || !isRendered(element)) return;
        for (const color of [dark[index]!.background, dark[index]!.border]) {
          if (color !== null) expect(darkPalette.has(color), `${element.className} did not repaint ${color}`).toBe(true);
        }
      });
    }
    darkElements.forEach((element, index) => {
      if (!isOwned(element) || !isRendered(element)) return;
      for (const [slot, color] of Object.entries(dark[index]!)) {
        if (color === null) continue;
        expect(lightOnlyColors.has(color), `${element.className} ${slot} keeps the light-only color ${color}`).toBe(false);
      }
    });
  },
  async "large-text"(fixture, environment) {
    const small = await snapshot(fixture, baseline);
    const smallSizes = small.map((element) => (
      ownText(element) && isOwned(element) && isRendered(element) && !isVisuallyHidden(element)
        ? Number.parseFloat(getComputedStyle(element).fontSize)
        : null
    ));
    const large = await snapshot(fixture, environment);
    large.forEach((element, index) => {
      const before = smallSizes[index];
      if (before === null || before === undefined) return;
      const after = Number.parseFloat(getComputedStyle(element).fontSize);
      expect(after / before, `text "${ownText(element).slice(0, 24)}" did not scale (${before}px -> ${after}px at ${environment.textScale}x)`).toBeGreaterThanOrEqual(1.5);
    });
    const rootElement = large[0]!;
    if (!isVisuallyHidden(rootElement)) {
      // Transforms from running animations (a spinning glyph's rotated box) count
      // toward scrollWidth; pause them so only layout overflow is measured.
      const freeze = document.createElement("style");
      freeze.textContent = "*, *::before, *::after { animation: none !important; transition: none !important; }";
      document.head.append(freeze);
      try {
        expect(rootElement.scrollWidth, "content overflows inline at 2x text").toBeLessThanOrEqual(rootElement.clientWidth + 1);
      } finally {
        freeze.remove();
      }
    }
  },
  async rtl(fixture, environment) {
    const elements = await snapshot(fixture, environment);
    for (const element of elements) {
      if (element.closest("[dir=ltr]") || !isOwned(element)) continue;
      if (Array.from(element.classList).some((name) => name in ltrIsolates)) continue;
      if (element.parentElement?.closest(Object.keys(ltrIsolates).map((name) => `.${name}`).join(","))) continue;
      const style = getComputedStyle(element);
      expect(style.direction, `${element.className} forces ltr`).toBe("rtl");
      expect(["left", "right"], `${element.className} uses physical text-align`).not.toContain(style.textAlign);
    }
  },
  async "reduced-motion"(fixture, environment) {
    const elements = await snapshot(fixture, environment);
    for (const element of elements) {
      if (!isOwned(element)) continue;
      const style = getComputedStyle(element);
      if (style.transitionProperty !== "none") {
        const properties = style.transitionProperty.split(",").map((part) => part.trim());
        const moving = durations(style.transitionDuration).some((duration, index) =>
          duration > 0 && (properties[index] ?? properties[0]) !== "opacity");
        expect(moving, `${element.className} transitions ${style.transitionProperty}`).toBe(false);
      }
      if (style.animationName !== "none") {
        const moving = style.animationName.split(",").map((part) => part.trim()).some((name, index) =>
          (durations(style.animationDuration)[index] ?? 0) > 0 && !keyframesAnimateOnlyOpacity(name));
        expect(moving, `${element.className} animates ${style.animationName}`).toBe(false);
      }
    }
  },
  async accessibility(fixture, environment) {
    const elements = await snapshot(fixture, environment);
    for (const element of elements) {
      for (const attribute of ["aria-label", "aria-describedby", "aria-labelledby"]) {
        expect(element.getAttribute(attribute), `${attribute} is empty`).not.toBe("");
      }
      for (const attribute of ["aria-describedby", "aria-labelledby", "aria-controls"]) {
        for (const id of element.getAttribute(attribute)?.split(/\s+/) ?? []) {
          if (attribute === "aria-controls" && element.getAttribute("aria-expanded") === "false") continue;
          expect(document.getElementById(id), `${attribute} points at missing #${id}`).not.toBeNull();
        }
      }
      if (element instanceof HTMLImageElement) expect(element.hasAttribute("alt"), "img without alt").toBe(true);
      if (element.matches(interactiveSelector) && isRendered(element) && !element.closest("[aria-hidden=true],[inert]")) {
        expect(accessibleName(element), `${element.tagName.toLowerCase()} has no accessible name`).not.toBe("");
      }
    }
  },
  async "long-copy"(fixture, environment) {
    expect(fixture.renderLongCopy, "long-copy needs a fixture that puts the copy in the component").toBeDefined();
    await mount(environment, fixture.renderLongCopy!(longCopy));
    const element = findMarker(fixture.marker);
    const holder = subtree(element).reverse().find((node) => (node.textContent ?? "").includes(longCopy));
    expect(holder, "long copy is not rendered inside the component").toBeDefined();
    // Two pixels absorb sub-pixel rounding in line-clamped labels (buttonRecipe.label.maxLines).
    expect(holder!.scrollWidth, "long copy overflows its box").toBeLessThanOrEqual(holder!.clientWidth + 2);
    expect(element.getBoundingClientRect().width, "component grew past its container").toBeLessThanOrEqual(containerWidth + 1);
  },
};

const fixtures = new Map(defaultRenderFixtures.map((fixture) => [fixture.componentId, fixture]));

/** Claimed matrix cases; the literal ids let the evidence gates find each case. */
const matrixCases = reactRendererEvidence.components.flatMap((component) =>
  component.proofs
    .filter((proof) => proof.file === proofFile)
    .flatMap((proof) => proof.scenarios.map((scenario) => ({ componentId: proof.caseId, scenario }))),
);

describe("@hjmds/react environment scenario proofs", () => {
  it("registers every scenario this file executes", () => {
    const registered = new Set(environments.map(({ id }) => id));
    for (const { componentId, scenario } of matrixCases) {
      expect(registered.has(scenario), `${componentId}:${scenario}`).toBe(true);
      expect(fixtures.has(componentId), componentId).toBe(true);
    }
  });

  it.each(matrixCases)("$componentId $scenario", async ({ componentId, scenario }) => {
    const environment = environments.find(({ id }) => id === scenario)!;
    await checks[scenario as keyof typeof checks](fixtures.get(componentId)!, environment);
  });
});
