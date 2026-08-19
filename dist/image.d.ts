export type ImageFit = "cover" | "contain" | "fill";
export type ImageLoadStatus = "idle" | "loading" | "loaded" | "error";
export declare const imageDefaults: {
    readonly fit: "cover";
};
type ImageAppearance = Readonly<{
    src: string;
    /** Intrinsic dimensions reserve layout space before the asset loads. */
    width: number;
    height: number;
    fit?: ImageFit;
}>;
/**
 * Same shape as Icon's decorative/informative split: a picture that only
 * repeats a caption or label already visible nearby stays decorative, and
 * only a self-sufficient picture requires localized alt copy.
 */
export type DecorativeImageDescriptor = ImageAppearance & Readonly<{
    decorative?: true;
    accessibilityLabel?: never;
}>;
export type InformativeImageDescriptor = ImageAppearance & Readonly<{
    decorative: false;
    accessibilityLabel: string;
}>;
export type ImageDescriptor = DecorativeImageDescriptor | InformativeImageDescriptor;
export type ResolvedImageDescriptor = (Required<Omit<DecorativeImageDescriptor, "accessibilityLabel">> & Readonly<{
    accessibilityLabel?: never;
}>) | Required<InformativeImageDescriptor>;
export declare function validateImageDescriptor(descriptor: ImageDescriptor): void;
export declare function resolveImageDescriptor(descriptor: ImageDescriptor): ResolvedImageDescriptor;
/**
 * Reserves layout space ahead of load so a slow asset never shifts
 * surrounding content — the same problem `width`/`height` solve for
 * `next/image`, translated without a bundler dependency.
 */
export declare function resolveImageAspectRatio(width: number, height: number): number;
/**
 * The fallback node on `error` always carries the resolved
 * `accessibilityLabel`, never a generic "broken image" string. An
 * informative picture's meaning does not disappear because the asset
 * failed to load; only its visual form changes.
 */
export declare function resolveImageFallbackAccessibilityLabel(descriptor: ResolvedImageDescriptor): string | undefined;
/**
 * Web `object-fit` and RN `resizeMode` diverge only in the `fill` case;
 * `fills` is the platform-neutral name and `nativeResizeModes` is the one
 * translation renderers need, kept here instead of re-derived per product.
 */
export declare const nativeResizeModes: {
    readonly cover: "cover";
    readonly contain: "contain";
    readonly fill: "stretch";
};
export declare const imageRecipe: {
    readonly slots: readonly ["root", "image", "placeholder", "fallbackIcon"];
    readonly defaults: {
        readonly fit: "cover";
    };
    readonly fits: readonly ImageFit[];
    readonly placeholder: {
        readonly background: Readonly<{
            source: "theme";
            key: "surfaceAlt";
            alpha?: number;
        }>;
    };
    readonly fallback: {
        readonly background: Readonly<{
            source: "theme";
            key: "surfaceAlt";
            alpha?: number;
        }>;
        readonly icon: {
            readonly name: "error";
            readonly tone: "secondary";
        };
    };
    readonly radius: "md";
};
export {};
//# sourceMappingURL=image.d.ts.map