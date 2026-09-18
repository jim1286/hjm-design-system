/** IDs refer to same-document sections, never arbitrary external destinations. */
export type AnchorItem = Readonly<{
    id: string;
    label: string;
}>;
export declare function resolveAnchorItems(items: readonly AnchorItem[]): any[];
/** Positions use one viewport's coordinates. DOM reads and scroll ownership stay in the renderer. */
export declare function getAnchorCurrentId(positions: readonly Readonly<{
    id: string;
    top: number;
}>[], offset?: number, atEnd?: boolean): string | undefined;
export declare const anchorRecipe: {
    readonly slots: readonly ["root", "list", "link", "indicator"];
    readonly gap: 4;
    readonly link: {
        readonly padding: 8;
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
    };
    readonly current: {
        readonly color: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly border: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly width: 2;
    };
    readonly focus: {
        readonly color: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly width: 2;
        readonly offset: 2;
    };
};
export declare const anchorBehavior: {
    readonly controlled: readonly [];
    readonly inputs: readonly ["items", "offset", "container", "historyMode"];
    readonly stateAxes: {};
    readonly web: {
        readonly roles: readonly ["navigation", "list", "listitem", "link"];
        readonly keyboard: readonly ["Tab", "Enter"];
        readonly focus: "native";
    };
    readonly native: {
        readonly roles: readonly [];
        readonly states: readonly [];
        readonly actions: readonly [];
    };
    readonly scenarios: readonly ["scroll-position-selects-one-current-location", "activation-focuses-target-and-preserves-offset", "reduced-motion-jumps-instantly", "browser-history-restores-a-section", "missing-targets-are-not-current"];
};
//# sourceMappingURL=anchor.d.ts.map