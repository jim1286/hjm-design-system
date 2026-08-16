/** Internal visual fragments keep future recipes from inventing new chrome. */
export declare const focusIndicatorContract: {
    readonly color: Readonly<{
        source: "theme";
        key: "contentBrand";
        alpha?: number;
    }>;
    readonly width: 2;
    readonly offset: 2;
};
export declare const fieldFrameContract: {
    readonly background: Readonly<{
        source: "theme";
        key: "surface";
        alpha?: number;
    }>;
    readonly border: Readonly<{
        source: "theme";
        key: "textMuted";
        alpha?: number;
    }>;
    readonly focusBorder: Readonly<{
        source: "theme";
        key: "contentBrand";
        alpha?: number;
    }>;
    readonly invalidBorder: Readonly<{
        source: "theme";
        key: "danger";
        alpha?: number;
    }>;
    readonly radius: "md";
    readonly borderWidth: 1;
    readonly minHeight: 44;
    readonly paddingHorizontal: 16;
};
export declare const formSupportContract: {
    readonly label: {
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly textVariant: "body";
        readonly fontWeight: "600";
    };
    readonly hint: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly textVariant: "label";
    };
    readonly error: {
        readonly color: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
        readonly textVariant: "label";
    };
    readonly gap: 8;
};
export declare const floatingSurfaceContract: {
    readonly background: Readonly<{
        source: "theme";
        key: "bg";
        alpha?: number;
    }>;
    readonly border: Readonly<{
        source: "theme";
        key: "border";
        alpha?: number;
    }>;
    readonly borderWidth: 1;
    readonly radius: "md";
    readonly shadow: {
        readonly color: "#000000";
        readonly opacity: 0.12;
        readonly radius: 12;
        readonly offsetY: 4;
    };
    readonly padding: 8;
};
export declare const collectionItemContract: {
    readonly minHeight: 44;
    readonly paddingHorizontal: 12;
    readonly gap: 12;
    readonly radius: "md";
    readonly label: {
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly textVariant: "body";
    };
    readonly description: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly textVariant: "label";
    };
    readonly highlightedBackground: Readonly<{
        source: "theme";
        key: "text";
        alpha?: number;
    }>;
    readonly focus: {
        readonly color: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly width: 2;
        readonly offset: 2;
    };
    readonly selectedBackground: Readonly<{
        source: "theme";
        key: "primary";
        alpha?: number;
    }>;
    readonly selectedIndicator: Readonly<{
        source: "theme";
        key: "contentBrand";
        alpha?: number;
    }>;
    readonly danger: Readonly<{
        source: "theme";
        key: "danger";
        alpha?: number;
    }>;
};
//# sourceMappingURL=component-contracts.d.ts.map