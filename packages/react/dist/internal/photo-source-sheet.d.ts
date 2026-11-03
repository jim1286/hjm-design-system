import type { PhotoSource, PhotoSourceLabels } from "@hjmds/design-contracts/screen-patterns";
/** Source choice only: permission, capture, decoding and draft persistence belong to the host. */
export type PhotoSourceSheetProps = Readonly<{
    open: boolean;
    onOpenChange(open: boolean): void;
    onSelect(source: PhotoSource): void;
    labels: PhotoSourceLabels;
    disabled?: boolean;
    cameraAvailable?: boolean;
}>;
export declare function PhotoSourceSheet({ open, onOpenChange, onSelect, labels, disabled, cameraAvailable }: PhotoSourceSheetProps): import("react").JSX.Element;
//# sourceMappingURL=photo-source-sheet.d.ts.map