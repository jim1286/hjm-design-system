/** Numeric units are consumed as CSS pixels on web and density-independent points on native. */
export declare const spacing: {
    readonly xxs: 4;
    readonly xs: 8;
    readonly sm: 12;
    readonly md: 16;
    readonly lg: 20;
    readonly xl: 24;
    readonly xxl: 32;
    readonly xxxl: 40;
};
export declare const radius: {
    readonly sm: 8;
    readonly md: 12;
    readonly lg: 16;
    readonly xl: 24;
    readonly full: 999;
};
export declare const typography: {
    readonly caption: {
        readonly fontSize: 11;
        readonly lineHeight: 16;
        readonly fontWeight: "400";
    };
    readonly label: {
        readonly fontSize: 12;
        readonly lineHeight: 18;
        readonly fontWeight: "600";
    };
    readonly body: {
        readonly fontSize: 14;
        readonly lineHeight: 20;
        readonly fontWeight: "400";
    };
    readonly bodyLarge: {
        readonly fontSize: 16;
        readonly lineHeight: 24;
        readonly fontWeight: "400";
    };
    readonly title: {
        readonly fontSize: 18;
        readonly lineHeight: 26;
        readonly fontWeight: "700";
    };
    readonly titleLarge: {
        readonly fontSize: 20;
        readonly lineHeight: 28;
        readonly fontWeight: "800";
    };
    readonly heading: {
        readonly fontSize: 24;
        readonly lineHeight: 32;
        readonly fontWeight: "800";
    };
};
export type TextVariant = keyof typeof typography;
/** Glyphs include icons and avatars; they do not inherit paragraph line-height. */
export declare const glyph: {
    readonly xs: 14;
    readonly sm: 20;
    readonly md: 24;
    readonly lg: 28;
    readonly xl: 32;
    readonly xxl: 44;
    readonly xxxl: 48;
};
export type GlyphSize = keyof typeof glyph;
export declare const motion: {
    readonly fast: 120;
    readonly normal: 200;
    readonly slow: 320;
};
export declare const control: {
    readonly minTouchTarget: 44;
    readonly buttonHeight: {
        readonly small: 36;
        readonly medium: 44;
        readonly large: 52;
    };
    readonly buttonHitSlop: {
        readonly small: 4;
        readonly medium: 0;
        readonly large: 0;
    };
};
export declare const overlay: {
    readonly scrim: 0.6;
    readonly veil: 0.25;
};
export declare const scrim: string;
/** Renderers translate this contract to box-shadow or native shadow/elevation properties. */
export declare const shadow: {
    readonly raised: {
        readonly color: "#000000";
        readonly opacity: 0.08;
        readonly radius: 4;
        readonly offsetY: 1;
    };
};
//# sourceMappingURL=foundations.d.ts.map