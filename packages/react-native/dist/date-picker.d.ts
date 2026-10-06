import { type ComposeCalendarAccessibleName, type ResolvedCalendarDateCell } from "@hjmds/design-contracts/components/calendar";
import { type DatePickerDescriptor, type DatePickerSize } from "@hjmds/design-contracts/components/date-picker";
import { type ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import { type SheetProps } from "./overlays.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type DatePickerMonthAction = Readonly<{
    month: string;
    label: string;
}>;
export type DatePickerProps<Content = unknown> = Readonly<{
    descriptor: DatePickerDescriptor<Content>;
    monthLabel: string;
    composeAccessibleName: ComposeCalendarAccessibleName<Content>;
    previousMonth?: DatePickerMonthAction;
    nextMonth?: DatePickerMonthAction;
    clearLabel: string;
    closeLabel: string;
    size?: DatePickerSize;
    description?: string;
    error?: string;
    renderCellContent?: (cell: ResolvedCalendarDateCell<Content>) => ReactNode;
    /**
     * Forwarded to the picker's Sheet. Without it the calendar's last row sat under
     * the Android navigation bar and the call site had no way to fix it
     * (2026-09-30 audit). Defaults to the HjmNativeProvider insets like Sheet.
     */
    safeAreaInsets?: SheetProps["safeAreaInsets"];
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement;
     * the field recipe (`size`) owns appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
}>;
/** Native single-date trigger backed by the canonical Sheet overlay. */
export declare function DatePicker<Content>({ descriptor, monthLabel, composeAccessibleName, previousMonth, nextMonth, clearLabel, closeLabel, size, description, error, renderCellContent, safeAreaInsets, layoutStyle, style, }: DatePickerProps<Content>): import("react").JSX.Element;
//# sourceMappingURL=date-picker.d.ts.map