import { type TimePickerOptions } from "@hjmds/design-contracts/components/time-picker";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type TimePickerProps = TimePickerOptions & Readonly<{
    layoutStyle?: HjmCompositionStyleProp;
    className?: string;
}>;
/** One draft and one confirmation for both columns. Inline mode delegates confirmation to its form. */
export declare function TimePicker(props: TimePickerProps): import("react").JSX.Element;
//# sourceMappingURL=time-picker.d.ts.map