import type { ReactNode } from "react";
import type { NativeIconRenderProps } from "./primitives.js";
/**
 * Draws an HJM semantic mark inside Icon's frame. Icon still owns naming, size, tone and RTL mirroring; this only
 * paints the shared geometry with the resolved size, color and stroke.
 */
export declare function renderSemanticGlyph({ name, size, color, strokeWidth }: NativeIconRenderProps<string>): ReactNode;
//# sourceMappingURL=icon-svg.d.ts.map