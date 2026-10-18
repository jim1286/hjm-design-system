import { type ReactNode } from "react";
import { type ImageChoiceItemDescriptor, type ImageChoiceItemLabelLines } from "@hjmds/design-contracts/components/image-choice";
export type ImageChoiceItem = ImageChoiceItemDescriptor & Readonly<{
    image: ReactNode;
}>;
export type ImageChoiceVirtualization = Readonly<{
    /** Height of the scrolling viewport in dp. The group scrolls itself (a FlatList): do not nest it in a ScrollView. */
    height: number;
    /** Rows rendered beyond the visible window on first mount. */
    overscan?: number;
}>;
type Base = Readonly<{
    /** Localized group name read before the choices. */
    label: string;
    /** Visible caption above the tiles; omit when the screen heading already names the choice. */
    showLabel?: boolean;
    /**
     * Shows each item's `label` under its tile (one ellipsized line), e.g. a person's name in a recipient picker.
     * The tile keeps the same accessible name, so turning this on does not change what screen readers announce.
     */
    showItemLabels?: boolean;
    /** Lines the visible item label wraps to before the ellipsis (default 1). Every tile reserves the same height. */
    itemLabelLines?: ImageChoiceItemLabelLines;
    items: readonly ImageChoiceItem[];
    disabled?: boolean;
    /**
     * Long lists (hundreds of people): rows are recycled by a FlatList. Tiles keep their size; the column count follows
     * the measured width.
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
 * a brand ring plus a check when chosen; screen readers hear radios (single) or checkboxes (multiple).
 */
export declare function ImageChoiceGroup(props: ImageChoiceGroupProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=image-choice.d.ts.map