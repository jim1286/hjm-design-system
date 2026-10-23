import { solidAccentColor } from "./color-references.js";
import { THEMES } from "./colors.js";
import { contrastRatio } from "./palette-contrast.js";
import { collectionItemContract, fieldFrameContract, floatingSurfaceContract, focusIndicatorContract, formSupportContract, } from "./component-contracts.js";
import { backdrop, breakpoint, control, glyph, layer, largeTextThreshold, layout, fontWeight, motion, motionPreset, opacity, radius, spacing, stroke, typography, } from "./foundations.js";
import { buttonRecipe } from "./base-recipes.js";
import { semanticColors } from "./semantic-colors.js";
import { tooltipDescriptorDefaults } from "./tooltip.js";
import { bottomNavigationRecipeDefaults } from "./bottom-navigation-defaults.js";
export { iconButtonEdges, iconButtonRecipe, resolveIconButtonEdgeOverhang, resolveIconButtonPresentation, } from "./icon-button-recipe.js";
export { counterBadgeDefaults, counterBadgeRecipe, formatCounterBadgeCount, } from "./counter-badge-recipe.js";
export { progressRecipe, resolveProgressSegments, } from "./progress-recipe.js";
export const textRecipe = {
    slots: ["root"],
    defaults: { variant: "body", tone: "primary", emphasis: "regular" },
    tones: {
        primary: semanticColors.content.primary,
        body: semanticColors.content.body,
        muted: semanticColors.content.secondary,
        subtle: semanticColors.content.tertiary,
        weak: semanticColors.content.decorative,
        brand: semanticColors.content.brand,
        danger: semanticColors.content.danger,
        inverse: semanticColors.content.inverse,
    },
    // 2026-10-17 user decisions: the strongest inline emphasis matches the title weight. strong=700 made unread
    // notification titles and labels heavier than every title after titles moved to 600 ("왜 폰트가 진해"), so
    // strong became 600; the second round ("굵기 좀더 줄여") moved titles 600→500 and display headings 700→600,
    // so strong follows the title role (500) and equals `medium`. Semibold 600 is the key-number/selected step.
    emphasis: {
        regular: fontWeight.regular,
        medium: fontWeight.medium,
        strong: typography.title.fontWeight,
    },
    /**
     * Variants whose omitted `emphasis` renders the variant's typography weight even without a design profile.
     * Label's 500 equals the `medium` emphasis step, but the shared `regular` default drew form labels at
     * body weight (2026-10-17 user decision: label 500 on Web and Native). Other variants keep `regular`.
     */
    variantWeight: ["label"],
};
/**
 * Weight Text renders when the caller omits `emphasis`; `undefined` means `textRecipe.defaults.emphasis` applies.
 * Inside a design profile every variant follows the profile's typography weight; outside one only
 * `textRecipe.variantWeight` variants do. An explicit `emphasis` always wins and never reaches this resolver.
 */
export function resolveTextDefaultWeight(variant, typographyTokens, designProfileActive) {
    return designProfileActive || textRecipe.variantWeight.includes(variant)
        ? typographyTokens[variant].fontWeight
        : undefined;
}
export const iconRecipe = {
    slots: ["root"],
    defaults: {
        size: "md",
        tone: "secondary",
        weight: "regular",
        decorative: true,
    },
    sizes: glyph,
    tones: {
        primary: semanticColors.content.primary,
        secondary: semanticColors.content.secondary,
        decorative: semanticColors.content.decorative,
        brand: semanticColors.content.brand,
        info: semanticColors.feedback.info.foreground,
        success: semanticColors.feedback.success.foreground,
        warning: semanticColors.feedback.warning.foreground,
        danger: semanticColors.content.danger,
        inverse: semanticColors.content.inverse,
    },
    weights: { regular: 2, strong: 2.5 },
    stroke: {
        lineCap: "round",
        lineJoin: "round",
        scaling: "proportional",
    },
};
export const stackRecipe = {
    slots: ["root"],
    defaults: { axis: "block", gap: "md", align: "stretch", justify: "start", wrap: false },
    axes: { block: "column", inline: "row" },
    gaps: spacing,
    align: ["start", "center", "end", "stretch"],
    justify: ["start", "center", "end", "between"],
};
export const linkRecipe = {
    slots: ["root", "leading", "label", "trailing"],
    defaults: { tone: "brand", variant: "inline" },
    tones: {
        brand: semanticColors.content.brand,
        neutral: semanticColors.content.body,
    },
    variants: {
        inline: {
            textVariant: "body",
            fontWeight: fontWeight.medium,
            underline: "always",
            minHeight: null,
            minWidth: null,
        },
        /** 그 자체가 동작이므로 두 축 모두 최소 터치 타깃. 높이만 잡으면 짧은 라벨이 좁아진다. */
        standalone: {
            textVariant: "body",
            fontWeight: fontWeight.medium,
            underline: "hover",
            minHeight: control.minTouchTarget,
            minWidth: control.minTouchTarget,
        },
    },
    gap: spacing.xxs,
    icon: { glyph: "xs", inheritsTone: true },
    states: {
        pressedOpacity: opacity.pressed,
        focus: focusIndicatorContract,
    },
};
export const selectionGroupRecipe = {
    slots: ["root", "label", "requiredIndicator", "description", "items", "itemLabel", "itemAction", "error"],
    defaults: { orientation: "vertical", presentation: "card" },
    orientations: {
        vertical: {
            direction: "column",
            // `grouped` rows sit flush inside one shared card, so the group owns
            // the only outer radius and the rows share edges instead of floating
            // apart with their own gap — the same shape as `selectionControlRecipe`'s
            // `grouped` presentation, which this gap pairs with.
            gap: { plain: spacing.xxs, card: spacing.xs, grouped: 0, chips: spacing.xs },
        },
        horizontal: {
            direction: "row",
            gap: { plain: spacing.sm, card: spacing.md, grouped: 0, chips: spacing.xs },
        },
    },
    label: formSupportContract.label,
    requiredIndicator: { color: semanticColors.content.danger },
    description: formSupportContract.hint,
    error: formSupportContract.error,
    supportGap: formSupportContract.gap,
    states: { disabledOpacity: opacity.disabled },
};
export const badgeRecipe = {
    slots: ["root", "icon", "label", "trailing"],
    defaults: { tone: "neutral", size: "medium", variant: "filled" },
    variants: {
        filled: {
            usesToneBackground: true,
            borderFallback: null,
        },
        outline: {
            usesToneBackground: false,
            borderFallback: semanticColors.border.default,
        },
    },
    // 2026-10-18: match the Today Baseball status plate reference: solid fill,
    // white copy and compact rounded corners. Outline retains its tone-colored copy.
    tones: {
        neutral: { content: semanticColors.content.statusInverse, outlineContent: semanticColors.content.secondary, background: semanticColors.surface.statusNeutral, border: null },
        strong: { content: semanticColors.content.statusInverse, outlineContent: semanticColors.content.primary, background: semanticColors.surface.statusStrong, border: null },
        brand: { content: semanticColors.content.inverse, outlineContent: semanticColors.content.brand, background: semanticColors.action.brand.background, border: null },
        info: { content: semanticColors.content.statusInverse, outlineContent: semanticColors.feedback.info.foreground, background: solidAccentColor("info"), border: semanticColors.feedback.info.border },
        success: { content: semanticColors.content.statusInverse, outlineContent: semanticColors.feedback.success.foreground, background: solidAccentColor("success"), border: semanticColors.feedback.success.border },
        warning: { content: semanticColors.content.statusInverse, outlineContent: semanticColors.feedback.warning.foreground, background: solidAccentColor("warning"), border: semanticColors.feedback.warning.border },
        attention: { content: semanticColors.content.statusInverse, outlineContent: semanticColors.feedback.attention.foreground, background: solidAccentColor("attention"), border: semanticColors.feedback.attention.border },
        danger: { content: semanticColors.action.danger.content, outlineContent: semanticColors.content.danger, background: semanticColors.action.danger.background, border: semanticColors.feedback.danger.border },
    },
    sizes: {
        small: {
            minHeight: 20,
            paddingHorizontal: spacing.xs,
            gap: spacing.xxs,
            iconSize: glyph.xs,
            textVariant: "caption",
        },
        medium: {
            minHeight: 24,
            paddingHorizontal: spacing.xs,
            gap: spacing.xxs,
            iconSize: glyph.xs,
            textVariant: "caption",
        },
    },
    radius: "sm",
    borderWidth: stroke.default,
    fontWeight: fontWeight.bold,
    /** Adornment line weight handed to `leading`/`trailing` callbacks (Icon `regular`). */
    iconStrokeWidth: iconRecipe.weights.regular,
    /**
     * `categoryColor` ink. Filled plates take whichever of the light ink (`onStatusFill`, as the status plates) or the
     * dark ink (light theme `text`) reads better on the product fill; outline badges use the color itself as label and
     * stroke. Either way the label must reach `minimumContrast` or the badge throws — the product must pick another
     * shade per theme instead of shipping an unreadable classification.
     */
    category: { darkInk: THEMES.light.text, minimumContrast: 4.5 },
};
/** Resolves a product classification color for the active theme and verifies label contrast (AA 4.5). */
export function resolveBadgeCategoryColor(color, options) {
    const { theme, variant, palette } = options;
    const value = color?.[theme];
    if (typeof value !== "string")
        throw new TypeError(`Badge categoryColor needs a ${theme} color`);
    const minimum = badgeRecipe.category.minimumContrast;
    if (variant === "outline") {
        for (const background of [palette.bg, palette.surface]) {
            const ratio = contrastRatio(value, background);
            if (ratio < minimum) {
                throw new RangeError(`Badge categoryColor ${value} reads ${ratio.toFixed(2)}:1 on the ${theme} background ${background}; outline labels need ${minimum}:1`);
            }
        }
        return { background: null, content: value, border: value };
    }
    const [content, ratio] = [palette.onStatusFill, badgeRecipe.category.darkInk]
        .map(ink => [ink, contrastRatio(ink, value)])
        .reduce((best, next) => (next[1] > best[1] ? next : best));
    if (ratio < minimum) {
        throw new RangeError(`Badge categoryColor ${value} (${theme}) reaches only ${ratio.toFixed(2)}:1 with either label ink; filled badges need ${minimum}:1`);
    }
    return { background: value, content, border: null };
}
/** Search is a field specialization with stable affordance and clear targets. */
export const searchFieldRecipe = {
    slots: ["root", "leading", "input", "trailing", "clear", "spinner"],
    defaults: { size: "medium", shape: "medium" },
    sizes: {
        medium: {
            minHeight: control.minTouchTarget,
            paddingHorizontal: spacing.sm,
            gap: spacing.xs,
            glyph: "sm",
            clearDiameter: 36,
            clearHitSlop: 4,
            textVariant: "body",
        },
        large: {
            minHeight: control.buttonHeight.large,
            paddingHorizontal: spacing.md,
            gap: spacing.sm,
            glyph: "sm",
            clearDiameter: control.minTouchTarget,
            clearHitSlop: 0,
            textVariant: "bodyLarge",
        },
    },
    colors: {
        background: semanticColors.canvas,
        content: semanticColors.content.primary,
        placeholder: semanticColors.content.secondary,
        leading: semanticColors.content.decorative,
        clear: semanticColors.content.secondary,
        border: semanticColors.border.control,
        focus: focusIndicatorContract.color,
        invalid: semanticColors.border.danger,
    },
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
    shapes: { medium: "md", large: "lg", full: "full" },
    borderWidth: stroke.default,
    focusRingWidth: focusIndicatorContract.width,
    focusRingOffset: focusIndicatorContract.offset,
    states: {
        disabledOpacity: opacity.disabled,
        pressedOpacity: opacity.pressed,
    },
};
export const chipRecipe = {
    slots: ["root", "leading", "indicator", "label", "trailing"],
    defaults: { size: "small", selected: false },
    /**
     * `height` is the minimum visible height; a label taller than it grows the chip (Web `min-block-size`,
     * Native `minHeight` from 1.13.1). Native used it as a fixed height and clipped labels at large text
     * (utilverse 1.13.0 adoption, 2026-10-06), unlike Web and Button.
     */
    sizes: {
        small: {
            height: control.chipHeight.small,
            hitSlop: 4,
            paddingHorizontal: spacing.sm,
            gap: spacing.xxs,
            textVariant: "body",
        },
        medium: {
            height: control.chipHeight.medium,
            hitSlop: 0,
            paddingHorizontal: spacing.md,
            gap: spacing.xs,
            textVariant: "body",
        },
    },
    states: {
        idle: {
            background: semanticColors.canvas,
            content: semanticColors.content.secondary,
            // A resting chip wears the shared hairline, not a text-strength
            // outline. Drawing it in `content.secondary` made an unselected chip
            // read heavier than the selected one beside it, inverting the one
            // signal that matters in a filter row.
            border: semanticColors.border.default,
        },
        selected: {
            background: semanticColors.selection.background,
            content: semanticColors.selection.content,
            border: semanticColors.selection.border,
        },
        pressedOpacity: opacity.pressed,
        disabledOpacity: opacity.disabled,
    },
    radius: "full",
    borderWidth: stroke.default,
    // Selected keeps one step above idle (500 → 600) so the state still carries a weight cue on the lighter scale.
    label: { fontWeight: fontWeight.medium, selectedFontWeight: fontWeight.semibold },
    selectionIndicator: {
        color: semanticColors.selection.content,
        glyph: "xs",
    },
    focus: focusIndicatorContract,
};
export const dividerRecipe = {
    slots: ["root", "label"],
    defaults: { orientation: "horizontal", inset: "none", lineStyle: "solid" },
    color: semanticColors.border.default,
    thickness: stroke.subtle,
    insets: {
        none: 0,
        start: spacing.md,
        both: spacing.md,
    },
    /** Dash and gap along the line, at `thickness`; the pattern starts with a dash at the line's start edge. */
    lineStyles: {
        dashed: { dash: 4, gap: 4 },
    },
};
export function validateDividerLineStyle(value) {
    if (value !== "solid" && value !== "dashed")
        throw new TypeError(`Unsupported Divider lineStyle: ${String(value)}`);
}
/**
 * How far a ListRow surface (pressed, hover, selected, focus ring) reaches past the row text on each inline side.
 * 2026-10-17 user decision: the row text sits on its container's content edge (the 16 screen gutter on a default
 * screen) and only the surface bleeds outward by this amount. Rows used to put it inside as padding, so row text
 * started at 16 + 8 = 24 while section titles and result headers started at 16. Containers that clip (grouped List,
 * VirtualList) keep exactly this much inline room so the bleed is never cut.
 */
const listRowSurfaceBleed = spacing.xs;
/** ListRow leading frame and the gap before its text column; the indented separator reuses both. */
const listRowLeadingSize = 40;
const listRowGap = spacing.sm;
export const listRecipe = {
    slots: ["root", "item", "separator"],
    defaults: { separator: "indented" },
    /**
     * Separators are measured from the list's content edge, where the row text sits, and each one belongs to the row
     * above it (iOS cell separator). "full" spans the row surface (content edge ± bleed). "indented" follows that row's
     * text column: it starts at the text — `leadingInsetStart` (leading 40 + gap 12) when the row has a leading
     * element, `insetStart` 0 when it has none — and ends on the row's trailing content edge (0).
     * 2026-10-17 user report: a fixed 52 start cut the line off midway under rows without leading (text at 16, line
     * from 68), and the −8 end ran past the trailing content.
     */
    separators: {
        none: null,
        // Controls and router-owned rows already contain their own padding; their separators stay on the content edge.
        content: { insetStart: 0, leadingInsetStart: 0, insetEnd: 0 },
        full: { insetStart: -listRowSurfaceBleed, leadingInsetStart: -listRowSurfaceBleed, insetEnd: -listRowSurfaceBleed },
        indented: { insetStart: 0, leadingInsetStart: listRowLeadingSize + listRowGap, insetEnd: 0 },
    },
    // A grouped list paints its own rounded surface and clips to it, so it leaves the row bleed as inline padding:
    // rows keep their full surface inside the radius and the text stays 8 inside the group edge as before.
    grouped: { paddingInline: listRowSurfaceBleed },
    background: null,
};
export const listRowRecipe = {
    slots: ["root", "leading", "content", "title", "description", "trailing", "accessory"],
    defaults: { density: "comfortable", selected: false, tone: "default", trailingAccessory: "none" },
    // Destructive destinations keep semantic emphasis without renderer-specific title styles.
    tones: { default: { titleColor: semanticColors.content.body }, danger: { titleColor: semanticColors.content.danger } },
    density: {
        compact: {
            oneLineMinHeight: control.minTouchTarget,
            twoLineMinHeight: 60,
            paddingHorizontal: listRowSurfaceBleed,
            paddingVertical: spacing.xxs,
        },
        comfortable: {
            oneLineMinHeight: layout.rowHeight.singleLine,
            twoLineMinHeight: layout.rowHeight.twoLine,
            paddingHorizontal: listRowSurfaceBleed,
            paddingVertical: spacing.xs,
        },
        /*
          토스 TDS의 ListRow는 세로 여백을 네 단계로 둔다. HJM이 두 단계만 갖고 있던 동안
          제품은 그 사이 값을 제품 CSS로 만들었다(설정 목록은 넓게, 검색 결과는 좁게).
          숫자는 이미 있는 spacing 스케일(sm/md)을 그대로 쓰고 새 값을 만들지 않는다.
          최소 높이는 여백에 맞춰 함께 올라간다 — 여백만 키우면 한 줄 행이 위아래로 치우친다.
        */
        relaxed: {
            oneLineMinHeight: layout.rowHeight.singleLine + spacing.xs,
            twoLineMinHeight: layout.rowHeight.twoLine + spacing.xs,
            paddingHorizontal: listRowSurfaceBleed,
            paddingVertical: spacing.sm,
        },
        spacious: {
            oneLineMinHeight: layout.rowHeight.singleLine + spacing.md,
            twoLineMinHeight: layout.rowHeight.twoLine + spacing.md,
            paddingHorizontal: listRowSurfaceBleed,
            paddingVertical: spacing.md,
        },
    },
    // Loading uses the same row/line boxes as content; only the copy width is illustrative.
    loading: { titleWidthPercent: 60, descriptionWidthPercent: 40, trailingWidth: spacing.xxl },
    /**
     * Inline placement (2026-10-17 user decision, see `listRowSurfaceBleed`): the content box sits on the container's
     * content edge and the surface bleeds outward by `paddingHorizontal` — renderers draw the row with that padding and
     * the same negative inline margin, so pressed/selected fills keep 8 of room beyond the text.
     */
    surfaceBleed: listRowSurfaceBleed,
    gap: listRowGap,
    leadingSize: listRowLeadingSize,
    /**
     * Frame geometry for the leading slot. The size was already declared here but
     * no renderer bound it, so every consumer re-derived the avatar box (radius,
     * clipping, centering) in product styles.
     */
    leadingShapes: { square: null, circle: "full" },
    title: { color: semanticColors.content.body, textVariant: "bodyLarge", fontWeight: typography.title.fontWeight },
    description: { color: semanticColors.content.secondary, textVariant: "body" },
    trailing: {
        textColor: semanticColors.content.secondary,
        iconColor: semanticColors.content.decorative,
        glyph: "sm",
        textVariant: "caption",
    },
    /**
     * Order inside the row command: leading → content → trailing → accessory; a `trailingAction` stays outside, after
     * it. The mark is decorative (the row's link/button role already says it is activatable), follows the reading
     * direction (`chevronEnd` mirrors in RTL) and sits `gap` after any trailing value, the iOS detail → chevron pairing.
     */
    accessories: {
        disclosure: { icon: "chevronEnd", glyph: "sm", weight: "regular", color: semanticColors.content.decorative, gap: spacing.xs },
    },
    states: {
        pressedBackground: semanticColors.canvas,
        selectedBackground: semanticColors.selection.background,
        disabledOpacity: opacity.disabled,
    },
};
export function validateListRowTrailingAccessory(value) {
    if (value !== "none" && value !== "disclosure")
        throw new TypeError(`Unsupported ListRow trailingAccessory: ${String(value)}`);
}
export const accordionRecipe = {
    slots: ["root", "item", "header", "trigger", "title", "indicator", "panel", "divider"],
    defaults: { density: "comfortable", allowsMultipleExpanded: false },
    density: {
        compact: { triggerMinHeight: control.minTouchTarget, paddingVertical: spacing.xs },
        comfortable: { triggerMinHeight: layout.rowHeight.singleLine, paddingVertical: spacing.sm },
    },
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
    title: { color: semanticColors.content.body, textVariant: "bodyLarge", fontWeight: typography.title.fontWeight },
    indicator: { color: semanticColors.content.secondary, glyph: "sm" },
    panel: {
        color: semanticColors.content.body,
        textVariant: "body",
        paddingBottom: spacing.md,
        paddingInlineStart: spacing.xs,
    },
    divider: semanticColors.border.default,
    states: {
        pressedBackground: semanticColors.canvas,
        focus: focusIndicatorContract,
        disabledOpacity: opacity.disabled,
    },
    transition: motionPreset.enter,
};
export const menuRecipe = {
    slots: [
        "trigger",
        "content",
        "viewport",
        "section",
        "sectionLabel",
        "item",
        "leading",
        "copy",
        "label",
        "description",
        "trailing",
        "shortcut",
        "indicator",
        "dangerIndicator",
        "separator",
    ],
    defaults: { density: "comfortable", itemTone: "neutral" },
    // 2026-10-20: one menu contract, three intentional placements. Item count never changes the presentation.
    presentations: {
        grouped: { maxWidth: 288, padding: spacing.sm, gap: spacing.xs, rowHeight: 52 },
        anchored: { maxWidth: 280, padding: spacing.xs, gap: spacing.xs, rowHeight: 48 },
        bottom: { maxWidth: 420, padding: 0, gap: spacing.xs, rowHeight: 56 },
    },
    surface: floatingSurfaceContract,
    density: {
        compact: { ...collectionItemContract, minHeight: control.minTouchTarget },
        comfortable: { ...collectionItemContract, minHeight: layout.rowHeight.singleLine },
    },
    tones: {
        neutral: collectionItemContract.label.color,
        danger: collectionItemContract.danger,
    },
    sectionLabel: {
        color: semanticColors.content.secondary,
        textVariant: "label",
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
    leading: { color: semanticColors.content.secondary, glyph: "sm" },
    shortcut: { color: semanticColors.content.secondary, textVariant: "caption" },
    indicator: { color: collectionItemContract.selectedIndicator, glyph: "sm" },
    separator: semanticColors.border.default,
    dangerIndicator: {
        color: collectionItemContract.danger,
        glyph: "sm",
        mark: "alert",
    },
    minWidth: 220,
    maxWidth: 320,
    maxHeight: 360,
    sideOffset: spacing.xs,
    collisionPadding: spacing.xs,
    states: { disabledOpacity: opacity.disabled },
    transition: { enter: motionPreset.enter, exit: motionPreset.exit },
};
/**
 * Select is visually one field plus one collection, even though Web renders
 * the collection in a popover and Native renders it in a modal sheet.
 */
export const selectRecipe = {
    slots: [
        "root",
        "label",
        "trigger",
        "leading",
        "value",
        "placeholder",
        "busyIndicator",
        "indicator",
        "description",
        "error",
        "popover",
        "viewport",
        "section",
        "sectionLabel",
        "option",
        "optionLeading",
        "optionCopy",
        "optionLabel",
        "optionDescription",
        "selectionIndicator",
        "stateMessage",
    ],
    defaults: { size: "medium", density: "comfortable" },
    adaptive: { web: "popover", native: "sheet" },
    frame: fieldFrameContract,
    sizes: {
        medium: {
            minHeight: fieldFrameContract.minHeight,
            paddingHorizontal: fieldFrameContract.paddingHorizontal,
            textVariant: "body",
            glyph: "sm",
        },
        large: {
            minHeight: control.buttonHeight.large,
            paddingHorizontal: spacing.lg,
            textVariant: "bodyLarge",
            glyph: "md",
        },
    },
    support: formSupportContract,
    value: {
        color: semanticColors.content.body,
        placeholderColor: semanticColors.content.secondary,
        gap: spacing.sm,
    },
    leading: { color: semanticColors.content.secondary },
    indicator: { color: semanticColors.content.secondary },
    busyIndicator: { color: semanticColors.content.brand, glyph: "sm" },
    popover: {
        ...floatingSurfaceContract,
        minWidth: 220,
        maxWidth: 420,
        maxHeight: 360,
        sideOffset: spacing.xs,
        collisionPadding: spacing.xs,
    },
    density: {
        compact: { ...collectionItemContract, minHeight: control.minTouchTarget },
        comfortable: { ...collectionItemContract, minHeight: layout.rowHeight.singleLine },
    },
    sectionLabel: {
        color: semanticColors.content.secondary,
        textVariant: "label",
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
    optionLeading: { color: semanticColors.content.secondary, glyph: "sm" },
    optionLabel: { fontWeight: fontWeight.medium, selectedFontWeight: fontWeight.semibold },
    selectionIndicator: { color: semanticColors.selection.content, glyph: "sm" },
    stateMessage: {
        color: semanticColors.content.secondary,
        textVariant: "body",
        minHeight: control.minTouchTarget,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
    },
    states: {
        hoverBackground: semanticColors.canvas,
        pressedBackground: semanticColors.canvas,
        focus: focusIndicatorContract,
        invalidBorder: semanticColors.border.danger,
        disabledOpacity: opacity.disabled,
    },
    transition: {
        web: { enter: motionPreset.micro, exit: motionPreset.exit },
        native: { enter: motionPreset.enter, exit: motionPreset.exit },
    },
};
/** Editable input anatomy layered on the exact same collection grammar. */
export const comboboxRecipe = {
    slots: [
        "root",
        "label",
        "field",
        "leading",
        "input",
        "indicator",
        "clear",
        "loadingIndicator",
        "description",
        "error",
        "popover",
        "viewport",
        "section",
        "sectionLabel",
        "option",
        "optionLeading",
        "optionCopy",
        "optionLabel",
        "optionDescription",
        "selectionIndicator",
        "stateMessage",
    ],
    defaults: selectRecipe.defaults,
    adaptive: selectRecipe.adaptive,
    frame: selectRecipe.frame,
    sizes: selectRecipe.sizes,
    support: selectRecipe.support,
    input: selectRecipe.value,
    leading: selectRecipe.leading,
    indicator: selectRecipe.indicator,
    clear: {
        diameter: control.buttonHeight.small,
        hitSlop: control.buttonHitSlop.small,
        glyph: "xs",
        color: semanticColors.content.secondary,
    },
    loadingIndicator: { color: semanticColors.content.brand, glyph: "sm" },
    popover: selectRecipe.popover,
    density: selectRecipe.density,
    sectionLabel: selectRecipe.sectionLabel,
    optionLeading: selectRecipe.optionLeading,
    optionLabel: selectRecipe.optionLabel,
    selectionIndicator: selectRecipe.selectionIndicator,
    stateMessage: selectRecipe.stateMessage,
    states: selectRecipe.states,
    transition: selectRecipe.transition,
};
/** Block-side inset of the connected track: `container.padding` + `container.borderWidth`. */
const segmentedTrackInset = spacing.xxs + stroke.subtle;
export const segmentedControlRecipe = {
    // Text navigation reuses radio selection, without cloning a product-only tab engine.
    text: { gap: spacing.md, indicatorWidth: 16, indicatorHeight: 2, indicatorRadius: radius.full,
        minHeight: control.minTouchTarget, labelGap: spacing.xxs, regular: { idle: "400", selected: "600" }, strong: { idle: "500", selected: "700" } },
    slots: ["root", "item", "label", "indicator"],
    defaults: { size: "medium" },
    // Category filters share the single-selection engine, with a compact surface inside a 44 target.
    // See usage/components/segmented-control.md; no separate filter-selection state is introduced.
    // Match Chip's visible size step in mixed filter rails; the inset keeps a separate 44pt touch box.
    // The old 8pt inset drew 28pt pills next to a 36pt small action chip (Utilverse, 2026-10-20).
    // Spint review (2026-10-20): restore the original inset and use a smaller category label instead.
    // Strong selection uses the product primary/onPrimary contrast pair (Diairy/Spint review, 2026-10-21).
    selectedBrand: { background: semanticColors.action.brand.background, content: semanticColors.action.brand.content },
    pills: { textVariant: "label", paddingHorizontal: { small: spacing.sm, medium: spacing.md }, gap: spacing.xs, radius: radius.full, inset: spacing.xxs, minHeight: control.minTouchTarget,
        // Utilverse's pastel scene swallowed the sunken fill without an outline (2026-10-20).
        // Use the resting control border on the inset surface so touch geometry stays unchanged.
        background: semanticColors.surface.raised, border: semanticColors.border.control, borderWidth: stroke.subtle,
        selectedBackground: semanticColors.selection.background, selectedContent: semanticColors.selection.content,
        /**
         * Pills are content-width, so large text keeps the row: it wraps inside a block and stays one line
         * inside a horizontal scroller (SearchScreen `filtersOverflow="scroll"`, a product rail). `adaptive`
         * stacking is for the equal-width connected track only. Stacking pills too turned a seven-theme
         * filter rail into a ~440pt column at accessibility-large (utilverse 1.13.0 adoption, 2026-10-06),
         * and the product swapped in a Select to escape it. Rejected: a pills-only scroll prop, because
         * the host already owns the rail and a second scroller inside it would nest horizontal scrolling.
         */
        largeTextLayout: "wrap" },
    adaptive: {
        // Equal-width rows stop being comparable when every short label wraps one
        // Hangul syllable per line. Native renderers stack the options before that
        // point so each choice remains a readable phrase and a 44pt target.
        // Applies to presentation="connected" only; pills follow `pills.largeTextLayout`.
        largeTextLayout: "stacked",
        stackAtFontScale: largeTextThreshold,
    },
    // The neutral selected surface is shared with pills and Chip; the ring remains a separate selection cue.
    container: {
        background: semanticColors.canvas,
        border: semanticColors.border.default,
        borderWidth: stroke.subtle,
        radius: "lg",
        padding: spacing.xxs,
        gap: spacing.xxs,
    },
    /**
     * `height` is the connected control's outer height (track border + padding included) and matches the Button /
     * IconButton / Chip height of the same size step, so a segmented control and a chip in one row line up.
     * `minHeight` is the option inside the track (height − 2 × (`container.padding` + `container.borderWidth`)) and `hitSlop` extends each
     * option vertically to the 44 touch target. Before 2026-10-17 `minHeight` was the option itself, so the track
     * drew 46/54 next to 36/44 chips and buttons (DiscoveryGallery sort row, user request "높이 맞춰").
     */
    sizes: {
        small: {
            height: control.buttonHeight.small,
            minHeight: control.buttonHeight.small - 2 * segmentedTrackInset,
            hitSlop: (control.minTouchTarget - (control.buttonHeight.small - 2 * segmentedTrackInset)) / 2,
            paddingHorizontal: spacing.sm,
            textVariant: "label",
        },
        medium: {
            height: control.buttonHeight.medium,
            minHeight: control.buttonHeight.medium - 2 * segmentedTrackInset,
            hitSlop: (control.minTouchTarget - (control.buttonHeight.medium - 2 * segmentedTrackInset)) / 2,
            paddingHorizontal: spacing.md,
            textVariant: "body",
        },
    },
    item: {
        radius: "md",
        gap: spacing.xxs,
        idleContent: semanticColors.content.secondary,
        fontWeight: fontWeight.medium,
        selectedBackground: semanticColors.selection.background,
        selectedContent: semanticColors.selection.content,
        /**
         * The ring stays the selection signal so the control keeps a non-text
         * contrast of at least 3:1; a fill-only thumb cannot reach that against a
         * neutral track.
         */
        selectedBorder: semanticColors.border.focus,
        selectedBorderWidth: stroke.strong,
        selectedFontWeight: fontWeight.semibold,
        focusRing: semanticColors.border.focus,
        pressedOpacity: opacity.pressed,
        disabledOpacity: opacity.disabled,
    },
};
export const switchRecipe = {
    // Settings rows are controls, not prominent reading content. Spint's native row
    // used bodyLarge while Web inherited its parent; one role prevents that drift.
    rowLabelTextVariant: "body",
    slots: ["root", "track", "thumb", "label", "description"],
    defaults: { size: "medium" },
    // One default on both renderers: label/description first, track at the trailing edge
    // (2026-10-17 web/native comparison: Web defaulted to an inline track-first switch, so the
    // same settings toggle rendered mirrored). Compact toolbars can still pass `inline`.
    presentationDefaults: { web: "row", native: "row" },
    // Descriptions beside a fixed track become a narrow column at larger text sizes.
    // Reuse the provider's large-text boundary so Web CSS and Native reflow together.
    stackedTextScale: largeTextThreshold,
    sizes: {
        small: { width: 44, height: 26, thumb: 22, inset: 2 },
        medium: { width: 52, height: 32, thumb: 28, inset: 2 },
    },
    colors: {
        // The off state is two unsaturated planes — a `surfaceAlt` track holding a `bg`
        // thumb — so on a dark palette both collapse into the card behind them: measured
        // 1.10:1 track-to-surface and 1.20:1 thumb-to-track on the canonical dark theme,
        // where the thumb is actually *darker* than its own track. The `*OffBorder`
        // hairlines are what keep the shape readable, so they are part of the contract
        // rather than a renderer flourish. A consumer settings screen shipped with the web
        // renderer ignoring them and the control was invisible (2026-09-14); the web
        // stylesheet now paints them and `action-contrast.browser.test.tsx` holds the line.
        trackOff: semanticColors.surface.sunken,
        trackOffBorder: semanticColors.content.secondary,
        // A lit track is a filled brand plate, same role as a checked checkbox
        // (`selectionControlRecipe.states.checkedBackground`). Was `content.brand`, a
        // content role; both renderers painted `primary` anyway, so this is a no-op.
        trackOn: semanticColors.action.brand.background,
        trackOnBorder: semanticColors.border.focus,
        thumbOff: semanticColors.canvas,
        thumbOffBorder: semanticColors.content.secondary,
        thumbOn: semanticColors.canvas,
        // A disabled switch still has to report what it is set to, so disabled
        // state changes hue instead of fading uniformly with `states.disabledOpacity`
        // — a product author found that a flat opacity made "on" and "off" nearly
        // identical, turning a saved setting unreadable while its backing request
        // was in flight. The on track keeps a recognisable (if muted) brand wash,
        // the off track and both thumbs drop to neutral tones, and every part
        // keeps a hairline border so the shape stays legible at reduced contrast.
        trackOffDisabled: semanticColors.border.default,
        trackOffBorderDisabled: semanticColors.border.default,
        trackOnDisabled: { ...semanticColors.action.brand.background, alpha: 0.38 },
        trackOnBorderDisabled: { ...semanticColors.action.brand.background, alpha: 0.38 },
        thumbDisabled: semanticColors.canvas,
        thumbDisabledBorder: semanticColors.content.decorative,
    },
    states: {
        disabledOpacity: opacity.disabled,
        pressedOpacity: opacity.pressed,
    },
    rowMinHeight: control.minTouchTarget,
    // A described switch is a two-line row: the copy (body 20 + gap 4 + caption 16 = 40) with the
    // comfortable list-row vertical padding (8) on both sides. The padding is drawn by the row itself
    // so it survives larger text, and the minimum keeps neighbouring rows equal (a product author found
    // content-only height gave them different heights). It used to borrow ListRow's 68, which is sized
    // for a bodyLarge title + body description; on the smaller switch copy that left 14 above and below,
    // and stacked rows read as widely spaced (2026-10-17 user report, notification settings: 84 pitch
    // for 40 of copy, together with a Stack gap the rows must not have).
    rowPaddingVertical: listRowRecipe.density.comfortable.paddingVertical,
    rowTwoLineMinHeight: typography.body.lineHeight + spacing.xxs + typography.caption.lineHeight
        + 2 * listRowRecipe.density.comfortable.paddingVertical,
};
export const selectionControlRecipe = {
    slots: [
        "root",
        "control",
        "indicator",
        "leading",
        "content",
        "label",
        "description",
    ],
    defaults: { kind: "checkbox", size: "medium", presentation: "card" },
    sizes: {
        small: {
            rowMinHeight: control.minTouchTarget,
            control: 20,
            hitSlop: 12,
            glyph: "xs",
            gap: spacing.xs,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            labelVariant: "label",
            descriptionVariant: "caption",
        },
        medium: {
            rowMinHeight: layout.rowHeight.singleLine,
            control: control.selectionIndicator,
            hitSlop: 10,
            glyph: "sm",
            gap: spacing.sm,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            labelVariant: "body",
            descriptionVariant: "label",
        },
    },
    shapes: { checkbox: "sm", radio: "full" },
    // Web drew 2px and Native 1px; Agreement and TransferList now reuse this indicator, so the width is one value.
    indicatorBorderWidth: stroke.strong,
    presentations: {
        // Nullable and multi-select chip collections keep the existing radio/checkbox engines;
        // SegmentedControl deliberately always selects one value, so it cannot represent them.
        chips: {
            background: chipRecipe.states.idle.background,
            border: chipRecipe.states.idle.border,
            borderWidth: chipRecipe.borderWidth,
            radius: chipRecipe.radius,
            useSizePadding: true,
            labelColor: null,
        },
        plain: {
            background: null,
            border: null,
            borderWidth: 0,
            radius: "md",
            useSizePadding: false,
            labelColor: null,
        },
        card: {
            background: semanticColors.canvas,
            border: semanticColors.border.default,
            borderWidth: stroke.default,
            radius: "md",
            useSizePadding: true,
            labelColor: null,
        },
        // A row inside a card shared by the whole group (paired with
        // `selectionGroupRecipe.orientations.*.gap.grouped`). The item owns its
        // own padding so the selected fill runs the full width of the group, and
        // only the first and last rows round — an item-level radius on every row
        // left a visible white sliver in the group's corners. `labelColor` is
        // pinned here (rather than left to the row) because a grouped row's
        // label sits directly on the shared card background, not on its own
        // plate — the row needs to know the label reads correctly there.
        grouped: {
            background: null,
            border: null,
            borderWidth: 0,
            radius: "lg",
            useSizePadding: true,
            labelColor: semanticColors.content.primary,
        },
    },
    label: {
        color: semanticColors.content.body,
        fontWeight: fontWeight.medium,
        checkedFontWeight: fontWeight.semibold,
    },
    leading: { size: "md", color: semanticColors.content.secondary },
    description: { color: semanticColors.content.secondary },
    indicators: {
        checkbox: { checked: "check", mixed: "dash" },
        radio: { checked: "dot", mixed: null },
    },
    radioDotRatio: 0.42,
    states: {
        idleBackground: semanticColors.canvas,
        idleBorder: semanticColors.content.secondary,
        checkedBackground: semanticColors.action.brand.background,
        checkedBorder: semanticColors.border.focus,
        indicator: semanticColors.action.brand.content,
        // The full plate uses neutral selection; the compact checked glyph remains primary.
        selectedBackground: semanticColors.selection.background,
        selectedBorder: semanticColors.selection.border,
        hoverBackground: semanticColors.canvas,
        pressedBackground: semanticColors.canvas,
        invalidBorder: semanticColors.border.danger,
        focus: focusIndicatorContract,
        disabledOpacity: opacity.disabled,
    },
};
/**
 * Persistent top-level navigation. The recipe reserves an optional center gap
 * for a sibling primary action but never treats that action as a destination.
 */
export const bottomNavigationRecipe = {
    slots: [
        "root",
        "surface",
        "list",
        "item",
        "indicator",
        "icon",
        "label",
        "badge",
    ],
    defaults: bottomNavigationRecipeDefaults,
    // Selected full-item cards retain the existing navigation state engine (Spint, 2026-10-12).
    // Capsule navigation is ordinary selection; tile is an explicit strong brand treatment.
    selectionCapsule: { background: semanticColors.selection.background, content: semanticColors.selection.content },
    selectionTile: {
        background: semanticColors.surface.brand,
        selectedBackground: semanticColors.action.brand.background,
        selectedContent: semanticColors.action.brand.content,
        padding: spacing.xxs,
        gap: spacing.xxs,
        radius: "lg",
    },
    /**
     * Opt-in thick plank for tile selection (Spint wooden sign, 2026-10-13). The
     * lower edges replace the floating shadow so the bar reads as one flat object.
     * The selected edge darkens the brand fill with `interaction.depth` because no
     * palette role names a "pressed brand" shade.
     */
    raisedSurface: {
        background: semanticColors.surface.sunken,
        border: semanticColors.border.control,
        depth: 4,
        selectedDepth: 3,
        selectedDepthColor: semanticColors.interaction.depth,
    },
    /**
     * Raised center destination (`prominent` item, Diairy write tab, 2026-10-18). The circle is the large control
     * height plus one 4pt step so it outranks the 40pt indicators beside it. Renderers lift it by
     * `diameter - indicator.minHeight` so its label stays on the same line as the other labels. It keeps brand
     * fill in both states because a dimmed circle would read as a large idle icon, not the product's main entry;
     * selection evidence stays on the label (weight and color), as for other items.
     */
    prominentDestination: {
        diameter: control.buttonHeight.large + spacing.xxs,
        icon: "lg",
        background: semanticColors.action.brand.background,
        content: semanticColors.action.brand.content,
        shadow: floatingSurfaceContract.shadow,
    },
    /**
     * App-icon slots for `configuration.iconSize` (Utilverse dock artwork, 2026-10-18). `standard` keeps the
     * density glyph; 44 is the minimum touch target and 52 the large control height, the sizes the dock used.
     */
    iconSizes: {
        large: control.minTouchTarget,
        xlarge: control.buttonHeight.large,
    },
    /**
     * Floating frames for `configuration.shape` (Utilverse home shells, 2026-10-18). `surfacePadding` is the inner
     * gap between the frame and the destination row; the two tighter frames pair with `density: "compact"` for the
     * desktop-shell docks. Radii are theme radius tokens, so a design profile's radius scale still applies.
     * `standard` is absent on purpose: it keeps `presentations.floating`.
     */
    shapes: {
        rounded: { radius: "xl", surfacePadding: spacing.xs },
        pill: { radius: "full", surfacePadding: spacing.xs },
        compact: { radius: "lg", surfacePadding: spacing.xxs },
        square: { radius: "sm", surfacePadding: spacing.xxs },
    },
    adaptive: {
        web: "fixed-compact-viewport",
        native: "navigator-tab-bar",
    },
    presentations: {
        capsule: {
            background: semanticColors.surface.default,
            border: semanticColors.border.default,
            borderWidth: stroke.default,
            borderEdges: ["all"],
            radius: "full",
            shadow: floatingSurfaceContract.shadow,
            maxWidth: 480,
            contentMaxWidth: null,
            outerPaddingHorizontal: spacing.md,
            outerPaddingTop: spacing.xs,
        },
        bar: {
            background: semanticColors.canvas,
            border: semanticColors.border.default,
            borderWidth: stroke.default,
            borderEdges: ["block-start"],
            radius: null,
            shadow: null,
            maxWidth: null,
            /**
             * The bar surface and its top edge span the viewport, but the destinations stay in a centered 480 column
             * (the capsule width): on a 1280 desktop two items otherwise sat at opposite screen edges (2026-10-17 review D8).
             */
            contentMaxWidth: 480,
            outerPaddingHorizontal: 0,
            outerPaddingTop: 0,
        },
        floating: {
            background: semanticColors.canvas,
            border: semanticColors.border.default,
            borderWidth: stroke.default,
            borderEdges: ["all"],
            radius: "xl",
            shadow: floatingSurfaceContract.shadow,
            maxWidth: 384,
            contentMaxWidth: null,
            outerPaddingHorizontal: spacing.md,
            outerPaddingTop: spacing.xs,
        },
    },
    distributions: {
        equal: { centerGap: 0, requiresEvenItemCount: false },
        "center-gap": {
            centerGap: control.buttonHeight.large + spacing.md,
            requiresEvenItemCount: true,
        },
    },
    density: {
        compact: {
            itemMinWidth: 52,
            itemMinHeight: 52,
            padding: spacing.xxs,
            gap: 2,
            icon: "sm",
            label: "caption",
        },
        regular: {
            itemMinWidth: 56,
            itemMinHeight: 64,
            padding: spacing.xs,
            gap: spacing.xxs,
            icon: "md",
            label: "caption",
        },
    },
    colors: {
        idle: semanticColors.content.secondary,
        selectedIcon: semanticColors.content.brand,
        selectedLabel: semanticColors.content.brand,
    },
    /**
     * Stable icon/badge layout anchor. Selection never paints this slot as a
     * pill: the icon and label below own the non-color selected evidence.
     */
    indicator: {
        minWidth: 40,
        minHeight: 28,
        radius: "full",
        visual: "none",
        background: null,
        border: null,
        borderWidth: 0,
    },
    icon: {
        /**
         * Adapters apply at least one supported emphasis. Stroke-oriented glyphs
         * use strokeWidth; renderers without stroke control use scale instead.
         */
        selectedEmphasis: {
            minimumAdaptations: 1,
            strokeWidth: { idle: stroke.strong, selected: 3 },
            scale: { idle: 1, selected: 1.06 },
        },
        /**
         * `configuration.iconEmphasis: "lift"` (Utilverse dock artwork, 2026-10-18): the selected icon rises one 4pt
         * step on top of the selected scale, and idle icons dim. Full-color artwork cannot take the selected tint, so
         * without the dim only the label would mark the current destination. 0.82 is the dock's measured idle opacity.
         */
        liftEmphasis: {
            translateY: -spacing.xxs,
            idleOpacity: 0.82,
        },
    },
    label: {
        fontWeight: fontWeight.medium,
        selectedFontWeight: fontWeight.semibold,
        textAlign: "center",
        wrap: true,
        fixedLines: null,
    },
    badge: {
        size: "small",
        variant: "floating",
        anchor: { blockStart: -spacing.xxs, inlineEnd: -spacing.xs },
        subtreeHiddenFromAccessibility: true,
    },
    safeArea: {
        mode: "additive",
        minimumBottomPadding: spacing.xs,
    },
    keyboard: { defaultBehavior: "hide", movesAboveKeyboard: false },
    largeText: {
        allowFontScaling: true,
        // Persistent navigation has to keep every destination visible at once.
        // Let labels respond to Dynamic Type, but cap the visual chrome before a
        // three-character destination turns into a three-line column. The full,
        // uncapped label remains the item's accessible name.
        maxFontSizeMultiplier: 1.4,
        fixedItemHeight: false,
        labelWraps: true,
    },
    direction: {
        itemOrder: "logical",
        badgeAnchor: "inline-end",
    },
    states: {
        hoverBackground: semanticColors.canvas,
        pressedBackground: semanticColors.canvas,
        focus: focusIndicatorContract,
        disabledOpacity: opacity.disabled,
        selectedNonColorEvidence: {
            target: "icon-and-label",
            label: "font-weight",
            icon: "emphasis",
        },
        selectedFocusSeparation: {
            selectedTarget: "icon-and-label",
            focusTarget: "item",
            minimumGap: focusIndicatorContract.offset,
        },
    },
    transition: motionPreset.micro,
};
export const tabsRecipe = {
    slots: ["root", "list", "tab", "label", "indicator", "panel"],
    defaults: { size: "medium", layout: "content", overflow: "scroll", indicator: "underline" },
    /**
     * Selection mark. `filled` paints the selected tab as a brand-tinted pill instead of the 2pt underline and
     * drops the list divider, which only anchors underlines (Diairy nest tabs, 2026-10-18: the app's tab bar
     * already marks the current place with this pill, so in-screen tabs looked like a second product).
     */
    indicators: {
        underline: { listDivider: true, background: null, selectedContent: semanticColors.content.primary, radius: null },
        filled: { listDivider: false, background: semanticColors.selection.background, selectedContent: semanticColors.selection.content, radius: "full" },
        solid: { listDivider: false, background: semanticColors.action.brand.background, selectedContent: semanticColors.action.brand.content, radius: "full" },
    },
    sizes: {
        small: {
            minHeight: control.minTouchTarget,
            paddingHorizontal: spacing.sm,
            textVariant: "label",
        },
        medium: {
            minHeight: 48,
            paddingHorizontal: spacing.md,
            textVariant: "body",
        },
    },
    colors: {
        idle: semanticColors.content.secondary,
        selected: semanticColors.content.primary,
        indicator: semanticColors.border.focus,
        divider: semanticColors.border.default,
    },
    gap: spacing.xs,
    icon: { glyph: "xs" },
    label: { fontWeight: fontWeight.medium, selectedFontWeight: fontWeight.semibold },
    layouts: {
        content: { fitted: false },
        fitted: { fitted: true },
    },
    overflow: {
        scroll: { scrollable: true, wrap: false },
        clip: { scrollable: false, wrap: false },
    },
    indicatorHeight: stroke.strong,
    states: {
        pressedBackground: semanticColors.canvas,
        focus: focusIndicatorContract,
        disabledOpacity: opacity.disabled,
    },
};
export const noticeRecipe = {
    slots: ["root", "icon", "content", "title", "description", "action"],
    defaults: { tone: "info", appearance: "panel" },
    // Saved results belong beside their owner without a second banner-sized surface.
    // Both renderers reuse Badge for the short status; panels remain the default for guidance/errors.
    appearances: { panel: { padding: spacing.md, borderWidth: stroke.default }, status: { padding: 0, borderWidth: 0 } },
    tones: {
        ...semanticColors.feedback,
        info: {
            ...semanticColors.feedback.info,
            // The informational wash landed bluer and darker than the selection
            // tint itself over canvas, so a banner outranked the control the
            // reader was supposed to act on. `info` alone goes neutral — its
            // accent stays in the icon, the title, and the border; `success`/
            // `warning`/`attention`/`danger` keep the tinted surface because a
            // product author confirmed those readings didn't have the same
            // conflict with a selection state.
            background: semanticColors.canvas,
        },
    },
    radius: "md",
    padding: spacing.md,
    gap: spacing.sm,
    contentGap: spacing.xxs,
    iconSize: "sm",
    borderWidth: stroke.default,
    title: { textVariant: "body", fontWeight: typography.title.fontWeight },
    description: { color: semanticColors.content.body, textVariant: "body" },
};
export const skeletonRecipe = {
    slots: ["root", "line"],
    // animated는 0.9.12까지 false였다. 정지한 블록은 로딩이 아니라 깨진 화면으로
    // 읽힌다. 전환 근거와 소비 측 migration은
    // .changeset/skeleton-pulse-by-default.md에 있다.
    defaults: { shape: "block", animated: true, lines: 1 },
    // 2026-10-17 사용자 요청: canvas 채움 + 1px 테두리는 흰 배경에서 거의 보이지 않아 로딩 모양을 알 수 없었다.
    // 2026-09-29 "넓은 회색 면은 canvas" 방향의 예외로, 자리표시는 채운 면이어야 모양이 읽힌다(skeleton.md 근거).
    background: semanticColors.surface.placeholder,
    // `aspectRatio`가 있으면 높이 대신 폭에 비례한다(media). `button`은 medium 버튼 높이와 Button 기본 모양의 모서리다.
    // 2026-10-17: 번뚝처럼 알약 버튼을 쓰는 제품은 자리표시도 알약이어야 하므로 모서리는 `buttonShape` 축
    // (buttonRecipe.shapes와 같은 이름·같은 기본값)으로 고르고, 이 값은 그 기본값에서 나온다.
    shapes: {
        block: { radius: "md", defaultHeight: spacing.xxl, aspectRatio: null },
        text: { radius: "sm", defaultHeight: spacing.md, aspectRatio: null },
        circle: { radius: "full", defaultHeight: glyph.xxl, aspectRatio: null },
        media: { radius: "md", defaultHeight: null, aspectRatio: 16 / 9 },
        button: { radius: buttonRecipe.shapes[buttonRecipe.defaults.shape], defaultHeight: control.buttonHeight.medium, aspectRatio: null },
    },
    // `lines` > 1 (text 전용): 줄 사이 간격과 짧게 끝나는 마지막 줄. 16 막대 + 8 간격 = 본문 큰 글자 줄 높이 24.
    lines: { gap: spacing.xs, lastLineWidthPercent: 60 },
    animation: {
        duration: motion.slow * 4,
        easing: "standard",
        fromOpacity: 0.56,
        toOpacity: 1,
        reducedMotion: "static",
    },
};
export const emptyStateRecipe = {
    slots: ["root", "icon", "title", "description", "action"],
    defaults: { density: "regular" },
    density: {
        compact: { paddingVertical: spacing.xl },
        regular: { paddingVertical: spacing.xxxl },
    },
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
    icon: { size: "lg", color: semanticColors.content.decorative },
    title: { textVariant: "body", color: semanticColors.content.primary, fontWeight: typography.title.fontWeight },
    description: { textVariant: "body", color: semanticColors.content.secondary },
};
export const spinnerRecipe = {
    slots: ["root"],
    defaults: { size: "medium", tone: "brand" },
    sizes: { small: glyph.xs, medium: glyph.sm, large: glyph.lg },
    tones: {
        brand: semanticColors.content.brand,
        neutral: semanticColors.content.secondary,
        inverse: semanticColors.content.inverse,
    },
    strokeWidth: stroke.strong,
    animation: {
        duration: 800,
        easing: "standard",
        reducedMotion: "static",
    },
};
export const loadMoreRecipe = {
    slots: [
        "root",
        "status",
        "spinner",
        "trigger",
        "error",
        "retry",
        "end",
    ],
    defaults: { mode: "automatic", density: "regular" },
    density: {
        compact: { paddingVertical: spacing.sm, gap: spacing.xs },
        regular: { paddingVertical: spacing.lg, gap: spacing.sm },
    },
    status: {
        color: semanticColors.content.secondary,
        textVariant: "label",
    },
    error: {
        color: semanticColors.content.danger,
        textVariant: "label",
    },
    end: {
        color: semanticColors.content.secondary,
        textVariant: "caption",
    },
    trigger: {
        minHeight: control.minTouchTarget,
        paddingHorizontal: spacing.md,
        radius: "md",
        color: semanticColors.content.brand,
        textVariant: "label",
        fontWeight: fontWeight.medium,
    },
    spinner: { size: "small", tone: "brand" },
    states: {
        focus: focusIndicatorContract,
        pressedOpacity: opacity.pressed,
        disabledOpacity: opacity.disabled,
    },
};
export const avatarRecipe = {
    slots: ["root", "image", "fallback", "badge", "group"],
    /**
     * 겹쳐 쌓은 아바타 묶음이 얼마나 겹치는가. 비율로 두는 이유는 크기 축이 이미 네 단계라
     * 픽셀로 적으면 네 벌이 되기 때문이다. 남은 인원은 제품이 문구로 만든다("+3").
     */
    overlapRatio: 0.3,
    defaults: { size: "medium", shape: "circle" },
    sizes: { small: 32, medium: 40, large: 48, xlarge: 64 },
    shapes: { rounded: "md", circle: "full" },
    background: semanticColors.canvas,
    content: semanticColors.content.secondary,
    border: semanticColors.border.default,
    /** Initials use the strong emphasis step; their size follows the avatar (Web `.hjm-avatar[data-size]` steps). */
    initialsWeight: "strong",
};
/**
 * Initials text step for an avatar diameter, shared by Web size tokens and Native numeric sizes
 * (2026-10-17 comparison: Native drew 12pt brand-colored initials at every size).
 */
export function resolveAvatarInitialsTextVariant(size) {
    if (size < avatarRecipe.sizes.medium)
        return "label";
    if (size < avatarRecipe.sizes.xlarge)
        return "body";
    return "title";
}
export const statisticRecipe = {
    slots: [
        "group",
        "root",
        "label",
        "valueRow",
        "prefix",
        "value",
        "suffix",
        "trend",
        "trendMark",
        "hint",
    ],
    defaults: { density: "comfortable", presentation: "plain", columns: 3 },
    density: {
        compact: {
            padding: spacing.sm,
            gap: spacing.xxs,
            labelVariant: "caption",
            // Small summary cards need a quieter count (Diairy today log, 2026-10-21 user feedback).
            valueVariant: "bodyLarge",
        },
        comfortable: {
            padding: spacing.md,
            gap: spacing.xs,
            labelVariant: "label",
            valueVariant: "heading",
        },
    },
    presentations: {
        plain: { background: null, border: null, borderWidth: 0, radius: "md" },
        surface: {
            background: semanticColors.canvas,
            border: semanticColors.border.default,
            borderWidth: stroke.default,
            radius: "md",
        },
    },
    group: {
        gap: spacing.xs,
        minItemWidth: 120,
        // Read-only social/count bars retain one row, with the value before its label.
        bar: { cellPadding: spacing.xs, valueGap: spacing.xxs, iconSize: glyph.sm },
        columns: [1, 2, 3, 4],
    },
    label: {
        color: semanticColors.content.secondary,
        fontWeight: fontWeight.medium,
    },
    value: {
        color: semanticColors.content.primary,
        // The key number keeps the semibold emphasis step (600, 2026-10-17 lighter scale) at the `heading` size.
        // It used to borrow the display heading weight, which was removed with the display tier the same day.
        fontWeight: fontWeight.semibold,
        numericVariant: "tabular",
        maxLines: null,
    },
    affix: {
        color: semanticColors.content.body,
        textVariant: "body",
        fontWeight: fontWeight.medium,
    },
    hint: {
        color: semanticColors.content.secondary,
        textVariant: "caption",
    },
    trend: {
        textVariant: "caption",
        fontWeight: fontWeight.medium,
        gap: spacing.xxs,
        marks: {
            up: "trendUp",
            down: "trendDown",
            flat: "trendFlat",
        },
        tones: {
            neutral: semanticColors.content.secondary,
            success: semanticColors.feedback.success.foreground,
            warning: semanticColors.feedback.warning.foreground,
            danger: semanticColors.content.danger,
        },
    },
};
/**
 * Adjacent action buttons use 8 in both directions. The 2026-10-20 user request tightened
 * horizontal groups to the same spacing as stacked groups; control touch targets remain unchanged.
 */
export const actionGroupRecipe = { inlineGap: spacing.xs, stackedGap: spacing.xs };
export const sheetRecipe = {
    slots: ["backdrop", "positioner", "content", "handle", "header", "title", "body", "footer", "close"],
    defaults: { placement: "bottom", size: "auto" },
    /**
     * How tall the sheet opens. `auto` keeps the content-driven height that the
     * recipe already caps with `maxHeightRatio`. The fixed steps exist because
     * consumers otherwise reach for `contentStyle={{ height }}`, which moves a
     * recipe-owned dimension into product code.
     */
    sizes: {
        auto: null,
        // Short explanatory sheets need breathing room without the medium step's
        // empty space (Choose Window primer review, 2026-10-20: two-thirds of medium).
        small: 0.4,
        medium: 0.6,
        large: 0.85,
        full: 1,
    },
    backdrop: backdrop.modal,
    content: {
        background: semanticColors.canvas,
        border: semanticColors.border.default,
        borderWidth: floatingSurfaceContract.borderWidth,
        radius: "xl",
        shadow: floatingSurfaceContract.shadow,
        /** Caps `size="auto"` only; fixed `sizes` (medium/large/full) are bounded by the safe-area viewport instead. */
        maxHeightRatio: 0.9,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,
    },
    web: { maxWidth: 640 },
    safeArea: {
        edge: "bottom",
        mode: "additive",
        minimumPadding: spacing.sm,
    },
    handle: {
        width: 36,
        height: 4,
        radius: "full",
        color: semanticColors.content.secondary,
        // Bottom sheets now always offer drag-to-dismiss, so the handle is visible whenever it is allowed.
        visibleByDefault: true,
        showWhen: "swipe-dismiss-enabled",
    },
    header: { minHeight: control.minTouchTarget, gap: spacing.sm },
    // No visual `title` region: sheets render the title only as the accessible name (2026-10-17 user decision).
    // The "title" slot stays because the title is still the dialog's name.
    body: {
        color: semanticColors.content.body,
        textVariant: "body",
        gap: spacing.md,
    },
    footer: {
        color: semanticColors.content.body,
        textVariant: "body",
        // Native stacks footer actions in a column.
        gap: actionGroupRecipe.stackedGap,
        paddingTop: spacing.sm,
    },
    transition: { enter: motionPreset.enter, exit: motionPreset.exit },
};
export const dialogRecipe = {
    slots: ["backdrop", "positioner", "content", "header", "title", "description", "body", "footer", "close"],
    defaults: { size: "medium", dismissible: true },
    sizes: {
        small: { maxWidth: 320, padding: spacing.lg },
        medium: { maxWidth: 420, padding: spacing.xl },
        large: { maxWidth: 640, padding: spacing.xl },
    },
    backdrop: backdrop.modal,
    content: {
        background: semanticColors.canvas,
        border: semanticColors.border.default,
        borderWidth: floatingSurfaceContract.borderWidth,
        radius: "lg",
        gap: spacing.md,
        shadow: floatingSurfaceContract.shadow,
    },
    transition: { enter: motionPreset.enter, exit: motionPreset.exit },
    /**
     * ImmersiveOverlay (Dialog companion, 1.31.0): an edge-to-edge stage with a control bar and no card, scrim or
     * header, for presentations such as a display board (utilverse used a raw RN Modal because Dialog/Sheet always
     * framed their content). The stage is product-drawn; the bar reuses screen spacing so it matches a screen footer.
     */
    immersive: {
        background: semanticColors.canvas,
        controls: { padding: spacing.md, gap: spacing.xs, actionGap: actionGroupRecipe.inlineGap },
        // A presentation is read from across a room: rotation follows the device even when the app is portrait-only.
        orientations: ["portrait", "landscape-left", "landscape-right"],
        statusBarHidden: true,
    },
};
export const alertDialogRecipe = {
    slots: [
        "backdrop",
        "positioner",
        "content",
        "icon",
        "title",
        "description",
        "status",
        "error",
        "actions",
        "cancel",
        "confirm",
    ],
    defaults: { tone: "attention", size: "small" },
    sizes: dialogRecipe.sizes,
    backdrop: dialogRecipe.backdrop,
    content: dialogRecipe.content,
    tones: {
        attention: {
            icon: semanticColors.feedback.attention.foreground,
            iconBackground: semanticColors.feedback.attention.background,
            confirm: semanticColors.action.brand.background,
            confirmContent: semanticColors.action.brand.content,
        },
        danger: {
            icon: semanticColors.content.danger,
            iconBackground: semanticColors.feedback.danger.background,
            confirm: semanticColors.action.danger.background,
            confirmContent: semanticColors.action.danger.content,
        },
        // Explanation and completion keep the brand confirm button: the action they
        // introduce is the ordinary one, only the mark and its wash change.
        info: {
            icon: semanticColors.feedback.info.foreground,
            iconBackground: semanticColors.feedback.info.background,
            confirm: semanticColors.action.brand.background,
            confirmContent: semanticColors.action.brand.content,
        },
        success: {
            icon: semanticColors.feedback.success.foreground,
            iconBackground: semanticColors.feedback.success.background,
            confirm: semanticColors.action.brand.background,
            confirmContent: semanticColors.action.brand.content,
        },
    },
    icon: { containerSize: control.minTouchTarget, glyph: "md", radius: "full" },
    title: {
        color: semanticColors.content.primary,
        textVariant: "title",
        fontWeight: typography.title.fontWeight,
    },
    description: {
        color: semanticColors.content.secondary,
        textVariant: "body",
    },
    error: formSupportContract.error,
    // Stacked: confirm on top, cancel below, tighter gap (reported 2026-09-27). Row stays [cancel][confirm].
    actions: {
        gap: actionGroupRecipe.inlineGap,
        stackedGap: actionGroupRecipe.stackedGap,
        stackedOrder: "confirm-first",
        stackBelow: breakpoint.medium,
        minButtonWidth: 96,
    },
    transition: dialogRecipe.transition,
};
// First-line anchor (2026-10-17 user: "기본 토스트 좌우랑 글자 라인이 안맞는데"). The badge box is the one
// line every leading column, first text line and close glyph centre on; the close keeps its 44 touch target but
// overhangs so its glyph, not its hit area, sets the visible inset. Derived here so both renderers read numbers.
const toastBadgeDiameter = 32;
const toastCloseDiameter = control.minTouchTarget;
const toastCloseGlyph = "xs";
export const toastRecipe = {
    slots: [
        "viewport",
        "root",
        "toneMark",
        "icon",
        "media",
        "content",
        "title",
        "description",
        "progress",
        "action",
        "close",
    ],
    defaults: { tone: "neutral", placement: "bottom", durationMs: 3000 },
    adaptive: { web: "fixed-viewport", native: "safe-area-overlay" },
    viewport: {
        layer: layer.toast,
        gap: spacing.sm,
        inset: spacing.md,
        maxWidth: 420,
        safeAreaMode: "additive",
    },
    placements: {
        top: { blockEdge: "top", inlineEdge: "center", stackFrom: "top" },
        "top-start": { blockEdge: "top", inlineEdge: "start", stackFrom: "top" },
        "top-end": { blockEdge: "top", inlineEdge: "end", stackFrom: "top" },
        bottom: { blockEdge: "bottom", inlineEdge: "center", stackFrom: "bottom" },
        "bottom-start": { blockEdge: "bottom", inlineEdge: "start", stackFrom: "bottom" },
        "bottom-end": { blockEdge: "bottom", inlineEdge: "end", stackFrom: "bottom" },
    },
    // 1.10.0: tone is carried by a tinted icon badge, not a 2px edge strip — the strip plus a bare glyph read
    // as a grey dot on neutral toasts (BurnTok 2026-09-30 feedback "알림 ui 구려"). `badge` is the badge fill.
    tones: {
        neutral: {
            foreground: semanticColors.content.primary,
            accent: semanticColors.content.secondary,
            badge: semanticColors.surface.sunken,
            mark: "notifications",
        },
        info: {
            foreground: semanticColors.content.primary,
            accent: semanticColors.feedback.info.foreground,
            badge: semanticColors.feedback.info.badgeBackground,
            mark: "info",
        },
        success: {
            foreground: semanticColors.content.primary,
            accent: semanticColors.feedback.success.foreground,
            badge: semanticColors.feedback.success.badgeBackground,
            mark: "success",
        },
        warning: {
            foreground: semanticColors.content.primary,
            accent: semanticColors.feedback.warning.foreground,
            badge: semanticColors.feedback.warning.badgeBackground,
            mark: "warning",
        },
        danger: {
            foreground: semanticColors.content.primary,
            accent: semanticColors.content.danger,
            badge: semanticColors.feedback.danger.badgeBackground,
            mark: "alert",
        },
    },
    // 2026-10-20 approved light/dark notification reference: neutral glass chrome,
    // a quiet hairline and a bare glyph replace the heavy outline and coloured badge.
    material: {
        radius: 24,
        blur: 20,
        opacity: 0.96,
        light: { background: "#FAFBFE", border: "#E3E6EB", foreground: "#202124", secondary: "#626873", close: "#696F79" },
        dark: { background: "#27282B", border: "#4D4F54", foreground: "#F6F7F9", secondary: "#B4B8C0", close: "#B4B8C0" },
    },
    surface: {
        background: semanticColors.canvas,
        // Legacy semantic references remain available; renderers resolve the theme material above.
        // 1.10.0 softened the shape to lg; 1.20 makes every toast the "panel" (xl) that BurnTok designed for its
        // review status, by user request on 2026-10-10 ("패널이 토스트가 되는거지").
        border: semanticColors.border.strong,
        borderWidth: stroke.default,
        radius: "xl",
        shadow: floatingSurfaceContract.shadow,
        minHeight: layout.rowHeight.singleLine,
        // block sm + anchor 32 + sm = the 56 single-line row; inline md on both edges so the badge's start inset
        // equals the close glyph's end inset (Web had sm/xs/sm/md, Native md on all sides — 2026-10-17 measurement).
        padding: { block: spacing.sm, inline: spacing.md },
        gap: spacing.sm,
        maxWidth: 420,
    },
    // First text line (title, else description) is centred on this box: content insets its first line by
    // (blockSize − first-line line-height) / 2. Multi-line copy grows downward; the lead and close stay beside
    // the first line instead of centring on the whole block. Product media (44) start-aligns to the same top and
    // is not the anchor: centring the title on the media pushed the description below the avatar.
    anchor: { blockSize: toastBadgeDiameter },
    /**
     * @deprecated Toast has no edge stripe: the tinted icon badge (or product media) carries tone. Retired in 1.10.0
     * (width 0); since 1.32.0 neither renderer draws an element for it, so there is nothing for a product to hide
     * (2026-10-18 BurnTok still hid a strip that no longer existed). Kept only so the published recipe shape stays
     * compatible; remove in the next major.
     */
    toneMark: { width: 0, radius: "full" },
    icon: { glyph: "sm", badgeDiameter: toastBadgeDiameter, badgeRadius: "full" },
    // A product media (mascot, avatar) replaces the tone badge in the same leading column. 44 keeps a
    // character legible; it is decorative, so the tone still lives in `data-tone` and the copy.
    media: { size: 44 },
    content: { gap: spacing.xxs },
    title: {
        color: semanticColors.content.primary,
        textVariant: "body",
        fontWeight: typography.title.fontWeight,
    },
    // Secondary copy so the title leads; body-on-body read as one grey block.
    description: {
        color: semanticColors.content.secondary,
        textVariant: "body",
    },
    // Step dots of a running task: done and current are brand, upcoming is the divider colour; the current
    // label is emphasized. Labels sit beside each dot so the row reads without colour alone (WCAG 1.4.1).
    progress: {
        gap: spacing.sm,
        dotSize: 6,
        currentScale: 1.4,
        doneColor: semanticColors.content.brand,
        upcomingColor: semanticColors.border.default,
        labelColor: semanticColors.content.secondary,
        currentLabelColor: semanticColors.content.primary,
        textVariant: "caption",
    },
    // 1.10.0: a tinted pill button instead of a bare text link, so the one thing a toast asks for is
    // recognisable as a control. Hit area stays the 44pt touch target. 1.20 panel: it sits under the copy
    // at the start edge, where the eye already is, instead of the far end.
    action: {
        color: semanticColors.content.brand,
        background: semanticColors.surface.brand,
        radius: "full",
        align: "start",
        textVariant: "body",
        fontWeight: fontWeight.medium,
        minHeight: control.minTouchTarget,
        paddingHorizontal: spacing.md,
    },
    close: {
        color: semanticColors.content.secondary,
        diameter: toastCloseDiameter,
        glyph: toastCloseGlyph,
        // Negative block margin on both sides: the 44 target centres on the anchor line without stretching the row.
        blockOverhang: (toastCloseDiameter - toastBadgeDiameter) / 2,
        // Negative inline-end margin: the glyph box ends at the md padding edge, mirroring the badge's start inset.
        inlineOverhang: (toastCloseDiameter - glyph[toastCloseGlyph]) / 2,
    },
    states: {
        pressedOpacity: opacity.pressed,
        draggedOpacity: opacity.dragged,
        focus: focusIndicatorContract,
    },
    gesture: { dismissThreshold: 50 },
    transition: {
        web: { enter: motionPreset.micro, exit: motionPreset.exit },
        native: { enter: motionPreset.enter, exit: motionPreset.exit },
    },
};
export const tooltipRecipe = {
    slots: ["provider", "trigger", "content", "arrow"],
    defaults: tooltipDescriptorDefaults,
    layer: layer.tooltip,
    surface: {
        ...floatingSurfaceContract,
        background: semanticColors.content.primary,
        border: semanticColors.content.primary,
        radius: "sm",
        padding: spacing.xs,
    },
    content: {
        color: semanticColors.canvas,
        textVariant: "label",
        maxWidth: 280,
    },
    arrow: {
        width: 10,
        height: 5,
        color: semanticColors.content.primary,
        padding: spacing.xs,
    },
    positioning: {
        sideOffset: spacing.xxs,
        collisionPadding: spacing.sm,
    },
    transition: { enter: motionPreset.micro, exit: motionPreset.exit },
};
export const topBarRecipe = {
    slots: [
        "root",
        "leading",
        "title",
        "titleLeading",
        "titleAction",
        "trailing",
        "action",
        "actionLabel",
    ],
    defaults: { centered: true },
    minHeight: control.buttonHeight.large,
    sideMinWidth: control.buttonHeight.small,
    paddingHorizontal: spacing.md,
    gap: spacing.xxs,
    largeTextThreshold,
    title: { textVariant: "bodyLarge", color: semanticColors.content.primary, fontWeight: typography.title.fontWeight },
    titleAction: {
        minHeight: control.minTouchTarget,
        minWidth: control.minTouchTarget,
        gap: spacing.xs,
        pressedOpacity: opacity.pressed,
    },
    // 2026-10-21: compact header tools approved after the Today Baseball home trial.
    action: {
        size: "small",
        hitSlop: 0,
        minHeight: control.buttonHeight.small,
        minWidth: control.buttonHeight.small,
        gap: spacing.xxs,
        paddingHorizontal: spacing.xxs,
        pressedOpacity: opacity.pressed,
        disabledOpacity: opacity.disabled,
    },
    actionLabel: {
        textVariant: "caption",
        color: semanticColors.content.primary,
        fontWeight: fontWeight.medium,
    },
    background: semanticColors.canvas,
};
export const bottomCtaRecipe = {
    slots: ["root", "description", "secondaryAction", "primaryAction"],
    minHeight: 64,
    // A standalone bar shares ScreenLayout's 16pt content edges. The general 20pt page gutter
    // narrowed the pinned action below the search field (Unairplane simulator review, 2026-10-20).
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    // ScreenLayout's reading width includes its two body gutters. Subtract them here because this
    // max width measures the actions themselves; otherwise tablet buttons extend 16pt beyond each body edge.
    contentMaxWidth: layout.readingMaxWidth - spacing.md * 2,
    // A footer painted in the canvas tone left only a 1pt hairline between it
    // and the content scrolling underneath — a product author found that the
    // line cut a glyph in half at whatever scroll position the reader stopped
    // at, reading as a broken card rather than a footer. Layering by surface
    // (one step up from canvas) instead of by shadow alone is how this
    // component builds the separation; `shadow` below is reserved for the one
    // case that still needs it — see its comment.
    background: semanticColors.canvas,
    border: semanticColors.border.default,
    borderWidth: stroke.default,
    // The cut described above is the scroll viewport's edge, not a spacing
    // problem — content clips mid-glyph, and a hairline between two
    // similarly-light planes can't carry that on its own. The footer casts
    // upward instead: the one case where a shadow, rather than a surface step,
    // is the right tool, because the footer genuinely overlaps the content
    // beneath it.
    shadow: {
        color: "#000000",
        opacity: 0.08,
        radius: 8,
        offsetY: -2,
        elevation: 8,
    },
};
export const sectionRecipe = {
    slots: ["root", "header", "copy", "title", "description", "action", "content"],
    gap: spacing.xs,
    headerGap: spacing.sm,
    copyGap: spacing.xxs,
    title: { textVariant: "title", color: semanticColors.content.body, fontWeight: typography.title.fontWeight },
    description: { textVariant: "caption", color: semanticColors.content.secondary },
};
//# sourceMappingURL=component-recipes.js.map