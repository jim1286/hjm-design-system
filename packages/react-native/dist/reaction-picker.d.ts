import { type ReactionMoreOptions, type ReactionOption } from "@hjmds/design-contracts/reactions";
export type ReactionPickerProps = Readonly<{
    label: string;
    options: readonly ReactionOption[];
    value: string | null;
    onValueChange: (value: string | null) => void;
    disabled?: boolean;
    layout?: "wrap" | "strip";
    more?: ReactionMoreOptions;
}>;
export declare function ReactionPicker({ label, options, value, onValueChange, disabled, layout, more }: ReactionPickerProps): import("react").JSX.Element;
//# sourceMappingURL=reaction-picker.d.ts.map