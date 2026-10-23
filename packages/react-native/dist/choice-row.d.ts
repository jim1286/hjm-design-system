import { type ReactNode } from "react";
import { type ChoiceRowItem as ChoiceRowItemContract } from "@hjmds/design-contracts/choice-row";
import { type ListRowDensity } from "@hjmds/design-contracts/recipes";
/**
 * A choice. `leading` is the product picture for that choice (theme artwork, flag); the sheet draws it in the
 * recipe-owned box (choiceRowRecipe.itemLeading) and the row shows the confirmed choice's picture unless the row
 * gets its own `leading` (2026-10-23 utilverse shell theme row).
 */
export type ChoiceRowItem<Value extends string = string> = ChoiceRowItemContract<Value> & Readonly<{
    leading?: ReactNode;
}>;
/** A synchronous save closes the sheet at once. Only an async save can fail inside the sheet, so only it needs
 * `errorLabel`; a rejected promise keeps the sheet open with that message (2026-10-23 product adoption). */
export type ChoiceRowSave<Value extends string = string> = Readonly<{
    onValueChange: (value: Value) => void;
    errorLabel?: never;
}> | Readonly<{
    onValueChange: (value: Value) => Promise<void>;
    errorLabel: string;
}>;
export type ChoiceRowProps<Value extends string = string> = ChoiceRowSave<Value> & Readonly<{
    title: string;
    items: readonly ChoiceRowItem<Value>[];
    /** The product-confirmed value; update it only after the save succeeds. */
    value: Value | null;
    closeLabel: string;
    sheetTitle?: string;
    sheetDescription?: string;
    placeholder?: string;
    /** Row picture; defaults to the confirmed item's `leading`. */
    leading?: ReactNode;
    trailing?: ReactNode;
    /** Spoken result of activating the row, e.g. "Opens the language list". */
    accessibilityHint?: string;
    /** ListRow density, so the row matches the surrounding settings rows. */
    density?: ListRowDensity;
    disabled?: boolean;
    loading?: boolean;
}>;
export declare function ChoiceRow<Value extends string = string>(props: ChoiceRowProps<Value>): import("react").JSX.Element;
//# sourceMappingURL=choice-row.d.ts.map