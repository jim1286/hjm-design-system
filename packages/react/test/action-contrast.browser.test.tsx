import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Button, IconButton, Link } from "../src/actions.js";
import { Switch } from "../src/selection.js";
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

describe("standalone link touch target", () => {
  it("keeps the minimum touch target on both axes for a short label", async () => {
    await act(async () => root.render(
      <HjmProvider theme="light">
        <Link variant="standalone" href="/write">
          Write
        </Link>
        <Link variant="inline" href="/write">
          문장 안의 링크
        </Link>
      </HjmProvider>,
    ));

    const links = container.querySelectorAll<HTMLAnchorElement>("a");
    const standalone = links[0]!.getBoundingClientRect();
    // 단독 링크는 그 자체가 동작이므로 짧은 라벨에서도 44pt 사각형을 유지한다.
    expect(standalone.height).toBeGreaterThanOrEqual(44);
    expect(standalone.width).toBeGreaterThanOrEqual(44);
    // 문장 안 링크는 글줄을 따라가야 하므로 최소 크기를 강제하지 않는다.
    const inline = links[1]!.getBoundingClientRect();
    expect(inline.height).toBeLessThan(44);
  });
});

/** Pulls the inset hairline colour out of a computed `box-shadow` list. */
function insetHairline(boxShadow: string): string {
  const inset = boxShadow.split(/,(?![^(]*\))/).find((layer) => layer.includes("inset"));
  return inset?.match(/rgba?\([^)]*\)/)?.[0] ?? "";
}

describe("visible switch off state", () => {
  // 꺼짐 스위치는 채도 없는 두 면(트랙 surfaceAlt · 손잡이 bg)으로만 이루어져 있어서,
  // 다크 팔레트에서는 둘 다 카드와 1.2:1 아래로 붙어 컨트롤이 통째로 사라졌다.
  // `switchRecipe.colors`의 trackOffBorder·thumbOffBorder가 그 경계를 이미 계약하고 있었고
  // 이 테스트가 웹 렌더러에서 그 계약이 다시 빠지는 것을 막는다.
  it.each(["light", "dark"] as const)("keeps the off track and thumb legible in %s mode", async (theme) => {
    await act(async () => root.render(
      <HjmProvider theme={theme}>
        {/* 설정 화면의 실제 배치 — 스위치는 카드(`surface`) 위에 앉는다. */}
        <div data-testid="card" style={{ background: "var(--hjm-color-surface)" }}>
          <Switch checked={false} onCheckedChange={() => {}} label="효과음" />
        </div>
      </HjmProvider>,
    ));

    const track = getComputedStyle(container.querySelector(".hjm-switch__track")!);
    const thumb = getComputedStyle(container.querySelector(".hjm-switch__thumb")!);
    const canvas = getComputedStyle(container.querySelector("[data-testid=\"card\"]")!).backgroundColor;

    for (const [surface, style] of [[track.backgroundColor, track], [thumb.backgroundColor, thumb]] as const) {
      const hairline = insetHairline(style.boxShadow);
      expect(hairline).not.toBe("");
      // 경계선은 자기가 감싼 면에서도, 뒤에 깔린 캔버스에서도 보여야 한다 (WCAG 1.4.11).
      expect(contrast(hairline, surface)).toBeGreaterThanOrEqual(3);
      expect(contrast(hairline, canvas)).toBeGreaterThanOrEqual(3);
    }
  });
});
