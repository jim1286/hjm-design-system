import { type ReactNode } from "react";
import { type ChoiceRowItem } from "@hjmds/design-contracts/choice-row";
export type { ChoiceRowItem } from "@hjmds/design-contracts/choice-row";
export type ChoiceRowProps<Value extends string = string> = Readonly<{
    title: string;
    items: readonly ChoiceRowItem<Value>[];
    /** The product-confirmed value; update it only after the save succeeds. */
    value: Value | null;
    /** A returned promise keeps the sheet open and busy; rejection keeps it open with `errorLabel`. */
    onValueChange: (value: Value) => void | Promise<void>;
    closeLabel: string;
    errorLabel: string;
    sheetTitle?: string;
    sheetDescription?: string;
    placeholder?: string;
    leading?: ReactNode;
    trailing?: ReactNode;
    disabled?: boolean;
    loading?: boolean;
}>;
export declare function ChoiceRow<Value extends string = string>({ title, items, value, onValueChange, closeLabel, errorLabel, sheetTitle, sheetDescription, placeholder, leading, trailing, disabled, loading }: ChoiceRowProps<Value>): import("react").JSX.Element;
//# sourceMappingURL=choice-row.d.ts.map