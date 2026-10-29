import { type ColorReferencePalette } from "./color-references.js";
export type TagTone = "neutral" | "info" | "success" | "attention" | "brand";
export type TagVariant = "default" | "outline";
export declare const tagDefaults: {
    readonly tone: "neutral";
    readonly variant: "default";
};
/**
 * A single piece of static metadata (a position, a grade, a season). Tag has
 * no interaction axis at all — no selected, no pressed, no closable. Removing
 * or toggling a tag is deselection, which belongs to `Chip`.
 */
export type TagDescriptor = Readonly<{
    label: string;
    tone?: TagTone;
    variant?: TagVariant;
}>;
export type ResolvedTagDescriptor = Readonly<{
    label: string;
    tone: TagTone;
    variant: TagVariant;
}>;
export declare function validateTagDescriptor(descriptor: TagDescriptor): void;
export declare function resolveTagDescriptor(descriptor: TagDescriptor): ResolvedTagDescriptor;
/** Static metadata has no focus or press contract, including the outline capsule. */
export declare const tagRecipe: {
    readonly slots: readonly ["root", "label"];
    readonly defaults: {
        readonly tone: "neutral";
        readonly variant: "default";
    };
    readonly tones: {
        readonly neutral: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
        };
        readonly brand: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
        };
        readonly info: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "accent";
                key: "info";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "accent";
                key: "info";
                alpha?: number;
            }>;
        };
        readonly success: {
            readonly background: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
        };
        readonly attention: {
            readonly background: Readonly<{
                source: "accent";
                key: "attention";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "accent";
                key: "attention";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "accent";
                key: "attention";
                alpha?: number;
            }>;
        };
    };
    readonly size: {
        readonly minHeight: 20;
        readonly paddingHorizontal: 4;
        readonly gap: 4;
        readonly textVariant: "caption";
        readonly fontWeight: "500";
    };
    readonly outline: {
        readonly minHeight: 32;
        readonly paddingHorizontal: 10;
        readonly paddingVertical: 6;
        readonly radius: "full";
        readonly fontWeight: "400";
        readonly background: "transparent";
        readonly content: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
    };
    readonly radius: "sm";
    readonly borderWidth: 1;
};
export type ResolvedTagPresentation = Readonly<{
    background: string;
    content: string;
    border: string | null;
}>;
/** Resolve the same Tag recipe for non-CSS renderers. */
export declare function resolveTagPresentation(tone: TagTone, palette: ColorReferencePalette, variant?: TagVariant): ResolvedTagPresentation;
//# sourceMappingURL=tag.d.ts.map