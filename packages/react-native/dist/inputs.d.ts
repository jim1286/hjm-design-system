import { type ReactNode } from "react";
import { TextInput, type StyleProp, type SwitchProps as NativeSwitchProps, type TextInputProps, type TextStyle, type ViewStyle } from "react-native";
type BaseFieldProps = Omit<TextInputProps, "accessibilityLabel" | "defaultValue" | "multiline" | "onChangeText" | "style" | "value"> & Readonly<{
    label: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    supportText?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    busy?: boolean;
    accessibilityLabel?: string;
    inputStyle?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;
}>;
export type TextFieldProps = BaseFieldProps;
export declare const TextField: import("react").ForwardRefExoticComponent<Omit<TextInputProps, "value" | "style" | "accessibilityLabel" | "defaultValue" | "multiline" | "onChangeText"> & Readonly<{
    label: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    supportText?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    busy?: boolean;
    accessibilityLabel?: string;
    inputStyle?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;
}> & import("react").RefAttributes<TextInput>>;
export type TextAreaProps = BaseFieldProps;
export declare const TextArea: import("react").ForwardRefExoticComponent<Omit<TextInputProps, "value" | "style" | "accessibilityLabel" | "defaultValue" | "multiline" | "onChangeText"> & Readonly<{
    label: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    supportText?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    busy?: boolean;
    accessibilityLabel?: string;
    inputStyle?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;
}> & import("react").RefAttributes<TextInput>>;
export type SearchFieldProps = BaseFieldProps & Readonly<{
    /** Localized accessible name for the clear action. */
    clearLabel: string;
    /** Localized accessible name announced while search is busy. */
    busyLabel: string;
    onClear?: () => void;
}>;
export declare const SearchField: import("react").ForwardRefExoticComponent<Omit<TextInputProps, "value" | "style" | "accessibilityLabel" | "defaultValue" | "multiline" | "onChangeText"> & Readonly<{
    label: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    supportText?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    busy?: boolean;
    accessibilityLabel?: string;
    inputStyle?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;
}> & Readonly<{
    /** Localized accessible name for the clear action. */
    clearLabel: string;
    /** Localized accessible name announced while search is busy. */
    busyLabel: string;
    onClear?: () => void;
}> & import("react").RefAttributes<TextInput>>;
export type CheckboxProps = Readonly<{
    label: string;
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    accessibilityHint?: string;
    style?: StyleProp<ViewStyle>;
}>;
export declare function Checkbox({ label, checked, defaultChecked, onCheckedChange, disabled, accessibilityHint, style, }: CheckboxProps): import("react").JSX.Element;
export type RadioOption<Value extends string = string> = Readonly<{
    value: Value;
    label: string;
    disabled?: boolean;
    accessibilityHint?: string;
}>;
export type RadioGroupProps<Value extends string = string> = Readonly<{
    label: string;
    options: readonly RadioOption<Value>[];
    value?: Value | null;
    defaultValue?: Value | null;
    onValueChange?: (value: Value | null) => void;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    invalid?: boolean;
    description?: string;
    error?: string;
    /** Optional localized qualifier; a neutral asterisk is used when omitted. */
    requiredLabel?: string;
    /** Optional localized qualifier; disabled state remains available when omitted. */
    readOnlyLabel?: string;
    style?: StyleProp<ViewStyle>;
}>;
export declare function RadioGroup<Value extends string = string>({ label, options, value, defaultValue, onValueChange, required, disabled, readOnly, invalid, description, error, requiredLabel, readOnlyLabel, style, }: RadioGroupProps<Value>): import("react").JSX.Element;
export type SwitchProps = Omit<NativeSwitchProps, "accessibilityHint" | "accessibilityLabel" | "onValueChange" | "style" | "value"> & Readonly<{
    label: string;
    value?: boolean;
    defaultValue?: boolean;
    onValueChange?: (value: boolean) => void;
    accessibilityHint?: string;
    style?: StyleProp<ViewStyle>;
}>;
export declare function Switch({ label, value, defaultValue, onValueChange, disabled, accessibilityHint, style, ...props }: SwitchProps): import("react").JSX.Element;
export type SegmentedControlOption<Value extends string = string> = Readonly<{
    value: Value;
    label: string;
    disabled?: boolean;
}>;
export type SegmentedControlProps<Value extends string = string> = Readonly<{
    label: string;
    options: readonly SegmentedControlOption<Value>[];
    value?: Value;
    defaultValue?: Value;
    onValueChange?: (value: Value) => void;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
}>;
export declare function SegmentedControl<Value extends string = string>({ label, options, value, defaultValue, onValueChange, disabled, style, }: SegmentedControlProps<Value>): import("react").JSX.Element;
type ChipBaseProps = Readonly<{
    label: string;
    size?: "small" | "medium";
    disabled?: boolean;
    leading?: ReactNode;
    trailing?: ReactNode;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    style?: StyleProp<ViewStyle>;
}>;
type ActionChipProps = Readonly<{
    selectionMode?: "action";
    selected?: never;
    onPress: () => void;
}>;
type SelectionChipProps = Readonly<{
    selectionMode: "single" | "multiple";
    /** Product-owned controlled selection. */
    selected: boolean;
    onPress: (selected: boolean) => void;
}>;
export type ChipProps = ChipBaseProps & (ActionChipProps | SelectionChipProps);
/** Action/filter chip with role-specific, controlled selection semantics. */
export declare function Chip({ label, size, disabled, leading, trailing, accessibilityLabel, accessibilityHint, style, selectionMode, selected, onPress, }: ChipProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=inputs.d.ts.map