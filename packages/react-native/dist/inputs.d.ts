import type { ComponentRef } from "react";
import { type FieldAlign, type FieldShape, type FieldVariant } from "@hjmds/design-contracts/recipes/base";
import { type ChipSize, type SearchFieldSize, type SegmentedControlSize, type SelectionControlPresentation, type SelectionGroupOverflow, type SelectionControlSize, type SwitchSize, type SwitchPresentation } from "@hjmds/design-contracts/recipes";
import { type PasswordFieldAutofillHint, type PasswordFieldSize } from "@hjmds/design-contracts/components/password-field";
import { type OtpFieldSize, type OtpFieldPresentation } from "@hjmds/design-contracts/components/otp-field";
import { type CharacterCountOptions } from "@hjmds/design-contracts/character-count";
import { type CheckboxGroupSelection, type CheckboxState, type SelectionItemDescriptor, type SelectionOrientation } from "@hjmds/design-contracts/behaviors";
import { forwardRef, type ReactNode } from "react";
import { TextInput, View, type GestureResponderEvent, type SwitchProps as NativeSwitchProps, type TextInputProps } from "react-native";
import type { GridDescriptor } from "@hjmds/design-contracts/grid";
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
    /** External group errors can mark this field without repeating inline copy. Supply accessibilityHint. */
    invalid?: boolean;
    required?: boolean;
    disabled?: boolean;
    busy?: boolean;
    variant?: FieldVariant;
    shape?: FieldShape;
    /** Canonical layout-only placement for the complete field. Controlled keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * Page-entry target: true prefers this field, false excludes it, omission uses tree order. Only chooses during
     * entry; revealing a field after interaction does not focus it. Bottom sheets disable automatic input focus.
     */
    initialFocusTarget?: boolean;
}>;
type AccessibleFieldProps = BaseFieldProps & FieldAccessibleName;
/** TextField and TextArea only; SearchField and PasswordField have no free-text limit to count. */
type CharacterCountProps = Readonly<{
    /**
     * Shows `length/max` and the product's sentence for the current status under the control
     * (`resolveCharacterCount`). `overflow: "block"` (default) also sets `maxLength`; do not pass both.
     */
    characterCount?: CharacterCountOptions;
}>;
export type TextFieldProps = AccessibleFieldProps & CharacterCountProps;
export declare const TextField: ReturnType<typeof forwardRef<ComponentRef<typeof TextInput>, TextFieldProps>>;
export type TextAreaProps = AccessibleFieldProps & CharacterCountProps & Readonly<{
    trailing?: ReactNode;
    leadingAction?: ReactNode;
}>;
export declare const TextArea: ReturnType<typeof forwardRef<ComponentRef<typeof TextInput>, TextAreaProps>>;
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
export declare const SearchField: ReturnType<typeof forwardRef<ComponentRef<typeof TextInput>, SearchFieldProps>>;
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
export declare const PasswordField: ReturnType<typeof forwardRef<ComponentRef<typeof TextInput>, PasswordFieldProps>>;
export type OtpFieldProps = Omit<BaseFieldProps, "autoComplete" | "defaultValue" | "inputStyle" | "keyboardType" | "multiline" | "onChangeText" | "secureTextEntry" | "textContentType" | "value"> & FieldAccessibleName & Readonly<{
    length: number;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    onComplete?: (value: string) => void;
    size?: OtpFieldSize;
    presentation?: OtpFieldPresentation;
}>;
/** One accessible numeric TextInput rendered through decorative OTP slots. */
export declare const OtpField: ReturnType<typeof forwardRef<ComponentRef<typeof TextInput>, OtpFieldProps>>;
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
    action?: Readonly<{
        label: string;
        accessibilityLabel?: string;
        onAction: () => void;
        disabled?: boolean;
    }>;
}>;
type ChoiceGroupVisualProps = ChoiceVisualProps & Readonly<{
    orientation?: SelectionOrientation;
    /** Equal-width responsive options, measured and arranged by the shared Grid. */
    grid?: GridDescriptor;
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
    /** One horizontal line of cards or chips, without grid; the selected item stays visible. */
    overflow?: SelectionGroupOverflow;
    /** Brand fill uses primary/onPrimary; brand-outline keeps canvas and emphasizes the primary border. */
    selectionTone?: "neutral" | "brand" | "brand-outline";
    /** Visual preview only; the string label remains the accessible name. */
    renderLabel?: (item: RadioGroupItem<Value>) => ReactNode;
    renderLeading?: (item: RadioGroupItem<Value>, props: ChoiceVisualRenderProps) => ReactNode;
    renderIndicator?: (item: RadioGroupItem<Value>, props: ChoiceVisualRenderProps) => ReactNode;
}>;
export declare function RadioGroup<Value extends string = string>(props: RadioGroupProps<Value>): import("react").JSX.Element;
export type CheckboxGroupProps<Value extends string = string> = ChoiceGroupVisualProps & CheckboxGroupSelection<Value> & Readonly<{
    label?: string;
    accessibilityLabel?: string;
    /**
     * Chip line overflow, the same meaning as SegmentedControl `overflow`: `wrap` (default) breaks onto more lines,
     * `scroll` keeps one horizontal line and scrolls a focused chip into view. Requires `presentation="chips"`
     * without `grid`.
     */
    overflow?: SelectionGroupOverflow;
    items: readonly SelectionItemDescriptor<Value>[];
    renderLeading?: (item: SelectionItemDescriptor<Value>, props: ChoiceVisualRenderProps) => ReactNode;
    renderIndicator?: (item: SelectionItemDescriptor<Value>, props: ChoiceVisualRenderProps) => ReactNode;
}>;
/** Validated controlled/uncontrolled checkbox collection using immutable Sets. */
export declare function CheckboxGroup<Value extends string = string>({ label, accessibilityLabel, items, value, defaultValue, onValueChange, required, disabled, readOnly, invalid, description, error, requiredLabel, readOnlyLabel, invalidLabel, orientation, grid, presentation, overflow, size, indicator, renderLeading, renderIndicator, layoutStyle, ...slotStyles }: CheckboxGroupProps<Value>): import("react").JSX.Element;
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
export declare function Switch({ label, labelVisibility, presentation, testID, description, size, checked, defaultChecked, onCheckedChange, disabled, accessibilityLabel, accessibilityHint, layoutStyle, ...props }: SwitchProps): import("react").JSX.Element;
export type SegmentedControlItem<Value extends string = string> = Readonly<{
    value: Value;
    label: string;
    /** Full spoken name when the visible label is abbreviated. */
    accessibilityLabel?: string;
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
    presentation?: "connected" | "pills" | "text";
    /** Opaque primary/onPrimary selection, independent of presentation geometry. */
    selectionTone?: "neutral" | "brand";
    textEmphasis?: "regular" | "strong";
    /** Move only decorative selection artwork, never labels or hit targets. */
    selectionMotion?: "none" | "slide";
    disabled?: boolean;
    /** Pills wrap by default; a rail keeps one row while actions remain outside the selection group. */
    overflow?: "wrap" | "scroll";
    actions?: ReactNode;
    testID?: string;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
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
/** Forwards the host View ref so a chip can be a focus-return target (2026-10-16, DiscoveryGallery). */
export declare const Chip: ReturnType<typeof forwardRef<ComponentRef<typeof View>, ChipProps>>;
export {};
//# sourceMappingURL=inputs.d.ts.map