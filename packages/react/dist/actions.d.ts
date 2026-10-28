import { type ButtonAppearance, type ButtonAlign, type ButtonEdge, type ButtonShape, type ButtonSize, type ButtonTone } from "@hjmds/design-contracts/recipes/base";
export type { ButtonAlign, ButtonEdge, ButtonShape, ButtonAppearance };
import type { ElevationStep } from "@hjmds/design-contracts/foundations";
import { type IconButtonEdge, type IconButtonShape, type IconButtonSize, type IconButtonTone, type LinkTone, type LinkVariant } from "@hjmds/design-contracts/recipes";
import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ForwardedRef, type ReactElement, type ReactNode } from "react";
export type { ButtonSize, ButtonTone } from "@hjmds/design-contracts/recipes/base";
export type { IconButtonEdge, IconButtonShape, IconButtonSize, IconButtonTone, } from "@hjmds/design-contracts/recipes";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & Readonly<{
    tone?: ButtonTone;
    size?: ButtonSize;
    /** Extra pointer area in pixels; compact header tools use 0. Defaults to the size recipe. */
    hitSlop?: number;
    /** Frame geometry. `pill` replaces product code that overrode `border-radius`. */
    shape?: ButtonShape;
    appearance?: ButtonAppearance;
    fullWidth?: boolean;
    /** Label placement inside the frame; `leading` suits a full-width row action. */
    align?: ButtonAlign;
    /** Toggle state. Preserves tone background and sets `aria-pressed`. */
    selected?: boolean;
    loading?: boolean;
    /** Explicit confirmed mutation result. Both text labels remain measured in every state. */
    completion?: Readonly<{
        confirmed: boolean;
        label: string;
    }>;
    leading?: ReactNode;
    trailing?: ReactNode;
    /**
     * Container edge(s) this button sits on. A ghost button overhangs that edge by its inline padding so the label
     * or trailing glyph lines up with the container inset (`resolveButtonEdgeOverhang`); framed tones keep their frame.
     */
    edge?: ButtonEdge;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const Button: import("react").ForwardRefExoticComponent<ButtonHTMLAttributes<HTMLButtonElement> & Readonly<{
    tone?: ButtonTone;
    size?: ButtonSize;
    /** Extra pointer area in pixels; compact header tools use 0. Defaults to the size recipe. */
    hitSlop?: number;
    /** Frame geometry. `pill` replaces product code that overrode `border-radius`. */
    shape?: ButtonShape;
    appearance?: ButtonAppearance;
    fullWidth?: boolean;
    /** Label placement inside the frame; `leading` suits a full-width row action. */
    align?: ButtonAlign;
    /** Toggle state. Preserves tone background and sets `aria-pressed`. */
    selected?: boolean;
    loading?: boolean;
    /** Explicit confirmed mutation result. Both text labels remain measured in every state. */
    completion?: Readonly<{
        confirmed: boolean;
        label: string;
    }>;
    leading?: ReactNode;
    trailing?: ReactNode;
    /**
     * Container edge(s) this button sits on. A ghost button overhangs that edge by its inline padding so the label
     * or trailing glyph lines up with the container inset (`resolveButtonEdgeOverhang`); framed tones keep their frame.
     */
    edge?: ButtonEdge;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLButtonElement>>;
/** Web navigation with Button paint. Mutation/loading/toggle semantics belong to Button. */
export type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & Pick<ButtonProps, "tone" | "size" | "shape" | "appearance" | "fullWidth" | "align" | "leading" | "trailing" | "edge" | "layoutStyle"> & Readonly<{
    href: string;
    disabled?: boolean;
    /** Framework routing adapter; HJM still owns the anchor destination, ref and disabled guards. */
    renderAnchor?: (props: AnchorHTMLAttributes<HTMLAnchorElement> & {
        ref: ForwardedRef<HTMLAnchorElement>;
    }) => ReactElement;
}>;
export declare const ButtonLink: import("react").ForwardRefExoticComponent<AnchorHTMLAttributes<HTMLAnchorElement> & Pick<ButtonProps, "appearance" | "layoutStyle" | "size" | "tone" | "align" | "leading" | "trailing" | "shape" | "fullWidth" | "edge"> & Readonly<{
    href: string;
    disabled?: boolean;
    /** Framework routing adapter; HJM still owns the anchor destination, ref and disabled guards. */
    renderAnchor?: (props: AnchorHTMLAttributes<HTMLAnchorElement> & {
        ref: ForwardedRef<HTMLAnchorElement>;
    }) => ReactElement;
}> & import("react").RefAttributes<HTMLAnchorElement>>;
export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & Readonly<{
    label: string;
    tone?: IconButtonTone;
    size?: IconButtonSize;
    /** Extra pointer area in pixels; compact header tools use 0. Defaults to the size recipe. */
    hitSlop?: number;
    shape?: IconButtonShape;
    /** Toggle state. Preserves tone background and sets `aria-pressed`. */
    selected?: boolean;
    loading?: boolean;
    /**
     * Container edge(s) this button sits on (logical, RTL-aware). A ghost button keeps its touch target but overhangs
     * the edge by (diameter − glyph slot) / 2 so the glyph slot lines up with the container inset
     * (`resolveIconButtonEdgeOverhang`, 2026-10-17 measured audit). Framed tones align their frame and do not move.
     */
    edge?: IconButtonEdge;
    /**
     * Shadow token step for a floating control (iconButtonRecipe.elevation, default `none`). Filled tones only;
     * an elevated ghost button throws.
     */
    elevation?: ElevationStep;
    children: ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const IconButton: import("react").ForwardRefExoticComponent<Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & Readonly<{
    label: string;
    tone?: IconButtonTone;
    size?: IconButtonSize;
    /** Extra pointer area in pixels; compact header tools use 0. Defaults to the size recipe. */
    hitSlop?: number;
    shape?: IconButtonShape;
    /** Toggle state. Preserves tone background and sets `aria-pressed`. */
    selected?: boolean;
    loading?: boolean;
    /**
     * Container edge(s) this button sits on (logical, RTL-aware). A ghost button keeps its touch target but overhangs
     * the edge by (diameter − glyph slot) / 2 so the glyph slot lines up with the container inset
     * (`resolveIconButtonEdgeOverhang`, 2026-10-17 measured audit). Framed tones align their frame and do not move.
     */
    edge?: IconButtonEdge;
    /**
     * Shadow token step for a floating control (iconButtonRecipe.elevation, default `none`). Filled tones only;
     * an elevated ghost button throws.
     */
    elevation?: ElevationStep;
    children: ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLButtonElement>>;
/**
 * Web navigation with IconButton paint, as ButtonLink is to Button. A 44px icon-only destination (shell settings,
 * profile) needs the IconButton frame, `edge` and a current-page treatment; ButtonLink's padded pill and a product
 * `<a>` with its own radius/size/selected CSS both drifted from IconButton (2026-10-23 Diairy ShellSettingsLink).
 * Toggle, loading and mutation semantics stay on IconButton.
 */
export type IconButtonLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "aria-label" | "aria-current" | "children"> & Pick<IconButtonProps, "label" | "tone" | "size" | "hitSlop" | "shape" | "edge" | "layoutStyle"> & Readonly<{
    href: string;
    /** Icon only; `label` is the accessible name. */
    children: ReactNode;
    /** The link points at the current page: `aria-current="page"` without changing the tone background. */
    current?: boolean;
    disabled?: boolean;
    /** Framework routing adapter; HJM still owns the anchor destination, ref, name, current state and disabled guards. */
    renderAnchor?: (props: AnchorHTMLAttributes<HTMLAnchorElement> & {
        ref: ForwardedRef<HTMLAnchorElement>;
    }) => ReactElement;
}>;
export declare const IconButtonLink: import("react").ForwardRefExoticComponent<Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "aria-current" | "aria-label"> & Pick<IconButtonProps, "layoutStyle" | "label" | "size" | "tone" | "shape" | "hitSlop" | "edge"> & Readonly<{
    href: string;
    /** Icon only; `label` is the accessible name. */
    children: ReactNode;
    /** The link points at the current page: `aria-current="page"` without changing the tone background. */
    current?: boolean;
    disabled?: boolean;
    /** Framework routing adapter; HJM still owns the anchor destination, ref, name, current state and disabled guards. */
    renderAnchor?: (props: AnchorHTMLAttributes<HTMLAnchorElement> & {
        ref: ForwardedRef<HTMLAnchorElement>;
    }) => ReactElement;
}> & import("react").RefAttributes<HTMLAnchorElement>>;
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
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const Link: import("react").ForwardRefExoticComponent<AnchorHTMLAttributes<HTMLAnchorElement> & Readonly<{
    tone?: LinkTone;
    variant?: LinkVariant;
    disabled?: boolean;
    leading?: ReactNode;
    trailing?: ReactNode;
    /** Framework adapter, for example Next.js Link, while HJM keeps link semantics and state. */
    renderAnchor?: (props: LinkRenderProps) => ReactElement;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLAnchorElement>>;
//# sourceMappingURL=actions.d.ts.map