import { type ButtonSize as ContractButtonSize, type ButtonTone as ContractButtonTone } from "@hjm/design-contracts/recipes/base";
import { type IconButtonShape, type IconButtonSize, type IconButtonTone as ContractIconButtonTone } from "@hjm/design-contracts/recipes";
import { type LinkDescriptor, type LinkDestination } from "@hjm/design-contracts/components/link";
import { type ReactNode } from "react";
import { View, type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
export type ButtonTone = ContractButtonTone;
export type ButtonSize = ContractButtonSize;
export type { IconButtonShape, IconButtonSize, } from "@hjm/design-contracts/recipes";
export type ButtonProps = Omit<PressableProps, "accessibilityRole" | "accessibilityState" | "children" | "disabled" | "hitSlop" | "style"> & Readonly<{
    /** @deprecated Prefer renderer-neutral `children`. */
    label?: string;
    children?: ReactNode;
    tone?: ButtonTone;
    size?: ButtonSize;
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
    style?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
    renderLoadingIndicator?: (props: Readonly<{
        color: string;
        size: "small";
    }>) => ReactNode;
}>;
export declare const Button: import("react").ForwardRefExoticComponent<Omit<PressableProps, "style" | "children" | "hitSlop" | "accessibilityRole" | "accessibilityState" | "disabled"> & Readonly<{
    /** @deprecated Prefer renderer-neutral `children`. */
    label?: string;
    children?: ReactNode;
    tone?: ButtonTone;
    size?: ButtonSize;
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
    style?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
    renderLoadingIndicator?: (props: Readonly<{
        color: string;
        size: "small";
    }>) => ReactNode;
}> & import("react").RefAttributes<View>>;
export type IconButtonTone = ContractIconButtonTone;
/** @deprecated `link` was never an IconButton recipe tone; use `ghost`. */
export type LegacyNativeIconButtonTone = "link";
type IconButtonNameProps = Readonly<{
    label: string;
    accessibilityLabel?: never;
}> | Readonly<{
    label?: never;
    /** @deprecated Prefer the renderer-neutral `label`. */
    accessibilityLabel: string;
}>;
type IconButtonContentProps = Readonly<{
    children: ReactNode;
    icon?: never;
}> | Readonly<{
    children?: never;
    /** @deprecated Prefer the renderer-neutral `children`. */
    icon: ReactNode;
}>;
export type IconButtonProps = Omit<PressableProps, "accessibilityLabel" | "accessibilityRole" | "accessibilityState" | "children" | "disabled" | "hitSlop" | "style"> & IconButtonNameProps & IconButtonContentProps & Readonly<{
    tone?: IconButtonTone | LegacyNativeIconButtonTone;
    size?: IconButtonSize;
    shape?: IconButtonShape;
    disabled?: boolean;
    loading?: boolean;
    /** Keep the busy control discoverable by default; opt in only for legacy disabled semantics. */
    disableWhileLoading?: boolean;
    hitSlop?: PressableProps["hitSlop"];
    accessibilityState?: PressableProps["accessibilityState"];
    style?: StyleProp<ViewStyle>;
    renderLoadingIndicator?: (props: Readonly<{
        color: string;
        size: "small";
    }>) => ReactNode;
}>;
export declare const IconButton: import("react").ForwardRefExoticComponent<IconButtonProps & import("react").RefAttributes<View>>;
export type LinkProps = Omit<PressableProps, "accessibilityLabel" | "accessibilityRole" | "children" | "disabled" | "style"> & Readonly<{
    descriptor: LinkDescriptor;
    /** Product router boundary for both internal and external destinations. */
    onNavigate: (destination: LinkDestination) => void | Promise<void>;
    leading?: ReactNode;
    trailing?: ReactNode;
    accessibilityHint?: string;
    style?: StyleProp<ViewStyle>;
}>;
export declare function Link({ descriptor, onNavigate, leading, trailing, accessibilityHint, style, ...props }: LinkProps): import("react").JSX.Element;
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
    style?: StyleProp<ViewStyle>;
    testID?: string;
}>;
/** Native sticky-action content; products own its screen-edge positioning. */
export declare function BottomCTA({ primaryAction, secondaryAction, description, accessibilityLabel, safeAreaBottom, style, testID, }: BottomCTAProps): import("react").JSX.Element;
//# sourceMappingURL=actions.d.ts.map