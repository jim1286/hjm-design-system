import { control, spacing, type FontWeightValue, type TextVariant } from "./foundations.js";
export { iconButtonEdges, iconButtonRecipe, resolveIconButtonEdgeOverhang, resolveIconButtonPresentation, type IconButtonEdge, type IconButtonShape, type IconButtonSize, type IconButtonTone, type ResolvedIconButtonPresentation, } from "./icon-button-recipe.js";
export { counterBadgeDefaults, counterBadgeRecipe, formatCounterBadgeCount, type CounterBadgeSize, type CounterBadgeTone, type CounterBadgeVariant, } from "./counter-badge-recipe.js";
export { progressRecipe, resolveProgressSegments, type ProgressShape, type ProgressSize, type ProgressTone, } from "./progress-recipe.js";
export type { BottomNavigationDensity, BottomNavigationDistribution, BottomNavigationPresentation, } from "./bottom-navigation-defaults.js";
export type TextTone = "primary" | "body" | "muted" | "subtle" | "weak" | "brand" | "danger" | "inverse";
export type TextEmphasis = "regular" | "medium" | "strong";
export declare const textRecipe: {
    readonly slots: readonly ["root"];
    readonly defaults: {
        readonly variant: "body";
        readonly tone: "primary";
        readonly emphasis: "regular";
    };
    readonly tones: {
        readonly primary: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly body: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly muted: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly subtle: Readonly<{
            source: "theme";
            key: "textSub";
            alpha?: number;
        }>;
        readonly weak: Readonly<{
            source: "theme";
            key: "textWeak";
            alpha?: number;
        }>;
        readonly brand: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly danger: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
        readonly inverse: Readonly<{
            source: "theme";
            key: "onPrimary";
            alpha?: number;
        }>;
    };
    readonly emphasis: {
        readonly regular: "400";
        readonly medium: "500";
        readonly strong: "500";
    };
    /**
     * Variants whose omitted `emphasis` renders the variant's typography weight even without a design profile.
     * Label's 500 equals the `medium` emphasis step, but the shared `regular` default drew form labels at
     * body weight (2026-10-17 user decision: label 500 on Web and Native). Other variants keep `regular`.
     */
    readonly variantWeight: readonly ["label"];
};
/**
 * Weight Text renders when the caller omits `emphasis`; `undefined` means `textRecipe.defaults.emphasis` applies.
 * Inside a design profile every variant follows the profile's typography weight; outside one only
 * `textRecipe.variantWeight` variants do. An explicit `emphasis` always wins and never reaches this resolver.
 */
export declare function resolveTextDefaultWeight(variant: TextVariant, typographyTokens: Readonly<Record<TextVariant, Readonly<{
    fontWeight: FontWeightValue;
}>>>, designProfileActive: boolean): FontWeightValue | undefined;
export type IconTone = "primary" | "secondary" | "decorative" | "brand" | "info" | "success" | "warning" | "danger" | "inverse";
export type IconWeight = "regular" | "strong";
export declare const iconRecipe: {
    readonly slots: readonly ["root"];
    readonly defaults: {
        readonly size: "md";
        readonly tone: "secondary";
        readonly weight: "regular";
        readonly decorative: true;
    };
    readonly sizes: {
        readonly xs: 14;
        readonly sm: 20;
        readonly md: 24;
        readonly lg: 28;
        readonly xl: 32;
        readonly xxl: 44;
        readonly xxxl: 48;
    };
    readonly tones: {
        readonly primary: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly secondary: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly decorative: Readonly<{
            source: "theme";
            key: "textWeak";
            alpha?: number;
        }>;
        readonly brand: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly info: Readonly<{
            source: "accent";
            key: "info";
            alpha?: number;
        }>;
        readonly success: Readonly<{
            source: "accent";
            key: "success";
            alpha?: number;
        }>;
        readonly warning: Readonly<{
            source: "accent";
            key: "warning";
            alpha?: number;
        }>;
        readonly danger: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
        readonly inverse: Readonly<{
            source: "theme";
            key: "onPrimary";
            alpha?: number;
        }>;
    };
    readonly weights: {
        readonly regular: 2;
        readonly strong: 2.5;
    };
    readonly stroke: {
        readonly lineCap: "round";
        readonly lineJoin: "round";
        readonly scaling: "proportional";
    };
};
export type StackAxis = "block" | "inline";
export type StackGap = keyof typeof spacing;
export type StackAlign = "start" | "center" | "end" | "stretch";
export type StackJustify = "start" | "center" | "end" | "between";
export declare const stackRecipe: {
    readonly slots: readonly ["root"];
    readonly defaults: {
        readonly axis: "block";
        readonly gap: "md";
        readonly align: "stretch";
        readonly justify: "start";
        readonly wrap: false;
    };
    readonly axes: {
        readonly block: "column";
        readonly inline: "row";
    };
    readonly gaps: {
        readonly xxs: 4;
        readonly xs: 8;
        readonly sm: 12;
        readonly md: 16;
        readonly lg: 20;
        readonly xl: 24;
        readonly xxl: 32;
        readonly xxxl: 40;
    };
    readonly align: readonly ["start", "center", "end", "stretch"];
    readonly justify: readonly ["start", "center", "end", "between"];
};
export type LinkTone = "brand" | "neutral";
export type LinkVariant = "inline" | "standalone";
export declare const linkRecipe: {
    readonly slots: readonly ["root", "leading", "label", "trailing"];
    readonly defaults: {
        readonly tone: "brand";
        readonly variant: "inline";
    };
    readonly tones: {
        readonly brand: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly neutral: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
    };
    readonly variants: {
        readonly inline: {
            readonly textVariant: "body";
            readonly fontWeight: "500";
            readonly underline: "always";
            readonly minHeight: null;
            readonly minWidth: null;
        };
        /** 그 자체가 동작이므로 두 축 모두 최소 터치 타깃. 높이만 잡으면 짧은 라벨이 좁아진다. */
        readonly standalone: {
            readonly textVariant: "body";
            readonly fontWeight: "500";
            readonly underline: "hover";
            readonly minHeight: 44;
            readonly minWidth: 44;
        };
    };
    readonly gap: 4;
    readonly icon: {
        readonly glyph: "xs";
        readonly inheritsTone: true;
    };
    readonly states: {
        readonly pressedOpacity: 0.86;
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
};
export declare const selectionGroupRecipe: {
    readonly slots: readonly ["root", "label", "requiredIndicator", "description", "items", "itemLabel", "itemAction", "error"];
    readonly defaults: {
        readonly orientation: "vertical";
        readonly presentation: "card";
    };
    readonly orientations: {
        readonly vertical: {
            readonly direction: "column";
            readonly gap: {
                readonly plain: 4;
                readonly card: 8;
                readonly grouped: 0;
                readonly chips: 8;
            };
        };
        readonly horizontal: {
            readonly direction: "row";
            readonly gap: {
                readonly plain: 12;
                readonly card: 16;
                readonly grouped: 0;
                readonly chips: 8;
            };
        };
    };
    readonly label: {
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly textVariant: "body";
        readonly fontWeight: "500";
    };
    readonly requiredIndicator: {
        readonly color: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
    };
    readonly description: {
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
    readonly supportGap: 8;
    readonly states: {
        readonly disabledOpacity: 0.5;
    };
};
export type SelectionGroupOrientation = keyof typeof selectionGroupRecipe.orientations;
export type SelectionGroupPresentation = keyof typeof selectionGroupRecipe.orientations.vertical.gap;
export type BadgeTone = "neutral"
/**
 * One step stronger than `neutral`: solid ink plate instead of a muted
 * label + sunken plate. A product author needed this for a result screen
 * where win/loss is the fact itself, not a side note, and `neutral` plus
 * its `outline` variant read as nearly the same grey — the one place the
 * distinction had to be unmistakable at a glance. Use it where a badge must
 * outrank `neutral` without borrowing an accent or the brand tint (both of
 * which already carry other meanings — see the `brand` tone below).
 */
 | "strong" | "brand" | "info" | "success" | "warning" | "attention" | "danger";
export type BadgeSize = "small" | "medium";
export type BadgeVariant = "filled" | "outline";
export type BadgeAdornmentContext = Readonly<{
    color: string;
    size: number;
}>;
export declare const badgeRecipe: {
    readonly slots: readonly ["root", "icon", "label", "trailing"];
    readonly defaults: {
        readonly tone: "neutral";
        readonly size: "medium";
        readonly variant: "filled";
    };
    readonly variants: {
        readonly filled: {
            readonly usesToneBackground: true;
            readonly borderFallback: null;
        };
        readonly outline: {
            readonly usesToneBackground: false;
            readonly borderFallback: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
        };
    };
    readonly tones: {
        readonly neutral: {
            readonly content: Readonly<{
                source: "theme";
                key: "onStatusFill";
                alpha?: number;
            }>;
            readonly outlineContent: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly background: Readonly<{
                source: "theme";
                key: "neutralFill";
                alpha?: number;
            }>;
            readonly border: null;
        };
        readonly strong: {
            readonly content: Readonly<{
                source: "theme";
                key: "onStatusFill";
                alpha?: number;
            }>;
            readonly outlineContent: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly background: Readonly<{
                source: "theme";
                key: "strongFill";
                alpha?: number;
            }>;
            readonly border: null;
        };
        readonly brand: {
            readonly content: Readonly<{
                source: "theme";
                key: "onPrimary";
                alpha?: number;
            }>;
            readonly outlineContent: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly background: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
            readonly border: null;
        };
        readonly info: {
            readonly content: Readonly<{
                source: "theme";
                key: "onStatusFill";
                alpha?: number;
            }>;
            readonly outlineContent: Readonly<{
                source: "accent";
                key: "info";
                alpha?: number;
            }>;
            readonly background: Readonly<{
                source: "accentFill";
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
            readonly content: Readonly<{
                source: "theme";
                key: "onStatusFill";
                alpha?: number;
            }>;
            readonly outlineContent: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
            readonly background: Readonly<{
                source: "accentFill";
                key: "success";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
        };
        readonly warning: {
            readonly content: Readonly<{
                source: "theme";
                key: "onStatusFill";
                alpha?: number;
            }>;
            readonly outlineContent: Readonly<{
                source: "accent";
                key: "warning";
                alpha?: number;
            }>;
            readonly background: Readonly<{
                source: "accentFill";
                key: "warning";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "accent";
                key: "warning";
                alpha?: number;
            }>;
        };
        readonly attention: {
            readonly content: Readonly<{
                source: "theme";
                key: "onStatusFill";
                alpha?: number;
            }>;
            readonly outlineContent: Readonly<{
                source: "accent";
                key: "attention";
                alpha?: number;
            }>;
            readonly background: Readonly<{
                source: "accentFill";
                key: "attention";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "accent";
                key: "attention";
                alpha?: number;
            }>;
        };
        readonly danger: {
            readonly content: Readonly<{
                source: "theme";
                key: "onDanger";
                alpha?: number;
            }>;
            readonly outlineContent: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly background: Readonly<{
                source: "theme";
                key: "dangerFill";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
    };
    readonly sizes: {
        readonly small: {
            readonly minHeight: 20;
            readonly paddingHorizontal: 8;
            readonly gap: 4;
            readonly iconSize: 14;
            readonly textVariant: "caption";
        };
        readonly medium: {
            readonly minHeight: 24;
            readonly paddingHorizontal: 8;
            readonly gap: 4;
            readonly iconSize: 14;
            readonly textVariant: "caption";
        };
    };
    readonly radius: "sm";
    readonly borderWidth: 1;
    readonly fontWeight: "700";
};
export type SearchFieldSize = "medium" | "large";
/** Search is a field specialization with stable affordance and clear targets. */
export declare const searchFieldRecipe: {
    readonly slots: readonly ["root", "leading", "input", "trailing", "clear", "spinner"];
    readonly defaults: {
        readonly size: "medium";
        readonly shape: "medium";
    };
    readonly sizes: {
        readonly medium: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 12;
            readonly gap: 8;
            readonly glyph: "sm";
            readonly clearDiameter: 36;
            readonly clearHitSlop: 4;
            readonly textVariant: "body";
        };
        readonly large: {
            readonly minHeight: 52;
            readonly paddingHorizontal: 16;
            readonly gap: 12;
            readonly glyph: "sm";
            readonly clearDiameter: 44;
            readonly clearHitSlop: 0;
            readonly textVariant: "bodyLarge";
        };
    };
    readonly colors: {
        readonly background: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly content: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly placeholder: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly leading: Readonly<{
            source: "theme";
            key: "textWeak";
            alpha?: number;
        }>;
        readonly clear: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly border: Readonly<{
            source: "theme";
            key: "borderControl";
            alpha?: number;
        }>;
        readonly focus: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly invalid: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
    };
    /**
     * 모양은 **축이다** — 값 하나로 못 박지 않는다.
     *
     * 원래 여기는 `radius: "full"` 하나였다. 그런데 `fieldRecipe`는 같은 결정을
     * `shapes: { medium, large, full }` 축으로 열어 두고 있었고, 그래서 **한 앱 안에서
     * 평범한 입력과 찾기 입력이 서로 다른 모양이 되는 것을 계약이 막지 못했다.** 실제로
     * 갈라졌다 — app-rn은 `"md"`로 그리고 있었는데 이 계약은 `"full"`이라고 말하고
     * 있었고, 어느 쪽이 옳은지 양쪽 문서 어디에도 없었다.
     *
     * 찾기 입력이 알약이어야 하는지는 **제품이 정할 일**이고(iOS 관례는 알약, 이 앱은
     * 사각), 계약이 할 일은 그 선택지를 `fieldRecipe`와 **같은 이름으로** 주는 것이다.
     * 그러면 두 입력의 모양을 나란히 맞추는 것과 일부러 다르게 하는 것이 둘 다 표현된다.
     */
    readonly shapes: {
        readonly medium: "md";
        readonly large: "lg";
        readonly full: "full";
    };
    readonly borderWidth: 1;
    readonly focusRingWidth: 2;
    readonly focusRingOffset: 2;
    readonly states: {
        readonly disabledOpacity: 0.5;
        readonly pressedOpacity: 0.86;
    };
};
export type ChipSize = keyof typeof control.chipHeight;
export declare const chipRecipe: {
    readonly slots: readonly ["root", "leading", "indicator", "label", "trailing"];
    readonly defaults: {
        readonly size: "small";
        readonly selected: false;
    };
    /**
     * `height` is the minimum visible height; a label taller than it grows the chip (Web `min-block-size`,
     * Native `minHeight` from 1.13.1). Native used it as a fixed height and clipped labels at large text
     * (utilverse 1.13.0 adoption, 2026-10-06), unlike Web and Button.
     */
    readonly sizes: {
        readonly small: {
            readonly height: 36;
            readonly hitSlop: 4;
            readonly paddingHorizontal: 12;
            readonly gap: 4;
            readonly textVariant: "body";
        };
        readonly medium: {
            readonly height: 44;
            readonly hitSlop: 0;
            readonly paddingHorizontal: 16;
            readonly gap: 8;
            readonly textVariant: "body";
        };
    };
    readonly states: {
        readonly idle: {
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
        readonly selected: {
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
                key: "contentBrand";
                alpha?: number;
            }>;
        };
        readonly pressedOpacity: 0.86;
        readonly disabledOpacity: 0.5;
    };
    readonly radius: "full";
    readonly borderWidth: 1;
    readonly label: {
        readonly fontWeight: "500";
        readonly selectedFontWeight: "600";
    };
    readonly selectionIndicator: {
        readonly color: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly glyph: "xs";
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
export declare const dividerRecipe: {
    readonly slots: readonly ["root", "label"];
    readonly defaults: {
        readonly orientation: "horizontal";
        readonly inset: "none";
    };
    readonly color: Readonly<{
        source: "theme";
        key: "border";
        alpha?: number;
    }>;
    readonly thickness: 1;
    readonly insets: {
        readonly none: 0;
        readonly start: 16;
        readonly both: 16;
    };
};
export declare const listRecipe: {
    readonly slots: readonly ["root", "item", "separator"];
    readonly defaults: {
        readonly separator: "indented";
    };
    /**
     * Separators are measured from the list's content edge, where the row text sits, and each one belongs to the row
     * above it (iOS cell separator). "full" spans the row surface (content edge ± bleed). "indented" follows that row's
     * text column: it starts at the text — `leadingInsetStart` (leading 40 + gap 12) when the row has a leading
     * element, `insetStart` 0 when it has none — and ends on the row's trailing content edge (0).
     * 2026-10-17 user report: a fixed 52 start cut the line off midway under rows without leading (text at 16, line
     * from 68), and the −8 end ran past the trailing content.
     */
    readonly separators: {
        readonly none: null;
        readonly content: {
            readonly insetStart: 0;
            readonly leadingInsetStart: 0;
            readonly insetEnd: 0;
        };
        readonly full: {
            readonly insetStart: number;
            readonly leadingInsetStart: number;
            readonly insetEnd: number;
        };
        readonly indented: {
            readonly insetStart: 0;
            readonly leadingInsetStart: number;
            readonly insetEnd: 0;
        };
    };
    readonly grouped: {
        readonly paddingInline: 8;
    };
    readonly background: null;
};
export type ListRowDensity = "compact" | "comfortable" | "relaxed" | "spacious";
/** Frame geometry the ListRow paints around its leading slot. */
export type ListRowLeadingShape = "square" | "circle";
export declare const listRowRecipe: {
    readonly slots: readonly ["root", "leading", "content", "title", "description", "trailing"];
    readonly defaults: {
        readonly density: "comfortable";
        readonly selected: false;
        readonly tone: "default";
    };
    readonly tones: {
        readonly default: {
            readonly titleColor: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
        };
        readonly danger: {
            readonly titleColor: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
    };
    readonly density: {
        readonly compact: {
            readonly oneLineMinHeight: 44;
            readonly twoLineMinHeight: 60;
            readonly paddingHorizontal: 8;
            readonly paddingVertical: 4;
        };
        readonly comfortable: {
            readonly oneLineMinHeight: 56;
            readonly twoLineMinHeight: 68;
            readonly paddingHorizontal: 8;
            readonly paddingVertical: 8;
        };
        readonly relaxed: {
            readonly oneLineMinHeight: number;
            readonly twoLineMinHeight: number;
            readonly paddingHorizontal: 8;
            readonly paddingVertical: 12;
        };
        readonly spacious: {
            readonly oneLineMinHeight: number;
            readonly twoLineMinHeight: number;
            readonly paddingHorizontal: 8;
            readonly paddingVertical: 16;
        };
    };
    readonly loading: {
        readonly titleWidthPercent: 60;
        readonly descriptionWidthPercent: 40;
        readonly trailingWidth: 32;
    };
    /**
     * Inline placement (2026-10-17 user decision, see `listRowSurfaceBleed`): the content box sits on the container's
     * content edge and the surface bleeds outward by `paddingHorizontal` — renderers draw the row with that padding and
     * the same negative inline margin, so pressed/selected fills keep 8 of room beyond the text.
     */
    readonly surfaceBleed: 8;
    readonly gap: 12;
    readonly leadingSize: 40;
    /**
     * Frame geometry for the leading slot. The size was already declared here but
     * no renderer bound it, so every consumer re-derived the avatar box (radius,
     * clipping, centering) in product styles.
     */
    readonly leadingShapes: {
        readonly square: null;
        readonly circle: "full";
    };
    readonly title: {
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly textVariant: "bodyLarge";
        readonly fontWeight: "500";
    };
    readonly description: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly textVariant: "body";
    };
    readonly trailing: {
        readonly textColor: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly iconColor: Readonly<{
            source: "theme";
            key: "textWeak";
            alpha?: number;
        }>;
        readonly glyph: "sm";
        readonly textVariant: "caption";
    };
    readonly states: {
        readonly pressedBackground: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly selectedBackground: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly disabledOpacity: 0.5;
    };
};
export type AccordionDensity = "compact" | "comfortable";
export declare const accordionRecipe: {
    readonly slots: readonly ["root", "item", "header", "trigger", "title", "indicator", "panel", "divider"];
    readonly defaults: {
        readonly density: "comfortable";
        readonly allowsMultipleExpanded: false;
    };
    readonly density: {
        readonly compact: {
            readonly triggerMinHeight: 44;
            readonly paddingVertical: 8;
        };
        readonly comfortable: {
            readonly triggerMinHeight: 56;
            readonly paddingVertical: 12;
        };
    };
    readonly paddingHorizontal: 8;
    readonly gap: 12;
    readonly title: {
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly textVariant: "bodyLarge";
        readonly fontWeight: "500";
    };
    readonly indicator: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly glyph: "sm";
    };
    readonly panel: {
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly textVariant: "body";
        readonly paddingBottom: 16;
        readonly paddingInlineStart: 8;
    };
    readonly divider: Readonly<{
        source: "theme";
        key: "border";
        alpha?: number;
    }>;
    readonly states: {
        readonly pressedBackground: Readonly<{
            source: "theme";
            key: "bg";
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
        readonly disabledOpacity: 0.5;
    };
    readonly transition: {
        readonly duration: 200;
        readonly easing: "enter";
        readonly reducedMotion: "opacity";
    };
};
export type MenuItemTone = "neutral" | "danger";
export declare const menuRecipe: {
    readonly slots: readonly ["trigger", "content", "viewport", "section", "sectionLabel", "item", "leading", "copy", "label", "description", "trailing", "shortcut", "indicator", "dangerIndicator", "separator"];
    readonly defaults: {
        readonly density: "comfortable";
        readonly itemTone: "neutral";
    };
    readonly presentations: {
        readonly grouped: {
            readonly maxWidth: 288;
            readonly padding: 12;
            readonly gap: 8;
            readonly rowHeight: 52;
        };
        readonly anchored: {
            readonly maxWidth: 280;
            readonly padding: 8;
            readonly gap: 8;
            readonly rowHeight: 48;
        };
        readonly bottom: {
            readonly maxWidth: 420;
            readonly padding: 0;
            readonly gap: 8;
            readonly rowHeight: 56;
        };
    };
    readonly surface: {
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
    readonly density: {
        readonly compact: {
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
                key: "bg";
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
                key: "bg";
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
        readonly comfortable: {
            readonly minHeight: 56;
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
                key: "bg";
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
                key: "bg";
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
    };
    readonly tones: {
        readonly neutral: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly danger: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
    };
    readonly sectionLabel: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly textVariant: "label";
        readonly paddingHorizontal: 12;
        readonly paddingVertical: 8;
    };
    readonly leading: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly glyph: "sm";
    };
    readonly shortcut: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly textVariant: "caption";
    };
    readonly indicator: {
        readonly color: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly glyph: "sm";
    };
    readonly separator: Readonly<{
        source: "theme";
        key: "border";
        alpha?: number;
    }>;
    readonly dangerIndicator: {
        readonly color: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
        readonly glyph: "sm";
        readonly mark: "alert";
    };
    readonly minWidth: 220;
    readonly maxWidth: 320;
    readonly maxHeight: 360;
    readonly sideOffset: 8;
    readonly collisionPadding: 8;
    readonly states: {
        readonly disabledOpacity: 0.5;
    };
    readonly transition: {
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
    };
};
export type MenuDensity = keyof typeof menuRecipe.density;
export type MenuPresentation = keyof typeof menuRecipe.presentations;
export type SelectSize = "medium" | "large";
export type SelectDensity = "compact" | "comfortable";
/**
 * Select is visually one field plus one collection, even though Web renders
 * the collection in a popover and Native renders it in a modal sheet.
 */
export declare const selectRecipe: {
    readonly slots: readonly ["root", "label", "trigger", "leading", "value", "placeholder", "busyIndicator", "indicator", "description", "error", "popover", "viewport", "section", "sectionLabel", "option", "optionLeading", "optionCopy", "optionLabel", "optionDescription", "selectionIndicator", "stateMessage"];
    readonly defaults: {
        readonly size: "medium";
        readonly density: "comfortable";
    };
    readonly adaptive: {
        readonly web: "popover";
        readonly native: "sheet";
    };
    readonly frame: {
        readonly background: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly border: Readonly<{
            source: "theme";
            key: "borderControl";
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
    readonly sizes: {
        readonly medium: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 16;
            readonly textVariant: "body";
            readonly glyph: "sm";
        };
        readonly large: {
            readonly minHeight: 52;
            readonly paddingHorizontal: 20;
            readonly textVariant: "bodyLarge";
            readonly glyph: "md";
        };
    };
    readonly support: {
        readonly label: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly fontWeight: "500";
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
    readonly value: {
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly placeholderColor: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly gap: 12;
    };
    readonly leading: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
    };
    readonly indicator: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
    };
    readonly busyIndicator: {
        readonly color: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly glyph: "sm";
    };
    readonly popover: {
        readonly minWidth: 220;
        readonly maxWidth: 420;
        readonly maxHeight: 360;
        readonly sideOffset: 8;
        readonly collisionPadding: 8;
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
    readonly density: {
        readonly compact: {
            readonly selectedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly highlightedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
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
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
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
        readonly comfortable: {
            readonly selectedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly highlightedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly minHeight: 56;
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
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
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
    };
    readonly sectionLabel: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly textVariant: "label";
        readonly paddingHorizontal: 12;
        readonly paddingVertical: 8;
    };
    readonly optionLeading: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly glyph: "sm";
    };
    readonly optionLabel: {
        readonly fontWeight: "500";
        readonly selectedFontWeight: "600";
    };
    readonly selectionIndicator: {
        readonly color: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly glyph: "sm";
    };
    readonly stateMessage: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly textVariant: "body";
        readonly minHeight: 44;
        readonly paddingHorizontal: 12;
        readonly paddingVertical: 12;
    };
    readonly states: {
        readonly hoverBackground: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly pressedBackground: Readonly<{
            source: "theme";
            key: "bg";
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
        readonly invalidBorder: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
        readonly disabledOpacity: 0.5;
    };
    readonly transition: {
        readonly web: {
            readonly enter: {
                readonly duration: 120;
                readonly easing: "standard";
                readonly reducedMotion: "instant";
            };
            readonly exit: {
                readonly duration: 120;
                readonly easing: "exit";
                readonly reducedMotion: "instant";
            };
        };
        readonly native: {
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
        };
    };
};
/** Editable input anatomy layered on the exact same collection grammar. */
export declare const comboboxRecipe: {
    readonly slots: readonly ["root", "label", "field", "leading", "input", "indicator", "clear", "loadingIndicator", "description", "error", "popover", "viewport", "section", "sectionLabel", "option", "optionLeading", "optionCopy", "optionLabel", "optionDescription", "selectionIndicator", "stateMessage"];
    readonly defaults: {
        readonly size: "medium";
        readonly density: "comfortable";
    };
    readonly adaptive: {
        readonly web: "popover";
        readonly native: "sheet";
    };
    readonly frame: {
        readonly background: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly border: Readonly<{
            source: "theme";
            key: "borderControl";
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
    readonly sizes: {
        readonly medium: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 16;
            readonly textVariant: "body";
            readonly glyph: "sm";
        };
        readonly large: {
            readonly minHeight: 52;
            readonly paddingHorizontal: 20;
            readonly textVariant: "bodyLarge";
            readonly glyph: "md";
        };
    };
    readonly support: {
        readonly label: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly fontWeight: "500";
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
    readonly input: {
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly placeholderColor: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly gap: 12;
    };
    readonly leading: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
    };
    readonly indicator: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
    };
    readonly clear: {
        readonly diameter: 36;
        readonly hitSlop: 4;
        readonly glyph: "xs";
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
    };
    readonly loadingIndicator: {
        readonly color: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly glyph: "sm";
    };
    readonly popover: {
        readonly minWidth: 220;
        readonly maxWidth: 420;
        readonly maxHeight: 360;
        readonly sideOffset: 8;
        readonly collisionPadding: 8;
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
    readonly density: {
        readonly compact: {
            readonly selectedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly highlightedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
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
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
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
        readonly comfortable: {
            readonly selectedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly highlightedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly minHeight: 56;
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
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
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
    };
    readonly sectionLabel: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly textVariant: "label";
        readonly paddingHorizontal: 12;
        readonly paddingVertical: 8;
    };
    readonly optionLeading: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly glyph: "sm";
    };
    readonly optionLabel: {
        readonly fontWeight: "500";
        readonly selectedFontWeight: "600";
    };
    readonly selectionIndicator: {
        readonly color: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly glyph: "sm";
    };
    readonly stateMessage: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly textVariant: "body";
        readonly minHeight: 44;
        readonly paddingHorizontal: 12;
        readonly paddingVertical: 12;
    };
    readonly states: {
        readonly hoverBackground: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly pressedBackground: Readonly<{
            source: "theme";
            key: "bg";
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
        readonly invalidBorder: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
        readonly disabledOpacity: 0.5;
    };
    readonly transition: {
        readonly web: {
            readonly enter: {
                readonly duration: 120;
                readonly easing: "standard";
                readonly reducedMotion: "instant";
            };
            readonly exit: {
                readonly duration: 120;
                readonly easing: "exit";
                readonly reducedMotion: "instant";
            };
        };
        readonly native: {
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
        };
    };
};
export declare const segmentedControlRecipe: {
    readonly text: {
        readonly gap: 16;
        readonly indicatorWidth: 16;
        readonly indicatorHeight: 2;
        readonly indicatorRadius: 999;
        readonly minHeight: 44;
        readonly labelGap: 4;
        readonly regular: {
            readonly idle: "400";
            readonly selected: "600";
        };
        readonly strong: {
            readonly idle: "500";
            readonly selected: "700";
        };
    };
    readonly slots: readonly ["root", "item", "label", "indicator"];
    readonly defaults: {
        readonly size: "medium";
    };
    readonly pills: {
        readonly textVariant: "label";
        readonly paddingHorizontal: {
            readonly small: 12;
            readonly medium: 16;
        };
        readonly gap: 8;
        readonly radius: 999;
        readonly inset: 4;
        readonly minHeight: 44;
        readonly background: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly border: Readonly<{
            source: "theme";
            key: "borderControl";
            alpha?: number;
        }>;
        readonly borderWidth: 1;
        readonly selectedBackground: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly selectedContent: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        /**
         * Pills are content-width, so large text keeps the row: it wraps inside a block and stays one line
         * inside a horizontal scroller (SearchScreen `filtersOverflow="scroll"`, a product rail). `adaptive`
         * stacking is for the equal-width connected track only. Stacking pills too turned a seven-theme
         * filter rail into a ~440pt column at accessibility-large (utilverse 1.13.0 adoption, 2026-10-06),
         * and the product swapped in a Select to escape it. Rejected: a pills-only scroll prop, because
         * the host already owns the rail and a second scroller inside it would nest horizontal scrolling.
         */
        readonly largeTextLayout: "wrap";
    };
    readonly adaptive: {
        readonly largeTextLayout: "stacked";
        readonly stackAtFontScale: 1.6;
    };
    readonly container: {
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
        readonly radius: "lg";
        readonly padding: 4;
        readonly gap: 4;
    };
    /**
     * `height` is the connected control's outer height (track border + padding included) and matches the Button /
     * IconButton / Chip height of the same size step, so a segmented control and a chip in one row line up.
     * `minHeight` is the option inside the track (height − 2 × (`container.padding` + `container.borderWidth`)) and `hitSlop` extends each
     * option vertically to the 44 touch target. Before 2026-10-17 `minHeight` was the option itself, so the track
     * drew 46/54 next to 36/44 chips and buttons (DiscoveryGallery sort row, user request "높이 맞춰").
     */
    readonly sizes: {
        readonly small: {
            readonly height: 36;
            readonly minHeight: number;
            readonly hitSlop: number;
            readonly paddingHorizontal: 12;
            readonly textVariant: "label";
        };
        readonly medium: {
            readonly height: 44;
            readonly minHeight: number;
            readonly hitSlop: number;
            readonly paddingHorizontal: 16;
            readonly textVariant: "body";
        };
    };
    readonly item: {
        readonly radius: "md";
        readonly gap: 4;
        readonly idleContent: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly fontWeight: "500";
        readonly selectedBackground: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly selectedContent: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        /**
         * The ring stays the selection signal so the control keeps a non-text
         * contrast of at least 3:1; a fill-only thumb cannot reach that against a
         * neutral track.
         */
        readonly selectedBorder: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly selectedBorderWidth: 2;
        readonly selectedFontWeight: "600";
        readonly focusRing: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly pressedOpacity: 0.86;
        readonly disabledOpacity: 0.5;
    };
};
export declare const switchRecipe: {
    readonly rowLabelTextVariant: "body";
    readonly slots: readonly ["root", "track", "thumb", "label", "description"];
    readonly defaults: {
        readonly size: "medium";
    };
    readonly presentationDefaults: {
        readonly web: "row";
        readonly native: "row";
    };
    readonly stackedTextScale: 1.6;
    readonly sizes: {
        readonly small: {
            readonly width: 44;
            readonly height: 26;
            readonly thumb: 22;
            readonly inset: 2;
        };
        readonly medium: {
            readonly width: 52;
            readonly height: 32;
            readonly thumb: 28;
            readonly inset: 2;
        };
    };
    readonly colors: {
        readonly trackOff: Readonly<{
            source: "theme";
            key: "surfaceAlt";
            alpha?: number;
        }>;
        readonly trackOffBorder: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly trackOn: Readonly<{
            source: "theme";
            key: "primary";
            alpha?: number;
        }>;
        readonly trackOnBorder: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly thumbOff: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly thumbOffBorder: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly thumbOn: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly trackOffDisabled: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
        readonly trackOffBorderDisabled: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
        readonly trackOnDisabled: {
            readonly alpha: 0.38;
            readonly source: "theme";
            readonly key: "primary";
        };
        readonly trackOnBorderDisabled: {
            readonly alpha: 0.38;
            readonly source: "theme";
            readonly key: "primary";
        };
        readonly thumbDisabled: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly thumbDisabledBorder: Readonly<{
            source: "theme";
            key: "textWeak";
            alpha?: number;
        }>;
    };
    readonly states: {
        readonly disabledOpacity: 0.5;
        readonly pressedOpacity: 0.86;
    };
    readonly rowMinHeight: 44;
    readonly rowPaddingVertical: 8;
    readonly rowTwoLineMinHeight: number;
};
export type SelectionControlKind = "checkbox" | "radio";
export declare const selectionControlRecipe: {
    readonly slots: readonly ["root", "control", "indicator", "leading", "content", "label", "description"];
    readonly defaults: {
        readonly kind: "checkbox";
        readonly size: "medium";
        readonly presentation: "card";
    };
    readonly sizes: {
        readonly small: {
            readonly rowMinHeight: 44;
            readonly control: 20;
            readonly hitSlop: 12;
            readonly glyph: "xs";
            readonly gap: 8;
            readonly paddingHorizontal: 12;
            readonly paddingVertical: 8;
            readonly labelVariant: "label";
            readonly descriptionVariant: "caption";
        };
        readonly medium: {
            readonly rowMinHeight: 56;
            readonly control: 24;
            readonly hitSlop: 10;
            readonly glyph: "sm";
            readonly gap: 12;
            readonly paddingHorizontal: 16;
            readonly paddingVertical: 12;
            readonly labelVariant: "body";
            readonly descriptionVariant: "label";
        };
    };
    readonly shapes: {
        readonly checkbox: "sm";
        readonly radio: "full";
    };
    readonly indicatorBorderWidth: 2;
    readonly presentations: {
        readonly chips: {
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
            readonly radius: "full";
            readonly useSizePadding: true;
            readonly labelColor: null;
        };
        readonly plain: {
            readonly background: null;
            readonly border: null;
            readonly borderWidth: 0;
            readonly radius: "md";
            readonly useSizePadding: false;
            readonly labelColor: null;
        };
        readonly card: {
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
            readonly useSizePadding: true;
            readonly labelColor: null;
        };
        readonly grouped: {
            readonly background: null;
            readonly border: null;
            readonly borderWidth: 0;
            readonly radius: "lg";
            readonly useSizePadding: true;
            readonly labelColor: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
        };
    };
    readonly label: {
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly fontWeight: "500";
        readonly checkedFontWeight: "600";
    };
    readonly leading: {
        readonly size: "md";
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
    };
    readonly description: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
    };
    readonly indicators: {
        readonly checkbox: {
            readonly checked: "check";
            readonly mixed: "dash";
        };
        readonly radio: {
            readonly checked: "dot";
            readonly mixed: null;
        };
    };
    readonly radioDotRatio: 0.42;
    readonly states: {
        readonly idleBackground: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly idleBorder: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly checkedBackground: Readonly<{
            source: "theme";
            key: "primary";
            alpha?: number;
        }>;
        readonly checkedBorder: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly indicator: Readonly<{
            source: "theme";
            key: "onPrimary";
            alpha?: number;
        }>;
        readonly selectedBackground: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly selectedBorder: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly hoverBackground: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly pressedBackground: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly invalidBorder: Readonly<{
            source: "theme";
            key: "danger";
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
        readonly disabledOpacity: 0.5;
    };
};
/**
 * Persistent top-level navigation. The recipe reserves an optional center gap
 * for a sibling primary action but never treats that action as a destination.
 */
export declare const bottomNavigationRecipe: {
    readonly slots: readonly ["root", "surface", "list", "item", "indicator", "icon", "label", "badge"];
    readonly defaults: {
        readonly presentation: "bar";
        readonly distribution: "equal";
        readonly density: "regular";
    };
    readonly selectionTile: {
        readonly background: Readonly<{
            source: "theme";
            key: "surfaceAccent";
            alpha?: number;
        }>;
        readonly selectedBackground: Readonly<{
            source: "theme";
            key: "primary";
            alpha?: number;
        }>;
        readonly selectedContent: Readonly<{
            source: "theme";
            key: "onPrimary";
            alpha?: number;
        }>;
        readonly padding: 4;
        readonly gap: 4;
        readonly radius: "lg";
    };
    /**
     * Opt-in thick plank for tile selection (Spint wooden sign, 2026-10-13). The
     * lower edges replace the floating shadow so the bar reads as one flat object.
     * The selected edge darkens the brand fill with `interaction.depth` because no
     * palette role names a "pressed brand" shade.
     */
    readonly raisedSurface: {
        readonly background: Readonly<{
            source: "theme";
            key: "surfaceAlt";
            alpha?: number;
        }>;
        readonly border: Readonly<{
            source: "theme";
            key: "borderControl";
            alpha?: number;
        }>;
        readonly depth: 4;
        readonly selectedDepth: 3;
        readonly selectedDepthColor: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
    };
    /**
     * Raised center destination (`prominent` item, Diairy write tab, 2026-10-18). The circle is the large control
     * height plus one 4pt step so it outranks the 40pt indicators beside it. Renderers lift it by
     * `diameter - indicator.minHeight` so its label stays on the same line as the other labels. It keeps brand
     * fill in both states because a dimmed circle would read as a large idle icon, not the product's main entry;
     * selection evidence stays on the label (weight and color), as for other items.
     */
    readonly prominentDestination: {
        readonly diameter: number;
        readonly icon: "lg";
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
        readonly shadow: {
            readonly color: "#000000";
            readonly opacity: 0.12;
            readonly radius: 12;
            readonly offsetY: 4;
        };
    };
    /**
     * App-icon slots for `configuration.iconSize` (Utilverse dock artwork, 2026-10-18). `standard` keeps the
     * density glyph; 44 is the minimum touch target and 52 the large control height, the sizes the dock used.
     */
    readonly iconSizes: {
        readonly large: 44;
        readonly xlarge: 52;
    };
    /**
     * Floating frames for `configuration.shape` (Utilverse home shells, 2026-10-18). `surfacePadding` is the inner
     * gap between the frame and the destination row; the two tighter frames pair with `density: "compact"` for the
     * desktop-shell docks. Radii are theme radius tokens, so a design profile's radius scale still applies.
     * `standard` is absent on purpose: it keeps `presentations.floating`.
     */
    readonly shapes: {
        readonly rounded: {
            readonly radius: "xl";
            readonly surfacePadding: 8;
        };
        readonly pill: {
            readonly radius: "full";
            readonly surfacePadding: 8;
        };
        readonly compact: {
            readonly radius: "lg";
            readonly surfacePadding: 4;
        };
        readonly square: {
            readonly radius: "sm";
            readonly surfacePadding: 4;
        };
    };
    readonly adaptive: {
        readonly web: "fixed-compact-viewport";
        readonly native: "navigator-tab-bar";
    };
    readonly presentations: {
        readonly capsule: {
            readonly background: Readonly<{
                source: "theme";
                key: "surface";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly borderEdges: readonly ["all"];
            readonly radius: "full";
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
            readonly maxWidth: 480;
            readonly contentMaxWidth: null;
            readonly outerPaddingHorizontal: 16;
            readonly outerPaddingTop: 8;
        };
        readonly bar: {
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
            readonly borderEdges: readonly ["block-start"];
            readonly radius: null;
            readonly shadow: null;
            readonly maxWidth: null;
            /**
             * The bar surface and its top edge span the viewport, but the destinations stay in a centered 480 column
             * (the capsule width): on a 1280 desktop two items otherwise sat at opposite screen edges (2026-10-17 review D8).
             */
            readonly contentMaxWidth: 480;
            readonly outerPaddingHorizontal: 0;
            readonly outerPaddingTop: 0;
        };
        readonly floating: {
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
            readonly borderEdges: readonly ["all"];
            readonly radius: "xl";
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
            readonly maxWidth: 384;
            readonly contentMaxWidth: null;
            readonly outerPaddingHorizontal: 16;
            readonly outerPaddingTop: 8;
        };
    };
    readonly distributions: {
        readonly equal: {
            readonly centerGap: 0;
            readonly requiresEvenItemCount: false;
        };
        readonly "center-gap": {
            readonly centerGap: number;
            readonly requiresEvenItemCount: true;
        };
    };
    readonly density: {
        readonly compact: {
            readonly itemMinWidth: 52;
            readonly itemMinHeight: 52;
            readonly padding: 4;
            readonly gap: 2;
            readonly icon: "sm";
            readonly label: "caption";
        };
        readonly regular: {
            readonly itemMinWidth: 56;
            readonly itemMinHeight: 64;
            readonly padding: 8;
            readonly gap: 4;
            readonly icon: "md";
            readonly label: "caption";
        };
    };
    readonly colors: {
        readonly idle: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly selectedIcon: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly selectedLabel: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
    };
    /**
     * Stable icon/badge layout anchor. Selection never paints this slot as a
     * pill: the icon and label below own the non-color selected evidence.
     */
    readonly indicator: {
        readonly minWidth: 40;
        readonly minHeight: 28;
        readonly radius: "full";
        readonly visual: "none";
        readonly background: null;
        readonly border: null;
        readonly borderWidth: 0;
    };
    readonly icon: {
        /**
         * Adapters apply at least one supported emphasis. Stroke-oriented glyphs
         * use strokeWidth; renderers without stroke control use scale instead.
         */
        readonly selectedEmphasis: {
            readonly minimumAdaptations: 1;
            readonly strokeWidth: {
                readonly idle: 2;
                readonly selected: 3;
            };
            readonly scale: {
                readonly idle: 1;
                readonly selected: 1.06;
            };
        };
        /**
         * `configuration.iconEmphasis: "lift"` (Utilverse dock artwork, 2026-10-18): the selected icon rises one 4pt
         * step on top of the selected scale, and idle icons dim. Full-color artwork cannot take the selected tint, so
         * without the dim only the label would mark the current destination. 0.82 is the dock's measured idle opacity.
         */
        readonly liftEmphasis: {
            readonly translateY: number;
            readonly idleOpacity: 0.82;
        };
    };
    readonly label: {
        readonly fontWeight: "500";
        readonly selectedFontWeight: "600";
        readonly textAlign: "center";
        readonly wrap: true;
        readonly fixedLines: null;
    };
    readonly badge: {
        readonly size: "small";
        readonly variant: "floating";
        readonly anchor: {
            readonly blockStart: number;
            readonly inlineEnd: number;
        };
        readonly subtreeHiddenFromAccessibility: true;
    };
    readonly safeArea: {
        readonly mode: "additive";
        readonly minimumBottomPadding: 8;
    };
    readonly keyboard: {
        readonly defaultBehavior: "hide";
        readonly movesAboveKeyboard: false;
    };
    readonly largeText: {
        readonly allowFontScaling: true;
        readonly maxFontSizeMultiplier: 1.4;
        readonly fixedItemHeight: false;
        readonly labelWraps: true;
    };
    readonly direction: {
        readonly itemOrder: "logical";
        readonly badgeAnchor: "inline-end";
    };
    readonly states: {
        readonly hoverBackground: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly pressedBackground: Readonly<{
            source: "theme";
            key: "bg";
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
        readonly disabledOpacity: 0.5;
        readonly selectedNonColorEvidence: {
            readonly target: "icon-and-label";
            readonly label: "font-weight";
            readonly icon: "emphasis";
        };
        readonly selectedFocusSeparation: {
            readonly selectedTarget: "icon-and-label";
            readonly focusTarget: "item";
            readonly minimumGap: 2;
        };
    };
    readonly transition: {
        readonly duration: 120;
        readonly easing: "standard";
        readonly reducedMotion: "instant";
    };
};
export declare const tabsRecipe: {
    readonly slots: readonly ["root", "list", "tab", "label", "indicator", "panel"];
    readonly defaults: {
        readonly size: "medium";
        readonly layout: "content";
        readonly overflow: "scroll";
        readonly indicator: "underline";
    };
    /**
     * Selection mark. `filled` paints the selected tab as a brand-tinted pill instead of the 2pt underline and
     * drops the list divider, which only anchors underlines (Diairy nest tabs, 2026-10-18: the app's tab bar
     * already marks the current place with this pill, so in-screen tabs looked like a second product).
     */
    readonly indicators: {
        readonly underline: {
            readonly listDivider: true;
            readonly background: null;
            readonly selectedContent: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly radius: null;
        };
        readonly filled: {
            readonly listDivider: false;
            readonly background: Readonly<{
                source: "theme";
                key: "surfaceAccent";
                alpha?: number;
            }>;
            readonly selectedContent: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly radius: "full";
        };
    };
    readonly sizes: {
        readonly small: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 12;
            readonly textVariant: "label";
        };
        readonly medium: {
            readonly minHeight: 48;
            readonly paddingHorizontal: 16;
            readonly textVariant: "body";
        };
    };
    readonly colors: {
        readonly idle: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly selected: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly indicator: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly divider: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
    };
    readonly gap: 8;
    readonly icon: {
        readonly glyph: "xs";
    };
    readonly label: {
        readonly fontWeight: "500";
        readonly selectedFontWeight: "600";
    };
    readonly layouts: {
        readonly content: {
            readonly fitted: false;
        };
        readonly fitted: {
            readonly fitted: true;
        };
    };
    readonly overflow: {
        readonly scroll: {
            readonly scrollable: true;
            readonly wrap: false;
        };
        readonly clip: {
            readonly scrollable: false;
            readonly wrap: false;
        };
    };
    readonly indicatorHeight: 2;
    readonly states: {
        readonly pressedBackground: Readonly<{
            source: "theme";
            key: "bg";
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
        readonly disabledOpacity: 0.5;
    };
};
export type NoticeTone = "info" | "success" | "warning" | "attention" | "danger";
export declare const noticeRecipe: {
    readonly slots: readonly ["root", "icon", "content", "title", "description", "action"];
    readonly defaults: {
        readonly tone: "info";
        readonly appearance: "panel";
    };
    readonly appearances: {
        readonly panel: {
            readonly padding: 16;
            readonly borderWidth: 1;
        };
        readonly status: {
            readonly padding: 0;
            readonly borderWidth: 0;
        };
    };
    readonly tones: {
        readonly info: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly foreground: Readonly<{
                source: "accent";
                key: "info";
                alpha?: number;
            }>;
            readonly badgeBackground: Readonly<{
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
            readonly foreground: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
            readonly background: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
            readonly badgeBackground: Readonly<{
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
        readonly warning: {
            readonly foreground: Readonly<{
                source: "accent";
                key: "warning";
                alpha?: number;
            }>;
            readonly background: Readonly<{
                source: "accent";
                key: "warning";
                alpha?: number;
            }>;
            readonly badgeBackground: Readonly<{
                source: "accent";
                key: "warning";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "accent";
                key: "warning";
                alpha?: number;
            }>;
        };
        readonly attention: {
            readonly foreground: Readonly<{
                source: "accent";
                key: "attention";
                alpha?: number;
            }>;
            readonly background: Readonly<{
                source: "accent";
                key: "attention";
                alpha?: number;
            }>;
            readonly badgeBackground: Readonly<{
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
        readonly danger: {
            readonly foreground: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly background: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly badgeBackground: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
    };
    readonly radius: "md";
    readonly padding: 16;
    readonly gap: 12;
    readonly contentGap: 4;
    readonly iconSize: "sm";
    readonly borderWidth: 1;
    readonly title: {
        readonly textVariant: "body";
        readonly fontWeight: "500";
    };
    readonly description: {
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly textVariant: "body";
    };
};
export declare const skeletonRecipe: {
    readonly slots: readonly ["root", "line"];
    readonly defaults: {
        readonly shape: "block";
        readonly animated: true;
        readonly lines: 1;
    };
    readonly background: Readonly<{
        source: "theme";
        key: "text";
        alpha?: number;
    }>;
    readonly shapes: {
        readonly block: {
            readonly radius: "md";
            readonly defaultHeight: 32;
            readonly aspectRatio: null;
        };
        readonly text: {
            readonly radius: "sm";
            readonly defaultHeight: 16;
            readonly aspectRatio: null;
        };
        readonly circle: {
            readonly radius: "full";
            readonly defaultHeight: 44;
            readonly aspectRatio: null;
        };
        readonly media: {
            readonly radius: "md";
            readonly defaultHeight: null;
            readonly aspectRatio: number;
        };
        readonly button: {
            readonly radius: "md";
            readonly defaultHeight: 44;
            readonly aspectRatio: null;
        };
    };
    readonly lines: {
        readonly gap: 8;
        readonly lastLineWidthPercent: 60;
    };
    readonly animation: {
        readonly duration: number;
        readonly easing: "standard";
        readonly fromOpacity: 0.56;
        readonly toOpacity: 1;
        readonly reducedMotion: "static";
    };
};
export declare const emptyStateRecipe: {
    readonly slots: readonly ["root", "icon", "title", "description", "action"];
    readonly defaults: {
        readonly density: "regular";
    };
    readonly density: {
        readonly compact: {
            readonly paddingVertical: 24;
        };
        readonly regular: {
            readonly paddingVertical: 40;
        };
    };
    readonly paddingHorizontal: 24;
    readonly gap: 8;
    readonly icon: {
        readonly size: "lg";
        readonly color: Readonly<{
            source: "theme";
            key: "textWeak";
            alpha?: number;
        }>;
    };
    readonly title: {
        readonly textVariant: "body";
        readonly color: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly fontWeight: "500";
    };
    readonly description: {
        readonly textVariant: "body";
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
    };
};
export declare const spinnerRecipe: {
    readonly slots: readonly ["root"];
    readonly defaults: {
        readonly size: "medium";
        readonly tone: "brand";
    };
    readonly sizes: {
        readonly small: 14;
        readonly medium: 20;
        readonly large: 28;
    };
    readonly tones: {
        readonly brand: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly neutral: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly inverse: Readonly<{
            source: "theme";
            key: "onPrimary";
            alpha?: number;
        }>;
    };
    readonly strokeWidth: 2;
    readonly animation: {
        readonly duration: 800;
        readonly easing: "standard";
        readonly reducedMotion: "static";
    };
};
export type LoadMoreDensity = "compact" | "regular";
export declare const loadMoreRecipe: {
    readonly slots: readonly ["root", "status", "spinner", "trigger", "error", "retry", "end"];
    readonly defaults: {
        readonly mode: "automatic";
        readonly density: "regular";
    };
    readonly density: {
        readonly compact: {
            readonly paddingVertical: 12;
            readonly gap: 8;
        };
        readonly regular: {
            readonly paddingVertical: 20;
            readonly gap: 12;
        };
    };
    readonly status: {
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
    readonly end: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly textVariant: "caption";
    };
    readonly trigger: {
        readonly minHeight: 44;
        readonly paddingHorizontal: 16;
        readonly radius: "md";
        readonly color: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly textVariant: "label";
        readonly fontWeight: "500";
    };
    readonly spinner: {
        readonly size: "small";
        readonly tone: "brand";
    };
    readonly states: {
        readonly focus: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly width: 2;
            readonly offset: 2;
        };
        readonly pressedOpacity: 0.86;
        readonly disabledOpacity: 0.5;
    };
};
export declare const avatarRecipe: {
    readonly slots: readonly ["root", "image", "fallback", "badge", "group"];
    /**
     * 겹쳐 쌓은 아바타 묶음이 얼마나 겹치는가. 비율로 두는 이유는 크기 축이 이미 네 단계라
     * 픽셀로 적으면 네 벌이 되기 때문이다. 남은 인원은 제품이 문구로 만든다("+3").
     */
    readonly overlapRatio: 0.3;
    readonly defaults: {
        readonly size: "medium";
        readonly shape: "circle";
    };
    readonly sizes: {
        readonly small: 32;
        readonly medium: 40;
        readonly large: 48;
        readonly xlarge: 64;
    };
    readonly shapes: {
        readonly rounded: "md";
        readonly circle: "full";
    };
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
    /** Initials use the strong emphasis step; their size follows the avatar (Web `.hjm-avatar[data-size]` steps). */
    readonly initialsWeight: "strong";
};
/**
 * Initials text step for an avatar diameter, shared by Web size tokens and Native numeric sizes
 * (2026-10-17 comparison: Native drew 12pt brand-colored initials at every size).
 */
export declare function resolveAvatarInitialsTextVariant(size: number): "label" | "body" | "title";
export type StatisticDensity = "compact" | "comfortable";
export type StatisticPresentation = "plain" | "surface";
export declare const statisticRecipe: {
    readonly slots: readonly ["group", "root", "label", "valueRow", "prefix", "value", "suffix", "trend", "trendMark", "hint"];
    readonly defaults: {
        readonly density: "comfortable";
        readonly presentation: "plain";
        readonly columns: 3;
    };
    readonly density: {
        readonly compact: {
            readonly padding: 12;
            readonly gap: 4;
            readonly labelVariant: "caption";
            readonly valueVariant: "title";
        };
        readonly comfortable: {
            readonly padding: 16;
            readonly gap: 8;
            readonly labelVariant: "label";
            readonly valueVariant: "heading";
        };
    };
    readonly presentations: {
        readonly plain: {
            readonly background: null;
            readonly border: null;
            readonly borderWidth: 0;
            readonly radius: "md";
        };
        readonly surface: {
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
        };
    };
    readonly group: {
        readonly gap: 8;
        readonly minItemWidth: 120;
        readonly bar: {
            readonly cellPadding: 8;
            readonly valueGap: 4;
            readonly iconSize: 20;
        };
        readonly columns: readonly [1, 2, 3, 4];
    };
    readonly label: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly fontWeight: "500";
    };
    readonly value: {
        readonly color: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly fontWeight: "600";
        readonly numericVariant: "tabular";
        readonly maxLines: null;
    };
    readonly affix: {
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly textVariant: "body";
        readonly fontWeight: "500";
    };
    readonly hint: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly textVariant: "caption";
    };
    readonly trend: {
        readonly textVariant: "caption";
        readonly fontWeight: "500";
        readonly gap: 4;
        readonly marks: {
            readonly up: "trendUp";
            readonly down: "trendDown";
            readonly flat: "trendFlat";
        };
        readonly tones: {
            readonly neutral: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly success: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
            readonly warning: Readonly<{
                source: "accent";
                key: "warning";
                alpha?: number;
            }>;
            readonly danger: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
    };
};
/**
 * Adjacent action buttons use 8 in both directions. The 2026-10-20 user request tightened
 * horizontal groups to the same spacing as stacked groups; control touch targets remain unchanged.
 */
export declare const actionGroupRecipe: {
    readonly inlineGap: 8;
    readonly stackedGap: 8;
};
export declare const sheetRecipe: {
    readonly slots: readonly ["backdrop", "positioner", "content", "handle", "header", "title", "body", "footer", "close"];
    readonly defaults: {
        readonly placement: "bottom";
        readonly size: "auto";
    };
    /**
     * How tall the sheet opens. `auto` keeps the content-driven height that the
     * recipe already caps with `maxHeightRatio`. The fixed steps exist because
     * consumers otherwise reach for `contentStyle={{ height }}`, which moves a
     * recipe-owned dimension into product code.
     */
    readonly sizes: {
        readonly auto: null;
        readonly small: 0.4;
        readonly medium: 0.6;
        readonly large: 0.85;
        readonly full: 1;
    };
    readonly backdrop: {
        readonly color: "#000000";
        readonly opacity: 0.6;
    };
    readonly content: {
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
        readonly radius: "xl";
        readonly shadow: {
            readonly color: "#000000";
            readonly opacity: 0.12;
            readonly radius: 12;
            readonly offsetY: 4;
        };
        /** Caps `size="auto"` only; fixed `sizes` (medium/large/full) are bounded by the safe-area viewport instead. */
        readonly maxHeightRatio: 0.9;
        readonly paddingHorizontal: 20;
        readonly paddingTop: 12;
        readonly paddingBottom: 12;
    };
    readonly web: {
        readonly maxWidth: 640;
    };
    readonly safeArea: {
        readonly edge: "bottom";
        readonly mode: "additive";
        readonly minimumPadding: 12;
    };
    readonly handle: {
        readonly width: 36;
        readonly height: 4;
        readonly radius: "full";
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly visibleByDefault: true;
        readonly showWhen: "swipe-dismiss-enabled";
    };
    readonly header: {
        readonly minHeight: 44;
        readonly gap: 12;
    };
    readonly body: {
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly textVariant: "body";
        readonly gap: 16;
    };
    readonly footer: {
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly textVariant: "body";
        readonly gap: 8;
        readonly paddingTop: 12;
    };
    readonly transition: {
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
    };
};
export declare const dialogRecipe: {
    readonly slots: readonly ["backdrop", "positioner", "content", "header", "title", "description", "body", "footer", "close"];
    readonly defaults: {
        readonly size: "medium";
        readonly dismissible: true;
    };
    readonly sizes: {
        readonly small: {
            readonly maxWidth: 320;
            readonly padding: 20;
        };
        readonly medium: {
            readonly maxWidth: 420;
            readonly padding: 24;
        };
        readonly large: {
            readonly maxWidth: 640;
            readonly padding: 24;
        };
    };
    readonly backdrop: {
        readonly color: "#000000";
        readonly opacity: 0.6;
    };
    readonly content: {
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
        readonly radius: "lg";
        readonly gap: 16;
        readonly shadow: {
            readonly color: "#000000";
            readonly opacity: 0.12;
            readonly radius: 12;
            readonly offsetY: 4;
        };
    };
    readonly transition: {
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
    };
    /**
     * ImmersiveOverlay (Dialog companion, 1.31.0): an edge-to-edge stage with a control bar and no card, scrim or
     * header, for presentations such as a display board (utilverse used a raw RN Modal because Dialog/Sheet always
     * framed their content). The stage is product-drawn; the bar reuses screen spacing so it matches a screen footer.
     */
    readonly immersive: {
        readonly background: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly controls: {
            readonly padding: 16;
            readonly gap: 8;
            readonly actionGap: 12;
        };
        readonly orientations: readonly ["portrait", "landscape-left", "landscape-right"];
        readonly statusBarHidden: true;
    };
};
/**
 * Tone is the dialog's reason for interrupting, not its decoration.
 *
 * `attention` and `danger` covered "are you sure?" and "this destroys
 * something", but consumers also stop the user to *explain* an action before
 * running it — an intro before a button that copies content into the account,
 * or a confirmation that something finished. Those were shipping with the
 * attention mark, so a neutral explanation read as a warning (reported by a
 * product team on 2026-09-15). `info` and `success` carry the existing feedback
 * accents so the axis stays one token lookup per renderer.
 */
export type AlertDialogTone = "attention" | "danger" | "info" | "success";
export declare const alertDialogRecipe: {
    readonly slots: readonly ["backdrop", "positioner", "content", "icon", "title", "description", "status", "error", "actions", "cancel", "confirm"];
    readonly defaults: {
        readonly tone: "attention";
        readonly size: "small";
    };
    readonly sizes: {
        readonly small: {
            readonly maxWidth: 320;
            readonly padding: 20;
        };
        readonly medium: {
            readonly maxWidth: 420;
            readonly padding: 24;
        };
        readonly large: {
            readonly maxWidth: 640;
            readonly padding: 24;
        };
    };
    readonly backdrop: {
        readonly color: "#000000";
        readonly opacity: 0.6;
    };
    readonly content: {
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
        readonly radius: "lg";
        readonly gap: 16;
        readonly shadow: {
            readonly color: "#000000";
            readonly opacity: 0.12;
            readonly radius: 12;
            readonly offsetY: 4;
        };
    };
    readonly tones: {
        readonly attention: {
            readonly icon: Readonly<{
                source: "accent";
                key: "attention";
                alpha?: number;
            }>;
            readonly iconBackground: Readonly<{
                source: "accent";
                key: "attention";
                alpha?: number;
            }>;
            readonly confirm: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
            readonly confirmContent: Readonly<{
                source: "theme";
                key: "onPrimary";
                alpha?: number;
            }>;
        };
        readonly danger: {
            readonly icon: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly iconBackground: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly confirm: Readonly<{
                source: "theme";
                key: "dangerFill";
                alpha?: number;
            }>;
            readonly confirmContent: Readonly<{
                source: "theme";
                key: "onDanger";
                alpha?: number;
            }>;
        };
        readonly info: {
            readonly icon: Readonly<{
                source: "accent";
                key: "info";
                alpha?: number;
            }>;
            readonly iconBackground: Readonly<{
                source: "accent";
                key: "info";
                alpha?: number;
            }>;
            readonly confirm: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
            readonly confirmContent: Readonly<{
                source: "theme";
                key: "onPrimary";
                alpha?: number;
            }>;
        };
        readonly success: {
            readonly icon: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
            readonly iconBackground: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
            readonly confirm: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
            readonly confirmContent: Readonly<{
                source: "theme";
                key: "onPrimary";
                alpha?: number;
            }>;
        };
    };
    readonly icon: {
        readonly containerSize: 44;
        readonly glyph: "md";
        readonly radius: "full";
    };
    readonly title: {
        readonly color: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly textVariant: "title";
        readonly fontWeight: "500";
    };
    readonly description: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly textVariant: "body";
    };
    readonly error: {
        readonly color: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
        readonly textVariant: "label";
    };
    readonly actions: {
        readonly gap: 8;
        readonly stackedGap: 8;
        readonly stackedOrder: "confirm-first";
        readonly stackBelow: 600;
        readonly minButtonWidth: 96;
    };
    readonly transition: {
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
    };
};
export type ToastPlacement = "top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end";
export type ToastTone = "neutral" | "info" | "success" | "warning" | "danger";
export type ToastToneMark = "notifications" | "info" | "success" | "warning" | "alert";
export declare const toastRecipe: {
    readonly slots: readonly ["viewport", "root", "toneMark", "icon", "media", "content", "title", "description", "progress", "action", "close"];
    readonly defaults: {
        readonly tone: "neutral";
        readonly placement: "bottom";
        readonly durationMs: 3000;
    };
    readonly adaptive: {
        readonly web: "fixed-viewport";
        readonly native: "safe-area-overlay";
    };
    readonly viewport: {
        readonly layer: 1000;
        readonly gap: 12;
        readonly inset: 16;
        readonly maxWidth: 420;
        readonly safeAreaMode: "additive";
    };
    readonly placements: {
        readonly top: {
            readonly blockEdge: "top";
            readonly inlineEdge: "center";
            readonly stackFrom: "top";
        };
        readonly "top-start": {
            readonly blockEdge: "top";
            readonly inlineEdge: "start";
            readonly stackFrom: "top";
        };
        readonly "top-end": {
            readonly blockEdge: "top";
            readonly inlineEdge: "end";
            readonly stackFrom: "top";
        };
        readonly bottom: {
            readonly blockEdge: "bottom";
            readonly inlineEdge: "center";
            readonly stackFrom: "bottom";
        };
        readonly "bottom-start": {
            readonly blockEdge: "bottom";
            readonly inlineEdge: "start";
            readonly stackFrom: "bottom";
        };
        readonly "bottom-end": {
            readonly blockEdge: "bottom";
            readonly inlineEdge: "end";
            readonly stackFrom: "bottom";
        };
    };
    readonly tones: {
        readonly neutral: {
            readonly foreground: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly accent: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly badge: Readonly<{
                source: "theme";
                key: "surfaceAlt";
                alpha?: number;
            }>;
            readonly mark: "notifications";
        };
        readonly info: {
            readonly foreground: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly accent: Readonly<{
                source: "accent";
                key: "info";
                alpha?: number;
            }>;
            readonly badge: Readonly<{
                source: "accent";
                key: "info";
                alpha?: number;
            }>;
            readonly mark: "info";
        };
        readonly success: {
            readonly foreground: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly accent: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
            readonly badge: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
            readonly mark: "success";
        };
        readonly warning: {
            readonly foreground: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly accent: Readonly<{
                source: "accent";
                key: "warning";
                alpha?: number;
            }>;
            readonly badge: Readonly<{
                source: "accent";
                key: "warning";
                alpha?: number;
            }>;
            readonly mark: "warning";
        };
        readonly danger: {
            readonly foreground: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly accent: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly badge: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly mark: "alert";
        };
    };
    readonly surface: {
        readonly background: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly border: Readonly<{
            source: "theme";
            key: "textWeak";
            alpha?: number;
        }>;
        readonly borderWidth: 1;
        readonly radius: "xl";
        readonly shadow: {
            readonly color: "#000000";
            readonly opacity: 0.12;
            readonly radius: 12;
            readonly offsetY: 4;
        };
        readonly minHeight: 56;
        readonly padding: {
            readonly block: 12;
            readonly inline: 16;
        };
        readonly gap: 12;
        readonly maxWidth: 420;
    };
    readonly anchor: {
        readonly blockSize: 32;
    };
    /**
     * @deprecated Toast has no edge stripe: the tinted icon badge (or product media) carries tone. Retired in 1.10.0
     * (width 0); since 1.32.0 neither renderer draws an element for it, so there is nothing for a product to hide
     * (2026-10-18 BurnTok still hid a strip that no longer existed). Kept only so the published recipe shape stays
     * compatible; remove in the next major.
     */
    readonly toneMark: {
        readonly width: 0;
        readonly radius: "full";
    };
    readonly icon: {
        readonly glyph: "sm";
        readonly badgeDiameter: 32;
        readonly badgeRadius: "full";
    };
    readonly media: {
        readonly size: 44;
    };
    readonly content: {
        readonly gap: 4;
    };
    readonly title: {
        readonly color: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly textVariant: "body";
        readonly fontWeight: "500";
    };
    readonly description: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly textVariant: "body";
    };
    readonly progress: {
        readonly gap: 12;
        readonly dotSize: 6;
        readonly currentScale: 1.4;
        readonly doneColor: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly upcomingColor: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
        readonly labelColor: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly currentLabelColor: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly textVariant: "caption";
    };
    readonly action: {
        readonly color: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly background: Readonly<{
            source: "theme";
            key: "surfaceAccent";
            alpha?: number;
        }>;
        readonly radius: "full";
        readonly align: "start";
        readonly textVariant: "body";
        readonly fontWeight: "500";
        readonly minHeight: 44;
        readonly paddingHorizontal: 16;
    };
    readonly close: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly diameter: 44;
        readonly glyph: "xs";
        readonly blockOverhang: number;
        readonly inlineOverhang: number;
    };
    readonly states: {
        readonly pressedOpacity: 0.86;
        readonly draggedOpacity: 0.64;
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
    readonly gesture: {
        readonly dismissThreshold: 50;
    };
    readonly transition: {
        readonly web: {
            readonly enter: {
                readonly duration: 120;
                readonly easing: "standard";
                readonly reducedMotion: "instant";
            };
            readonly exit: {
                readonly duration: 120;
                readonly easing: "exit";
                readonly reducedMotion: "instant";
            };
        };
        readonly native: {
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
        };
    };
};
export declare const tooltipRecipe: {
    readonly slots: readonly ["provider", "trigger", "content", "arrow"];
    readonly defaults: {
        readonly placement: "top";
        readonly align: "center";
    };
    readonly layer: 950;
    readonly surface: {
        readonly background: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly border: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly radius: "sm";
        readonly padding: 8;
        readonly borderWidth: 1;
        readonly shadow: {
            readonly color: "#000000";
            readonly opacity: 0.12;
            readonly radius: 12;
            readonly offsetY: 4;
        };
    };
    readonly content: {
        readonly color: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly textVariant: "label";
        readonly maxWidth: 280;
    };
    readonly arrow: {
        readonly width: 10;
        readonly height: 5;
        readonly color: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly padding: 8;
    };
    readonly positioning: {
        readonly sideOffset: 4;
        readonly collisionPadding: 12;
    };
    readonly transition: {
        readonly enter: {
            readonly duration: 120;
            readonly easing: "standard";
            readonly reducedMotion: "instant";
        };
        readonly exit: {
            readonly duration: 120;
            readonly easing: "exit";
            readonly reducedMotion: "instant";
        };
    };
};
export declare const topBarRecipe: {
    readonly slots: readonly ["root", "leading", "title", "titleLeading", "titleAction", "trailing", "action", "actionLabel"];
    readonly defaults: {
        readonly centered: true;
    };
    readonly minHeight: 52;
    readonly sideMinWidth: 44;
    readonly paddingHorizontal: 16;
    readonly gap: 8;
    readonly largeTextThreshold: 1.6;
    readonly title: {
        readonly textVariant: "bodyLarge";
        readonly color: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly fontWeight: "500";
    };
    readonly titleAction: {
        readonly minHeight: 44;
        readonly minWidth: 44;
        readonly gap: 8;
        readonly pressedOpacity: 0.86;
    };
    readonly action: {
        readonly minHeight: 44;
        readonly minWidth: 44;
        readonly gap: 4;
        readonly paddingHorizontal: 4;
        readonly pressedOpacity: 0.86;
        readonly disabledOpacity: 0.5;
    };
    readonly actionLabel: {
        readonly textVariant: "caption";
        readonly color: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly fontWeight: "500";
    };
    readonly background: Readonly<{
        source: "theme";
        key: "bg";
        alpha?: number;
    }>;
};
export declare const bottomCtaRecipe: {
    readonly slots: readonly ["root", "description", "secondaryAction", "primaryAction"];
    readonly minHeight: 64;
    readonly paddingHorizontal: 16;
    readonly paddingTop: 12;
    readonly paddingBottom: 12;
    readonly gap: 12;
    readonly contentMaxWidth: number;
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
    readonly shadow: {
        readonly color: "#000000";
        readonly opacity: 0.08;
        readonly radius: 8;
        readonly offsetY: -2;
        readonly elevation: 8;
    };
};
export declare const sectionRecipe: {
    readonly slots: readonly ["root", "header", "copy", "title", "description", "action", "content"];
    readonly gap: 8;
    readonly headerGap: 12;
    readonly copyGap: 4;
    readonly title: {
        readonly textVariant: "title";
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly fontWeight: "500";
    };
    readonly description: {
        readonly textVariant: "caption";
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
    };
};
export type SegmentedControlSize = keyof typeof segmentedControlRecipe.sizes;
export type SwitchPresentation = "inline" | "row";
export type SwitchSize = keyof typeof switchRecipe.sizes;
export type SelectionControlSize = keyof typeof selectionControlRecipe.sizes;
export type SelectionControlPresentation = keyof typeof selectionControlRecipe.presentations;
export type TabSize = keyof typeof tabsRecipe.sizes;
export type TabsLayout = keyof typeof tabsRecipe.layouts;
export type TabsOverflow = keyof typeof tabsRecipe.overflow;
export type TabsIndicator = keyof typeof tabsRecipe.indicators;
export type SpinnerSize = keyof typeof spinnerRecipe.sizes;
export type SpinnerTone = keyof typeof spinnerRecipe.tones;
export type AvatarSize = keyof typeof avatarRecipe.sizes;
export type AvatarShape = keyof typeof avatarRecipe.shapes;
export type DialogSize = keyof typeof dialogRecipe.sizes;
//# sourceMappingURL=component-recipes.d.ts.map