import type { GlyphSize } from "./foundations.js";
import type { IconTone, IconWeight } from "./component-recipes.js";
import type { DesignSystemDirection } from "./design-system-provider.js";
/**
 * Shared semantic names. Renderers map these roles to their tree-shakeable SVG
 * or native glyph component instead of leaking a third-party icon name into a
 * product screen.
 */
export declare const semanticIconNames: readonly ["add", "ai", "alert", "arrowDown", "arrowUp", "back", "calendar", "check", "chevronDown", "chevronEnd", "chevronStart", "chevronUp", "close", "compare", "copy", "delete", "download", "edit", "error", "favorite", "filter", "forward", "help", "home", "info", "lock", "menu", "more", "moreVertical", "notifications", "pause", "play", "refresh", "rotate", "search", "settings", "share", "success", "trendDown", "trendFlat", "trendUp", "unblock", "upload", "user", "users", "visibility", "visibilityOff", "warning"];
export type SemanticIconName = (typeof semanticIconNames)[number];
/**
 * Lucide icon (kebab-case name, lucide 1.49.0) that draws each semantic mark. HJM no longer draws its own artwork:
 * 2026-11-05 the user made Lucide the only icon source, after hand-drawn marks shipped with detached arrowheads and
 * drifted from the Lucide glyphs products already placed beside them. Both renderers import exactly these icons from
 * `lucide` by name (static imports keep the rest of the library out of bundles), and their tests hold them to this map.
 * A meaning Lucide does not cover is mapped to its nearest Lucide icon (`trendFlat` → `equal`); adding a new
 * hand-drawn mark needs the user's explicit approval.
 */
export declare const semanticIconLucideNames: {
    readonly add: "plus";
    readonly ai: "sparkles";
    readonly alert: "triangle-alert";
    readonly arrowDown: "arrow-down";
    readonly arrowUp: "arrow-up";
    readonly back: "arrow-left";
    readonly calendar: "calendar";
    readonly check: "check";
    readonly chevronDown: "chevron-down";
    readonly chevronEnd: "chevron-right";
    readonly chevronStart: "chevron-left";
    readonly chevronUp: "chevron-up";
    readonly close: "x";
    readonly compare: "arrow-left-right";
    readonly copy: "copy";
    readonly delete: "trash";
    readonly download: "download";
    readonly edit: "pencil";
    readonly error: "circle-alert";
    readonly favorite: "heart";
    readonly filter: "funnel";
    readonly forward: "arrow-right";
    readonly help: "circle-question-mark";
    readonly home: "house";
    readonly info: "info";
    readonly lock: "lock";
    readonly menu: "menu";
    readonly more: "ellipsis";
    readonly moreVertical: "ellipsis-vertical";
    readonly notifications: "bell";
    readonly pause: "pause";
    readonly play: "play";
    readonly refresh: "refresh-cw";
    readonly rotate: "rotate-cw";
    readonly search: "search";
    readonly settings: "settings";
    readonly share: "share-2";
    readonly success: "circle-check";
    readonly trendDown: "trending-down";
    readonly trendFlat: "equal";
    readonly trendUp: "trending-up";
    readonly unblock: "lock-open";
    readonly upload: "upload";
    readonly user: "user";
    readonly users: "users";
    readonly visibility: "eye";
    readonly visibilityOff: "eye-off";
    readonly warning: "triangle-alert";
};
/** Narrows a product glyph name to the shared set, so adapters can draw HJM's Lucide marks and fall back to their own. */
export declare function isSemanticIconName(name: string): name is SemanticIconName;
export type IconDirection = DesignSystemDirection;
export type IconDirectionality = "fixed" | "mirror-in-rtl";
export type IconTransform = "none" | "mirror-inline";
type IconAppearance = Readonly<{
    size?: GlyphSize;
    weight?: IconWeight;
    directionality?: IconDirectionality;
}>;
export type DecorativeIconDescriptor<Name extends string = SemanticIconName> = IconAppearance & Readonly<{
    name: Name;
    tone?: IconTone;
    decorative?: true;
    accessibilityLabel?: never;
}>;
export type InformativeIconDescriptor<Name extends string = SemanticIconName> = IconAppearance & Readonly<{
    name: Name;
    /** Decorative is intentionally excluded because informative marks need contrast. */
    tone?: Exclude<IconTone, "decorative">;
    decorative: false;
    accessibilityLabel: string;
}>;
export type IconDescriptor<Name extends string = SemanticIconName> = DecorativeIconDescriptor<Name> | InformativeIconDescriptor<Name>;
export type ResolvedIconDescriptor<Name extends string = SemanticIconName> = (Required<Omit<DecorativeIconDescriptor<Name>, "accessibilityLabel">> & Readonly<{
    accessibilityLabel?: never;
}>) | Required<InformativeIconDescriptor<Name>>;
export declare function getIconDirectionality(name: string): IconDirectionality;
export declare function getIconTransform(directionality: IconDirectionality, direction: IconDirection): IconTransform;
export declare function validateIconDescriptor<Name extends string>(descriptor: IconDescriptor<Name>): void;
export declare function resolveIconDescriptor<Name extends string>(descriptor: IconDescriptor<Name>): ResolvedIconDescriptor<Name>;
export {};
//# sourceMappingURL=icon.d.ts.map