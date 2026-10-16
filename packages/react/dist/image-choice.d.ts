import type { ReactNode } from "react";
import { type ImageChoiceItemDescriptor } from "@hjmds/design-contracts/components/image-choice";
export type ImageChoiceItem = ImageChoiceItemDescriptor & Readonly<{
    image: ReactNode;
}>;
type Base = Readonly<{
    /** Localized group name read before the choices. */
    label: string;
    /** Visible caption above the tiles; omit when the screen heading already names the choice. */
    showLabel?: boolean;
    items: readonly ImageChoiceItem[];
    disabled?: boolean;
    className?: string;
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