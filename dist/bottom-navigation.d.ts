import { type BottomNavigationDensity, type BottomNavigationDistribution, type BottomNavigationPresentation } from "./component-recipes.js";
import { type SemanticIconName } from "./icon.js";
import type { DesignSystemDirection } from "./design-system-provider.js";
export type BottomNavigationDirection = DesignSystemDirection;
export type BottomNavigationKeyboardBehavior = "hide" | "remain";
export type BottomNavigationConfiguration = Readonly<{
    presentation?: BottomNavigationPresentation;
    distribution?: BottomNavigationDistribution;
    density?: BottomNavigationDensity;
    direction?: BottomNavigationDirection;
    keyboardBehavior?: BottomNavigationKeyboardBehavior;
}>;
export type ResolvedBottomNavigationConfiguration = Readonly<{
    presentation: BottomNavigationPresentation;
    distribution: BottomNavigationDistribution;
    density: BottomNavigationDensity;
    direction: BottomNavigationDirection;
    keyboardBehavior: BottomNavigationKeyboardBehavior;
}>;
/**
 * Bottom navigation only accepts numeric counters. A silent status dot is too
 * ambiguous for a persistent, top-level destination.
 */
export type BottomNavigationCounterBadge = Readonly<{
    count: number;
    max?: number;
    /** Product-localized copy, for example "3 unread messages". */
    accessibilityLabel: string;
}>;
/**
 * BottomNavigation owns icon appearance through its density and state recipe.
 * Products may extend the semantic name registry, but never override size,
 * tone, stroke weight, accessibility, or logical direction at the call site.
 */
export type BottomNavigationIconDescriptor<IconName extends string = SemanticIconName> = Readonly<{
    name: IconName;
    decorative?: true;
    accessibilityLabel?: never;
    size?: never;
    tone?: never;
    weight?: never;
    directionality?: never;
}>;
export type ResolvedBottomNavigationIconDescriptor<IconName extends string = SemanticIconName> = Readonly<{
    name: IconName;
    decorative: true;
}>;
/**
 * Items are stable top-level destinations, never actions. The icon is always
 * decorative because the visible/item accessibility label already names it.
 */
export type BottomNavigationItemDescriptor<Key extends string = string, IconName extends string = SemanticIconName> = Readonly<{
    id: Key;
    label: string;
    accessibilityLabel?: string;
    icon: BottomNavigationIconDescriptor<IconName>;
    badge?: BottomNavigationCounterBadge;
    disabled?: boolean;
}>;
/** The router owns selectedKey; the design-system never keeps a second copy. */
export type BottomNavigationDescriptor<Key extends string = string, IconName extends string = SemanticIconName> = Readonly<{
    accessibilityLabel: string;
    items: readonly BottomNavigationItemDescriptor<Key, IconName>[];
    selectedKey: Key;
}>;
/**
 * The resolved badge intentionally has no accessible label. Renderers hide its
 * subtree and use only the item's resolvedAccessibilityLabel, preventing the
 * counter from being announced twice.
 */
export type ResolvedBottomNavigationCounterBadge = Readonly<{
    visibleLabel: string;
    hiddenFromAccessibility: true;
}>;
export type ResolvedBottomNavigationItemDescriptor<Key extends string = string, IconName extends string = SemanticIconName> = Readonly<{
    id: Key;
    label: string;
    icon: ResolvedBottomNavigationIconDescriptor<IconName>;
    disabled: boolean;
    badge: ResolvedBottomNavigationCounterBadge | null;
    resolvedAccessibilityLabel: string;
}>;
export type ResolvedBottomNavigationDescriptor<Key extends string = string, IconName extends string = SemanticIconName> = Readonly<{
    accessibilityLabel: string;
    items: readonly ResolvedBottomNavigationItemDescriptor<Key, IconName>[];
    selectedKey: Key;
}>;
export type BottomNavigationActivation<Key extends string = string> = Readonly<{
    key: Key;
    reason: "navigate" | "reselect";
}>;
/**
 * `maxItems` follows the platform bars rather than Material's five-destination
 * guidance: iOS tab bars and Android navigation bars both render six labelled
 * destinations without collapsing, and products that ship six need the shared
 * contract to describe them instead of routing around it.
 */
export declare const bottomNavigationBehaviorDefaults: {
    readonly direction: "ltr";
    readonly keyboardBehavior: "hide";
    readonly minItems: 2;
    readonly maxItems: 6;
};
export declare function validateBottomNavigationConfiguration(configuration: BottomNavigationConfiguration, itemCount: number): void;
export declare function resolveBottomNavigationConfiguration(configuration: BottomNavigationConfiguration, itemCount: number): ResolvedBottomNavigationConfiguration;
export declare function validateBottomNavigationDescriptor<Key extends string, IconName extends string>(descriptor: BottomNavigationDescriptor<Key, IconName>): void;
export declare function resolveBottomNavigationItem<Key extends string, IconName extends string>(item: BottomNavigationItemDescriptor<Key, IconName>): ResolvedBottomNavigationItemDescriptor<Key, IconName>;
export declare function resolveBottomNavigationDescriptor<Key extends string, IconName extends string>(descriptor: BottomNavigationDescriptor<Key, IconName>): ResolvedBottomNavigationDescriptor<Key, IconName>;
/**
 * Produces navigation intent without mutating selectedKey. A renderer forwards
 * the request to its router, which updates selectedKey only after navigation.
 */
export declare function resolveBottomNavigationActivation<Key extends string, IconName extends string>(descriptor: BottomNavigationDescriptor<Key, IconName>, key: Key): BottomNavigationActivation<Key> | null;
//# sourceMappingURL=bottom-navigation.d.ts.map