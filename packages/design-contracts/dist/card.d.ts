export type CardHeadingLevel = 2 | 3 | 4;
/**
 * Shared Card anatomy. Renderers own their host nodes (`article` on Web,
 * `View` on Native), while these slots and defaults stay identical.
 */
export declare const cardRecipe: {
    readonly slots: readonly ["root", "media", "body", "header", "leading", "title", "description", "content", "actions"];
    readonly defaults: {
        readonly tone: "default";
        readonly selected: false;
        readonly bordered: true;
        readonly headingLevel: 3;
        readonly padding: "md";
    };
    readonly selectedTone: "accent";
    readonly body: {
        readonly padding: 16;
        readonly gap: 8;
    };
    readonly header: {
        readonly gap: 12;
    };
    readonly title: {
        readonly variant: "title";
        readonly tone: "primary";
        readonly emphasis: "strong";
    };
    readonly description: {
        readonly variant: "body";
        readonly tone: "muted";
        readonly emphasis: "regular";
    };
    readonly actions: {
        readonly gap: 12;
        readonly paddingHorizontal: 16;
        readonly paddingBottom: 16;
    };
};
//# sourceMappingURL=card.d.ts.map