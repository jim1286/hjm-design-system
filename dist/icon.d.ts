import type { GlyphSize } from "./foundations.js";
import type { IconTone, IconWeight } from "./component-recipes.js";
/**
 * Shared semantic names. Renderers map these roles to their tree-shakeable SVG
 * or native glyph component instead of leaking a third-party icon name into a
 * product screen.
 */
export declare const semanticIconNames: readonly ["add", "ai", "alert", "back", "calendar", "check", "chevronDown", "chevronEnd", "chevronStart", "chevronUp", "close", "compare", "copy", "delete", "download", "edit", "error", "favorite", "filter", "forward", "help", "home", "info", "lock", "menu", "more", "notifications", "pause", "play", "refresh", "search", "settings", "share", "success", "trendDown", "trendFlat", "trendUp", "upload", "user", "users", "visibility", "visibilityOff", "warning"];
export type SemanticIconName = (typeof semanticIconNames)[number];
export type IconDirection = "ltr" | "rtl";
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