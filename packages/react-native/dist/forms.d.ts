import { formRecipe, type FormSubmitStatus } from "@hjm/design-contracts/components/form";
import { type ComboboxCommitReason, type ComboboxFiltering, type SelectItemDescriptor } from "@hjm/design-contracts/behaviors";
import { type ReactNode } from "react";
import { type ModalProps, type StyleProp, type ViewStyle } from "react-native";
export type FieldControlProps = Readonly<{
    accessibilityLabel: string;
    accessibilityHint?: string;
    accessibilityState: Readonly<{
        disabled: boolean;
    }>;
}>;
export type FieldProps = Readonly<{
    label: string;
    children: ReactNode | ((props: FieldControlProps) => ReactNode);
    description?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
}>;
/** A renderer-neutral field frame for custom Native controls. */
export declare function Field({ label, children, description, error, required, disabled, style, }: FieldProps): import("react").JSX.Element;
export type FormProps<Values> = Readonly<{
    label: string;
    values: Values;
    onSubmit: (values: Values) => void | Promise<void>;
    children: ReactNode;
    submitLabel: string;
    status?: FormSubmitStatus;
    defaultStatus?: FormSubmitStatus;
    onStatusChange?: (status: FormSubmitStatus) => void;
    error?: string;
    /** Localized fallback used when a rejected submission has no usable message. */
    fallbackErrorMessage: string;
    disabled?: boolean;
    density?: keyof typeof formRecipe.density;
    style?: StyleProp<ViewStyle>;
}>;
/**
 * A Native submit boundary. Products retain ownership of values and validation;
 * this renderer only owns submit re-entrancy, feedback, and field rhythm.
 */
export declare function Form<Values>({ label, values, onSubmit, children, submitLabel, status, defaultStatus, onStatusChange, error, fallbackErrorMessage, disabled, density, style, }: FormProps<Values>): import("react").JSX.Element;
export type SelectOption<Value extends string = string> = Readonly<{
    value: Value;
    label: string;
    description?: string;
    disabled?: boolean;
    accessibilityHint?: string;
}>;
export type SelectProps<Value extends string = string> = Omit<ModalProps, "animationType" | "children" | "onRequestClose" | "onShow" | "transparent" | "visible"> & Readonly<{
    label: string;
    options: readonly SelectOption<Value>[];
    value?: Value | null;
    defaultValue?: Value | null;
    onValueChange?: (value: Value) => void;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Localized text shown when no option is selected. */
    placeholder: string;
    description?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    /** Localized accessible name and visible label for dismissing the option list. */
    dismissLabel: string;
    /** Optional localized name for the option-list region; defaults neutrally to label. */
    optionsAccessibilityLabel?: string;
    style?: StyleProp<ViewStyle>;
}>;
/** An accessible, router-free Native option picker backed by React Native Modal. */
export declare function Select<Value extends string = string>({ label, options, value, defaultValue, onValueChange, open, defaultOpen, onOpenChange, placeholder, description, error, required, disabled, dismissLabel, optionsAccessibilityLabel, style, ...modalProps }: SelectProps<Value>): import("react").JSX.Element;
export type ComboboxProps<Key extends string = string> = Omit<ModalProps, "animationType" | "children" | "onRequestClose" | "onShow" | "transparent" | "visible"> & Readonly<{
    label: string;
    items: readonly SelectItemDescriptor<Key>[];
    selectedKey?: Key | null;
    defaultSelectedKey?: Key | null;
    onSelectionChange?: (key: Key | null) => void;
    inputValue?: string;
    defaultInputValue?: string;
    onInputValueChange?: (value: string) => void;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onCommit?: (key: Key | null, reason: ComboboxCommitReason) => void;
    filtering?: ComboboxFiltering;
    loading?: boolean;
    /** Localized text rendered when filtering returns no items. */
    emptyMessage: string;
    /** Localized text announced while results are loading. */
    loadingMessage: string;
    description?: string;
    error?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    openOnFocus?: boolean;
    /** Localized accessible name for clearing the committed selection/query. */
    clearLabel: string;
    /** Localized accessible name for dismissing the result list. */
    dismissLabel: string;
    /** Optional localized name for the result region; defaults neutrally to label. */
    resultsAccessibilityLabel?: string;
    style?: StyleProp<ViewStyle>;
}>;
/** Editable Native combobox with independent query, committed key, and Modal results. */
export declare function Combobox<Key extends string = string>({ label, items, selectedKey, defaultSelectedKey, onSelectionChange, inputValue, defaultInputValue, onInputValueChange, open, defaultOpen, onOpenChange, onCommit, filtering, loading, emptyMessage, loadingMessage, description, error, placeholder, required, disabled, readOnly, openOnFocus, clearLabel, dismissLabel, resultsAccessibilityLabel, style, ...modalProps }: ComboboxProps<Key>): import("react").JSX.Element;
//# sourceMappingURL=forms.d.ts.map