export type TagTone = "neutral" | "info" | "success" | "attention" | "brand";
export declare const tagDefaults: {
    readonly tone: "neutral";
};
/**
 * A single piece of static metadata (a position, a grade, a season). Tag has
 * no interaction axis at all — no selected, no pressed, no closable. Removing
 * or toggling a tag is deselection, which belongs to `Chip`.
 */
export type TagDescriptor = Readonly<{
    label: string;
    tone?: TagTone;
}>;
export type ResolvedTagDescriptor = Readonly<{
    label: string;
    tone: TagTone;
}>;
export declare function validateTagDescriptor(descriptor: TagDescriptor): void;
export declare function resolveTagDescriptor(descriptor: TagDescriptor): ResolvedTagDescriptor;
/**
 * Rectangular, not the pill `radius.full` that `chipRecipe` and `badgeRecipe`
 * use, so a static Tag never reads as a pressable Chip or a status Badge at a
 * glance. No `states` and no `focus` contract: nothing here is ever pressed
 * or focused.
 */
export declare const tagRecipe: {
    readonly slots: readonly ["root", "label"];
    readonly defaults: {
        readonly tone: "neutral";
    };
    readonly tones: {
        readonly neutral: {
            readonly background: Readonly<{
                source: "theme";
                key: "surfaceAlt";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly border: null;
        };
        readonly brand: {
            readonly background: Readonly<{
                source: "theme";
                key: "surfaceAccent";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly border: null;
        };
        readonly info: {
            readonly background: Readonly<{
                source: "accent";
                key: "info";
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
        readonly fontWeight: "600";
    };
    readonly radius: "sm";
    readonly borderWidth: 1;
};
//# sourceMappingURL=tag.d.ts.map