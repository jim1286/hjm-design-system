/**
 * Picking by picture (avatar faces, photos). 2026-10-16 composition review: products imitated this with
 * rows of selected ghost Buttons because HJM had no image-choice control.
 */
export type ImageChoiceSelectionMode = "single" | "multiple";
export type ImageChoiceItemDescriptor = Readonly<{
    id: string;
    label: string;
    disabled?: boolean;
}>;
export declare const imageChoiceRecipe: {
    readonly tileSize: 72;
    readonly gap: 8;
    readonly radius: 12;
    readonly ringWidth: 2;
    readonly ringOffset: 2;
    readonly checkSize: 20;
};
export declare function validateImageChoiceItems(items: readonly ImageChoiceItemDescriptor[]): void;
/** Single mode keeps exactly the pressed id (radio semantics); multiple toggles membership in order. */
export declare function resolveImageChoiceToggle(mode: "single", value: string | null, id: string): string;
export declare function resolveImageChoiceToggle(mode: "multiple", value: readonly string[], id: string): string[];
//# sourceMappingURL=image-choice.d.ts.map