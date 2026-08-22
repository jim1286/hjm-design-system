import { type SelectCollectionSectionDescriptor, type SelectCollectionSource, type SelectOpenChangeReason } from "@hjm/design-contracts/components/collection";
import { type AsyncCollectionState, type SelectItemDescriptor } from "@hjm/design-contracts/behaviors";
import { type SelectDensity, type SelectSize } from "@hjm/design-contracts/recipes";
import { type ButtonHTMLAttributes, type ReactElement, type ReactNode, type RefAttributes } from "react";
export type SelectItem<Key extends string = string> = SelectItemDescriptor<Key>;
export type SelectSection<Key extends string = string, SectionKey extends string = string> = SelectCollectionSectionDescriptor<Key, SectionKey>;
type SelectSourceProps<Key extends string, SectionKey extends string> = SelectCollectionSource<Key, SectionKey>;
type SelectSelectionProps<Key extends string> = Readonly<{
    selectedKey: Key | null;
    defaultSelectedKey?: never;
    onSelectionChange(key: Key | null): void;
}> | Readonly<{
    selectedKey?: never;
    defaultSelectedKey?: Key | null;
    onSelectionChange?: (key: Key | null) => void;
}>;
type SelectOpenProps = Readonly<{
    open: boolean;
    defaultOpen?: never;
    onOpenChange(open: boolean, reason: SelectOpenChangeReason): void;
}> | Readonly<{
    open?: never;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, reason: SelectOpenChangeReason) => void;
}>;
type SelectLabelProps = Readonly<{
    label: string;
    accessibilityLabel?: string;
}> | Readonly<{
    label?: never;
    accessibilityLabel: string;
}>;
type SelectBaseProps<Key extends string> = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children" | "defaultValue" | "onChange" | "role" | "value"> & Readonly<{
    description?: ReactNode;
    error?: ReactNode;
    /** Localized text shown when no item is selected. */
    placeholder: string;
    /** Localized label for the nullable empty-selection option. */
    emptySelectionLabel: string;
    asyncState?: AsyncCollectionState;
    selectedItem?: SelectItemDescriptor<Key>;
    disallowEmptySelection?: boolean;
    loop?: boolean;
    readOnly?: boolean;
    required?: boolean;
    size?: SelectSize;
    density?: SelectDensity;
    fieldClassName?: string;
}>;
export type SelectProps<Key extends string = string, SectionKey extends string = string> = SelectBaseProps<Key> & SelectSourceProps<Key, SectionKey> & SelectSelectionProps<Key> & SelectOpenProps & SelectLabelProps;
export declare const Select: <Key extends string = string, SectionKey extends string = string>(props: SelectProps<Key, SectionKey> & RefAttributes<HTMLButtonElement>) => ReactElement | null;
export {};
//# sourceMappingURL=select.d.ts.map