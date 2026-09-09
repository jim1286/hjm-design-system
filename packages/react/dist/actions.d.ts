import { type ButtonAlign, type ButtonShape, type ButtonSize, type ButtonTone } from "@hjmds/design-contracts/recipes/base";
export type { ButtonAlign, ButtonShape };
import { type IconButtonShape, type IconButtonSize, type IconButtonTone, type LinkTone, type LinkVariant } from "@hjmds/design-contracts/recipes";
import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ForwardedRef, type ReactElement, type ReactNode } from "react";
export type { ButtonSize, ButtonTone } from "@hjmds/design-contracts/recipes/base";
export type { IconButtonShape, IconButtonSize, IconButtonTone, } from "@hjmds/design-contracts/recipes";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & Readonly<{
    tone?: ButtonTone;
    size?: ButtonSize;
    /** Frame geometry. `pill` replaces product code that overrode `border-radius`. */
    shape?: ButtonShape;
    /** Label placement inside the frame; `leading` suits a full-width row action. */
    align?: ButtonAlign;
    /** Toggle state. Paints the selected treatment and sets `aria-pressed`. */
    selected?: boolean;
    loading?: boolean;
    leading?: ReactNode;
    trailing?: ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const Button: import("react").ForwardRefExoticComponent<ButtonHTMLAttributes<HTMLButtonElement> & Readonly<{
    tone?: ButtonTone;
    size?: ButtonSize;
    /** Frame geometry. `pill` replaces product code that overrode `border-radius`. */
    shape?: ButtonShape;
    /** Label placement inside the frame; `leading` suits a full-width row action. */
    align?: ButtonAlign;
    /** Toggle state. Paints the selected treatment and sets `aria-pressed`. */
    selected?: boolean;
    loading?: boolean;
    leading?: ReactNode;
    trailing?: ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLButtonElement>>;
export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & Readonly<{
    label: string;
    tone?: IconButtonTone;
    size?: IconButtonSize;
    shape?: IconButtonShape;
    /** Toggle state. Paints the selected treatment and sets `aria-pressed`. */
    selected?: boolean;
    loading?: boolean;
    children: ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const IconButton: import("react").ForwardRefExoticComponent<Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & Readonly<{
    label: string;
    tone?: IconButtonTone;
    size?: IconButtonSize;
    shape?: IconButtonShape;
    /** Toggle state. Paints the selected treatment and sets `aria-pressed`. */
    selected?: boolean;
    loading?: boolean;
    children: ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLButtonElement>>;
export type LinkRenderProps = AnchorHTMLAttributes<HTMLAnchorElement> & Readonly<{
    children: ReactNode;
    ref: ForwardedRef<HTMLAnchorElement>;
    "data-tone": LinkTone;
    "data-variant": LinkVariant;
    "data-state": "disabled" | "idle";
}>;
export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & Readonly<{
    tone?: LinkTone;
    variant?: LinkVariant;
    disabled?: boolean;
    leading?: ReactNode;
    trailing?: ReactNode;
    /** Framework adapter, for example Next.js Link, while HJM keeps link semantics and state. */
    renderAnchor?: (props: LinkRenderProps) => ReactElement;
}>;
export declare const Link: import("react").ForwardRefExoticComponent<AnchorHTMLAttributes<HTMLAnchorElement> & Readonly<{
    tone?: LinkTone;
    variant?: LinkVariant;
    disabled?: boolean;
    leading?: ReactNode;
    trailing?: ReactNode;
    /** Framework adapter, for example Next.js Link, while HJM keeps link semantics and state. */
    renderAnchor?: (props: LinkRenderProps) => ReactElement;
}> & import("react").RefAttributes<HTMLAnchorElement>>;
//# sourceMappingURL=actions.d.ts.map