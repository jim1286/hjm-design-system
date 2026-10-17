import type { ReactNode } from "react";
import { selectionControlRecipe } from "@hjmds/design-contracts/recipes";
export type SelectionMarkState = boolean | "mixed";
/**
 * Checkbox/Radio indicator box. Agreement and TransferList rows are multi-select too, so they draw this same box
 * rather than their own 16pt mark (2026-10-17 review: the 16pt box with radius sm read as a radio).
 * The check and dash are fixed artwork: HJM Text scales with textScale even when OS scaling is off.
 */
export declare function SelectionMark({ kind, checked, size, invalid, children }: Readonly<{
    kind?: "checkbox" | "radio";
    checked: SelectionMarkState;
    size?: keyof typeof selectionControlRecipe.sizes;
    invalid?: boolean;
    /** Product indicator override (ChoiceRow `renderIndicator`). */
    children?: ReactNode;
}>): import("react").JSX.Element;
//# sourceMappingURL=selection-mark.d.ts.map