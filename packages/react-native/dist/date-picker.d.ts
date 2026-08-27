import { type ComposeCalendarAccessibleName, type ResolvedCalendarDateCell } from "@hjm/design-contracts/components/calendar";
import { type DatePickerDescriptor, type DatePickerSize } from "@hjm/design-contracts/components/date-picker";
import { type ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
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
    style?: StyleProp<ViewStyle>;
}>;
/** Native single-date trigger backed by the canonical Sheet overlay. */
export declare function DatePicker<Content>({ descriptor, monthLabel, composeAccessibleName, previousMonth, nextMonth, clearLabel, closeLabel, size, description, error, renderCellContent, style, }: DatePickerProps<Content>): import("react").JSX.Element;
//# sourceMappingURL=date-picker.d.ts.map