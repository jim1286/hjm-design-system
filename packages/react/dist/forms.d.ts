import { type FieldShape, type FieldVariant } from "@hjm/design-contracts/recipes/base";
import { type SearchFieldSize } from "@hjm/design-contracts/recipes";
import { type HTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
type FieldCopyProps = Readonly<{
    label?: ReactNode;
    description?: ReactNode;
    error?: ReactNode;
    required?: boolean;
}>;
type FieldFrameProps = HTMLAttributes<HTMLDivElement> & FieldCopyProps & Readonly<{
    controlId: string;
    descriptionId?: string;
    errorId?: string;
    disabled?: boolean;
    focused?: boolean;
    variant?: FieldVariant;
    shape?: FieldShape;
    children: ReactNode;
}>;
export type FieldControlProps = Readonly<{
    id: string;
    required: boolean;
    disabled: boolean;
    "aria-invalid"?: true;
    "aria-describedby"?: string;
}>;
export type FieldProps = Omit<FieldFrameProps, "children" | "descriptionId" | "errorId"> & Readonly<{
    label: ReactNode;
    children: ReactNode | ((props: FieldControlProps) => ReactNode);
}>;
/** Generic frame for custom native controls; `controlId` keeps the label explicit. */
export declare function Field({ controlId, description, error, required, disabled, children, ...props }: FieldProps): import("react").JSX.Element;
type SharedInputProps = FieldCopyProps & Readonly<{
    variant?: FieldVariant;
    shape?: FieldShape;
    leading?: ReactNode;
    trailing?: ReactNode;
    fieldClassName?: string;
}>;
export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & SharedInputProps;
export declare const TextField: import("react").ForwardRefExoticComponent<Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & Readonly<{
    label?: ReactNode;
    description?: ReactNode;
    error?: ReactNode;
    required?: boolean;
}> & Readonly<{
    variant?: FieldVariant;
    shape?: FieldShape;
    leading?: ReactNode;
    trailing?: ReactNode;
    fieldClassName?: string;
}> & import("react").RefAttributes<HTMLInputElement>>;
export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & Omit<SharedInputProps, "leading" | "trailing">;
export declare const TextArea: import("react").ForwardRefExoticComponent<TextareaHTMLAttributes<HTMLTextAreaElement> & Omit<SharedInputProps, "leading" | "trailing"> & import("react").RefAttributes<HTMLTextAreaElement>>;
export type SearchFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "value" | "defaultValue"> & SharedInputProps & Readonly<{
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    size?: SearchFieldSize;
    /** Localized accessible name for the clear action. */
    clearLabel: string;
    onClear?: () => void;
    /** Keeps the input mounted and named while replacing trailing actions with progress. */
    loading?: boolean;
    /** Product icon adapter; the renderer owns size and inherited color. */
    renderSearchIcon?: (props: SearchFieldIconRenderProps) => ReactNode;
    /** Product icon adapter for the clear action. */
    renderClearIcon?: (props: SearchFieldIconRenderProps) => ReactNode;
    /** Optional progress adapter. The default is the canonical CSS spinner. */
    renderLoadingIndicator?: (props: SearchFieldIconRenderProps) => ReactNode;
}>;
export type SearchFieldIconRenderProps = Readonly<{
    color: "currentColor";
    size: number;
}>;
export declare const SearchField: import("react").ForwardRefExoticComponent<Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "type" | "size"> & Readonly<{
    label?: ReactNode;
    description?: ReactNode;
    error?: ReactNode;
    required?: boolean;
}> & Readonly<{
    variant?: FieldVariant;
    shape?: FieldShape;
    leading?: ReactNode;
    trailing?: ReactNode;
    fieldClassName?: string;
}> & Readonly<{
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    size?: SearchFieldSize;
    /** Localized accessible name for the clear action. */
    clearLabel: string;
    onClear?: () => void;
    /** Keeps the input mounted and named while replacing trailing actions with progress. */
    loading?: boolean;
    /** Product icon adapter; the renderer owns size and inherited color. */
    renderSearchIcon?: (props: SearchFieldIconRenderProps) => ReactNode;
    /** Product icon adapter for the clear action. */
    renderClearIcon?: (props: SearchFieldIconRenderProps) => ReactNode;
    /** Optional progress adapter. The default is the canonical CSS spinner. */
    renderLoadingIndicator?: (props: SearchFieldIconRenderProps) => ReactNode;
}> & import("react").RefAttributes<HTMLInputElement>>;
export {};
//# sourceMappingURL=forms.d.ts.map