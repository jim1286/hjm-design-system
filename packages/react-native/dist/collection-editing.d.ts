import { type ReactNode } from "react";
import { type ColumnSetting, type FilterRecoveryOption, type FocusTarget, type SelectionAction } from "@hjmds/design-contracts/collection-editing";
import { type FieldGroupBinding, type FieldGroupProps } from "./field-group.js";
export type InlineEditProps = Readonly<{
    id: string;
    value: string;
    label: string;
    editLabel: string;
    saveLabel: string;
    cancelLabel: string;
    errorLabel: string;
    disabled?: boolean;
    validate?: (draft: string) => string | undefined;
    onSave: (draft: string) => void | Promise<void>;
}>;
export declare function InlineEdit(props: InlineEditProps): import("react").JSX.Element;
export type RepeatableFieldGroupProps = Omit<FieldGroupProps, "renderField"> & Readonly<{
    renderField: (binding: FieldGroupBinding & {
        focusRef: (target: FocusTarget | null) => void;
    }) => ReactNode;
    addLabel: string;
    removeLabel: (id: string) => string;
    minFields?: number;
    maxFields?: number;
    /** A referenced row may stay editable while removal is unavailable (Utilverse expense participants). */
    isRemoveDisabled?: (id: string) => boolean;
    onAdd: () => string | undefined;
    onRemove: (id: string) => void;
}>;
export declare function RepeatableFieldGroup({ renderField, addLabel, removeLabel, minFields, maxFields, isRemoveDisabled, onAdd, onRemove, ...props }: RepeatableFieldGroupProps): import("react").JSX.Element;
export type SelectionActionBarProps = Readonly<{
    selectedIds: readonly string[];
    selectionLabel: (count: number) => string;
    clearLabel: string;
    onClear: () => void;
    actions: readonly SelectionAction[];
    onAction: (actionId: string, selectedIds: readonly string[]) => void | Promise<void>;
    errorLabel: string;
    disabled?: boolean;
    recovery?: Readonly<{
        label: string;
        onUndo: () => void | Promise<void>;
    }>;
}>;
export declare function SelectionActionBar(props: SelectionActionBarProps): import("react").JSX.Element | null;
export type FilterRecoveryProps = Readonly<{
    title: string;
    description?: string;
    options: readonly FilterRecoveryOption[];
    optionLabel: (option: FilterRecoveryOption) => string;
    onApply: (id: string) => void | Promise<void>;
    errorLabel: string;
    disabled?: boolean;
}>;
export declare function FilterRecovery(props: FilterRecoveryProps): import("react").JSX.Element;
export type TableColumnSettingsProps = Readonly<{
    label: string;
    columns: readonly ColumnSetting[];
    disabled?: boolean;
    earlierLabel: (column: ColumnSetting) => string;
    laterLabel: (column: ColumnSetting) => string;
    onColumnsChange: (columns: readonly ColumnSetting[]) => void;
}>;
export declare function TableColumnSettings(props: TableColumnSettingsProps): import("react").JSX.Element;
//# sourceMappingURL=collection-editing.d.ts.map