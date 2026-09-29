import { cdp } from "vitest/browser";

/**
 * Real Chromium touch tap through CDP, so the browser produces the native
 * pointerdown(touch) -> focus -> click(touch) order. Synthetic PointerEvents
 * cannot reproduce the focus-then-click race the 2026-09-30 responsive audit
 * found. Coordinates are mapped from this test iframe to the top page.
 */
export async function tap(element: Element): Promise<void> {
  const rect = element.getBoundingClientRect();
  const frame = window.frameElement as HTMLElement | null;
  const frameRect = frame?.getBoundingClientRect();
  const scale = frameRect ? frameRect.width / window.innerWidth : 1;
  const x = (frameRect?.left ?? 0) + (rect.left + rect.width / 2) * scale;
  const y = (frameRect?.top ?? 0) + (rect.top + rect.height / 2) * scale;
  await tapAt(x, y);
}

/** Taps a top-page point; use `tap` unless the target is not an element. */
export async function tapAt(x: number, y: number): Promise<void> {
  // vitest types CDPSession as an empty interface; the Playwright provider's
  // session exposes the raw protocol `send`.
  const session = cdp() as unknown as { send(method: string, params: object): Promise<unknown> };
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await new Promise((resolve) => setTimeout(resolve, 50));
}

/**
 * Real hit-test extent around the element's centre, sampled like the audit's
 * 44px census: returns true only if every point within `size / 2 - 1` of the
 * centre on both axes lands on the element (or its pseudo-element slop).
 */
export function hasHitArea(element: Element, size = 44): boolean {
  const rect = element.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const reach = size / 2 - 1;
  const points: Array<[number, number]> = [[cx - reach, cy], [cx + reach, cy], [cx, cy - reach], [cx, cy + reach]];
  return points.every(([x, y]) => {
    const hit = document.elementFromPoint(x, y);
    return hit !== null && (hit === element || element.contains(hit));
  });
}
