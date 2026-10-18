import { type ReactNode } from "react";
import { type ImageChoiceItemDescriptor, type ImageChoiceItemLabelLines } from "@hjmds/design-contracts/components/image-choice";
export type ImageChoiceItem = ImageChoiceItemDescriptor & Readonly<{
    image: ReactNode;
}>;
export type ImageChoiceVirtualization = Readonly<{
    /** Height of the scrolling viewport in px. The group scrolls itself, so do not also put it in a scrolling parent. */
    height: number;
    /** Rows kept mounted above and below the visible window. */
    overscan?: number;
}>;
type Base = Readonly<{
    /** Localized group name read before the choices. */
    label: string;
    /** Visible caption above the tiles; omit when the screen heading already names the choice. */
    showLabel?: boolean;
    /**
     * Shows each item's `label` under its tile (one ellipsized line), e.g. a person's name in a recipient picker.
     * The tile keeps the same accessible name, so turning this on does not change what assistive tech reads.
     */
    showItemLabels?: boolean;
    /** Lines the visible item label wraps to before the ellipsis (default 1). Every tile reserves the same height. */
    itemLabelLines?: ImageChoiceItemLabelLines;
    items: readonly ImageChoiceItem[];
    disabled?: boolean;
    className?: string;
    /**
     * Long lists (hundreds of people): only the rows near the viewport are mounted. Tiles keep their size; the column
     * count follows the measured width.
     */
    virtualized?: ImageChoiceVirtualization;
}>;
export type ImageChoiceGroupProps = Base & (Readonly<{
    selectionMode: "single";
    value: string | null;
    onValueChange(value: string): void;
}> | Readonly<{
    selectionMode: "multiple";
    value: readonly string[];
    onValueChange(value: string[]): void;
}>);
/**
 * Picks avatars or photos by image (2026-10-16). Tiles are square, wrap to the available width, and show
 * a brand ring plus a check when chosen; assistive tech hears radios (single) or checkboxes (multiple).
 */
export declare function ImageChoiceGroup(props: ImageChoiceGroupProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=image-choice.d.ts.map