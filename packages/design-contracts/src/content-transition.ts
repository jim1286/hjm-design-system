export type ContentTransitionPreset = "fade" | "rise" | "slide" | "scale";
/** Small local travel preserves context; these are presentation values, never
 * gesture activation thresholds. Retain the existing geometry for compatibility. */
export const contentTransitionMotion = { rise: 12, slide: 16, scale: 0.96 } as const;
/** Bounded travel keeps decorative motion close to the destination.
 * Single-subtree recipes: preserve wrapping, focus and accessible content. */
export function resolveContentTransition(preset: ContentTransitionPreset = "fade", direction: "ltr" | "rtl" = "ltr") {
  switch (preset) {
    case "fade": return { opacity: 0, translateX: 0, translateY: 0, scale: 1 };
    case "rise": return { opacity: 0, translateX: 0, translateY: contentTransitionMotion.rise, scale: 1 };
    case "slide": return { opacity: 0, translateX: (direction === "rtl" ? -1 : 1) * contentTransitionMotion.slide, translateY: 0, scale: 1 };
    case "scale": return { opacity: 0, translateX: 0, translateY: 0, scale: contentTransitionMotion.scale };
    default: throw new TypeError("Unsupported content transition preset");
  }
}

/** Both rectangles must be measured in the same physical viewport coordinates.
 * Router shared-element IDs are not a substitute for a local overlay's geometry. */
export type TransitionRect = Readonly<{ x: number; y: number; width: number; height: number }>;

/** Invert the destination around its center so it starts at the trigger bounds.
 * A renderer interpolates this transform to identity and owns cancellation,
 * measurement freshness, presence and focus; this resolver never clones content. */
export function resolveOriginTransition(
  origin: TransitionRect | null | undefined,
  destination: TransitionRect | null | undefined,
  reducedMotion = false,
): Readonly<{ translateX: number; translateY: number; scaleX: number; scaleY: number }> | null {
  // Missing/zero geometry occurs before layout and after trigger removal. Keep
  // the canonical overlay available instead of throwing or guessing coordinates.
  if (reducedMotion || !origin || !destination) return null;
  for (const rect of [origin, destination]) {
    if (![rect.x, rect.y, rect.width, rect.height].every(Number.isFinite) || rect.width <= 0 || rect.height <= 0) return null;
  }
  const transform = {
    translateX: (origin.x - destination.x) + (origin.width - destination.width) / 2,
    translateY: (origin.y - destination.y) + (origin.height - destination.height) / 2,
    scaleX: origin.width / destination.width,
    scaleY: origin.height / destination.height,
  };
  // Finite measurements can still overflow or underflow during subtraction/division.
  return Object.values(transform).every(Number.isFinite) && transform.scaleX > 0 && transform.scaleY > 0 ? transform : null;
}
