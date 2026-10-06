import { type ReactionMoreOptions, type ReactionOption } from "@hjmds/design-contracts/reactions";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type ReactionPickerProps = Readonly<{
    label: string;
    options: readonly ReactionOption[];
    value: string | null;
    onValueChange: (value: string | null) => void;
    disabled?: boolean;
    layout?: "wrap" | "strip";
    layoutStyle?: HjmCompositionStyleProp;
    more?: ReactionMoreOptions;
}>;
/** Controlled single reaction; counts and persistence belong to the product. */
export declare function ReactionPicker({ label, options, value, onValueChange, disabled, layout, more, layoutStyle }: ReactionPickerProps): import("react").JSX.Element;
//# sourceMappingURL=reaction-picker.d.ts.map