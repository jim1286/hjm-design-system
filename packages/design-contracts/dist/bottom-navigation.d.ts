import { type BottomNavigationDensity, type BottomNavigationDistribution, type BottomNavigationPresentation } from "./bottom-navigation-defaults.js";
import { type SemanticIconName } from "./icon.js";
import type { DesignSystemDirection } from "./design-system-provider.js";
export type BottomNavigationDirection = DesignSystemDirection;
export type BottomNavigationKeyboardBehavior = "hide" | "remain";
/**
 * `hidden` drops the visible destination name and keeps it as the item's
 * accessible name. Icon-only bars rely on the icon stroke/scale emphasis (and
 * any product selection mark) for non-color selected evidence, so products
 * choose it deliberately; the default keeps labels visible. Added 2026-10-10
 * for BurnTok's icon-only dock instead of letting the app hide labels with
 * deprecated styles or transparent palette overrides.
 */
export type BottomNavigationLabels = "visible" | "hidden";
export type BottomNavigationConfiguration = Readonly<{
    presentation?: BottomNavigationPresentation;
    distribution?: BottomNavigationDistribution;
    density?: BottomNavigationDensity;
    direction?: BottomNavigationDirection;
    keyboardBehavior?: BottomNavigationKeyboardBehavior;
    labels?: BottomNavigationLabels;
    /** Inset selected destination card, with equal widths and persistent labels. Floating only. */
    selection?: "emphasis" | "tile";
    /**
     * `raised` paints the tile bar as a thick plank: a sunken surface role with a
     * control-colored lower edge, and a darker lower edge under the selected tile.
     * Tile selection only. Added 2026-10-13 for Spint's wooden-sign tab bar so the
     * product supplies colors through palette roles instead of deprecated styles.
     */
    surface?: BottomNavigationSurface;
    /**
     * Icon slot size. `standard` keeps the density glyph; `large`/`xlarge` reserve an app-icon sized slot
     * (`bottomNavigationRecipe.iconSizes`) for artwork rendered through `renderIcon`. Added 2026-10-18 for
     * Utilverse's dock, which drew its own Surface/Button row to show 38-54pt app icons.
     */
    iconSize?: BottomNavigationIconSize;
    /**
     * Frame of the floating surface (`bottomNavigationRecipe.shapes`): corner radius and the inner padding between
     * the frame and the destinations. `standard` keeps the floating recipe. Floating + emphasis selection only.
     * Added 2026-10-18 for Utilverse's home shells (iPhone rounded dock, Android pill, macOS compact dock,
     * Linux/Windows square taskbar), which otherwise assembled their own Surface/Button bar per shell.
     */
    shape?: BottomNavigationShape;
    /**
     * Selected icon emphasis (`bottomNavigationRecipe.icon`). `scale` is the default glyph emphasis; `lift` also
     * raises the selected icon and dims idle icons, the non-color cue for full-color artwork from `renderIcon` that
     * cannot take the selected tint. Added 2026-10-18 with `shape` for the same Utilverse dock.
     */
    iconEmphasis?: BottomNavigationIconEmphasis;
}>;
export type BottomNavigationSurface = "flat" | "raised";
export type BottomNavigationIconSize = "standard" | "large" | "xlarge";
export type BottomNavigationShape = "standard" | "rounded" | "pill" | "compact" | "square";
export type BottomNavigationIconEmphasis = "scale" | "lift";
export type ResolvedBottomNavigationConfiguration = Readonly<{
    presentation: BottomNavigationPresentation;
    distribution: BottomNavigationDistribution;
    density: BottomNavigationDensity;
    direction: BottomNavigationDirection;
    keyboardBehavior: BottomNavigationKeyboardBehavior;
    labels: BottomNavigationLabels;
    selection: "emphasis" | "tile";
    surface: BottomNavigationSurface;
    iconSize: BottomNavigationIconSize;
    shape: BottomNavigationShape;
    iconEmphasis: BottomNavigationIconEmphasis;
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
    /**
     * Raised center destination: a selectable route drawn as a lifted brand circle above the bar, with its label
     * below. Only the middle item of an odd item count may be prominent. Unlike `primaryAction` it is a real
     * destination (selected state, reselect, router-owned). Added 2026-10-18 for Diairy's "write" tab, which
     * replaced the shared bar with Expo Router's default tab bar to draw it.
     */
    prominent?: boolean;
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
    prominent: boolean;
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
    readonly labels: "visible";
    readonly selection: "emphasis";
    readonly surface: "flat";
    readonly iconSize: "standard";
    readonly shape: "standard";
    readonly iconEmphasis: "scale";
    readonly minItems: 2;
    readonly maxItems: 6;
};
export declare function validateBottomNavigationConfiguration(configuration: BottomNavigationConfiguration, itemCount: number): void;
export declare function resolveBottomNavigationConfiguration(configuration: BottomNavigationConfiguration, itemCount: number): ResolvedBottomNavigationConfiguration;
export declare function validateBottomNavigationDescriptor<Key extends string, IconName extends string>(descriptor: BottomNavigationDescriptor<Key, IconName>): void;
/**
 * A prominent destination needs the plain row: center-gap reserves the same slot for a primaryAction, capsule
 * places actions beside the surface, and a tile card would paint behind the lifted circle.
 */
export declare function validateBottomNavigationProminence(items: readonly Readonly<{
    prominent?: boolean;
}>[], configuration: ResolvedBottomNavigationConfiguration): void;
export declare function resolveBottomNavigationItem<Key extends string, IconName extends string>(item: BottomNavigationItemDescriptor<Key, IconName>): ResolvedBottomNavigationItemDescriptor<Key, IconName>;
export declare function resolveBottomNavigationDescriptor<Key extends string, IconName extends string>(descriptor: BottomNavigationDescriptor<Key, IconName>): ResolvedBottomNavigationDescriptor<Key, IconName>;
/**
 * Produces navigation intent without mutating selectedKey. A renderer forwards
 * the request to its router, which updates selectedKey only after navigation.
 */
export declare function resolveBottomNavigationActivation<Key extends string, IconName extends string>(descriptor: BottomNavigationDescriptor<Key, IconName>, key: Key): BottomNavigationActivation<Key> | null;
//# sourceMappingURL=bottom-navigation.d.ts.map