import { type ButtonSize, type ButtonTone } from "@hjm/design-contracts/recipes/base";
import { type IconButtonShape, type IconButtonSize, type IconButtonTone, type LinkTone, type LinkVariant } from "@hjm/design-contracts/recipes";
import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";
export type { ButtonSize, ButtonTone } from "@hjm/design-contracts/recipes/base";
export type { IconButtonShape, IconButtonSize, IconButtonTone, } from "@hjm/design-contracts/recipes";
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & Readonly<{
    tone?: ButtonTone;
    size?: ButtonSize;
    loading?: boolean;
    leading?: ReactNode;
    trailing?: ReactNode;
}>;
export declare const Button: import("react").ForwardRefExoticComponent<ButtonHTMLAttributes<HTMLButtonElement> & Readonly<{
    tone?: ButtonTone;
    size?: ButtonSize;
    loading?: boolean;
    leading?: ReactNode;
    trailing?: ReactNode;
}> & import("react").RefAttributes<HTMLButtonElement>>;
export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & Readonly<{
    label: string;
    tone?: IconButtonTone;
    size?: IconButtonSize;
    shape?: IconButtonShape;
    loading?: boolean;
    children: ReactNode;
}>;
export declare const IconButton: import("react").ForwardRefExoticComponent<Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & Readonly<{
    label: string;
    tone?: IconButtonTone;
    size?: IconButtonSize;
    shape?: IconButtonShape;
    loading?: boolean;
    children: ReactNode;
}> & import("react").RefAttributes<HTMLButtonElement>>;
export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & Readonly<{
    tone?: LinkTone;
    variant?: LinkVariant;
    disabled?: boolean;
    leading?: ReactNode;
    trailing?: ReactNode;
}>;
export declare const Link: import("react").ForwardRefExoticComponent<AnchorHTMLAttributes<HTMLAnchorElement> & Readonly<{
    tone?: LinkTone;
    variant?: LinkVariant;
    disabled?: boolean;
    leading?: ReactNode;
    trailing?: ReactNode;
}> & import("react").RefAttributes<HTMLAnchorElement>>;
//# sourceMappingURL=actions.d.ts.map