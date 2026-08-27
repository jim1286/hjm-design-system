import { type ComposeCalendarAccessibleName, type ResolvedCalendarDateCell } from "@hjm/design-contracts/components/calendar";
import { type DatePickerDescriptor, type DatePickerSize } from "@hjm/design-contracts/components/date-picker";
import { type ReactNode } from "react";
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
    description?: ReactNode;
    error?: ReactNode;
    renderCellContent?: (cell: ResolvedCalendarDateCell<Content>) => ReactNode;
    className?: string;
}>;
/** Single-date field with an anchored, focus-bearing calendar dialog. */
export declare function DatePicker<Content>({ descriptor, monthLabel, composeAccessibleName, previousMonth, nextMonth, clearLabel, closeLabel, size, description, error, renderCellContent, className, }: DatePickerProps<Content>): import("react").JSX.Element;
//# sourceMappingURL=date-picker.d.ts.map