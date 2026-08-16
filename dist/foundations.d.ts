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
/**
 * Curves are stored as normalized cubic-bezier tuples so CSS and native
 * animation drivers can translate the same motion intent without sharing a
 * renderer dependency.
 */
export declare const easing: {
    readonly standard: readonly [0.2, 0, 0, 1];
    readonly enter: readonly [0, 0, 0, 1];
    readonly exit: readonly [0.3, 0, 1, 1];
    readonly emphasized: readonly [0.2, 0, 0, 1];
};
export type ReducedMotionBehavior = "instant" | "opacity" | "static";
/** Shared transition intent; renderers translate easing tuples to their animation API. */
export declare const motionPreset: {
    readonly micro: {
        readonly duration: 120;
        readonly easing: "standard";
        readonly reducedMotion: "instant";
    };
    readonly enter: {
        readonly duration: 200;
        readonly easing: "enter";
        readonly reducedMotion: "opacity";
    };
    readonly exit: {
        readonly duration: 120;
        readonly easing: "exit";
        readonly reducedMotion: "instant";
    };
    readonly context: {
        readonly duration: 320;
        readonly easing: "emphasized";
        readonly reducedMotion: "opacity";
    };
};
/** Native renderers may use these values directly; web renderers use easing. */
export declare const spring: {
    readonly responsive: {
        readonly stiffness: 760;
        readonly damping: 52;
        readonly mass: 1;
    };
    readonly expressive: {
        readonly stiffness: 520;
        readonly damping: 38;
        readonly mass: 1;
    };
};
/** Reusable state strengths. Components still decide which states are valid. */
export declare const opacity: {
    readonly disabled: 0.5;
    readonly muted: 0.72;
    readonly pressed: 0.86;
    readonly dragged: 0.64;
};
/** Overlaying the content color at these strengths creates predictable states. */
export declare const stateLayer: {
    readonly hover: 0.06;
    readonly focus: 0.08;
    readonly pressed: 0.1;
    readonly selected: 0.1;
};
export declare const stroke: {
    readonly subtle: 1;
    readonly default: 1;
    readonly strong: 2;
    readonly focus: 2;
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
    readonly fieldHeight: 44;
    readonly chipHeight: {
        readonly small: 36;
        readonly medium: 44;
    };
    readonly selectionIndicator: 24;
};
/** Product renderers may narrow these widths, but should not invent new rhythm. */
export declare const layout: {
    readonly pagePadding: {
        readonly compact: 16;
        readonly regular: 20;
        readonly spacious: 24;
    };
    readonly sectionGap: 24;
    readonly contentGap: 16;
    readonly rowHeight: {
        readonly singleLine: 56;
        readonly twoLine: 68;
    };
    readonly readingMaxWidth: 720;
    readonly contentMaxWidth: 1200;
};
/** Breakpoints are web hints; native renderers may map them to window classes. */
export declare const breakpoint: {
    readonly compact: 0;
    readonly medium: 600;
    readonly expanded: 960;
    readonly wide: 1280;
};
/** Shared stacking intent. Values remain sparse to leave room for app layers. */
export declare const layer: {
    readonly base: 0;
    readonly sticky: 100;
    readonly dropdown: 400;
    readonly overlay: 800;
    readonly modal: 900;
    readonly tooltip: 950;
    readonly toast: 1000;
};
export declare const overlay: {
    readonly scrim: 0.6;
    readonly veil: 0.25;
};
export type BackdropReference = Readonly<{
    color: "#000000";
    opacity: number;
}>;
/** Fixed backdrop contracts avoid renderer-specific names such as CSS `scrim`. */
export declare const backdrop: {
    readonly modal: {
        readonly color: "#000000";
        readonly opacity: 0.6;
    };
    readonly veil: {
        readonly color: "#000000";
        readonly opacity: 0.25;
    };
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
    readonly floating: {
        readonly color: "#000000";
        readonly opacity: 0.12;
        readonly radius: 12;
        readonly offsetY: 4;
    };
    readonly overlay: {
        readonly color: "#000000";
        readonly opacity: 0.16;
        readonly radius: 24;
        readonly offsetY: 8;
    };
};
//# sourceMappingURL=foundations.d.ts.map