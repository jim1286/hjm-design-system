/**
 * A Web accessibility primitive. Native renderers should prefer the host
 * control's `accessibilityLabel`/`accessibilityHint` rather than mounting a
 * second invisible text node that can be announced out of order.
 */
export const visuallyHiddenRecipe = {
  slots: ["root"] as const,
  geometry: {
    width: 1,
    height: 1,
    margin: -1,
    border: 0,
    padding: 0,
  },
  clipping: "inset(50%)",
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
} as const;

export type VisuallyHiddenContract = typeof visuallyHiddenRecipe;
