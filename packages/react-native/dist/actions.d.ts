import type { ComponentRef } from "react";
import { type LinkDescriptor, type LinkDestination } from "@hjmds/design-contracts/components/link";
import type { SemanticIconName } from "@hjmds/design-contracts/components/icon";
import { type IconButtonEdge, type IconButtonTone as ContractIconButtonTone, type IconButtonShape, type IconButtonSize } from "@hjmds/design-contracts/recipes";
import { type ButtonAlign as ContractButtonAlign, type ButtonAppearance as ContractButtonAppearance, type ButtonEdge as ContractButtonEdge, type ButtonShape as ContractButtonShape, type ButtonSize as ContractButtonSize, type ButtonTone as ContractButtonTone } from "@hjmds/design-contracts/recipes/base";
import { forwardRef, type ReactNode, type Ref } from "react";
import { type View as NativeView, type PressableProps } from "react-native";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { type NativeIconRenderProps } from "./primitives.js";
export type ButtonTone = ContractButtonTone;
export type ButtonSize = ContractButtonSize;
export type ButtonShape = ContractButtonShape;
export type ButtonAppearance = ContractButtonAppearance;
export type ButtonAlign = ContractButtonAlign;
export type ButtonEdge = ContractButtonEdge;
export type { IconButtonEdge, IconButtonShape, IconButtonSize } from "@hjmds/design-contracts/recipes";
export type ButtonProps = Omit<PressableProps, "accessibilityRole" | "accessibilityState" | "children" | "disabled" | "hitSlop" | "style"> & Readonly<{
    children?: ReactNode;
    tone?: ButtonTone;
    size?: ButtonSize;
    /** Frame geometry. `pill` replaces product code that overrode `borderRadius`. */
    shape?: ButtonShape;
    appearance?: ButtonAppearance;
    /** Label placement inside the frame; `leading` suits a full-width row action. */
    align?: ButtonAlign;
    /** Toggle state. Paints the selected treatment and reports it to assistive tech. */
    selected?: boolean;
    disabled?: boolean;
    loading?: boolean;
    /** Explicit confirmed mutation result. Both text labels reserve the same slot in every state. */
    completion?: Readonly<{
        confirmed: boolean;
        label: string;
    }>;
    /** Keep the busy control discoverable by default; opt in only for legacy disabled semantics. */
    disableWhileLoading?: boolean;
    /** Allow the control to grow beyond its recipe height for large or custom content. */
    growWithContent?: boolean;
    loadingLabel?: ReactNode;
    leading?: ReactNode;
    trailing?: ReactNode;
    /**
     * Container edge(s) this button sits on (start/end follow the reading direction). A ghost button overhangs that
     * edge by its inline padding so the label or trailing glyph lines up with the inset (`resolveButtonEdgeOverhang`).
     */
    edge?: ButtonEdge;
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
export declare const Button: ReturnType<typeof forwardRef<ComponentRef<typeof NativeView>, ButtonProps>>;
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
    /**
     * Container edge(s) this button sits on (start/end follow the reading direction). A ghost button keeps its touch
     * target but overhangs the edge by (diameter − glyph slot) / 2 so the glyph slot lines up with the container inset
     * (`resolveIconButtonEdgeOverhang`, 2026-10-17 measured audit). Framed tones align their frame and do not move.
     */
    edge?: IconButtonEdge;
    /** Keep the busy control discoverable by default; opt in only for legacy disabled semantics. */
    disableWhileLoading?: boolean;
    hitSlop?: PressableProps["hitSlop"];
    accessibilityState?: PressableProps["accessibilityState"];
    renderLoadingIndicator?: (props: Readonly<{
        color: string;
        size: "small";
    }>) => ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const IconButton: ReturnType<typeof forwardRef<ComponentRef<typeof NativeView>, IconButtonProps>>;
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
}>;
export declare function Link({ descriptor, onNavigate, leading, trailing, renderIcon, accessibilityHint, layoutStyle, ...props }: LinkProps): import("react").JSX.Element;
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
    /** Decorative Button adornments; label remains the action name. */
    leading?: ReactNode;
    trailing?: ReactNode;
    /**
     * Ref to this action's button. Native overlays return focus only to an explicit target
     * (`ImmersiveOverlay`/`Dialog` `returnFocusRef`), so the action that opens one must expose its button
     * (2026-10-18 Utilverse display board: focus did not come back after closing the board).
     */
    buttonRef?: Ref<ComponentRef<typeof NativeView>>;
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
    testID?: string;
}>;
/** Native sticky-action content; products own its screen-edge positioning. */
export declare function BottomCTA({ primaryAction, secondaryAction, description, accessibilityLabel, safeAreaBottom, layoutStyle, testID, ...removedProps }: BottomCTAProps): import("react").JSX.Element;
//# sourceMappingURL=actions.d.ts.map