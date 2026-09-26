import type { ReactNode } from "react";
import { act, create, type ReactTestRendererJSON } from "react-test-renderer";
import { resolveDesignSystemProviderValue } from "@hjmds/design-contracts/components/design-system-provider";
import { describe, expect, it } from "vitest";
import { HjmNativeProvider } from "../src/index.js";
import { reactNativeRendererEvidence, type ReactNativeRendererEvidenceScenario } from "../src/evidence.js";
import { defaultRenderCases, type DefaultRenderCase } from "./default-render-fixtures.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };
import { startedAnimatedTimings } from "./react-native.mock.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * Environment scenario proof for every React Native evidence claim.
 *
 * These run against the test renderer and a react-native stub, so they read the
 * resolved style objects and props in the rendered host tree. They prove that a
 * component takes its colors, type sizes, direction and motion from the
 * provider. They do not prove device layout, TalkBack or VoiceOver behavior;
 * that stays with product device QA.
 */
type Environment = Readonly<{
  id: ReactNativeRendererEvidenceScenario;
  theme: "light" | "dark";
  direction: "ltr" | "rtl";
  textScale: number;
  reducedMotion: boolean;
}>;

const proofFile = "test/scenario-matrix.test.tsx";
const environments = executedScenarioRegistry.executions.find(
  (execution) => execution.proofFile === proofFile,
)!.scenarios as readonly Environment[];
const baseline: Environment = { id: "default", theme: "light", direction: "ltr", textScale: 1, reducedMotion: false };
const longCopy = "An unusually long product sentence with verylongunbrokenidentifierlikewordsthatmustwrap and a second clause that keeps going past one line.";

type HostNode = Readonly<{ type: string; props: Record<string, unknown>; raw: ReactTestRendererJSON }>;

function render(environment: Environment, node: ReactNode): HostNode[] {
  let json: ReactTestRendererJSON | ReactTestRendererJSON[] | null = null;
  let renderer: ReturnType<typeof create> | undefined;
  act(() => {
    renderer = create(
      <HjmNativeProvider
        direction={environment.direction}
        reducedMotion={environment.reducedMotion}
        textScale={environment.textScale}
        theme={environment.theme}
      >
        {node}
      </HjmNativeProvider>,
      { createNodeMock: () => ({}) },
    );
  });
  json = renderer!.toJSON();
  act(() => { renderer!.unmount(); });
  const nodes: HostNode[] = [];
  const visit = (value: ReactTestRendererJSON | string) => {
    if (typeof value === "string") return;
    nodes.push({ type: value.type, props: value.props, raw: value });
    for (const child of value.children ?? []) visit(child);
  };
  for (const value of Array.isArray(json) ? json : json ? [json] : []) visit(value);
  return nodes;
}

function flatStyle(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flatStyle));
  if (style && typeof style === "object") return style as Record<string, unknown>;
  return {};
}

function textOf(node: ReactTestRendererJSON | string): string {
  if (typeof node === "string") return node;
  return (node.children ?? []).map(textOf).join("");
}

function paletteColors(theme: "light" | "dark"): Set<string> {
  const { palette } = resolveDesignSystemProviderValue({ theme }, { systemTheme: theme });
  return new Set([...Object.values(palette.theme), ...Object.values(palette.statusAccents)].map((color) => color.toLowerCase()));
}

const lightOnlyColors = (() => {
  const dark = paletteColors("dark");
  return new Set([...paletteColors("light")].filter((color) => !dark.has(color)));
})();

/** Color-valued style keys and props, including Switch's trackColor/thumbColor. */
function colorsOf(node: HostNode): string[] {
  const values: unknown[] = [];
  for (const [key, value] of Object.entries(flatStyle(node.props.style))) {
    if (/color$/i.test(key)) values.push(value);
  }
  for (const [key, value] of Object.entries(node.props)) {
    if (key === "style" || !/color$/i.test(key)) continue;
    if (value && typeof value === "object") values.push(...Object.values(value));
    else values.push(value);
  }
  return values.filter((value): value is string => typeof value === "string").map((value) => value.toLowerCase());
}

const physicalPairs = [
  ["marginLeft", "marginRight"],
  ["paddingLeft", "paddingRight"],
  ["left", "right"],
  ["borderLeftWidth", "borderRightWidth"],
  ["borderTopLeftRadius", "borderTopRightRadius"],
  ["borderBottomLeftRadius", "borderBottomRightRadius"],
] as const;

/**
 * Components that mirror an absolute position by computing it from the
 * direction rather than by swapping left/right. Each needs a reason.
 */
const positionMirroredByComputation: Readonly<Record<string, string>> = {
  slider: "The thumb uses left with a direction-mirrored fraction (visualFraction); the test renderer has no layout width to observe it.",
};

const interactiveRoles = new Set(["button", "link", "checkbox", "radio", "switch", "tab", "menuitem", "adjustable", "combobox", "togglebutton"]);

type Check = (item: DefaultRenderCase, environment: Environment) => void;

const checks: Readonly<Record<Exclude<ReactNativeRendererEvidenceScenario, "default" | "keyboard" | "platform-parity">, Check>> = {
  dark(item, environment) {
    const light = render(baseline, item.render());
    const dark = render(environment, item.render());
    expect(dark.length, "dark mode must render the same structure").toBe(light.length);
    const darkPalette = paletteColors("dark");
    const changed = dark.some((node, index) => colorsOf(node).join() !== colorsOf(light[index]!).join());
    for (const node of dark) {
      for (const color of colorsOf(node)) {
        expect(lightOnlyColors.has(color), `${node.type} keeps the light-only color ${color}`).toBe(false);
        if (!changed && color.startsWith("#")) {
          expect(darkPalette.has(color), `${node.type} did not repaint ${color}`).toBe(true);
        }
      }
    }
  },
  "large-text"(item, environment) {
    const small = render(baseline, item.render());
    const large = render(environment, item.render());
    expect(large.length).toBe(small.length);
    small.forEach((node, index) => {
      if (node.type !== "Text") return;
      const before = flatStyle(node.props.style).fontSize;
      const after = flatStyle(large[index]!.props.style).fontSize;
      if (typeof before !== "number") return;
      expect(typeof after === "number" ? after / before : 0, `Text "${textOf(node.raw).slice(0, 24)}" did not scale`).toBeGreaterThanOrEqual(1.5);
    });
  },
  rtl(item, environment) {
    const ltr = render(baseline, item.render());
    const rtl = render(environment, item.render());
    expect(rtl.length).toBe(ltr.length);
    ltr.forEach((node, index) => {
      const before = flatStyle(node.props.style);
      const after = flatStyle(rtl[index]!.props.style);
      for (const [start, end] of physicalPairs) {
        if (before[start] === before[end]) continue;
        if (start === "left" && item.componentId in positionMirroredByComputation) continue;
        expect([after[start], after[end]], `${node.type} ${start}/${end} is not mirrored`).toEqual([before[end], before[start]]);
      }
      if (before.textAlign === "left" || before.textAlign === "right") {
        expect(after.textAlign, `${node.type} textAlign is not mirrored`).toBe(before.textAlign === "left" ? "right" : "left");
      }
    });
  },
  "reduced-motion"(item, environment) {
    startedAnimatedTimings.length = 0;
    render(environment, item.render());
    const moving = startedAnimatedTimings.filter(({ duration }) => duration > 0);
    expect(moving.map(({ duration }) => duration), "animations started with reduced motion").toEqual([]);
  },
  accessibility(item, environment) {
    const nodes = render(environment, item.render());
    for (const node of nodes) {
      for (const key of ["accessibilityLabel", "aria-label", "accessibilityHint"]) {
        expect(node.props[key], `${node.type} ${key} is empty`).not.toBe("");
      }
      const role = (node.props.accessibilityRole ?? node.props.role) as string | undefined;
      const interactive = node.type === "Pressable" || node.type === "TextInput" || (role !== undefined && interactiveRoles.has(role));
      if (!interactive || node.props.accessibilityElementsHidden === true || node.props.importantForAccessibility === "no-hide-descendants") continue;
      const name = (node.props.accessibilityLabel ?? node.props["aria-label"] ?? "") as string;
      const content = textOf(node.raw).trim();
      expect(`${name}${content}`.trim(), `${node.type} (${role ?? "no role"}) has no accessible name`).not.toBe("");
    }
  },
  "long-copy"(item, environment) {
    expect(item.renderLongCopy, "long-copy needs a case that puts the copy in the component").toBeDefined();
    const nodes = render(environment, item.renderLongCopy!(longCopy));
    const holders = nodes.filter((node) => node.type === "Text" && textOf(node.raw).includes(longCopy));
    expect(holders.length, "long copy is not rendered in a Text").toBeGreaterThan(0);
    const innermost = holders.at(-1)!;
    const lines = innermost.props.numberOfLines;
    expect(lines === undefined || (typeof lines === "number" && lines >= 2), "long copy is truncated to one line").toBe(true);
  },
};

const cases = new Map<string, DefaultRenderCase>(defaultRenderCases.map((item) => [item.componentId, item]));

const matrixCases = reactNativeRendererEvidence.components.flatMap((component) =>
  component.proofs
    .filter((proof) => proof.file === proofFile)
    .flatMap((proof) => proof.scenarios.map((scenario) => ({ componentId: proof.caseId, scenario }))),
);

describe("@hjmds/react-native environment scenario proofs", () => {
  it("registers every scenario this file executes", () => {
    const registered = new Set(environments.map(({ id }) => id));
    for (const { componentId, scenario } of matrixCases) {
      expect(registered.has(scenario), `${componentId}:${scenario}`).toBe(true);
      expect(cases.has(componentId), componentId).toBe(true);
    }
  });

  it.each(matrixCases)("$componentId $scenario", ({ componentId, scenario }) => {
    const environment = environments.find(({ id }) => id === scenario)!;
    checks[scenario as keyof typeof checks](cases.get(componentId)!, environment);
  });
});
