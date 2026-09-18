import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { IconButton } from "../src/actions.js";
import { Tabs } from "../src/navigation.js";
import { BottomCTA } from "../src/bottom-cta.js";
import { Carousel } from "../src/carousel.js";
import { control, radius } from "@hjmds/design-contracts/foundations";
import "../src/styles.css";
import "../../../showcase/web/src/showcase.css";

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });

describe("showcase CSS preserves shipped controls", () => {
  it("gives the Carousel card the full track width above its controls", async () => {
    await act(async () => root.render(<HjmProvider><Carousel label="소식" slides={[{ id: "one", label: "첫 소식" }]}
      labels={{ previous: "이전", next: "다음", pause: "멈춤", resume: "재생", navigation: "소식 이동" }}
      composeAccessibleName={({ label }) => label} renderSlide={({ label }) => <p>{label}</p>} /></HjmProvider>));
    const track = container.querySelector(".hjm-carousel__track")!.getBoundingClientRect();
    const controls = container.querySelector(".hjm-carousel__controls")!.getBoundingClientRect();
    const carousel = container.querySelector(".hjm-carousel")!.getBoundingClientRect();
    expect(track.width).toBe(carousel.width);
    expect(controls.top).toBeGreaterThanOrEqual(track.bottom);
  });
  it("keeps BottomCTA in flow without the retired floating demo card", async () => {
    await act(async () => root.render(<HjmProvider><BottomCTA primaryAction={{ label: "저장", onClick: () => {} }} /></HjmProvider>));
    const style = getComputedStyle(container.querySelector(".hjm-bottom-cta")!);
    expect(style.position).toBe("static");
    expect(style.boxShadow).toBe("none");
    expect(style.borderRadius).toBe("0px");
  });
  it("preserves the rounded large icon button instead of the old circular demo", async () => {
    await act(async () => root.render(<HjmProvider><IconButton label="알림" size="large" shape="rounded">♡</IconButton></HjmProvider>));
    const button = container.querySelector<HTMLButtonElement>("button")!;
    expect(button.getBoundingClientRect().width).toBe(control.buttonHeight.large);
    expect(button.getBoundingClientRect().height).toBe(control.buttonHeight.large);
    expect(getComputedStyle(button).borderRadius).toBe(`${radius.md}px`);
  });

  it("keeps tab content below its tab list", async () => {
    await act(async () => root.render(<HjmProvider><Tabs label="보기" defaultValue="first" items={[{ id: "first", label: "목록", panel: <p>목록 내용</p> }, { id: "second", label: "지도", panel: <p>지도 내용</p> }]} /></HjmProvider>));
    const list = container.querySelector<HTMLElement>('[role="tablist"]')!.getBoundingClientRect();
    const panel = container.querySelector<HTMLElement>('[role="tabpanel"]')!.getBoundingClientRect();
    expect(panel.top).toBeGreaterThanOrEqual(list.bottom);
  });
});
