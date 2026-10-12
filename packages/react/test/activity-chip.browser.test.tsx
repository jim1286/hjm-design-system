import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page } from "vitest/browser";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { activityChipRecipe, toastRecipe } from "@hjmds/design-contracts";
import { ActivityChip } from "../src/activity-chip.js";
import { HjmProvider } from "../src/provider.js";
import { Toast } from "../src/toast.js";
import "../src/styles.css";

let host: HTMLDivElement, root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });

const mascot = <svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" /></svg>;

describe("ActivityChip", () => {
  it("is a 44px disclosure button with hidden media and a one-line label", async () => {
    const onClick = vi.fn();
    await act(async () => root.render(<HjmProvider>
      <ActivityChip label="다듬는 중이에요 오래 걸리는 긴 상태 문구" accessibilityLabel="똑쟁이가 앱을 다듬는 중, 자세히 보기" expanded media={mascot} onClick={onClick} />
    </HjmProvider>));
    const chip = host.querySelector<HTMLButtonElement>(".hjm-activity-chip")!;
    expect(chip.type).toBe("button");
    expect(chip.getAttribute("aria-expanded")).toBe("true");
    expect(chip.getAttribute("aria-label")).toBe("똑쟁이가 앱을 다듬는 중, 자세히 보기");
    expect(chip.querySelector(".hjm-activity-chip__media")!.getAttribute("aria-hidden")).toBe("true");
    const box = chip.getBoundingClientRect();
    expect(box.height).toBeGreaterThanOrEqual(activityChipRecipe.root.minHeight);
    expect(box.width).toBeLessThanOrEqual(activityChipRecipe.root.maxWidth + 0.5);
    const media = chip.querySelector(".hjm-activity-chip__media")!.getBoundingClientRect();
    expect(media.width).toBe(activityChipRecipe.media.size);
    const label = chip.querySelector<HTMLElement>(".hjm-activity-chip__label")!;
    expect(label.getBoundingClientRect().height).toBeLessThanOrEqual(parseFloat(getComputedStyle(label).lineHeight) + 1);
    chip.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("uses the brand pair for emphasis and omits a duplicate accessible name", async () => {
    await act(async () => root.render(<HjmProvider><ActivityChip label="완료" emphasis="emphasis" /></HjmProvider>));
    const chip = host.querySelector<HTMLButtonElement>(".hjm-activity-chip")!;
    expect(chip.getAttribute("aria-expanded")).toBe("false");
    expect(chip.hasAttribute("aria-label")).toBe(false);
    expect(getComputedStyle(chip).backgroundColor).not.toBe(getComputedStyle(document.body).backgroundColor);
    expect(chip.dataset.emphasis).toBe("emphasis");
  });
});

describe("panel toast", () => {
  it("replaces the tone badge with media, lists progress steps and starts the action under the copy", async () => {
    await page.viewport(390, 844);
    await act(async () => root.render(<HjmProvider>
      <Toast
        descriptor={{
          id: "review",
          title: "똑쟁이",
          description: "앱을 다듬는 중이에요",
          durationMs: null,
          media: mascot,
          progress: { steps: ["읽기", "다듬기", "확인"], current: 1 },
          action: { label: "결과 보기", onAction() {} },
          closeLabel: "닫기",
        }}
        onDismissRequest={() => {}}
      />
    </HjmProvider>));
    const toast = host.querySelector<HTMLElement>(".hjm-toast")!;
    expect(toast.querySelector(".hjm-toast__icon")).toBeNull();
    const media = toast.querySelector<HTMLElement>(".hjm-toast__media")!;
    expect(media.getAttribute("aria-hidden")).toBe("true");
    expect(media.getBoundingClientRect().width).toBe(toastRecipe.media.size);
    const steps = [...toast.querySelectorAll<HTMLElement>(".hjm-toast__progress-step")];
    expect(steps.map(step => step.dataset.state)).toEqual(["done", "current", "upcoming"]);
    expect(steps[1]!.getAttribute("aria-current")).toBe("step");
    expect(toast.querySelector(".hjm-visually-hidden")!.textContent).toBe("똑쟁이. 앱을 다듬는 중이에요. 다듬기");
    const copy = toast.querySelector(".hjm-toast__content")!.getBoundingClientRect();
    const action = toast.querySelector(".hjm-toast__action")!.getBoundingClientRect();
    expect(action.top).toBeGreaterThanOrEqual(copy.bottom - 1);
    expect(Math.abs(action.left - copy.left)).toBeLessThanOrEqual(1);
    expect(getComputedStyle(toast).borderTopLeftRadius).toBe("24px");
    expect(toast.scrollWidth).toBeLessThanOrEqual(toast.clientWidth);
  });
});
