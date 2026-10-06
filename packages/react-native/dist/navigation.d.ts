import { type AsyncCollectionState, type CollectionItemDescriptor, type CollectionSectionDescriptor, type CollectionSelectionModel, type TabsActivationMode, type TabsDirection, type TabsMountPolicy, type TabsOrientation, type TabsPanelMode } from "@hjmds/design-contracts/behaviors";
import { type BottomNavigationActivation, type BottomNavigationConfiguration, type BottomNavigationDescriptor, type ResolvedBottomNavigationCounterBadge, type ResolvedBottomNavigationItemDescriptor } from "@hjmds/design-contracts/components/bottom-navigation";
import { type CollectionSource } from "@hjmds/design-contracts/components/collection";
import type { LinkDestination } from "@hjmds/design-contracts/components/link";
import { type LoadMoreDescriptor, type LoadMoreMode, type LoadMoreRequestHandler, type LoadMoreRequestOutcome, type LoadMoreRequestReason } from "@hjmds/design-contracts/components/load-more";
import { type TabsAppearance } from "@hjmds/design-contracts/gooey-navigation";
import { type LoadMoreDensity, type MenuDensity, type TabSize, type TabsLayout, type TabsOverflow } from "@hjmds/design-contracts/recipes";
import { type ReactElement, type ReactNode } from "react";
import { type ModalProps, type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type { TabsAppearance };
export type TabItem<Value extends string = string> = Readonly<{
    id: Value;
    label: string;
    disabled?: boolean;
    badge?: string;
    badgeAccessibilityLabel?: string;
    renderLeading?: (appearance: TabLeadingRenderProps) => ReactNode;
    /** Optional localized name for this item's tab panel. */
    panelAccessibilityLabel?: string;
    panel?: ReactNode;
}>;
export type TabLeadingRenderProps = Readonly<{
    selected: boolean;
    disabled: boolean;
    color: string;
    /** Pixel size resolved from `tabsRecipe.icon.glyph`. */
    size: number;
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
    /** Stable id used to associate external panels and automation targets. */
    id?: string;
    label: string;
    activationMode?: TabsActivationMode;
    mountPolicy?: TabsMountPolicy;
    panelMode?: TabsPanelMode;
    appearance?: TabsAppearance;
    orientation?: TabsOrientation;
    direction?: TabsDirection;
    loop?: boolean;
    size?: TabSize;
    layout?: TabsLayout;
    overflow?: TabsOverflow;
    /** Set false when panels are rendered separately with `TabPanel`. */
    renderPanels?: boolean;
    children?: (selectedValue: Value) => ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement; `tabsRecipe` (`size`/`layout`/`appearance`) owns appearance. Removed in the next major
     * (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` on Tabs for placement; `layout`/`overflow` own the tab list. Removed in the next major
     * (consumer-policy.md §3.1).
     */
    tabListStyle?: StyleProp<ViewStyle>;
}>;
type TabsCollectionProps<Value extends string> = Readonly<{
    items: readonly TabItem<Value>[];
}>;
export type TabsProps<Value extends string = string> = TabsBaseProps<Value> & TabsCollectionProps<Value> & TabsSelection<Value>;
export declare function getTabId(tabsId: string, value: string): string;
export declare function getTabPanelId(tabsId: string, value: string, mode?: TabsPanelMode): string;
export declare function getDynamicTabPanelId(tabsId: string): string;
type ExternalTabPanelBaseProps = Readonly<{
    tabsId: string;
    activeValue: string;
    label: string;
    children: ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement; panel content owns its own surface. Removed in the next major
     * (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
}>;
export type TabPanelProps = ExternalTabPanelBaseProps & (Readonly<{
    mode: "dynamic";
    value?: never;
    mountPolicy?: never;
}> | Readonly<{
    mode?: "keyed";
    value: string;
    mountPolicy?: TabsMountPolicy;
}>);
/** External panel host for products that keep routing, query, or list state outside Tabs. */
export declare function TabPanel(props: TabPanelProps): import("react").JSX.Element | null;
export declare function Tabs<Value extends string = string>(props: TabsProps<Value>): import("react").JSX.Element;
export type BottomNavigationIconRenderProps<Key extends string = string, IconName extends string = string> = Readonly<{
    item: ResolvedBottomNavigationItemDescriptor<Key, IconName>;
    name: IconName;
    selected: boolean;
    color: string;
    size: number;
    strokeWidth: number;
}>;
export type BottomNavigationBadgeRenderProps<Key extends string = string, IconName extends string = string> = Readonly<{
    item: ResolvedBottomNavigationItemDescriptor<Key, IconName>;
    badge: ResolvedBottomNavigationCounterBadge;
    count: number;
    max?: number;
    selected: boolean;
}>;
export type BottomNavigationProps<Key extends string = string, IconName extends string = string> = Readonly<{
    descriptor: BottomNavigationDescriptor<Key, IconName>;
    onActivate: (activation: BottomNavigationActivation<Key>) => void;
    /** Optional router adapter for tabLongPress or an equivalent intent. */
    onLongActivate?: (activation: BottomNavigationActivation<Key>) => void;
    renderIcon: (props: BottomNavigationIconRenderProps<Key, IconName>) => ReactNode;
    /** Product badge adapter; its subtree remains hidden from accessibility. */
    renderBadge?: (props: BottomNavigationBadgeRenderProps<Key, IconName>) => ReactNode;
    getItemTestID?: (item: ResolvedBottomNavigationItemDescriptor<Key, IconName>) => string | undefined;
    /** Centered sibling action. Pair with `distribution: "center-gap"`. */
    primaryAction?: ReactNode;
    configuration?: BottomNavigationConfiguration;
    safeAreaBottom?: number;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement; `configuration` (presentation/density/distribution) owns appearance. Removed in the next major
     * (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `configuration.presentation`/`density`. Removed in the next major
     * (consumer-policy.md §3.1).
     */
    surfaceStyle?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `configuration.distribution`. Removed in the next major
     * (consumer-policy.md §3.1).
     */
    listStyle?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `configuration.distribution: "center-gap"`. Removed in the next major
     * (consumer-policy.md §3.1).
     */
    primaryActionStyle?: StyleProp<ViewStyle>;
}>;
/** Router-owned persistent destinations; activation emits intent without mutating selection. */
export declare function BottomNavigation<Key extends string = string, IconName extends string = string>({ descriptor, onActivate, onLongActivate, renderIcon, renderBadge, getItemTestID, primaryAction, configuration, safeAreaBottom, layoutStyle, style, surfaceStyle, listStyle, primaryActionStyle, }: BottomNavigationProps<Key, IconName>): import("react").JSX.Element | null;
type TopBarActionHostProps = Omit<PressableProps, "accessible" | "accessibilityLabel" | "accessibilityRole" | "accessibilityState" | "children" | "disabled" | "onPress" | "role" | "style">;
export type TopBarActionControlProps = TopBarActionHostProps & Readonly<{
    accessible: true;
    accessibilityLabel: string;
    accessibilityRole: "button" | "link";
    accessibilityState: NonNullable<PressableProps["accessibilityState"]>;
    children: ReactNode;
    disabled: boolean;
    onPress: NonNullable<PressableProps["onPress"]>;
    role: "button" | "link";
    style: NonNullable<PressableProps["style"]>;
}>;
export type TopBarLinkRenderProps = TopBarActionControlProps & Readonly<{
    destination: LinkDestination;
}>;
type TopBarActionBaseProps = TopBarActionHostProps & Readonly<{
    /** Visible micro copy and the default accessible name; products own localization. */
    label: string;
    accessibilityLabel?: string;
    accessibilityState?: PressableProps["accessibilityState"];
    children: ReactNode;
    disabled?: boolean;
    /** Back/close affordances may keep the product label accessibility-only. */
    labelVisibility?: "visible" | "accessibility-only";
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `labelVisibility`; `topBarRecipe.actionLabel` owns typography. Removed in the next major
     * (consumer-policy.md §3.1).
     */
    labelStyle?: StyleProp<TextStyle>;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement; `topBarRecipe.action` owns size and states. Removed in the next major
     * (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
}>;
type TopBarButtonActionProps = TopBarActionBaseProps & Readonly<{
    intent?: "button";
    onPress: NonNullable<PressableProps["onPress"]>;
    destination?: never;
    onNavigate?: never;
    renderAction?: (props: TopBarActionControlProps) => ReactElement;
    renderLink?: never;
}>;
type TopBarLinkActionProps = TopBarActionBaseProps & Readonly<{
    intent: "link";
    destination: LinkDestination;
    /** Optional when the router adapter owns activation (for example Expo Router `Link`). */
    onNavigate?: (destination: LinkDestination) => void | Promise<void>;
    onPress?: never;
    renderAction?: never;
    renderLink?: (props: TopBarLinkRenderProps) => ReactElement;
}>;
export type TopBarActionProps = TopBarButtonActionProps | TopBarLinkActionProps;
/** Recipe-owned icon-over-micro-label action for Native screen chrome. */
export declare function TopBarAction(props: TopBarActionProps): import("react").JSX.Element;
export type TopBarProps = Readonly<{
    title?: string;
    /** Optional visual before the title, such as a small product avatar. */
    titleLeading?: ReactNode;
    /** Makes the complete title slot a named 44pt action. */
    onTitlePress?: NonNullable<PressableProps["onPress"]>;
    titleAccessibilityLabel?: string;
    titleAccessibilityHint?: string;
    leading?: ReactNode;
    trailing?: ReactNode;
    /** Semantic alias for trailing actions; do not combine with `trailing`. */
    actions?: ReactNode;
    centered?: boolean;
    safeAreaTop?: number;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement; `centered`/`topBarRecipe` own appearance. Removed in the next major
     * (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `centered` and slot content; `topBarRecipe` owns slot sizing. Removed in the next major
     * (consumer-policy.md §3.1).
     */
    leadingStyle?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `topBarRecipe.title` typography. Removed in the next major
     * (consumer-policy.md §3.1).
     */
    titleStyle?: StyleProp<TextStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `centered` and slot content; `topBarRecipe` owns slot sizing. Removed in the next major
     * (consumer-policy.md §3.1).
     */
    trailingStyle?: StyleProp<ViewStyle>;
}>;
/** Native screen top bar with logical action slots and large-text reflow. */
export declare function TopBar({ title, titleLeading, onTitlePress, titleAccessibilityLabel, titleAccessibilityHint, leading, trailing, actions, centered, safeAreaTop, layoutStyle, style, leadingStyle, titleStyle, trailingStyle, }: TopBarProps): import("react").JSX.Element;
/** Flat and sectioned menus share collection identifiers and rendering slots. */
export type MenuItem<Value extends string = string> = Omit<CollectionItemDescriptor<Value>, "textValue"> & Readonly<{
    textValue?: string;
}>;
export type MenuSection<Value extends string = string, SectionKey extends string = string> = CollectionSectionDescriptor<Value, SectionKey>;
export type MenuOpenChangeReason = "trigger" | "selection" | "escape" | "outside" | "programmatic";
export type MenuItemRenderProps = Readonly<{
    selected: boolean;
    disabled: boolean;
    color: string;
    size: number;
}>;
export type MenuTriggerRenderProps = Readonly<{
    accessibilityState: Readonly<{
        busy: boolean;
        disabled: boolean;
        expanded: boolean;
    }>;
    onPress: () => void;
}>;
export type MenuProps<Value extends string = string, SectionKey extends string = string> = Omit<ModalProps, "animationType" | "children" | "onDismiss" | "onRequestClose" | "onShow" | "style" | "transparent" | "visible"> & Readonly<{
    triggerLabel: string;
    title?: string;
    items?: readonly MenuItem<Value>[];
    sections?: readonly MenuSection<Value, SectionKey>[];
    source?: CollectionSource<Value, SectionKey>;
    selection?: CollectionSelectionModel<Value>;
    onAction?: (value: Value) => void | Promise<void>;
    onActionAfterDismiss?: (value: Value) => void | Promise<void>;
    onSelectionAfterDismiss?: (value: Value) => void | Promise<void>;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, reason: MenuOpenChangeReason) => void;
    onDismiss?: (reason: MenuOpenChangeReason) => void;
    disabled?: boolean;
    readOnly?: boolean;
    busy?: boolean;
    readOnlyLabel?: string;
    asyncState?: AsyncCollectionState;
    onRetry?: () => void;
    retryLabel?: string;
    density?: MenuDensity;
    renderLeading?: (item: CollectionItemDescriptor<Value>, props: MenuItemRenderProps) => ReactNode;
    renderTrailing?: (item: CollectionItemDescriptor<Value>) => ReactNode;
    /** Localized accessible name and visible label for dismissing the menu. */
    dismissLabel: string;
    trigger?: ReactNode;
    renderTrigger?: (props: MenuTriggerRenderProps) => ReactElement;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement of the trigger host; `density`/`menuRecipe` own appearance. Removed in the next major
     * (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
}>;
/** Sectioned Native action/selection menu with teardown-safe action callbacks. */
export declare function Menu<Value extends string = string, SectionKey extends string = string>({ triggerLabel, title, items, sections, source: sourceProp, selection, onAction, onActionAfterDismiss, onSelectionAfterDismiss, open, defaultOpen, onOpenChange, onDismiss, disabled, readOnly, busy, readOnlyLabel, asyncState, onRetry, retryLabel, density, renderLeading, renderTrailing, dismissLabel, trigger, renderTrigger, layoutStyle, style, ...modalProps }: MenuProps<Value, SectionKey>): import("react").JSX.Element;
export type LoadMoreProps = Readonly<{
    descriptor: LoadMoreDescriptor;
    onLoadMore: LoadMoreRequestHandler;
    mode?: LoadMoreMode;
    density?: LoadMoreDensity;
    onRequestOutcome?: (outcome: LoadMoreRequestOutcome, reason: LoadMoreRequestReason) => void;
    onRequestError?: (error: unknown, reason: LoadMoreRequestReason) => void;
    /** Canonical layout-only placement. Controlled visual and state keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export type LoadMoreHandle = Readonly<{
    /** Pass this method to FlatList.onEndReached through a small callback. */
    onEndReached(): Promise<LoadMoreRequestOutcome>;
}>;
/** Collection footer that de-duplicates automatic and manual page requests. */
export declare const LoadMore: import("react").ForwardRefExoticComponent<Readonly<{
    descriptor: LoadMoreDescriptor;
    onLoadMore: LoadMoreRequestHandler;
    mode?: LoadMoreMode;
    density?: LoadMoreDensity;
    onRequestOutcome?: (outcome: LoadMoreRequestOutcome, reason: LoadMoreRequestReason) => void;
    onRequestError?: (error: unknown, reason: LoadMoreRequestReason) => void;
    /** Canonical layout-only placement. Controlled visual and state keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<Readonly<{
    /** Pass this method to FlatList.onEndReached through a small callback. */
    onEndReached(): Promise<LoadMoreRequestOutcome>;
}>>>;
//# sourceMappingURL=navigation.d.ts.map