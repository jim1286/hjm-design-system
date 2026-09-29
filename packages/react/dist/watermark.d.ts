import { type ReactNode } from "react";
export type WatermarkProps = Readonly<{
    text: string | readonly string[];
    children: ReactNode;
    tileWidth?: number;
    tileHeight?: number;
    rotate?: number;
    opacity?: number;
}>;
/** React escapes all text; an inline SVG pattern avoids canvas, external requests and markup interpolation. */
export declare function Watermark({ text, children, tileWidth, tileHeight, rotate, opacity }: WatermarkProps): import("react").JSX.Element;
//# sourceMappingURL=watermark.d.ts.map