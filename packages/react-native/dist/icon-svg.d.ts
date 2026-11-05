import type { ReactNode } from "react";
import { type LucideIcon } from "lucide-react-native";
import type { NativeIconRenderProps } from "./primitives.js";
export declare const semanticIconGlyphs: {
    readonly add: LucideIcon;
    readonly ai: LucideIcon;
    readonly alert: LucideIcon;
    readonly arrowDown: LucideIcon;
    readonly arrowUp: LucideIcon;
    readonly back: LucideIcon;
    readonly calendar: LucideIcon;
    readonly check: LucideIcon;
    readonly chevronDown: LucideIcon;
    readonly chevronEnd: LucideIcon;
    readonly chevronStart: LucideIcon;
    readonly chevronUp: LucideIcon;
    readonly close: LucideIcon;
    readonly compare: LucideIcon;
    readonly copy: LucideIcon;
    readonly delete: LucideIcon;
    readonly download: LucideIcon;
    readonly edit: LucideIcon;
    readonly error: LucideIcon;
    readonly favorite: LucideIcon;
    readonly filter: LucideIcon;
    readonly forward: LucideIcon;
    readonly help: LucideIcon;
    readonly home: LucideIcon;
    readonly info: LucideIcon;
    readonly lock: LucideIcon;
    readonly menu: LucideIcon;
    readonly more: LucideIcon;
    readonly moreVertical: LucideIcon;
    readonly notifications: LucideIcon;
    readonly pause: LucideIcon;
    readonly play: LucideIcon;
    readonly refresh: LucideIcon;
    readonly rotate: LucideIcon;
    readonly search: LucideIcon;
    readonly settings: LucideIcon;
    readonly share: LucideIcon;
    readonly success: LucideIcon;
    readonly trendDown: LucideIcon;
    readonly trendFlat: LucideIcon;
    readonly trendUp: LucideIcon;
    readonly unblock: LucideIcon;
    readonly upload: LucideIcon;
    readonly user: LucideIcon;
    readonly users: LucideIcon;
    readonly visibility: LucideIcon;
    readonly visibilityOff: LucideIcon;
    readonly warning: LucideIcon;
};
/**
 * Draws an HJM semantic mark inside Icon's frame. Icon still owns naming, size, tone and RTL mirroring; this only
 * paints the Lucide glyph with the resolved size, color and stroke and hides it from assistive technology.
 */
export declare function renderSemanticGlyph({ name, size, color, strokeWidth }: NativeIconRenderProps<string>): ReactNode;
//# sourceMappingURL=icon-svg.d.ts.map