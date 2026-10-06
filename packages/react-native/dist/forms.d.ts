import { formRecipe, type FormSubmitStatus } from "@hjmds/design-contracts/components/form";
import { type ComboboxCommitReason, type ComboboxFiltering, type AsyncCollectionState, type SelectItemDescriptor } from "@hjmds/design-contracts/behaviors";
import { type SelectCollectionSectionDescriptor, type SelectCollectionSource, type SelectOpenChangeReason } from "@hjmds/design-contracts/components/collection";
import { type SelectDensity, type SelectSize } from "@hjmds/design-contracts/recipes";
import { type Ref, type RefObject, type ReactNode } from "react";
import { TextInput, type ModalProps, type StyleProp, type ViewStyle } from "react-native";
import type { HjmCompositionStyleProp } from "./composition-style.js";
type NativeCollectionLeadingRenderProps = Readonly<{
    placement: "trigger" | "option";
    selected: boolean;
    disabled: boolean;
    color: string;
    size: number;
}>;
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
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** A renderer-neutral field frame for custom Native controls. */
export declare function Field({ label, children, description, error, required, disabled, layoutStyle, }: FieldProps): import("react").JSX.Element;
export type FormHandle = Readonly<{
    submit(): Promise<void>;
}>;
export type FormProps<Values> = Readonly<{
    label: string;
    values: Values;
    onSubmit: (values: Values) => void | Promise<void>;
    children: ReactNode;
    submitLabel: string;
    /** Override the built-in action, including null for a host footer. Both routes use ref.submit(). */
    actions?: ReactNode;
    ref?: Ref<FormHandle>;
    status?: FormSubmitStatus;
    defaultStatus?: FormSubmitStatus;
    onStatusChange?: (status: FormSubmitStatus) => void;
    error?: string;
    /** Localized fallback used when a rejected submission has no usable message. */
    fallbackErrorMessage: string;
    disabled?: boolean;
    density?: keyof typeof formRecipe.density;
    /**
     * The product-selected first invalid input, or null when client validation passes.
     * Form uses it to focus the control and move screen-reader focus before submitting.
     */
    firstInvalidFieldRef?: RefObject<TextInput | null>;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses `formRecipe`. Use `layoutStyle` for placement and `density` for field rhythm.
     * Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
}>;
/**
 * A Native submit boundary. Products retain ownership of values and validation;
 * this renderer only owns submit re-entrancy, feedback, and field rhythm.
 */
export declare function Form<Values>({ label, values, onSubmit, children, submitLabel, actions, ref, status, defaultStatus, onStatusChange, error, fallbackErrorMessage, disabled, density, firstInvalidFieldRef, layoutStyle, style, }: FormProps<Values>): import("react").JSX.Element;
export type SelectSection<Value extends string = string, SectionKey extends string = string> = SelectCollectionSectionDescriptor<Value, SectionKey>;
export type SelectLeadingRenderProps = NativeCollectionLeadingRenderProps;
export type SelectProps<Value extends string = string, SectionKey extends string = string> = Omit<ModalProps, "animationType" | "children" | "onDismiss" | "onRequestClose" | "onShow" | "transparent" | "visible"> & Readonly<{
    label?: string;
    accessibilityLabel?: string;
    source?: SelectCollectionSource<Value, SectionKey>;
    items?: readonly SelectItemDescriptor<Value>[];
    sections?: readonly SelectSection<Value, SectionKey>[];
    selectedKey?: Value | null;
    defaultSelectedKey?: Value | null;
    onSelectionChange?: (value: Value | null) => void;
    selectedItem?: SelectItemDescriptor<Value>;
    disallowEmptySelection?: boolean;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, reason: SelectOpenChangeReason) => void;
    /** Localized text shown when no option is selected. */
    placeholder: string;
    description?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    busy?: boolean;
    size?: SelectSize;
    density?: SelectDensity;
    asyncState?: AsyncCollectionState;
    onRetry?: () => void;
    retryLabel?: string;
    readOnlyLabel?: string;
    openHint?: string;
    renderLeading?: (item: SelectItemDescriptor<Value> | null, props: SelectLeadingRenderProps) => ReactNode;
    renderOptionLeading?: (item: SelectItemDescriptor<Value>, props: SelectLeadingRenderProps) => ReactNode;
    onSelectionAfterDismiss?: (value: Value) => void | Promise<void>;
    onDismiss?: (reason: SelectOpenChangeReason) => void;
    /** Localized accessible name and visible label for dismissing the option list. */
    dismissLabel: string;
    /** Optional localized name for the option-list region; defaults neutrally to label. */
    optionsAccessibilityLabel?: string;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses `selectRecipe`. Use `layoutStyle` for placement and `size`/`density` for appearance.
     * Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
}>;
/** Native adaptive Select with shared sections, async states, and teardown-safe commits. */
export declare function Select<Value extends string = string, SectionKey extends string = string>({ label, accessibilityLabel, source: sourceProp, items, sections, selectedKey, defaultSelectedKey, onSelectionChange, selectedItem, disallowEmptySelection, open, defaultOpen, onOpenChange, placeholder, description, error, required, disabled, readOnly, busy, size, density, asyncState, onRetry, retryLabel, readOnlyLabel, openHint, renderLeading, renderOptionLeading, onSelectionAfterDismiss, onDismiss, dismissLabel, optionsAccessibilityLabel, layoutStyle, style, ...modalProps }: SelectProps<Value, SectionKey>): import("react").JSX.Element;
export type ComboboxLeadingRenderProps = NativeCollectionLeadingRenderProps;
export type ComboboxProps<Key extends string = string, SectionKey extends string = string> = Omit<ModalProps, "animationType" | "children" | "onDismiss" | "onRequestClose" | "onShow" | "transparent" | "visible"> & Readonly<{
    label?: string;
    accessibilityLabel?: string;
    items?: readonly SelectItemDescriptor<Key>[];
    sections?: readonly SelectSection<Key, SectionKey>[];
    source?: SelectCollectionSource<Key, SectionKey>;
    selectedKey?: Key | null;
    defaultSelectedKey?: Key | null;
    selectedItem?: SelectItemDescriptor<Key>;
    onSelectionChange?: (key: Key | null) => void;
    inputValue?: string;
    defaultInputValue?: string;
    onInputValueChange?: (value: string) => void;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, reason: SelectOpenChangeReason) => void;
    onCommit?: (key: Key | null, reason: ComboboxCommitReason) => void;
    onCommitAfterDismiss?: (key: Key, reason: "selection") => void | Promise<void>;
    onDismiss?: (reason: SelectOpenChangeReason) => void;
    filtering?: ComboboxFiltering;
    queryValue?: string;
    resultQuery?: string;
    asyncState?: AsyncCollectionState;
    loading?: boolean;
    /** Localized text rendered when filtering returns no items. */
    emptyMessage: string;
    /** Localized text announced while results are loading. */
    loadingMessage: string;
    loadingMoreMessage?: string;
    errorMessage?: string;
    promptMessage?: string;
    minimumQueryLength?: number;
    onRetry?: () => void;
    retryLabel?: string;
    description?: string;
    error?: string;
    placeholder?: string;
    /** Optional localized hint explaining how the editable trigger opens results. */
    openHint?: string;
    /** Optional visible modal heading when it should differ from the field label. */
    sheetTitle?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    busy?: boolean;
    openOnFocus?: boolean;
    size?: SelectSize;
    density?: SelectDensity;
    readOnlyLabel?: string;
    renderLeading?: (item: SelectItemDescriptor<Key>, props: ComboboxLeadingRenderProps) => ReactNode;
    /** Localized accessible name for clearing the committed selection/query. */
    clearLabel: string;
    /** Localized accessible name for dismissing the result list. */
    dismissLabel: string;
    /** Optional localized name for the result region; defaults neutrally to label. */
    resultsAccessibilityLabel?: string;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses `comboboxRecipe`. Use `layoutStyle` for placement and `density` for appearance.
     * Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
}>;
/** Editable Native combobox with sectioned async results and teardown-safe commits. */
export declare function Combobox<Key extends string = string, SectionKey extends string = string>({ label, accessibilityLabel, items, sections, source: sourceProp, selectedKey, defaultSelectedKey, selectedItem, onSelectionChange, inputValue, defaultInputValue, onInputValueChange, open, defaultOpen, onOpenChange, onCommit, onCommitAfterDismiss, onDismiss, filtering, queryValue, resultQuery, asyncState, loading, emptyMessage, loadingMessage, loadingMoreMessage, errorMessage, promptMessage, minimumQueryLength, onRetry, retryLabel, description, error, placeholder, openHint, sheetTitle, required, disabled, readOnly, busy, openOnFocus, size, density, readOnlyLabel, renderLeading, clearLabel, dismissLabel, resultsAccessibilityLabel, layoutStyle, style, ...modalProps }: ComboboxProps<Key, SectionKey>): import("react").JSX.Element;
export {};
//# sourceMappingURL=forms.d.ts.map