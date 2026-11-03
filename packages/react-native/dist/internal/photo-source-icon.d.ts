import type { PhotoSource } from "@hjmds/design-contracts/screen-patterns";
/** Built-in source marks use Views so opening the core sheet never requires an optional SVG peer. */
export declare function PhotoSourceIcon({ source }: {
    source: PhotoSource;
}): import("react").JSX.Element;
/**
 * The source mark without its plate, for a quiet inline action (PhotoAttachmentField's choose button, 2026-11-03).
 * `background` fills the overlapping frame so the back frame's line does not show through.
 */
export declare function PhotoSourceGlyph({ source, color, background, size }: Readonly<{
    source: PhotoSource;
    color: string;
    background: string;
    size?: number;
}>): import("react").JSX.Element;
//# sourceMappingURL=photo-source-icon.d.ts.map