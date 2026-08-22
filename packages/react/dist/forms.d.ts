import { type FieldShape, type FieldVariant } from "@hjm/design-contracts/recipes/base";
import { type SearchFieldSize } from "@hjm/design-contracts/recipes";
import { type HTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
type FieldCopyProps = Readonly<{
    label: ReactNode;
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
    label: ReactNode;
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
}>;
export declare const SearchField: import("react").ForwardRefExoticComponent<Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "size" | "type"> & Readonly<{
    label: ReactNode;
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
}> & import("react").RefAttributes<HTMLInputElement>>;
export {};
//# sourceMappingURL=forms.d.ts.map