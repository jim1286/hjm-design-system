import { type TimePickerOptions } from "@hjmds/design-contracts/components/time-picker";
import { type SheetProps } from "./overlays.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type TimePickerProps = TimePickerOptions & Readonly<{
    layoutStyle?: HjmCompositionStyleProp;
    safeAreaInsets?: SheetProps["safeAreaInsets"];
}>;
export declare function TimePicker(props: TimePickerProps): import("react").JSX.Element;
//# sourceMappingURL=time-picker.d.ts.map