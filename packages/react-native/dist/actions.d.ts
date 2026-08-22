import { type ButtonSize as ContractButtonSize, type ButtonTone as ContractButtonTone } from "@hjm/design-contracts/recipes/base";
import { type IconButtonShape, type IconButtonSize, type IconButtonTone as ContractIconButtonTone } from "@hjm/design-contracts/recipes";
import { type LinkDescriptor, type LinkDestination } from "@hjm/design-contracts/components/link";
import type { ReactNode } from "react";
import { type PressableProps, type StyleProp, type ViewStyle } from "react-native";
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
    leading?: ReactNode;
    trailing?: ReactNode;
    style?: StyleProp<ViewStyle>;
}>;
export declare function Button({ label, children, tone, size, disabled, loading, leading, trailing, style, accessibilityLabel, onPress, onLongPress, ...props }: ButtonProps): import("react").JSX.Element;
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
    style?: StyleProp<ViewStyle>;
}>;
export declare function IconButton({ label, accessibilityLabel, children, icon, tone, size, shape, disabled, loading, style, onPress, onLongPress, ...props }: IconButtonProps): import("react").JSX.Element;
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
    accessibilityHint?: string;
    disabled?: boolean;
    loading?: boolean;
    tone?: ButtonTone;
}>;
export type BottomCTAProps = Readonly<{
    primaryAction: BottomCTAAction;
    secondaryAction?: BottomCTAAction;
    description?: string;
    accessibilityLabel?: string;
    safeAreaBottom?: number;
    style?: StyleProp<ViewStyle>;
}>;
/** Native sticky-action content; products own its screen-edge positioning. */
export declare function BottomCTA({ primaryAction, secondaryAction, description, accessibilityLabel, safeAreaBottom, style, }: BottomCTAProps): import("react").JSX.Element;
//# sourceMappingURL=actions.d.ts.map