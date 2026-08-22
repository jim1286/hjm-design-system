import { type LoadMoreDescriptor, type LoadMoreMode, type LoadMoreRequestHandler } from "@hjm/design-contracts/components/load-more";
import { type BottomNavigationActivation, type BottomNavigationConfiguration, type BottomNavigationDescriptor } from "@hjm/design-contracts/components/bottom-navigation";
import { type TabsActivationMode, type TabsDirection, type TabsMountPolicy, type TabsOrientation, type TabsPanelMode } from "@hjm/design-contracts/behaviors";
import { type ReactNode } from "react";
import { type ModalProps, type StyleProp, type ViewStyle } from "react-native";
export type TabOption<Value extends string = string> = Readonly<{
    value: Value;
    label: string;
    disabled?: boolean;
    badge?: string;
    badgeAccessibilityLabel?: string;
    /** Optional localized name for this option's tab panel. */
    panelAccessibilityLabel?: string;
    panel?: ReactNode;
}>;
type TabsSelection<Value extends string> = Readonly<{
    value: Value;
    defaultValue?: never;
    onValueChange: (value: Value) => void;
}> | Readonly<{
    value?: never;
    defaultValue?: Value;
    onValueChange?: (value: Value) => void;
}>;
type TabsBaseProps<Value extends string> = Readonly<{
    label: string;
    options: readonly TabOption<Value>[];
    activationMode?: TabsActivationMode;
    mountPolicy?: TabsMountPolicy;
    panelMode?: TabsPanelMode;
    orientation?: TabsOrientation;
    direction?: TabsDirection;
    loop?: boolean;
    children?: (selectedValue: Value) => ReactNode;
    style?: StyleProp<ViewStyle>;
    tabListStyle?: StyleProp<ViewStyle>;
}>;
export type TabsProps<Value extends string = string> = TabsBaseProps<Value> & TabsSelection<Value>;
export declare function Tabs<Value extends string = string>(props: TabsProps<Value>): import("react").JSX.Element;
export type BottomNavigationIconRenderProps<IconName extends string = string> = Readonly<{
    name: IconName;
    selected: boolean;
}>;
export type BottomNavigationProps<Key extends string = string, IconName extends string = string> = Readonly<{
    descriptor: BottomNavigationDescriptor<Key, IconName>;
    onActivate: (activation: BottomNavigationActivation<Key>) => void;
    renderIcon: (props: BottomNavigationIconRenderProps<IconName>) => ReactNode;
    configuration?: BottomNavigationConfiguration;
    safeAreaBottom?: number;
    style?: StyleProp<ViewStyle>;
}>;
/** Router-owned persistent destinations; activation emits intent without mutating selection. */
export declare function BottomNavigation<Key extends string = string, IconName extends string = string>({ descriptor, onActivate, renderIcon, configuration, safeAreaBottom, style, }: BottomNavigationProps<Key, IconName>): import("react").JSX.Element;
export type TopBarProps = Readonly<{
    title: string;
    leading?: ReactNode;
    trailing?: ReactNode;
    centered?: boolean;
    accessibilityLabel?: string;
    safeAreaTop?: number;
    style?: StyleProp<ViewStyle>;
}>;
/** Native screen top bar with logical action slots and large-text reflow. */
export declare function TopBar({ title, leading, trailing, centered, accessibilityLabel, safeAreaTop, style, }: TopBarProps): import("react").JSX.Element;
export type MenuItem<Value extends string = string> = Readonly<{
    value: Value;
    label: string;
    description?: string;
    icon?: ReactNode;
    tone?: "default" | "danger";
    disabled?: boolean;
    accessibilityHint?: string;
}>;
export type MenuProps<Value extends string = string> = Omit<ModalProps, "animationType" | "children" | "onRequestClose" | "onShow" | "transparent" | "visible"> & Readonly<{
    triggerLabel: string;
    title?: string;
    items: readonly MenuItem<Value>[];
    onSelect: (value: Value) => void | Promise<void>;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
    /** Localized accessible name and visible label for dismissing the menu. */
    dismissLabel: string;
    trigger?: ReactNode;
    style?: StyleProp<ViewStyle>;
}>;
/** A compact Modal-backed action menu suitable for touch and screen readers. */
export declare function Menu<Value extends string = string>({ triggerLabel, title, items, onSelect, open, defaultOpen, onOpenChange, disabled, dismissLabel, trigger, style, ...modalProps }: MenuProps<Value>): import("react").JSX.Element;
export type LoadMoreProps = Readonly<{
    descriptor: LoadMoreDescriptor;
    onLoadMore: LoadMoreRequestHandler;
    mode?: LoadMoreMode;
    style?: StyleProp<ViewStyle>;
}>;
/** Collection footer that de-duplicates automatic and manual page requests. */
export declare function LoadMore({ descriptor, onLoadMore, mode, style, }: LoadMoreProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=navigation.d.ts.map