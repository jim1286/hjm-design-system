import { type SegmentedControlSize, type SelectionGroupOrientation, type SelectionGroupPresentation } from "@hjm/design-contracts/recipes";
import { type CheckboxGroupSelection, type SelectionItemDescriptor } from "@hjm/design-contracts/behaviors";
import { type ButtonHTMLAttributes, type ChangeEvent, type FieldsetHTMLAttributes, type InputHTMLAttributes, type ReactElement, type ReactNode, type RefAttributes } from "react";
export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "defaultChecked" | "onChange" | "children"> & Readonly<{
    label: ReactNode;
    description?: ReactNode;
    checked?: boolean;
    defaultChecked?: boolean;
    indeterminate?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}>;
export declare const Checkbox: import("react").ForwardRefExoticComponent<Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "children" | "defaultChecked" | "type" | "checked"> & Readonly<{
    label: ReactNode;
    description?: ReactNode;
    checked?: boolean;
    defaultChecked?: boolean;
    indeterminate?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}> & RefAttributes<HTMLInputElement>>;
type RadioState = Readonly<{
    checked: boolean;
    defaultChecked?: never;
    onCheckedChange(checked: true): void;
}> | Readonly<{
    checked?: never;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: true) => void;
}>;
export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "defaultChecked" | "onChange" | "children"> & RadioState & Readonly<{
    label: ReactNode;
    description?: ReactNode;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}>;
/** Native radio item primitive. Use RadioGroup when the renderer owns group state. */
export declare const Radio: import("react").ForwardRefExoticComponent<RadioProps & RefAttributes<HTMLInputElement>>;
export type CheckboxGroupItem<Key extends string = string> = SelectionItemDescriptor<Key>;
type CheckboxGroupBaseProps<Key extends string> = Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue" | "onChange" | "value"> & Readonly<{
    items: readonly CheckboxGroupItem<Key>[];
    label?: string;
    accessibilityLabel?: string;
    description?: ReactNode;
    error?: ReactNode;
    orientation?: SelectionGroupOrientation;
    presentation?: SelectionGroupPresentation;
    name?: string;
}>;
export type CheckboxGroupProps<Key extends string = string> = CheckboxGroupBaseProps<Key> & CheckboxGroupSelection<Key>;
export declare const CheckboxGroup: <Key extends string = string>(props: CheckboxGroupProps<Key> & RefAttributes<HTMLFieldSetElement>) => ReactElement;
export type RadioGroupItem = Readonly<{
    value: string;
    label: ReactNode;
    description?: ReactNode;
    disabled?: boolean;
}>;
export type RadioGroupProps = Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue" | "onChange" | "value"> & Readonly<{
    label: ReactNode;
    accessibilityLabel?: string;
    items: readonly RadioGroupItem[];
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string) => void;
    orientation?: SelectionGroupOrientation;
    description?: ReactNode;
    error?: ReactNode;
    name?: string;
    required?: boolean;
    readOnly?: boolean;
}>;
export declare const RadioGroup: import("react").ForwardRefExoticComponent<Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "value" | "defaultValue" | "onChange"> & Readonly<{
    label: ReactNode;
    accessibilityLabel?: string;
    items: readonly RadioGroupItem[];
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string) => void;
    orientation?: SelectionGroupOrientation;
    description?: ReactNode;
    error?: ReactNode;
    name?: string;
    required?: boolean;
    readOnly?: boolean;
}> & RefAttributes<HTMLFieldSetElement>>;
export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "role" | "onChange" | "value"> & Readonly<{
    label: ReactNode;
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}>;
export declare const Switch: import("react").ForwardRefExoticComponent<Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "onChange" | "role"> & Readonly<{
    label: ReactNode;
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}> & RefAttributes<HTMLButtonElement>>;
export type SegmentedControlItem = Readonly<{
    value: string;
    label: ReactNode;
    disabled?: boolean;
}>;
export type SegmentedControlProps = Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue" | "onChange" | "value"> & Readonly<{
    label: string;
    items: readonly SegmentedControlItem[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    size?: SegmentedControlSize;
    name?: string;
}>;
export declare const SegmentedControl: import("react").ForwardRefExoticComponent<Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "value" | "defaultValue" | "onChange"> & Readonly<{
    label: string;
    items: readonly SegmentedControlItem[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    size?: SegmentedControlSize;
    name?: string;
}> & RefAttributes<HTMLFieldSetElement>>;
export {};
//# sourceMappingURL=selection.d.ts.map