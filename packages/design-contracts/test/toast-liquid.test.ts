import { describe, expect, it, vi } from "vitest";
import { buildLiquidToastGeometry, createToastStore, resolveLiquidToastLayout, resolveToastDescriptor, validateLiquidToastAnchor, type ToastDescriptor } from "../src/toast.js";

const toast = (id: string): ToastDescriptor => ({ id, description: id, closeLabel: "닫기", presentation: "liquid" });
describe("Liquid presentation contract", () => {
  it("is opt-in and keeps lifecycle semantics across updates and independent pauses", () => {
    expect(resolveToastDescriptor({ ...toast("a"), presentation: undefined } as unknown as ToastDescriptor).presentation).toBe("standard");
    expect(() => resolveToastDescriptor({ ...toast("a"), presentation: "other" as never })).toThrow();
    const store = createToastStore();
    store.publish(toast("a")); store.pause("a", "presentation"); store.pauseAll("occlusion");
    store.advanceTime(2000); store.resume("a", "presentation"); store.advanceTime(2000);
    expect(store.getSnapshot().visible[0]?.timer.remainingMs).toBe(3000);
    store.resumeAll("occlusion"); store.advanceTime(1000); store.publish({ ...toast("a"), description: "완료" });
    expect(store.getSnapshot().visible[0]?.timer.remainingMs).toBe(2000);
    expect(store.getSnapshot().visible[0]?.descriptor.presentation).toBe("liquid");
    const dismissed = vi.fn(); store.publish({ ...toast("b"), onDismiss: dismissed });
    store.advanceTime(2000); expect(store.getSnapshot().visible[0]?.phase).toBe("closing");
    store.completeExit("a"); expect(store.getSnapshot().visible[0]?.descriptor.id).toBe("b");
    store.dispose(); expect(dismissed).toHaveBeenCalledExactlyOnceWith("interrupted");
  });

  it("uses explicit window frames and a capsule for stale measurements", () => {
    const input = { width: 358, height: 112, availableHeight: 650, anchor: { kind: "island", frame: { x: 132, y: 12, width: 126, height: 37.33 } } as const };
    const island = resolveLiquidToastLayout({ ...input, windowOrigin: { x: 16, y: 67 } });
    expect(island.anchorY).toBe(-55); expect(island.cardTop).toBeCloseTo(8.33);
    const capsule = resolveLiquidToastLayout(input);
    expect(capsule.anchorHeight).toBe(capsule.anchorWidth);
    expect(capsule.anchorWidth).toBe(32); expect(capsule.cardTop).toBe(58);
    expect(resolveLiquidToastLayout({ ...input, windowOrigin: { x: 200, y: 0 } }).anchorWidth).toBe(32);
    expect(resolveLiquidToastLayout({ ...input, height: 650 }).fits).toBe(false);
    expect(() => validateLiquidToastAnchor({ kind: "island", frame: { x: 0, y: 0, width: NaN, height: 10 } })).toThrow();
    expect(() => validateLiquidToastAnchor({ kind: "island", frame: {} } as never)).toThrow();
  });

  it("keeps drop, neck and radius finite through overshoot and resolves the measured final card", () => {
    const layout = resolveLiquidToastLayout({ width: 288, height: 170, availableHeight: 560, anchor: { kind: "capsule" } });
    for (const drop of [-0.1, 0, 0.2, 0.5, 0.82, 1, 1.15]) for (const expand of [-0.1, 0, 0.5, 1, 1.12]) {
      const g = buildLiquidToastGeometry(drop, expand, layout);
      expect(Object.values(g).every(Number.isFinite)).toBe(true);
      expect(g.radius).toBeGreaterThanOrEqual(0); expect(g.neckWidth).toBeGreaterThanOrEqual(0);
      expect(g.width).toBeLessThanOrEqual(288);
    }
    const final = buildLiquidToastGeometry(1, 1, layout);
    expect(final).toMatchObject({ width: 288, height: 170, y: 58, radius: 12, neckWidth: 0, offsetY: 0 });
    expect(buildLiquidToastGeometry(0.4, 0, layout).neckWidth).toBeGreaterThan(0);
  });

  it("uses a supplied settled corner without changing the origin or exceeding measured bounds", () => {
    const layout = resolveLiquidToastLayout({ width: 288, height: 112, availableHeight: 650, anchor: { kind: "capsule" } });
    for (const radius of [0, 24, 48, 300]) {
      const initial = buildLiquidToastGeometry(0.5, 0, layout, radius);
      expect(initial).toEqual(buildLiquidToastGeometry(0.5, 0, layout));
      const settled = buildLiquidToastGeometry(1, 1, layout, radius);
      expect(settled).toMatchObject({ x: 0, y: 58, width: 288, height: 112, radius: Math.min(radius, 56) });
      for (const expand of [-0.1, 0.25, 0.5, 0.75, 1.1]) {
        const frame = buildLiquidToastGeometry(0.8, expand, layout, radius);
        expect(frame.radius).toBeGreaterThanOrEqual(0);
        expect(frame.radius).toBeLessThanOrEqual(Math.min(frame.width, frame.height) / 2);
      }
    }
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])("rejects invalid settled corner %s", radius => {
    const layout = resolveLiquidToastLayout({ width: 288, height: 112, availableHeight: 650, anchor: { kind: "capsule" } });
    expect(() => buildLiquidToastGeometry(1, 1, layout, radius)).toThrow(RangeError);
  });
});
