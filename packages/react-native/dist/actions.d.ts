import { type LinkDescriptor, type LinkDestination } from "@hjmds/design-contracts/components/link";
import type { SemanticIconName } from "@hjmds/design-contracts/components/icon";
import { type IconButtonTone as ContractIconButtonTone, type IconButtonShape, type IconButtonSize } from "@hjmds/design-contracts/recipes";
import { type ButtonAlign as ContractButtonAlign, type ButtonShape as ContractButtonShape, type ButtonSize as ContractButtonSize, type ButtonTone as ContractButtonTone } from "@hjmds/design-contracts/recipes/base";
import { type ReactNode } from "react";
import { View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { type NativeIconRenderProps } from "./primitives.js";
export type ButtonTone = ContractButtonTone;
export type ButtonSize = ContractButtonSize;
export type ButtonShape = ContractButtonShape;
export type ButtonAlign = ContractButtonAlign;
export type { IconButtonShape, IconButtonSize } from "@hjmds/design-contracts/recipes";
export type ButtonProps = Omit<PressableProps, "accessibilityRole" | "accessibilityState" | "children" | "disabled" | "hitSlop" | "style"> & Readonly<{
    children?: ReactNode;
    tone?: ButtonTone;
    size?: ButtonSize;
    /** Frame geometry. `pill` replaces product code that overrode `borderRadius`. */
    shape?: ButtonShape;
    /** Label placement inside the frame; `leading` suits a full-width row action. */
    align?: ButtonAlign;
    /** Toggle state. Paints the selected treatment and reports it to assistive tech. */
    selected?: boolean;
    disabled?: boolean;
    loading?: boolean;
    /** Keep the busy control discoverable by default; opt in only for legacy disabled semantics. */
    disableWhileLoading?: boolean;
    /** Allow the control to grow beyond its recipe height for large or custom content. */
    growWithContent?: boolean;
    loadingLabel?: ReactNode;
    leading?: ReactNode;
    trailing?: ReactNode;
    fullWidth?: boolean;
    hitSlop?: PressableProps["hitSlop"];
    accessibilityState?: PressableProps["accessibilityState"];
    /** Canonical layout-only placement. Controlled visual and state keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    renderLoadingIndicator?: (props: Readonly<{
        color: string;
        size: "small";
    }>) => ReactNode;
}>;
export declare const Button: import("react").ForwardRefExoticComponent<Omit<PressableProps, "style" | "children" | "hitSlop" | "accessibilityRole" | "accessibilityState" | "disabled"> & Readonly<{
    children?: ReactNode;
    tone?: ButtonTone;
    size?: ButtonSize;
    /** Frame geometry. `pill` replaces product code that overrode `borderRadius`. */
    shape?: ButtonShape;
    /** Label placement inside the frame; `leading` suits a full-width row action. */
    align?: ButtonAlign;
    /** Toggle state. Paints the selected treatment and reports it to assistive tech. */
    selected?: boolean;
    disabled?: boolean;
    loading?: boolean;
    /** Keep the busy control discoverable by default; opt in only for legacy disabled semantics. */
    disableWhileLoading?: boolean;
    /** Allow the control to grow beyond its recipe height for large or custom content. */
    growWithContent?: boolean;
    loadingLabel?: ReactNode;
    leading?: ReactNode;
    trailing?: ReactNode;
    fullWidth?: boolean;
    hitSlop?: PressableProps["hitSlop"];
    accessibilityState?: PressableProps["accessibilityState"];
    /** Canonical layout-only placement. Controlled visual and state keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    renderLoadingIndicator?: (props: Readonly<{
        color: string;
        size: "small";
    }>) => ReactNode;
}> & import("react").RefAttributes<View>>;
export type IconButtonTone = ContractIconButtonTone;
type IconButtonNameProps = Readonly<{
    label: string;
}>;
type IconButtonContentProps = Readonly<{
    children: ReactNode;
}>;
export type IconButtonProps = Omit<PressableProps, "accessibilityLabel" | "accessibilityRole" | "accessibilityState" | "children" | "disabled" | "hitSlop" | "style"> & IconButtonNameProps & IconButtonContentProps & Readonly<{
    tone?: IconButtonTone;
    size?: IconButtonSize;
    shape?: IconButtonShape;
    /** Toggle state. Paints the selected treatment and reports it to assistive tech. */
    selected?: boolean;
    disabled?: boolean;
    loading?: boolean;
    /** Keep the busy control discoverable by default; opt in only for legacy disabled semantics. */
    disableWhileLoading?: boolean;
    hitSlop?: PressableProps["hitSlop"];
    accessibilityState?: PressableProps["accessibilityState"];
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and
     * `tone`/`size`/`shape`/`selected` for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    renderLoadingIndicator?: (props: Readonly<{
        color: string;
        size: "small";
    }>) => ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const IconButton: import("react").ForwardRefExoticComponent<Omit<PressableProps, "style" | "children" | "hitSlop" | "accessibilityLabel" | "accessibilityRole" | "accessibilityState" | "disabled"> & Readonly<{
    label: string;
}> & Readonly<{
    children: ReactNode;
}> & Readonly<{
    tone?: IconButtonTone;
    size?: IconButtonSize;
    shape?: IconButtonShape;
    /** Toggle state. Paints the selected treatment and reports it to assistive tech. */
    selected?: boolean;
    disabled?: boolean;
    loading?: boolean;
    /** Keep the busy control discoverable by default; opt in only for legacy disabled semantics. */
    disableWhileLoading?: boolean;
    hitSlop?: PressableProps["hitSlop"];
    accessibilityState?: PressableProps["accessibilityState"];
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and
     * `tone`/`size`/`shape`/`selected` for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    renderLoadingIndicator?: (props: Readonly<{
        color: string;
        size: "small";
    }>) => ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<View>>;
export type LinkProps = Omit<PressableProps, "accessibilityLabel" | "accessibilityRole" | "children" | "disabled" | "style"> & Readonly<{
    descriptor: LinkDescriptor;
    /** Product router boundary for both internal and external destinations. */
    onNavigate: (destination: LinkDestination) => void | Promise<void>;
    leading?: ReactNode;
    trailing?: ReactNode;
    /**
     * Product glyph boundary for `descriptor.leadingIcon` / `trailingIcon`. HJM resolves size
     * (`linkRecipe.icon.glyph`), the link tone, decorative semantics and RTL mirroring through `Icon`,
     * so the caller only maps a semantic name to a glyph (for example `createLucideGlyph`).
     */
    renderIcon?: (props: NativeIconRenderProps<SemanticIconName>) => ReactNode;
    accessibilityHint?: string;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement; link
     * color, underline and target size belong to `linkRecipe`. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
}>;
export declare function Link({ descriptor, onNavigate, leading, trailing, renderIcon, accessibilityHint, layoutStyle, style, ...props }: LinkProps): import("react").JSX.Element;
export type BottomCTAAction = Readonly<{
    label: string;
    onPress: NonNullable<PressableProps["onPress"]>;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    disabled?: boolean;
    loading?: boolean;
    loadingLabel?: ReactNode;
    size?: ButtonSize;
    tone?: ButtonTone;
}>;
export type BottomCTAProps = Readonly<{
    primaryAction: BottomCTAAction;
    /** A second HJM action descriptor or an arbitrary product-owned action node. */
    secondaryAction?: BottomCTAAction | ReactNode;
    description?: string;
    accessibilityLabel?: string;
    safeAreaBottom?: number;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement;
     * surface, border and shadow belong to `bottomCtaRecipe`. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    testID?: string;
}>;
/** Native sticky-action content; products own its screen-edge positioning. */
export declare function BottomCTA({ primaryAction, secondaryAction, description, accessibilityLabel, safeAreaBottom, layoutStyle, style, testID, }: BottomCTAProps): import("react").JSX.Element;
//# sourceMappingURL=actions.d.ts.map