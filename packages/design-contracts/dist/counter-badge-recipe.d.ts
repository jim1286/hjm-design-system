export { counterBadgeDefaults, formatCounterBadgeCount, type CounterBadgeSize, type CounterBadgeTone, type CounterBadgeVariant, } from "./counter-badge.js";
/** Numeric counters use a compact solid plate, distinct from status badges. */
export declare const counterBadgeRecipe: {
    readonly slots: readonly ["root", "label"];
    /**
     * 숫자 없이 "새것이 있다"만 말하는 점. 0이 아닌 개수를 모르거나 셀 필요가 없는
     * 자리(탭 배지, 사이드바 항목)에서 숫자를 지어내지 않기 위해 별도 크기로 둔다.
     */
    readonly dotSize: 8;
    readonly defaults: {
        readonly tone: "danger";
        readonly size: "medium";
        readonly variant: "inline";
        readonly max: 99;
    };
    readonly tones: {
        readonly danger: {
            readonly background: Readonly<{
                source: "theme";
                key: "dangerFill";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "theme";
                key: "onDanger";
                alpha?: number;
            }>;
        };
        readonly brand: {
            readonly background: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "theme";
                key: "onPrimary";
                alpha?: number;
            }>;
        };
        readonly neutral: {
            readonly background: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
        };
    };
    readonly sizes: {
        readonly small: {
            readonly height: 16;
            readonly minWidth: 16;
            readonly paddingHorizontal: 4;
            readonly textVariant: "caption";
        };
        readonly medium: {
            readonly height: 20;
            readonly minWidth: 20;
            readonly paddingHorizontal: 8;
            readonly textVariant: "caption";
        };
    };
    readonly variants: {
        readonly inline: {
            readonly border: null;
            readonly borderWidth: 0;
        };
        readonly floating: {
            readonly border: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly borderWidth: 2;
        };
    };
    readonly radius: "full";
    readonly fontWeight: "700";
};
//# sourceMappingURL=counter-badge-recipe.d.ts.map