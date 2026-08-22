import { type SelectDensity, type SelectSize } from "@hjm/design-contracts/recipes";
import { type FormDensity } from "@hjm/design-contracts/components/form";
import { type FormEvent, type FormHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
export type SelectOption = Readonly<{
    value: string;
    label: string;
    disabled?: boolean;
}>;
export type NativeSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children" | "defaultValue" | "onChange" | "size" | "value"> & Readonly<{
    label: ReactNode;
    description?: ReactNode;
    error?: ReactNode;
    options: readonly SelectOption[];
    placeholder?: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    size?: SelectSize;
    density?: SelectDensity;
    fieldClassName?: string;
}>;
/** A native select keeps browser keyboard, form, autofill, and mobile picker behavior. */
export declare const NativeSelect: import("react").ForwardRefExoticComponent<Omit<SelectHTMLAttributes<HTMLSelectElement>, "value" | "defaultValue" | "onChange" | "children" | "size"> & Readonly<{
    label: ReactNode;
    description?: ReactNode;
    error?: ReactNode;
    options: readonly SelectOption[];
    placeholder?: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    size?: SelectSize;
    density?: SelectDensity;
    fieldClassName?: string;
}> & import("react").RefAttributes<HTMLSelectElement>>;
export type ComboboxItem = Readonly<{
    value: string;
    label: string;
    keywords?: readonly string[];
    disabled?: boolean;
}>;
export type ComboboxOpenChangeReason = "focus" | "input" | "keyboard" | "selection" | "escape" | "blur";
export type ComboboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "children" | "defaultValue" | "onChange" | "role" | "size" | "value"> & Readonly<{
    label: ReactNode;
    description?: ReactNode;
    error?: ReactNode;
    items: readonly ComboboxItem[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    inputValue?: string;
    defaultInputValue?: string;
    onInputValueChange?: (value: string) => void;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, reason: ComboboxOpenChangeReason) => void;
    /** Localized content rendered when filtering returns no items. */
    emptyMessage: ReactNode;
    loading?: boolean;
    /** Localized content announced while options are loading. */
    loadingMessage: ReactNode;
    /** Localized native-validation message for an empty required selection. */
    selectionRequiredMessage: string;
    openOnFocus?: boolean;
    size?: SelectSize;
    density?: SelectDensity;
    fieldClassName?: string;
}>;
export declare const Combobox: import("react").ForwardRefExoticComponent<Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "children" | "role" | "size"> & Readonly<{
    label: ReactNode;
    description?: ReactNode;
    error?: ReactNode;
    items: readonly ComboboxItem[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    inputValue?: string;
    defaultInputValue?: string;
    onInputValueChange?: (value: string) => void;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, reason: ComboboxOpenChangeReason) => void;
    /** Localized content rendered when filtering returns no items. */
    emptyMessage: ReactNode;
    loading?: boolean;
    /** Localized content announced while options are loading. */
    loadingMessage: ReactNode;
    /** Localized native-validation message for an empty required selection. */
    selectionRequiredMessage: string;
    openOnFocus?: boolean;
    size?: SelectSize;
    density?: SelectDensity;
    fieldClassName?: string;
}> & import("react").RefAttributes<HTMLInputElement>>;
export type FormSubmitHandler = (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
export type FormProps = Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> & Readonly<{
    onSubmit: FormSubmitHandler;
    busy?: boolean;
    formError?: ReactNode;
    actions?: ReactNode;
    density?: FormDensity;
}>;
export declare const Form: import("react").ForwardRefExoticComponent<Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> & Readonly<{
    onSubmit: FormSubmitHandler;
    busy?: boolean;
    formError?: ReactNode;
    actions?: ReactNode;
    density?: FormDensity;
}> & import("react").RefAttributes<HTMLFormElement>>;
//# sourceMappingURL=advanced-forms.d.ts.map