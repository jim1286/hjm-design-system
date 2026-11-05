import type { PhotoSource } from "@hjmds/design-contracts/screen-patterns";
/** Built-in source marks are Lucide icons (the only icon source, 2026-11-05) on a neutral plate. */
export declare function PhotoSourceIcon({ source }: {
    source: PhotoSource;
}): import("react").JSX.Element;
/**
 * The source mark without its plate, for a quiet inline action (PhotoAttachmentField's choose button, 2026-11-03):
 * Lucide Camera and Images.
 */
export declare function PhotoSourceGlyph({ source, color, size }: Readonly<{
    source: PhotoSource;
    color: string;
    size?: number;
}>): import("react").JSX.Element;
//# sourceMappingURL=photo-source-icon.d.ts.map