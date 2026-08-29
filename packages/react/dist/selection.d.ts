import { chipRecipe, type SegmentedControlSize, type SelectionControlPresentation, type SelectionControlSize, type SelectionGroupOrientation, type SelectionGroupPresentation } from "@hjmds/design-contracts/recipes";
import { type CheckboxGroupSelection, type SelectionItemDescriptor } from "@hjmds/design-contracts/behaviors";
import { type ButtonHTMLAttributes, type ChangeEvent, type FieldsetHTMLAttributes, type InputHTMLAttributes, type MouseEvent, type ReactElement, type ReactNode, type RefAttributes } from "react";
export type ChoiceLeadingRenderProps = Readonly<{
    selected: boolean;
    color: "currentColor";
    size: number;
}>;
type ChipBaseProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onChange" | "onClick" | "size"> & Readonly<{
    label: ReactNode;
    size?: keyof typeof chipRecipe.sizes;
    leading?: ReactNode;
    trailing?: ReactNode;
    renderSelectionIndicator?: (props: Readonly<{
        selected: boolean;
        color: "currentColor";
        size: number;
    }>) => ReactNode;
}>;
type ActionChipProps = Readonly<{
    selectionMode?: "action";
    selected?: never;
    onPress?: (event: MouseEvent<HTMLButtonElement>) => void;
    onSelectedChange?: never;
}>;
type SelectionChipProps = Readonly<{
    selectionMode: "single" | "multiple";
    selected: boolean;
    onSelectedChange: (selected: boolean) => void;
    onPress?: (event: MouseEvent<HTMLButtonElement>) => void;
}>;
export type ChipProps = ChipBaseProps & (ActionChipProps | SelectionChipProps);
/** Action/filter chip with explicit selection semantics and no hidden state. */
export declare const Chip: import("react").ForwardRefExoticComponent<ChipProps & RefAttributes<HTMLButtonElement>>;
export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "defaultChecked" | "onChange" | "children" | "size"> & Readonly<{
    label: ReactNode;
    description?: ReactNode;
    checked?: boolean;
    defaultChecked?: boolean;
    indeterminate?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    presentation?: SelectionControlPresentation;
    size?: SelectionControlSize;
    renderLeading?: (appearance: ChoiceLeadingRenderProps) => ReactNode;
}>;
export declare const Checkbox: import("react").ForwardRefExoticComponent<Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "children" | "defaultChecked" | "type" | "size" | "checked"> & Readonly<{
    label: ReactNode;
    description?: ReactNode;
    checked?: boolean;
    defaultChecked?: boolean;
    indeterminate?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    presentation?: SelectionControlPresentation;
    size?: SelectionControlSize;
    renderLeading?: (appearance: ChoiceLeadingRenderProps) => ReactNode;
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
export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "defaultChecked" | "onChange" | "children" | "size"> & RadioState & Readonly<{
    label: ReactNode;
    description?: ReactNode;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    presentation?: SelectionControlPresentation;
    size?: SelectionControlSize;
    renderLeading?: (appearance: ChoiceLeadingRenderProps) => ReactNode;
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
    size?: SelectionControlSize;
    name?: string;
    required?: boolean;
    readOnly?: boolean;
    renderLeading?: (item: CheckboxGroupItem<Key>, appearance: ChoiceLeadingRenderProps) => ReactNode;
}>;
export type CheckboxGroupProps<Key extends string = string> = CheckboxGroupBaseProps<Key> & CheckboxGroupSelection<Key>;
export declare const CheckboxGroup: <Key extends string = string>(props: CheckboxGroupProps<Key> & RefAttributes<HTMLFieldSetElement>) => ReactElement;
export type RadioGroupItem = Readonly<{
    value: string;
    label: ReactNode;
    description?: ReactNode;
    disabled?: boolean;
}>;
type RadioGroupLabelProps = Readonly<{
    label: ReactNode;
    accessibilityLabel?: string;
}> | Readonly<{
    label?: never;
    accessibilityLabel: string;
}>;
export type RadioGroupProps = Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue" | "onChange" | "value"> & RadioGroupLabelProps & Readonly<{
    items: readonly RadioGroupItem[];
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string) => void;
    orientation?: SelectionGroupOrientation;
    presentation?: SelectionGroupPresentation;
    size?: SelectionControlSize;
    description?: ReactNode;
    error?: ReactNode;
    name?: string;
    required?: boolean;
    readOnly?: boolean;
    renderLeading?: (item: RadioGroupItem, appearance: ChoiceLeadingRenderProps) => ReactNode;
}>;
export declare const RadioGroup: import("react").ForwardRefExoticComponent<RadioGroupProps & RefAttributes<HTMLFieldSetElement>>;
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