import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Button, IconButton } from "../src/actions.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let container: HTMLDivElement;
let root: Root;

function contrast(foreground: string, background: string): number {
  const luminance = (color: string) => {
    const channels = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map((channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
  };
  const values = [luminance(foreground), luminance(background)];
  return (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05);
}

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

describe("visible secondary action boundaries", () => {
  it.each(["light", "dark"] as const)("renders contrasting button and icon outlines in %s mode", async (theme) => {
    await act(async () => root.render(
      <HjmProvider theme={theme}>
        <Button tone="secondary">저장</Button>
        <IconButton label="알림" tone="secondary"><span aria-hidden>●</span></IconButton>
        <IconButton label="더 보기"><span aria-hidden>⋯</span></IconButton>
      </HjmProvider>,
    ));

    const actions = container.querySelectorAll<HTMLButtonElement>("button");
    for (const action of [actions[0]!, actions[1]!]) {
      const style = getComputedStyle(action);
      expect(style.borderTopStyle).toBe("solid");
      expect(Number.parseFloat(style.borderTopWidth)).toBeGreaterThanOrEqual(1);
      expect(contrast(style.borderTopColor, style.backgroundColor)).toBeGreaterThanOrEqual(3);
      expect(contrast(style.color, style.backgroundColor)).toBeGreaterThanOrEqual(4.5);
    }
    const ghost = getComputedStyle(actions[2]!);
    expect(ghost.backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(ghost.borderTopColor).toBe("rgba(0, 0, 0, 0)");
  });
});
