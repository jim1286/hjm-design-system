import type { DesignSystemTextScale } from "./design-system-provider.js";
export type DescriptionListColumns = 1 | 2;
/**
 * One label-value pair. Like Statistic, DescriptionList never formats the
 * value itself — products own locale, unit, and domain formatting and pass
 * the finished string.
 */
export type DescriptionItemDescriptor<Id extends string = string> = Readonly<{
    id: Id;
    label: string;
    value: string;
}>;
export type DescriptionListDescriptor<Id extends string = string> = Readonly<{
    items: readonly DescriptionItemDescriptor<Id>[];
    /** Renderer preference; the resolver may still collapse this to 1. */
    columns?: DescriptionListColumns;
}>;
export declare const descriptionListDefaults: {
    readonly columns: 2;
};
export type ResolvedDescriptionListDescriptor<Id extends string = string> = Readonly<{
    items: readonly DescriptionItemDescriptor<Id>[];
    columns: DescriptionListColumns;
}>;
export declare function validateDescriptionItem<Id extends string>(item: DescriptionItemDescriptor<Id>): void;
export declare function validateDescriptionList<Id extends string>(descriptor: DescriptionListDescriptor<Id>): void;
export declare function resolveDescriptionListDescriptor<Id extends string>(descriptor: DescriptionListDescriptor<Id>): ResolvedDescriptionListDescriptor<Id>;
export declare const descriptionListRecipe: {
    readonly slots: readonly ["root", "group", "item", "label", "value"];
    readonly defaults: {
        readonly columns: 2;
    };
    readonly group: {
        readonly gap: 12;
        readonly minItemWidth: 160;
        readonly columns: readonly [1, 2];
    };
    readonly item: {
        readonly gap: 4;
    };
    readonly label: {
        readonly textVariant: "label";
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
    };
    readonly value: {
        readonly textVariant: "body";
        readonly color: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly maxLines: null;
    };
};
/**
 * Owns the large-text reflow so products stop re-deriving a per-screen
 * `textScale >= 1.6` guard (five screens missed it in the last review). The
 * minimum item width grows with `textScale`, so at a fixed `availableWidth`
 * the same formula that reflows for narrow screens also reflows for large
 * text — mirrors `resolveStatisticColumnCount`'s shape in the Yajalal app-rn
 * renderer contract.
 */
export declare function resolveDescriptionListColumnCount(availableWidth: number, requestedColumns: DescriptionListColumns, textScale?: DesignSystemTextScale): DescriptionListColumns;
//# sourceMappingURL=description-list.d.ts.map