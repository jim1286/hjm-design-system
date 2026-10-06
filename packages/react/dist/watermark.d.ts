import { type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type WatermarkProps = Readonly<{
    text: string | readonly string[];
    children: ReactNode;
    tileWidth?: number;
    tileHeight?: number;
    rotate?: number;
    opacity?: number;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** React escapes all text; an inline SVG pattern avoids canvas, external requests and markup interpolation. */
export declare function Watermark({ text, children, tileWidth, tileHeight, rotate, opacity, layoutStyle }: WatermarkProps): import("react").JSX.Element;
//# sourceMappingURL=watermark.d.ts.map