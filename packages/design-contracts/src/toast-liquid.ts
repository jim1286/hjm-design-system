/**
 * Geometry adapted from rit3zh/expo-dynamic-notifications, commit 5de059a5cbef.
 * The MIT notice is shipped in THIRD_PARTY_NOTICES.md. See docs/plans/liquid-toast.md.
 * Kept separate from the lifecycle: animation must never own a second queue.
 */
export const liquidToastRecipe = {
  // 2026-10-02: use a circular in-app origin rather than a second Dynamic Island.
  // Keep the public capsule key; changing geometry does not require callers to migrate.
  capsule: { width: 32, height: 32 },
  // Preserve the settled card top (58) when increasing the anchor height from 24 to 32.
  gap: 26,
  minHeight: 74,
  maxWidth: 396,
  // 2026-10-02 card redesign: the medium 12-unit corner supports a banner silhouette.
  radius: 12,
  dropSize: 52,
  neckWidth: 60,
  blur: 14.3,
  gain: 22,
  threshold: 0.43,
  // These intentionally exceed general HJM motion: the neck needs time to separate.
  // Original choreography is the comparison baseline, not a new global motion scale.
  spring: {
    drop: { duration: 1150, dampingRatio: 0.82 },
    expand: { duration: 1000, dampingRatio: 0.8 },
    reveal: { duration: 700, dampingRatio: 1 },
    tint: { duration: 700, dampingRatio: 1 },
    collapse: { duration: 660, dampingRatio: 0.92, velocity: 2 },
    return: { duration: 1150, dampingRatio: 0.9 },
    fade: { duration: 360, dampingRatio: 1 },
    drag: { duration: 560, dampingRatio: 0.7 },
  },
  // Keep the drop anchor-colored through descent; early tint looked like a gray blob on iPhone 17 (2026-09-30).
  delay: { tint: 420, expand: 340, reveal: 560, collapse: 100, return: 280 },
  swipe: { distance: -18, velocity: -420 },
} as const;

/** Island frames are explicitly verified window coordinates, never inferred from insets. */
export type LiquidToastAnchor = Readonly<{ kind: "capsule" }> | Readonly<{
  kind: "island";
  frame: Readonly<{ x: number; y: number; width: number; height: number }>;
}>;

export function validateLiquidToastAnchor(anchor: LiquidToastAnchor): void {
  if (anchor.kind === "capsule") return;
  if (anchor.kind !== "island") throw new TypeError("Unsupported liquid toast anchor");
  const frame = anchor.frame;
  if (!frame || ![frame.x, frame.y, frame.width, frame.height].every(Number.isFinite) || frame.x < 0 || frame.y < 0 || frame.width <= 0 || frame.height <= 0) {
    throw new RangeError("Liquid Toast island frame must be finite with positive dimensions");
  }
}

export type LiquidToastLayout = Readonly<{
  width: number; height: number; cardWidth: number; cardTop: number; cardLeft: number;
  anchorX: number; anchorY: number; anchorWidth: number; anchorHeight: number;
  canvasTop: number; canvasHeight: number; fits: boolean;
}>;

export function resolveLiquidToastLayout(input: Readonly<{
  width: number; height: number; availableHeight: number; anchor: LiquidToastAnchor;
  windowOrigin?: Readonly<{ x: number; y: number }>;
}>): LiquidToastLayout {
  const { width, height, availableHeight, anchor, windowOrigin } = input;
  validateLiquidToastAnchor(anchor);
  if (![width, height, availableHeight].every(Number.isFinite) || width < 0 || height < 0 || availableHeight < 0) {
    throw new RangeError("Liquid Toast measurements must be finite and non-negative");
  }
  let anchorWidth: number = liquidToastRecipe.capsule.width;
  let anchorHeight: number = liquidToastRecipe.capsule.height;
  let anchorX = (width - anchorWidth) / 2;
  let anchorY = 0;
  if (anchor.kind === "island" && windowOrigin) {
    const x = anchor.frame.x - windowOrigin.x;
    const y = anchor.frame.y - windowOrigin.y;
    // Rotation/stale host measurements fall back to capsule instead of drawing over a cutout.
    if (x >= 0 && x + anchor.frame.width <= width && y + anchor.frame.height <= availableHeight) {
      anchorX = x; anchorY = y; anchorWidth = anchor.frame.width; anchorHeight = anchor.frame.height;
    }
  }
  const cardWidth = Math.min(width, liquidToastRecipe.maxWidth);
  const cardTop = Math.max(0, anchorY + anchorHeight + liquidToastRecipe.gap);
  const canvasTop = Math.min(0, anchorY) - liquidToastRecipe.blur * 2;
  return {
    width, height, cardWidth, cardTop, cardLeft: (width - cardWidth) / 2,
    anchorX, anchorY, anchorWidth, anchorHeight, canvasTop,
    canvasHeight: cardTop + height - canvasTop + 32,
    fits: width >= 240 && height > 0 && cardTop + height <= availableHeight,
  };
}

export function buildLiquidToastGeometry(drop: number, expand: number, layout: LiquidToastLayout) {
  "worklet";
  const clamp = (n: number) => Math.max(0, Math.min(1, n));
  const mix = (a: number, b: number, t: number) => a + (b - a) * t;
  const grow = 1 - (1 - clamp(drop / 0.7)) ** 1.25;
  const n = clamp(drop / 0.82);
  const peak = 1.6 / 3;
  const normal = peak ** 1.6 * (1 - peak) ** 1.4;
  const neck = n <= 0 || n >= 1 ? 0 : (n ** 1.6 * (1 - n) ** 1.4) / normal;
  const stretch = 1 + 0.38 * neck;
  const droplet = liquidToastRecipe.dropSize * grow;
  const width = Math.max(0, Math.min(layout.width, mix(droplet / stretch, layout.cardWidth, expand)));
  const height = Math.max(0, mix(droplet * stretch, layout.height, expand));
  const originY = layout.anchorY + layout.anchorHeight * 0.66;
  const centerY = mix(originY, layout.cardTop + layout.height / 2, drop);
  const centerX = mix(layout.anchorX + layout.anchorWidth / 2, layout.width / 2, clamp(expand));
  const neckWidth = Math.max(0, Math.min(liquidToastRecipe.neckWidth, width) * neck);
  const neckY = layout.anchorY + layout.anchorHeight / 2;
  return {
    x: centerX - width / 2, y: centerY - height / 2, width, height,
    radius: Math.max(0, Math.min(mix(droplet / 2, liquidToastRecipe.radius, expand), width / 2, height / 2)),
    neckX: layout.anchorX + layout.anchorWidth / 2 - neckWidth / 2,
    neckY, neckWidth, neckHeight: Math.max(0, centerY - neckY),
    offsetY: centerY - (layout.cardTop + layout.height / 2),
  };
}
