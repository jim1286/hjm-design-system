import type { GlyphSize } from "./foundations.js";
import type { IconTone, IconWeight } from "./component-recipes.js";
import type { DesignSystemDirection } from "./design-system-provider.js";
/**
 * Shared semantic names. Renderers map these roles to their tree-shakeable SVG
 * or native glyph component instead of leaking a third-party icon name into a
 * product screen.
 */
export declare const semanticIconNames: readonly ["add", "ai", "alert", "arrowDown", "arrowUp", "back", "calendar", "check", "chevronDown", "chevronEnd", "chevronStart", "chevronUp", "close", "compare", "copy", "delete", "download", "edit", "error", "favorite", "filter", "forward", "help", "home", "info", "lock", "menu", "more", "notifications", "pause", "play", "refresh", "rotate", "search", "settings", "share", "success", "trendDown", "trendFlat", "trendUp", "unblock", "upload", "user", "users", "visibility", "visibilityOff", "warning"];
export type SemanticIconName = (typeof semanticIconNames)[number];
/**
 * Geometry of every semantic mark on one 24-unit stroke grid (round caps/joins, no fill). It lived privately in the
 * Web renderer, so Native products redrew the same marks in their own adapters (utilverse UiGlyph arrowUp/arrowDown/
 * rotate, 2026-10-18). As shared appearance data it belongs here: Web draws it, Native draws it through the optional
 * `@hjmds/react-native/icon-svg` adapter, and products without react-native-svg can still read the same path.
 */
export declare const semanticIconPaths: {
    readonly add: "M12 5v14M5 12h14";
    readonly ai: "M12 2l1.2 4.1L17 8l-3.8 1.9L12 14l-1.2-4.1L7 8l3.8-1.9L12 2ZM19 14l.7 2.3L22 17.5l-2.3 1.2L19 21l-.7-2.3-2.3-1.2 2.3-1.2L19 14Z";
    readonly alert: "M12 3 2.7 20h18.6L12 3Zm0 6v4m0 3h.01";
    readonly arrowDown: "M12 5v14m-6-6 6 6 6-6";
    readonly arrowUp: "M12 19V5m-6 6 6-6 6 6";
    readonly back: "M15 18 9 12l6-6M9 12h10";
    readonly calendar: "M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm2-2v4m10-4v4M3 9h18";
    readonly check: "m5 12 4 4L19 6";
    readonly chevronDown: "m6 9 6 6 6-6";
    readonly chevronEnd: "m9 6 6 6-6 6";
    readonly chevronStart: "m15 6-6 6 6 6";
    readonly chevronUp: "m6 15 6-6 6 6";
    readonly close: "M6 6l12 12M18 6 6 18";
    readonly compare: "M8 7h11m0 0-3-3m3 3-3 3M16 17H5m0 0 3-3m-3 3 3 3";
    readonly copy: "M8 8h11a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V8Zm8 0V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3";
    readonly delete: "M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6";
    readonly download: "M12 3v12m0 0 5-5m-5 5-5-5M4 19v2h16v-2";
    readonly edit: "m4 16-1 5 5-1L19 9l-4-4L4 16Zm9-9 4 4";
    readonly error: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-14v5m0 3h.01";
    readonly favorite: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z";
    readonly filter: "M3 5h18l-7 8v6l-4 2v-8L3 5Z";
    readonly forward: "m9 6 6 6-6 6m6-6H5";
    readonly help: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm-3-13a3 3 0 1 1 4.7 2.5c-1 .7-1.7 1.2-1.7 2.5m0 3h.01";
    readonly home: "m3 11 9-8 9 8v10h-6v-6H9v6H3V11Z";
    readonly info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-11v6m0-10h.01";
    readonly lock: "M6 10h12v11H6V10Zm3 0V7a3 3 0 0 1 6 0v3";
    readonly menu: "M4 6h16M4 12h16M4 18h16";
    readonly more: "M5 12h.01M12 12h.01M19 12h.01";
    readonly notifications: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 12h4";
    readonly pause: "M8 5v14m8-14v14";
    readonly play: "m8 5 11 7-11 7V5Z";
    readonly refresh: "M20 7v5h-5M4 17v-5h5m10.5-3A8 8 0 0 0 6 6l-2 2m.5 7A8 8 0 0 0 18 18l2-2";
    readonly rotate: "M20 12a8 8 0 1 1-2.3-5.6L20 9m0-5v5h-5";
    readonly search: "m21 21-4.4-4.4M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z";
    readonly settings: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm7.4-3.5 2-1.5-2-3.5-2.4 1a8 8 0 0 0-2-1.2L14.7 4h-4l-.4 2.8A8 8 0 0 0 8 8L5.6 7l-2 3.5 2 1.5a8 8 0 0 0 0 2l-2 1.5 2 3.5L8 18a8 8 0 0 0 2.3 1.2l.4 2.8h4l.3-2.8A8 8 0 0 0 17 18l2.4 1 2-3.5-2-1.5a8 8 0 0 0 0-2Z";
    readonly share: "M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8.6 13.5l6.8 4M15.4 6.5l-6.8 4";
    readonly success: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm-5-10 3 3 7-7";
    readonly trendDown: "M3 7l7 7 4-4 7 7m0 0v-6m0 6h-6";
    readonly trendFlat: "M4 12h16m0 0-4-4m4 4-4 4";
    readonly trendUp: "M3 17l7-7 4 4 7-7m0 0v6m0-6h-6";
    readonly unblock: "M6 10h12v11H6V10Zm3 0V7a3 3 0 0 1 5.8-1.1";
    readonly upload: "M12 21V9m0 0-5 5m5-5 5 5M4 5V3h16v2";
    readonly user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0";
    readonly users: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 10a7 7 0 0 1 14 0m1-16a4 4 0 0 1 0 7m0 3a6 6 0 0 1 5 6";
    readonly visibility: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z";
    readonly visibilityOff: "m3 3 18 18M10.6 5.2A9 9 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-2.1 3M6.6 6.6C3.8 8.5 2 12 2 12s4 7 10 7a9 9 0 0 0 3.4-.7M9.9 9.9a3 3 0 0 0 4.2 4.2";
    readonly warning: "M12 3 2.7 20h18.6L12 3Zm0 6v4m0 3h.01";
};
/** Narrows a product glyph name to the shared set, so adapters can draw HJM marks and fall back to their own. */
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