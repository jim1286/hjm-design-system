import { type FieldShape, type FieldVariant } from "@hjm/design-contracts/recipes/base";
import { type ChipSize, type SearchFieldSize, type SegmentedControlSize, type SelectionControlPresentation, type SelectionControlSize, type SwitchSize } from "@hjm/design-contracts/recipes";
import { type PasswordFieldAutofillHint, type PasswordFieldSize } from "@hjm/design-contracts/components/password-field";
import { type OtpFieldSize } from "@hjm/design-contracts/components/otp-field";
import { type CheckboxGroupSelection, type CheckboxState, type SelectionItemDescriptor, type SelectionOrientation } from "@hjm/design-contracts/behaviors";
import { type ReactNode } from "react";
import { TextInput, type StyleProp, type GestureResponderEvent, type SwitchProps as NativeSwitchProps, type TextInputProps, type TextStyle, type ViewStyle } from "react-native";
type FieldAccessibleName = Readonly<{
    label: string;
    accessibilityLabel?: string;
}> | Readonly<{
    label?: undefined;
    accessibilityLabel: string;
}>;
type BaseFieldProps = Omit<TextInputProps, "accessibilityLabel" | "defaultValue" | "multiline" | "onChangeText" | "style" | "value"> & Readonly<{
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    supportText?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    busy?: boolean;
    variant?: FieldVariant;
    shape?: FieldShape;
    inputStyle?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;
}>;
type AccessibleFieldProps = BaseFieldProps & FieldAccessibleName;
export type TextFieldProps = AccessibleFieldProps;
export declare const TextField: import("react").ForwardRefExoticComponent<AccessibleFieldProps & import("react").RefAttributes<TextInput>>;
export type TextAreaProps = AccessibleFieldProps;
export declare const TextArea: import("react").ForwardRefExoticComponent<AccessibleFieldProps & import("react").RefAttributes<TextInput>>;
export type SearchFieldAffordanceRenderProps = Readonly<{
    color: string;
    size: number;
    disabled: boolean;
}>;
export type SearchFieldProps = AccessibleFieldProps & Readonly<{
    size?: SearchFieldSize;
    /** Localized accessible name for the clear action. */
    clearLabel: string;
    /** Localized accessible name announced while search is busy. */
    busyLabel: string;
    onClear?: () => void;
    /** Decorative leading content. Defaults to a neutral search glyph. */
    leading?: ReactNode;
    /** Product-owned trailing content shown only when clear/busy is absent. */
    trailing?: ReactNode;
    renderLeading?: (props: SearchFieldAffordanceRenderProps) => ReactNode;
    renderClearIcon?: (props: SearchFieldAffordanceRenderProps) => ReactNode;
    renderBusyIndicator?: (props: SearchFieldAffordanceRenderProps) => ReactNode;
}>;
export declare const SearchField: import("react").ForwardRefExoticComponent<SearchFieldProps & import("react").RefAttributes<TextInput>>;
export type PasswordFieldToggleRenderProps = Readonly<{
    name: "visibility" | "visibilityOff";
    color: string;
    size: number;
    revealed: boolean;
    disabled: boolean;
}>;
export type PasswordFieldProps = Omit<BaseFieldProps, "autoComplete" | "defaultValue" | "secureTextEntry" | "textContentType" | "value"> & FieldAccessibleName & Readonly<{
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    revealed?: boolean;
    defaultRevealed?: boolean;
    onRevealedChange?: (revealed: boolean) => void;
    autofillHint: PasswordFieldAutofillHint;
    revealLabel: string;
    concealLabel: string;
    size?: PasswordFieldSize;
    renderToggleIcon?: (props: PasswordFieldToggleRenderProps) => ReactNode;
}>;
/** Password input with independent reveal state and native autofill translation. */
export declare const PasswordField: import("react").ForwardRefExoticComponent<PasswordFieldProps & import("react").RefAttributes<TextInput>>;
export type OtpFieldProps = Omit<BaseFieldProps, "autoComplete" | "defaultValue" | "inputStyle" | "keyboardType" | "multiline" | "onChangeText" | "secureTextEntry" | "textContentType" | "value"> & FieldAccessibleName & Readonly<{
    length: number;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    onComplete?: (value: string) => void;
    size?: OtpFieldSize;
    slotStyle?: StyleProp<ViewStyle>;
    slotTextStyle?: StyleProp<TextStyle>;
}>;
/** One accessible numeric TextInput rendered through decorative OTP slots. */
export declare const OtpField: import("react").ForwardRefExoticComponent<OtpFieldProps & import("react").RefAttributes<TextInput>>;
export type ChoiceVisualRenderProps = Readonly<{
    checked: CheckboxState;
    selected: boolean;
    disabled: boolean;
    readOnly: boolean;
    color: string;
    size: number;
}>;
type ChoiceVisualProps = Readonly<{
    presentation?: SelectionControlPresentation;
    size?: SelectionControlSize;
    indicator?: "default" | "none";
    style?: StyleProp<ViewStyle>;
    controlStyle?: StyleProp<ViewStyle>;
    indicatorStyle?: StyleProp<ViewStyle>;
    leadingStyle?: StyleProp<ViewStyle>;
    contentStyle?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
    descriptionStyle?: StyleProp<TextStyle>;
}>;
export type CheckboxProps = ChoiceVisualProps & Readonly<{
    label: string;
    checked?: CheckboxState;
    defaultChecked?: CheckboxState;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    invalid?: boolean;
    description?: string;
    readOnlyLabel?: string;
    requiredLabel?: string;
    invalidLabel?: string;
    leading?: ReactNode;
    renderLeading?: (props: ChoiceVisualRenderProps) => ReactNode;
    renderIndicator?: (props: ChoiceVisualRenderProps) => ReactNode;
    accessibilityHint?: string;
}>;
export declare function Checkbox({ label, checked, defaultChecked, onCheckedChange, disabled, readOnly, required, invalid, description, readOnlyLabel, requiredLabel, invalidLabel, leading, renderLeading, renderIndicator, accessibilityHint, ...visual }: CheckboxProps): import("react").JSX.Element;
export type RadioProps = ChoiceVisualProps & Readonly<{
    label: string;
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: true) => void;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    invalid?: boolean;
    description?: string;
    readOnlyLabel?: string;
    requiredLabel?: string;
    invalidLabel?: string;
    leading?: ReactNode;
    renderLeading?: (props: ChoiceVisualRenderProps) => ReactNode;
    renderIndicator?: (props: ChoiceVisualRenderProps) => ReactNode;
    accessibilityHint?: string;
}>;
/** Standalone native radio item. Prefer RadioGroup when group state is owned here. */
export declare function Radio({ label, checked, defaultChecked, onCheckedChange, disabled, readOnly, required, invalid, description, readOnlyLabel, requiredLabel, invalidLabel, leading, renderLeading, renderIndicator, accessibilityHint, ...visual }: RadioProps): import("react").JSX.Element;
export type RadioOption<Value extends string = string> = Readonly<{
    value: Value;
    label: string;
    description?: string;
    disabled?: boolean;
    accessibilityHint?: string;
    leading?: ReactNode;
}>;
type ChoiceGroupVisualProps = ChoiceVisualProps & Readonly<{
    orientation?: SelectionOrientation;
    disabled?: boolean;
    readOnly?: boolean;
    invalid?: boolean;
    description?: string;
    error?: string;
    required?: boolean;
    requiredLabel?: string;
    readOnlyLabel?: string;
    invalidLabel?: string;
}>;
export type RadioGroupProps<Value extends string = string> = ChoiceGroupVisualProps & Readonly<{
    label?: string | undefined;
    accessibilityLabel?: string | undefined;
    options: readonly RadioOption<Value>[];
    value?: Value | null;
    defaultValue?: Value | null;
    onValueChange?: (value: Value | null) => void;
    renderLeading?: (option: RadioOption<Value>, props: ChoiceVisualRenderProps) => ReactNode;
    renderIndicator?: (option: RadioOption<Value>, props: ChoiceVisualRenderProps) => ReactNode;
}>;
export declare function RadioGroup<Value extends string = string>({ label, accessibilityLabel, options, value, defaultValue, onValueChange, required, disabled, readOnly, invalid, description, error, requiredLabel, readOnlyLabel, invalidLabel, orientation, presentation, size, indicator, renderLeading, renderIndicator, style, ...slotStyles }: RadioGroupProps<Value>): import("react").JSX.Element;
export type CheckboxGroupProps<Value extends string = string> = ChoiceGroupVisualProps & CheckboxGroupSelection<Value> & Readonly<{
    label?: string;
    accessibilityLabel?: string;
    items: readonly SelectionItemDescriptor<Value>[];
    renderLeading?: (item: SelectionItemDescriptor<Value>, props: ChoiceVisualRenderProps) => ReactNode;
    renderIndicator?: (item: SelectionItemDescriptor<Value>, props: ChoiceVisualRenderProps) => ReactNode;
}>;
/** Validated controlled/uncontrolled checkbox collection using immutable Sets. */
export declare function CheckboxGroup<Value extends string = string>({ label, accessibilityLabel, items, value, defaultValue, onValueChange, required, disabled, readOnly, invalid, description, error, requiredLabel, readOnlyLabel, invalidLabel, orientation, presentation, size, indicator, renderLeading, renderIndicator, style, ...slotStyles }: CheckboxGroupProps<Value>): import("react").JSX.Element;
export type SwitchProps = Omit<NativeSwitchProps, "accessibilityHint" | "accessibilityLabel" | "onValueChange" | "style" | "value"> & Readonly<{
    label: string;
    description?: string;
    size?: SwitchSize;
    value?: boolean;
    defaultValue?: boolean;
    onValueChange?: (value: boolean) => void;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    style?: StyleProp<ViewStyle>;
}>;
export declare function Switch({ label, description, size, value, defaultValue, onValueChange, disabled, accessibilityLabel, accessibilityHint, style, ...props }: SwitchProps): import("react").JSX.Element;
export type SegmentedControlOption<Value extends string = string> = Readonly<{
    value: Value;
    label: string;
    disabled?: boolean;
    leading?: ReactNode;
    renderLeading?: (props: SegmentedControlLeadingRenderProps) => ReactNode;
}>;
export type SegmentedControlLeadingRenderProps = Readonly<{
    selected: boolean;
    disabled: boolean;
    color: string;
    size: number;
}>;
export type SegmentedControlProps<Value extends string = string> = Readonly<{
    label: string;
    options: readonly SegmentedControlOption<Value>[];
    value?: Value;
    defaultValue?: Value;
    onValueChange?: (value: Value) => void;
    size?: SegmentedControlSize;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
}>;
export declare function SegmentedControl<Value extends string = string>({ label, options, value, defaultValue, onValueChange, size, disabled, style, }: SegmentedControlProps<Value>): import("react").JSX.Element;
type ChipBaseProps = Readonly<{
    label: string;
    size?: ChipSize;
    disabled?: boolean;
    leading?: ReactNode;
    trailing?: ReactNode;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    style?: StyleProp<ViewStyle>;
    leadingStyle?: StyleProp<ViewStyle>;
    indicatorStyle?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
    trailingStyle?: StyleProp<ViewStyle>;
    renderSelectionIndicator?: (props: Readonly<{
        selected: boolean;
        color: string;
        size: number;
    }>) => ReactNode;
}>;
type ActionChipProps = Readonly<{
    selectionMode?: "action";
    selected?: never;
    onPress: (event: GestureResponderEvent) => void;
}>;
type SelectionChipProps = Readonly<{
    selectionMode: "single" | "multiple";
    /** Product-owned controlled selection. */
    selected: boolean;
    onPress: (selected: boolean, event: GestureResponderEvent) => void;
}>;
export type ChipProps = ChipBaseProps & (ActionChipProps | SelectionChipProps);
/** Action/filter chip with role-specific, controlled selection semantics. */
export declare function Chip({ label, size, disabled, leading, trailing, accessibilityLabel, accessibilityHint, style, leadingStyle, indicatorStyle, labelStyle, trailingStyle, renderSelectionIndicator, selectionMode, selected, onPress, }: ChipProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=inputs.d.ts.map