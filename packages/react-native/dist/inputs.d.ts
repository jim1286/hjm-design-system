import { type FieldAlign, type FieldShape, type FieldVariant } from "@hjmds/design-contracts/recipes/base";
import { type ChipSize, type SearchFieldSize, type SegmentedControlSize, type SelectionControlPresentation, type SelectionControlSize, type SwitchSize, type SwitchPresentation } from "@hjmds/design-contracts/recipes";
import { type PasswordFieldAutofillHint, type PasswordFieldSize } from "@hjmds/design-contracts/components/password-field";
import { type OtpFieldSize, type OtpFieldPresentation } from "@hjmds/design-contracts/components/otp-field";
import { type CheckboxGroupSelection, type CheckboxState, type SelectionItemDescriptor, type SelectionOrientation } from "@hjmds/design-contracts/behaviors";
import { type ReactNode } from "react";
import { TextInput, type StyleProp, type GestureResponderEvent, type SwitchProps as NativeSwitchProps, type TextInputProps, type TextStyle, type ViewStyle } from "react-native";
import type { HjmCompositionStyleProp } from "./composition-style.js";
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
    /**
     * Upper bound for a growing multiline field, in visible lines. Height is
     * recipe-owned, so this semantic axis replaces `inputStyle={{ maxHeight }}`.
     */
    maxVisibleLines?: number;
    /**
     * Lower bound for a growing multiline field, in visible lines. Height is
     * recipe-owned, so this semantic axis replaces `inputStyle={{ minHeight }}`.
     */
    minVisibleLines?: number;
    /**
     * Text placement inside the control. `start` follows the resolved
     * direction; `center` suits a short, ceremonial single value such as a
     * nickname or a code. Replaces `inputStyle={{ textAlign }}`.
     */
    align?: FieldAlign;
    onValueChange?: (value: string) => void;
    /** Helper copy below the control; the same name as the Web renderer. */
    description?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    busy?: boolean;
    variant?: FieldVariant;
    shape?: FieldShape;
    /** Canonical layout-only placement for the complete field. Controlled keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
type AccessibleFieldProps = BaseFieldProps & FieldAccessibleName;
export type TextFieldProps = AccessibleFieldProps;
export declare const TextField: import("react").ForwardRefExoticComponent<AccessibleFieldProps & import("react").RefAttributes<TextInput>>;
export type TextAreaProps = AccessibleFieldProps & Readonly<{
    trailing?: ReactNode;
    leadingAction?: ReactNode;
}>;
export declare const TextArea: import("react").ForwardRefExoticComponent<TextAreaProps & import("react").RefAttributes<TextInput>>;
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
    presentation?: OtpFieldPresentation;
    /**
     * @deprecated Raw slot style bypasses `otpFieldRecipe`. Use `size` and `presentation` for slot
     * appearance and `layoutStyle` for placement. Removed in the next major (consumer-policy.md §3.1).
     */
    slotStyle?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw slot text style bypasses `otpFieldRecipe`; `size` selects the digit typography.
     * Removed in the next major (consumer-policy.md §3.1).
     */
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
    /** Canonical layout-only placement for the row (or the group frame). Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses `selectionControlRecipe`. Use `layoutStyle` for placement and
     * `presentation`/`size`/`indicator`/`renderIndicator`/`renderLeading` for appearance. Removed in the
     * next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses `selectionControlRecipe`. Use `layoutStyle` for placement and
     * `presentation`/`size`/`indicator`/`renderIndicator`/`renderLeading` for appearance. Removed in the
     * next major (consumer-policy.md §3.1).
     */
    controlStyle?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses `selectionControlRecipe`. Use `layoutStyle` for placement and
     * `presentation`/`size`/`indicator`/`renderIndicator`/`renderLeading` for appearance. Removed in the
     * next major (consumer-policy.md §3.1).
     */
    indicatorStyle?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses `selectionControlRecipe`. Use `layoutStyle` for placement and
     * `presentation`/`size`/`indicator`/`renderIndicator`/`renderLeading` for appearance. Removed in the
     * next major (consumer-policy.md §3.1).
     */
    leadingStyle?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses `selectionControlRecipe`. Use `layoutStyle` for placement and
     * `presentation`/`size`/`indicator`/`renderIndicator`/`renderLeading` for appearance. Removed in the
     * next major (consumer-policy.md §3.1).
     */
    contentStyle?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses `selectionControlRecipe`. Use `layoutStyle` for placement and
     * `presentation`/`size`/`indicator`/`renderIndicator`/`renderLeading` for appearance. Removed in the
     * next major (consumer-policy.md §3.1).
     */
    labelStyle?: StyleProp<TextStyle>;
    /**
     * @deprecated Raw visual style bypasses `selectionControlRecipe`. Use `layoutStyle` for placement and
     * `presentation`/`size`/`indicator`/`renderIndicator`/`renderLeading` for appearance. Removed in the
     * next major (consumer-policy.md §3.1).
     */
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
export type RadioGroupItem<Value extends string = string> = Readonly<{
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
type RadioGroupCollectionProps<Value extends string> = Readonly<{
    items: readonly RadioGroupItem<Value>[];
}>;
export type RadioGroupProps<Value extends string = string> = ChoiceGroupVisualProps & RadioGroupCollectionProps<Value> & Readonly<{
    label?: string | undefined;
    accessibilityLabel?: string | undefined;
    value?: Value | null;
    defaultValue?: Value | null;
    onValueChange?: (value: Value | null) => void;
    renderLeading?: (item: RadioGroupItem<Value>, props: ChoiceVisualRenderProps) => ReactNode;
    renderIndicator?: (item: RadioGroupItem<Value>, props: ChoiceVisualRenderProps) => ReactNode;
}>;
export declare function RadioGroup<Value extends string = string>(props: RadioGroupProps<Value>): import("react").JSX.Element;
export type CheckboxGroupProps<Value extends string = string> = ChoiceGroupVisualProps & CheckboxGroupSelection<Value> & Readonly<{
    label?: string;
    accessibilityLabel?: string;
    items: readonly SelectionItemDescriptor<Value>[];
    renderLeading?: (item: SelectionItemDescriptor<Value>, props: ChoiceVisualRenderProps) => ReactNode;
    renderIndicator?: (item: SelectionItemDescriptor<Value>, props: ChoiceVisualRenderProps) => ReactNode;
}>;
/** Validated controlled/uncontrolled checkbox collection using immutable Sets. */
export declare function CheckboxGroup<Value extends string = string>({ label, accessibilityLabel, items, value, defaultValue, onValueChange, required, disabled, readOnly, invalid, description, error, requiredLabel, readOnlyLabel, invalidLabel, orientation, presentation, size, indicator, renderLeading, renderIndicator, layoutStyle, style, ...slotStyles }: CheckboxGroupProps<Value>): import("react").JSX.Element;
type SwitchBaseProps = Omit<NativeSwitchProps, "accessibilityHint" | "accessibilityLabel" | "defaultValue" | "onValueChange" | "style" | "value"> & Readonly<{
    label: string;
    /** Use inside a labelled ListRow; the accessible name and hint remain present. */
    labelVisibility?: "visible" | "hidden";
    description?: string;
    presentation?: SwitchPresentation;
    size?: SwitchSize;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses `switchRecipe`. Use `layoutStyle` for placement and
     * `presentation`/`size` for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
}>;
type SwitchCanonicalStateProps = Readonly<{
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    value?: never;
    defaultValue?: never;
    onValueChange?: never;
}>;
export type SwitchProps = SwitchBaseProps & SwitchCanonicalStateProps;
export declare function Switch({ label, labelVisibility, presentation, testID, description, size, checked, defaultChecked, onCheckedChange, disabled, accessibilityLabel, accessibilityHint, layoutStyle, style, ...props }: SwitchProps): import("react").JSX.Element;
export type SegmentedControlItem<Value extends string = string> = Readonly<{
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
type SegmentedControlCollectionProps<Value extends string> = Readonly<{
    items: readonly SegmentedControlItem<Value>[];
}>;
export type SegmentedControlProps<Value extends string = string> = SegmentedControlCollectionProps<Value> & Readonly<{
    label: string;
    value?: Value;
    defaultValue?: Value;
    onValueChange?: (value: Value) => void;
    size?: SegmentedControlSize;
    presentation?: "connected" | "pills";
    /** Move only decorative selection artwork, never labels or hit targets. */
    selectionMotion?: "none" | "slide";
    disabled?: boolean;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses `segmentedControlRecipe`. Use `layoutStyle` for placement
     * and `size` for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
}>;
export declare function SegmentedControl<Value extends string = string>(props: SegmentedControlProps<Value>): import("react").JSX.Element;
type ChipBaseProps = Readonly<{
    label: string;
    size?: ChipSize;
    disabled?: boolean;
    leading?: ReactNode;
    trailing?: ReactNode;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    /** Canonical layout-only placement. Controlled visual and state keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    leadingStyle?: HjmCompositionStyleProp;
    indicatorStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw text style bypasses `chipRecipe.label`. Use `size` and `selected` for label
     * typography. Removed in the next major (consumer-policy.md §3.1).
     */
    labelStyle?: StyleProp<TextStyle>;
    trailingStyle?: HjmCompositionStyleProp;
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
export declare function Chip({ label, size, disabled, leading, trailing, accessibilityLabel, accessibilityHint, layoutStyle, leadingStyle, indicatorStyle, labelStyle, trailingStyle, renderSelectionIndicator, selectionMode, selected, onPress, }: ChipProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=inputs.d.ts.map