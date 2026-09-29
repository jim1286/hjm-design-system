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
    expect(store.getSnapshot().visible[0]?.timer.remainingMs).toBe(5000);
    store.resumeAll("occlusion"); store.advanceTime(3000); store.publish({ ...toast("a"), description: "완료" });
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
    expect(island.anchorY).toBe(-55); expect(island.cardTop).toBeCloseTo(16.33);
    const capsule = resolveLiquidToastLayout(input);
    expect(capsule.anchorWidth).toBe(88); expect(capsule.cardTop).toBe(58);
    expect(resolveLiquidToastLayout({ ...input, windowOrigin: { x: 200, y: 0 } }).anchorWidth).toBe(88);
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
    expect(final).toMatchObject({ width: 288, height: 170, y: 58, neckWidth: 0, offsetY: 0 });
    expect(buildLiquidToastGeometry(0.4, 0, layout).neckWidth).toBeGreaterThan(0);
  });
});
