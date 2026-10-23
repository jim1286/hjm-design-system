import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { NotificationBell } from "../src/notification-bell.js";
import "../src/styles.css";

// 2026-10-23 web check (BurnTok home): the medium badge at the bell's top-end corner covered 82% of the 18px glyph.
// iconButtonRecipe.badge keeps the badge on the button's end edge, raised so only its floating ring reaches the glyph.
let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  container.style.cssText = "padding:24px";
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

// A glyph that fills the small IconButton's whole 20px slot: the worst case for coverage.
const glyph = <svg data-glyph width="20" height="20" viewBox="0 0 20 20"><rect width="20" height="20" /></svg>;

function overlapArea(a: DOMRect, b: { left: number; right: number; top: number; bottom: number }): number {
  const width = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const height = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return width > 0 && height > 0 ? width * height : 0;
}

describe("NotificationBell badge placement", () => {
  for (const direction of ["ltr", "rtl"] as const) {
    for (const minimumVisualTarget of [false, true]) {
      it(`keeps the count plate off the glyph (${direction}, minimumVisualTarget ${minimumVisualTarget})`, async () => {
        for (const count of [3, 27, 120]) {
          await act(async () => root.render(
            <HjmProvider direction={direction} minimumVisualTarget={minimumVisualTarget}>
              <NotificationBell label={`${count} unread`} count={count} icon={glyph} onPress={() => {}} />
            </HjmProvider>,
          ));
          const button = container.querySelector<HTMLButtonElement>(".hjm-icon-button")!.getBoundingClientRect();
          const icon = container.querySelector("[data-glyph]")!.getBoundingClientRect();
          const badgeNode = container.querySelector<HTMLElement>(".hjm-counter-badge")!;
          const badge = badgeNode.getBoundingClientRect();
          const ring = parseFloat(getComputedStyle(badgeNode).borderTopWidth);
          expect(badge.height).toBe(16);
          expect(ring).toBe(2);
          // The colored plate (inside the canvas ring) never covers the glyph; the ring touches at most its top rows.
          const plate = { left: badge.left + ring, right: badge.right - ring, top: badge.top + ring, bottom: badge.bottom - ring };
          expect(overlapArea(icon, plate)).toBe(0);
          expect(overlapArea(icon, badge) / (icon.width * icon.height)).toBeLessThanOrEqual(0.1);
          // Anchored to the button's end edge: wider counts grow toward the start, never past an edge-aligned inset.
          if (direction === "ltr") expect(badge.right).toBeCloseTo(button.right, 0);
          else expect(badge.left).toBeCloseTo(button.left, 0);
        }
      });
    }
  }
});
