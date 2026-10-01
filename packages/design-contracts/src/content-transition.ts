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
